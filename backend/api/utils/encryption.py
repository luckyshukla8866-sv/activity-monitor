"""
Encryption utilities for securing screenshots and sensitive data.
Uses Fernet symmetric encryption from the cryptography library.
"""

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64
import os
from pathlib import Path
from typing import Optional
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))
from config import settings


class EncryptionManager:
    """Manages encryption and decryption of files."""
    
    def __init__(self, key: Optional[str] = None):
        """
        Initialize encryption manager with a key.
        
        Args:
            key: Base64-encoded Fernet key. If None, uses settings.ENCRYPTION_KEY
        """
        self.key = key or settings.ENCRYPTION_KEY
        if self.key:
            self.cipher = Fernet(self.key.encode() if isinstance(self.key, str) else self.key)
        else:
            self.cipher = None
    
    @staticmethod
    def generate_key() -> str:
        """Generate a new Fernet encryption key."""
        return Fernet.generate_key().decode()
    
    @staticmethod
    def derive_key_from_password(password: str, salt: Optional[bytes] = None) -> tuple[str, bytes]:
        """
        Derive an encryption key from a password using PBKDF2.
        
        Args:
            password: Password to derive key from
            salt: Salt for key derivation. If None, generates random salt.
        
        Returns:
            Tuple of (base64-encoded key, salt)
        """
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key.decode(), salt
    
    def encrypt_file(self, file_path: Path) -> bool:
        """
        Encrypt a file in place.
        
        Args:
            file_path: Path to file to encrypt
        
        Returns:
            True if successful, False otherwise
        """
        if not self.cipher:
            print("Warning: No encryption key configured. Skipping encryption.")
            return False
        
        try:
            # Read original file
            with open(file_path, 'rb') as f:
                data = f.read()
            
            # Encrypt data
            encrypted_data = self.cipher.encrypt(data)
            
            # Write encrypted data back
            with open(file_path, 'wb') as f:
                f.write(encrypted_data)
            
            return True
        except Exception as e:
            print(f"Error encrypting file {file_path}: {e}")
            return False
    
    def decrypt_file(self, file_path: Path, output_path: Optional[Path] = None) -> Optional[bytes]:
        """
        Decrypt a file.
        
        Args:
            file_path: Path to encrypted file
            output_path: Optional path to write decrypted data. If None, returns data.
        
        Returns:
            Decrypted data if output_path is None, otherwise None
        """
        if not self.cipher:
            print("Warning: No encryption key configured. Reading file as-is.")
            with open(file_path, 'rb') as f:
                return f.read()
        
        try:
            # Read encrypted file
            with open(file_path, 'rb') as f:
                encrypted_data = f.read()
            
            # Decrypt data
            decrypted_data = self.cipher.decrypt(encrypted_data)
            
            # Write to output file or return data
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(decrypted_data)
                return None
            else:
                return decrypted_data
        except Exception as e:
            print(f"Error decrypting file {file_path}: {e}")
            return None
    
    def encrypt_bytes(self, data: bytes) -> Optional[bytes]:
        """Encrypt raw bytes."""
        if not self.cipher:
            return data
        try:
            return self.cipher.encrypt(data)
        except Exception as e:
            print(f"Error encrypting data: {e}")
            return None
    
    def decrypt_bytes(self, encrypted_data: bytes) -> Optional[bytes]:
        """Decrypt raw bytes."""
        if not self.cipher:
            return encrypted_data
        try:
            return self.cipher.decrypt(encrypted_data)
        except Exception as e:
            print(f"Error decrypting data: {e}")
            return None


# Global encryption manager instance
encryption_manager = EncryptionManager()


# Convenience functions
def encrypt_file(file_path: Path) -> bool:
    """Encrypt a file using the global encryption manager."""
    return encryption_manager.encrypt_file(file_path)


def decrypt_file(file_path: Path, output_path: Optional[Path] = None) -> Optional[bytes]:
    """Decrypt a file using the global encryption manager."""
    return encryption_manager.decrypt_file(file_path, output_path)


if __name__ == "__main__":
    # Generate a new key for testing
    print("Generated encryption key:")
    print(EncryptionManager.generate_key())
    print("\nAdd this to your .env file as ENCRYPTION_KEY")
