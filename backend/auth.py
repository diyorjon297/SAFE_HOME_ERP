from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import hashlib
import hmac
import base64
import json
import time


router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================================
# ADMIN LOGIN
# =========================================

ADMIN_LOGIN = "diyorjon2397"
ADMIN_PASSWORD = "Di23979797@"


# Token uchun maxfiy kalit
# Keyin buni .env faylga chiqaramiz.
SECRET_KEY = "SAFE_HOME_ERP_SECRET_KEY_2026"


class LoginRequest(BaseModel):
    login: str
    password: str


def create_token(login: str) -> str:
    payload = {
        "login": login,
        "exp": int(time.time()) + 60 * 60 * 12,
    }

    payload_json = json.dumps(
        payload,
        separators=(",", ":")
    ).encode()

    payload_encoded = base64.urlsafe_b64encode(
        payload_json
    ).decode()

    signature = hmac.new(
        SECRET_KEY.encode(),
        payload_encoded.encode(),
        hashlib.sha256,
    ).digest()

    signature_encoded = base64.urlsafe_b64encode(
        signature
    ).decode()

    return f"{payload_encoded}.{signature_encoded}"


@router.post("/login")
def login(data: LoginRequest):
    if (
        data.login != ADMIN_LOGIN
        or data.password != ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Login yoki parol noto‘g‘ri"
        )

    token = create_token(data.login)

    return {
        "status": "OK",
        "message": "Login muvaffaqiyatli",
        "token": token,
        "user": {
            "login": data.login,
            "role": "admin",
        },
    }