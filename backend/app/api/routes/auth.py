from urllib.parse import urlencode
import json
import logging

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

logger = logging.getLogger(__name__)
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db               
from app.models.user import User
from app.schemas.user_schema import (
    UserCreate,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
    VerifyLoginOTPRequest,
    VerifyForgotOTPRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    PreferenceUpdateRequest,
)
from app.services.auth_service import (send_otp, start_signup, finish_signup, finish_login, start_login, cancel_active_otp)
from app.services.auth_service import login_or_register_google_user
from app.services.password_service import (start_forgot_password, verify_forgot_password_otp, reset_password_with_token, change_password_authenticated)
from app.services.user_preference_service import UserPreferenceService
from app.utils.auth import clear_auth_cookie, get_current_user, set_auth_cookie
from app.utils.encryption import get_public_key, decrypt_dict

router = APIRouter(prefix="/auth", tags=["auth"])

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

#Raise HTTP Exception based on result.
def _raise_if_error(result: dict, *, default_status: int = 400, force_status: int | None = None):
    if "error" in result:
        status = force_status if force_status is not None else result.get("status_code", default_status)
        raise HTTPException(status_code=status, detail=result["error"])

#Implement the Signup Route
async def _register_impl(data: UserCreate, db: AsyncSession):
    result = await start_signup(data.email, db)
    _raise_if_error(result)
    return result

#Implement the Resend OTP Route
async def _resend_impl(data: ResendOTPRequest, db: AsyncSession):
    result = await send_otp(data.email, db, is_resend=True)
    _raise_if_error(result, force_status=429)
    return {"message": "New OTP sent."}

#Implement the Verify OTP Route
async def _verify_impl(data: VerifyOTPRequest, db: AsyncSession):
    result = await finish_signup(
        email=data.email,
        code=data.code,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        db=db,
    )
    _raise_if_error(result)
    return result

#Implement the Login Route
async def _login_impl(data: LoginRequest, db: AsyncSession):
    result = await start_login(data.email, data.password, db)
    _raise_if_error(result)

    return result

#Implement the Verify Login OTP Route
async def _verify_login_impl(data: VerifyLoginOTPRequest, db: AsyncSession):
    result = await finish_login(email=data.email, code=data.code, db=db)
    _raise_if_error(result)
    return result

#Implement the Cancel OTP Route
async def _cancel_otp_impl(data: ResendOTPRequest, db: AsyncSession):
    return await cancel_active_otp(data.email, db)

#Implement the Forgot Password Route
async def _forgot_password_impl(data: ResendOTPRequest, db: AsyncSession):
    result = await start_forgot_password(data.email, db)
    _raise_if_error(result)
    return result

#Implement the Verify Forgot OTP Route
async def _verify_forgot_otp_impl(data: VerifyForgotOTPRequest, db: AsyncSession):
    result = await verify_forgot_password_otp(data.email, data.code, db)
    _raise_if_error(result)
    return result

#Implement the Reset Password Route
async def _reset_password_impl(data: ResetPasswordRequest, db: AsyncSession):
    result = await reset_password_with_token(data.reset_token, data.new_password, db)
    _raise_if_error(result)
    return result

#Implement the User Payload Route
def _user_payload(user: User) -> dict:
    return {
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }

#Implement the Attach Cookie and Strip Token Route
def _attach_cookie_and_strip_token(response: Response, result: dict) -> dict:
    token = result.get("token")
    if token:
        set_auth_cookie(response, token)
    return {
        "message": "Authentication successful.",
        "user": result.get("user"),
    }

#Implement the Google OAuth Enabled Route
def _google_oauth_enabled() -> bool:
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)

#Implement the Build Callback URL Route
def _build_callback_url() -> str:
    base = settings.BACKEND_BASE_URL.rstrip("/")
    path = settings.GOOGLE_REDIRECT_PATH
    if not path.startswith("/"):
        path = f"/{path}"
    return f"{base}{path}"

#Implement the Frontend Login Redirect Route
def _frontend_login_redirect(error: str | None = None) -> str:
    base_login = f"{settings.FRONTEND_ORIGIN.rstrip('/')}/login"
    if not error:
        return base_login
    query = urlencode({"google_error": error})
    return f"{base_login}?{query}"

