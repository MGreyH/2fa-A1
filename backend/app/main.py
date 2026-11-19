"""Local FastAPI service for the offline authentication demonstration."""

import hmac
from io import BytesIO
from typing import Literal
from urllib.parse import quote

import qrcode
import qrcode.image.svg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from .totp import generate_secret, hotp_code, verify_totp

app = FastAPI(title="Offline Auth API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Deliberately development-only storage. Prisma/MariaDB models in database/
# replace these dictionaries in a deployed intranet environment.
users: dict[str, dict] = {}
sessions: set[str] = set()


def qr_svg(value: str) -> str:
    image = qrcode.make(value, image_factory=qrcode.image.svg.SvgPathImage, border=2)
    output = BytesIO()
    image.save(output)
    return output.getvalue().decode("utf-8")


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    method: Literal["totp", "hotp", "fido2"]


class VerifyRequest(BaseModel):
    email: EmailStr
    code: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "local"}


@app.post("/auth/register")
def register(payload: RegisterRequest) -> dict[str, str]:
    email = payload.email.lower()
    if email in users:
        raise HTTPException(409, "An account already exists for this email.")
    secret = generate_secret()
    users[email] = {
        "name": payload.name,
        "password": payload.password,  # Replace with Argon2id hash in persistence layer.
        "totp_secret": secret,
        "hotp_counter": 0,
    }
    label = quote(f"Offline Auth:{email}")
    issuer = quote("Offline Auth")
    otp_auth_uri = f"otpauth://totp/{label}?secret={secret}&issuer={issuer}&period=30&digits=6"
    return {
        "message": "Account created. Scan the QR code with an authenticator app.",
        "qrSvg": qr_svg(otp_auth_uri),
    }


@app.post("/auth/login")
def login(payload: LoginRequest) -> dict[str, str]:
    user = users.get(payload.email.lower())
    if not user or user["password"] != payload.password:
        raise HTTPException(401, "Invalid email or password.")
    if payload.method == "fido2":
        raise HTTPException(501, "FIDO2 needs a local HTTPS WebAuthn credential service.")
    return {"status": "mfa_required", "method": payload.method}


@app.post("/auth/verify/totp")
def verify_totp_endpoint(payload: VerifyRequest) -> dict[str, str]:
    user = users.get(payload.email.lower())
    if not user or not verify_totp(user["totp_secret"], payload.code):
        raise HTTPException(401, "Invalid or expired verification code.")
    token = generate_secret()
    sessions.add(token)
    return {"token": token, "message": "Local TOTP verification succeeded."}


@app.post("/auth/verify/hotp")
def verify_hotp_endpoint(payload: VerifyRequest) -> dict[str, str]:
    user = users.get(payload.email.lower())
    if not user:
        raise HTTPException(401, "Invalid verification code.")
    expected = hotp_code(user["totp_secret"], user["hotp_counter"])
    if not hmac.compare_digest(expected, payload.code):
        raise HTTPException(401, "Invalid verification code.")
    user["hotp_counter"] += 1
    token = generate_secret()
    sessions.add(token)
    return {"token": token, "message": "Local HOTP verification succeeded."}


@app.post("/auth/fido2/options")
def fido2_options() -> None:
    raise HTTPException(501, "Configure a WebAuthn RP ID and local HTTPS before enabling FIDO2.")
