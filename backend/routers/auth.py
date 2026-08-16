from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


class LoginRequest(BaseModel):
    login: str
    password: str


@router.post("/login")
def login(data: LoginRequest):

    if data.login == "admin" and data.password == "1234":
        return {
            "status": "OK",
            "token": "safe-home-admin-token",
            "message": "Login muvaffaqiyatli"
        }

    raise HTTPException(
        status_code=401,
        detail="Login yoki parol noto'g'ri"
    )
