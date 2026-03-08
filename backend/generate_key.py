"""Generate a secure encryption key for the Activity Monitor application."""
from cryptography.fernet import Fernet

# Generate a new Fernet key
key = Fernet.generate_key().decode()
print(key)
