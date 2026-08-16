from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


class LoginRequest(BaseModel):
    login: str
    password: str


ADMIN_LOGIN = "diyorjon2397"
ADMIN_PASSWORD = "Di23979797@"


@router.post("/login")
def login(data: LoginRequest):

    if (
        data.login == ADMIN_LOGIN
        and data.password == ADMIN_PASSWORD
    ):
        return {
            "status": "OK",
            "token": "safe-home-admin-token",
            "message": "Login muvaffaqiyatli"
        }

    raise HTTPException(
        status_code=401,
        detail="Login yoki parol noto'g'ri"
    )