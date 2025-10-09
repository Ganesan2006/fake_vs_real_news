# ai_learning_platform/frontend/utils/validators.py

import re

def validate_email(email: str) -> bool:
    """
    Validates if the provided string is a valid email format.
    """
    if not email:
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))

def validate_password_strength(password: str) -> bool:
    """
    Validates if the password is at least 6 characters long.
    (This can be expanded to check for complexity).
    """
    return len(password) >= 6
