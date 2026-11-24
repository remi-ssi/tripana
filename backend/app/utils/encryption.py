import os
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.config import settings

_private_key = None

def _ensure_key_pair() -> tuple[Path, Path]:
    private_path = settings.RSA_PRIVATE_KEY_PATH
    public_path = settings.RSA_PUBLIC_KEY_PATH

    if private_path.exists() and public_path.exists():
        return private_path, public_path

    private_path.parent.mkdir(parents=True, exist_ok=True)
    public_path.parent.mkdir(parents=True, exist_ok=True)

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_path.write_bytes(
        private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    public_path.write_bytes(
        private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    )

    try:
        os.chmod(private_path, 0o600)
    except OSError:
        pass

    return private_path, public_path


def _load_private_key():
    global _private_key
    if _private_key is None:
        private_path, _ = _ensure_key_pair()
        with private_path.open("rb") as f:
            _private_key = serialization.load_pem_private_key(
                f.read(),
                password=None,
            )
    return _private_key

def decrypt_value(encrypted_value: str) -> str:
    #Decrypt an encrypted value using the private key.
    #encrypted_value: Base64-encoded encrypted string from frontend
    import base64
    
    if not encrypted_value:
        return ""
    
    try:
        private_key = _load_private_key()
        
        # JSEncrypt returns base64-encoded data, so decode it first
        encrypted_bytes = base64.b64decode(encrypted_value.encode('utf-8'))
        
        decrypted_bytes = private_key.decrypt(
            encrypted_bytes,
            padding.PKCS1v15()
        )
        return decrypted_bytes.decode('utf-8')
    except base64.binascii.Error as e:
        print(f"[Decryption] Base64 decode error: {str(e)}")
        raise ValueError(f"Invalid encrypted data format: {str(e)}")
    except Exception as e:
        print(f"[Decryption] Decryption error: {str(e)}")
        raise ValueError(f"Decryption failed: {str(e)}")

def decrypt_dict(encrypted_data: dict) -> dict:
    #Decrypt all string values in a dictionary.    
    print(f"[Decryption] decrypt_dict called with keys: {list(encrypted_data.keys())}")
    decrypted = {}
    for key, value in encrypted_data.items():
        if isinstance(value, str) and value:
            # Only attempt to decrypt if it looks like base64-encoded encrypted data
            # Encrypted JSEncrypt output is typically very long (>100 chars) and contains base64 characters
            if len(value) > 100 and all(c.isalnum() or c in '+/=' for c in value):
                try:
                    print(f"[Decryption] Attempting to decrypt {key} (length: {len(value)})")
                    decrypted[key] = decrypt_value(value)
                    print(f"[Decryption] Successfully decrypted {key}")
                except Exception as e:
                    # If decryption fails, try using the original value
                    # This allows graceful fallback if encryption is optional
                    print(f"[Decrypt] Failed to decrypt {key}, using original value: {str(e)}")
                    decrypted[key] = value
            else:
                # Doesn't look like encrypted data, use as-is
                print(f"[Decryption] {key} doesn't look encrypted (length: {len(value)}), using as-is")
                decrypted[key] = value
        else:
            decrypted[key] = value
    return decrypted

def get_public_key() -> str:
    _, public_path = _ensure_key_pair()
    with public_path.open("r", encoding="utf-8") as f:
        return f.read()
