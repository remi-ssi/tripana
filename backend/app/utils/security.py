from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# for password hashing and verification
def hash_password(plain_password: str) -> str:
    #Return the bcrypt hash of a plain-text password
    return pwd_context.hash(plain_password)

# Verify a plain password against a hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    #Return True if plain_password matches the stored hash.
    return pwd_context.verify(plain_password, hashed_password)
