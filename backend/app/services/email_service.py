import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

# Service for sending OTP emails to users during registration and login processes
def send_otp_email(to_email: str, otp_code: str):
  
    # In development mode (when email credentials are not configured), log OTP to console
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning(f"[EMAIL] Development Mode - OTP for {to_email}: {otp_code}")
        print(f"\n{'='*60}")
        print(f"[EMAIL] Development Mode - OTP for {to_email}")
        print(f"[EMAIL] OTP Code: {otp_code}")
        print(f"{'='*60}\n")
        return
    
    # Construct the email content with HTML formatting
    subject = "Your verification code"
    body = f"""
    <h2>Your verification code</h2>
    <p>Use this code to complete your registration:</p>
    <h1 style="letter-spacing: 8px;">{otp_code}</h1>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request this, ignore this email.</p>
    """

    # Create the email message with the appropriate headers and body
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    try:
        # Send the email using SMTP with TLS encryption
        with smtplib.SMTP(settings.MAIL_HOST, settings.MAIL_PORT) as server:
            server.starttls()  # encrypt the connection
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
        logger.info(f"[EMAIL] OTP sent to {to_email}")
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send OTP to {to_email}: {str(e)}")
        raise