#Implement the Extract Profile from Claims Route
def _extract_profile_from_claims(claims: dict) -> tuple[str, str]:
    given_name = (claims.get("given_name") or "").strip()
    family_name = (claims.get("family_name") or "").strip()
    full_name = (claims.get("name") or "").strip()

    if given_name or family_name:
        return given_name or "Google", family_name or "User"

    if full_name:
        parts = full_name.split(maxsplit=1)
        if len(parts) == 2:
            return parts[0], parts[1]
        return full_name, "User"

    return "Google", "User"

#Implement the Verify Google ID Token Route 
def _verify_google_id_token(raw_id_token: str) -> dict:
    claims = id_token.verify_oauth2_token(
        raw_id_token,
        GoogleRequest(),
        settings.GOOGLE_CLIENT_ID,
        clock_skew_in_seconds=10,  # Allows up to 10 seconds of clock drift
    )

    # Defense in depth checks for issuer and required identity claims.
    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise ValueError("Invalid token issuer")

    if not claims.get("email"):
        raise ValueError("Google account email is missing")

    if claims.get("email_verified") is not True:
        raise ValueError("Google email is not verified")

    return claims


@router.get("/google/login")
async def google_login(request: Request):
    if not _google_oauth_enabled():
        return RedirectResponse(
            url=_frontend_login_redirect("Google login is not configured."),
            status_code=status.HTTP_302_FOUND,
        )

    return await oauth.google.authorize_redirect(request, _build_callback_url())


@router.get("/callback")
async def auth_callback(request: Request, db: AsyncSession = Depends(get_db)):
    if not _google_oauth_enabled():
        return RedirectResponse(
            url=_frontend_login_redirect("Google login is not configured."),
            status_code=status.HTTP_302_FOUND,
        )

    try:
        token = await oauth.google.authorize_access_token(request)

        # Authlib can attach verified OIDC claims as userinfo.
        userinfo = token.get("userinfo") or {}
        raw_id_token = token.get("id_token")
        if not raw_id_token:
            raise ValueError("Missing Google ID token")

        # Verify signature with Google's public keys and validate OIDC claims.
        claims = _verify_google_id_token(raw_id_token)

        if userinfo.get("email") and userinfo["email"] != claims["email"]:
            raise ValueError("Token identity mismatch")

        first_name, last_name = _extract_profile_from_claims(claims)
        result = await login_or_register_google_user(
            email=claims["email"],
            first_name=first_name,
            last_name=last_name,
            db=db,
        )

        response = RedirectResponse(url=_frontend_login_redirect(), status_code=status.HTTP_302_FOUND)
        set_auth_cookie(response, result["token"])
        return response

    except Exception as e:
        logger.error(f"Google OAuth callback error: {type(e).__name__}: {str(e)}", exc_info=True)
        return RedirectResponse(
            url=_frontend_login_redirect("Google login failed. Please try again."),
            status_code=status.HTTP_302_FOUND,
        )

#Implement the Public Key Route
@router.get("/public-key")
async def get_public_key_endpoint():
    #Get the public key for frontend encryption.
    return {"public_key": get_public_key()}

