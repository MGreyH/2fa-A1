"""Offline HOTP/TOTP primitives. No network calls are made here."""

import base64
import hashlib
import hmac
import secrets
import struct
import time


def generate_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def hotp_code(secret: str, counter: int, digits: int = 6) -> str:
    key = base64.b32decode(secret.upper() + "=" * (-len(secret) % 8))
    digest = hmac.new(key, struct.pack(">Q", counter), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    binary = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    return str(binary % (10**digits)).zfill(digits)


def totp_code(secret: str, timestamp: int | float | None = None, period: int = 30) -> str:
    current_time = time.time() if timestamp is None else timestamp
    return hotp_code(secret, int(current_time) // period)


def verify_totp(secret: str, code: str, timestamp: int | float | None = None) -> bool:
    if not code.isdigit() or len(code) != 6:
        return False
    current_time = time.time() if timestamp is None else timestamp
    return any(
        hmac.compare_digest(totp_code(secret, current_time + offset * 30), code)
        for offset in (-1, 0, 1)
    )
