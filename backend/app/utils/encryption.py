#Encryption/Decryption utilities for the backend.
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization
from pathlib import Path

# Load private key at startup
_private_key = None

def _load_private_key():
    #Load the private key from file.
    global _private_key
    if _private_key is None:
        key_path = Path(__file__).parent.parent.parent / "private_key.pem"
        with open(key_path, "rb") as f:
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
    # Load and return the public key in PEM format.
    key_path = Path(__file__).parent.parent.parent / "public_key.pem"
    with open(key_path, "r") as f:
        return f.read()