#Implement the Register Route
@router.post("/register")
async def register(request: Request, db: AsyncSession = Depends(get_db)):
    #Step 1: User submits form -> send OTP email. Data may be encrypted."""
    try:
        # Read raw JSON body
        body = await request.json()
        
        # Decrypt if data comes encrypted from frontend
        decrypted_data = decrypt_dict(body)
        
        # Validate with Pydantic schema (now with decrypted data)
        user_data = UserCreate(**decrypted_data)
        
        return await _register_impl(user_data, db)
    except HTTPException:
        # Let HTTPException pass through with its original status code
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Resend OTP — enforces 2-minute cooldown."""
    return await _resend_impl(data, db)

@router.post("/verify-otp")
async def verify_otp(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Step 2: User enters OTP → verify and create account. Data may be encrypted."""
    try:
        # Read raw JSON body
        body = await request.json()
        
        # Decrypt if data comes encrypted from frontend
        decrypted_data = decrypt_dict(body)
        
        # Validate with Pydantic schema (now with decrypted data)
        otp_data = VerifyOTPRequest(**decrypted_data)
        
        result = await _verify_impl(otp_data, db)
        return _attach_cookie_and_strip_token(response, result)
    except HTTPException:
        # Let HTTPException pass through with its original status code
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/login")
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    #Step 1 login: validate credentials and send OTP to email. Data may be encrypted.
    try:
        # Read raw JSON body
        body = await request.json()
        logger.debug(f"[Login] Received body keys: {list(body.keys())}")
        
        # Decrypt if data comes encrypted from frontend
        decrypted_data = decrypt_dict(body)
        logger.debug(f"[Login] After decryption - email: {decrypted_data.get('email', 'MISSING')}")
        
        # Validate with Pydantic schema (now with decrypted data)
        login_data = LoginRequest(**decrypted_data)
        logger.debug(f"[Login] Pydantic validation passed for email: {login_data.email}")
        
        result = await _login_impl(login_data, db)
        logger.debug(f"[Login] _login_impl result: {result}")
        return result
    except HTTPException:
        # Let HTTPException pass through with its original status code
        raise
    except json.JSONDecodeError as e:
        logger.error(f"[Login] JSONDecodeError: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    except Exception as e:
        logger.error(f"[Login] Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/verify-login-otp")
async def verify_login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Step 2 login: verify OTP and issue JWT token. Data may be encrypted."""
    try:
        # Read raw JSON body
        body = await request.json()
        
        # Decrypt if data comes encrypted from frontend
        decrypted_data = decrypt_dict(body)
        
        # Validate with Pydantic schema (now with decrypted data)
        otp_data = VerifyLoginOTPRequest(**decrypted_data)
        
        result = await _verify_login_impl(otp_data, db)
        if "error" not in result:
            service = UserPreferenceService(db)
            result = {
                **result,
                "has_preferences": await service.has_preferences(result["user"]["user_id"]),
            }
        return _attach_cookie_and_strip_token(response, result)
    except HTTPException:
        # Let HTTPException pass through with its original status code
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/cancel-otp")
async def cancel_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Invalidate active OTP when user exits the OTP modal."""
    return await _cancel_otp_impl(data, db)


# Forgot-password step 1: send OTP if user email exists.
@router.post("/forgot-password")
async def forgot_password(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    return await _forgot_password_impl(data, db)


# Forgot-password step 2: verify OTP and return reset token.
@router.post("/verify-forgot-otp")
async def verify_forgot_otp(data: VerifyForgotOTPRequest, db: AsyncSession = Depends(get_db)):
    return await _verify_forgot_otp_impl(data, db)


# Forgot-password step 3: set new password using reset token.
@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await _reset_password_impl(data, db)


# Logged-in password change: require current password.
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await change_password_authenticated(current_user, data.old_password, data.new_password, db)
    _raise_if_error(result)
    return result


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out successfully."}


@router.get("/profile")
async def profile(current_user: User = Depends(get_current_user)):
    return _user_payload(current_user)


@router.get("/session")
async def session_status(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        current_user = await get_current_user(request=request, bearer_token=None, db=db)
    except HTTPException:
        return {
            "authenticated": False,
            "has_preferences": False,
            "user": None,
        }

    service = UserPreferenceService(db)
    has_prefs = await service.has_preferences(current_user.user_id)

    return {
        "authenticated": True,
        "has_preferences": has_prefs,
        "user": _user_payload(current_user),
    }


@router.get("/preference-status")
async def preference_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserPreferenceService(db)
    categories = await service.get_preferences(current_user.user_id)
    has_prefs = await service.has_preferences(current_user.user_id)

    return {
        "has_preferences": has_prefs,
        "preferred_categories": categories,
    }


@router.post("/preferences")
async def save_preferences(
    payload: PreferenceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserPreferenceService(db)
    result = await service.save_preferences(
        current_user.user_id, payload.preferred_categories
    )
    return result