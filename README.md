# Offline 2FA demo

This intranet-oriented starter separates its responsibilities by trust boundary:

- `frontend/` — Next.js + shadcn-style interface for registration, login, QR enrollment and local MFA verification.
- `backend/` — FastAPI service that generates/verifies offline HOTP/TOTP values. It makes no network call to verify a code.
- `database/` — Prisma/MariaDB data model for users, encrypted one-time-password seeds, counters, FIDO2 credentials, and sessions.

## Start locally

1. Copy `frontend/.env.local.example` to `frontend/.env.local`.
2. Install frontend dependencies: `cd frontend; pnpm install`.
3. Create a Python virtual environment, install `backend/requirements.txt`, then run `uvicorn app.main:app --app-dir backend --reload --port 8000`.
4. Run `pnpm dev` from `frontend/` and open `http://localhost:3000`.
5. Configure MariaDB using `database/.env.example`, then run `npx prisma migrate dev --name init` within `database/`.

## Security notes

The API's dictionary storage is deliberately a development-only demonstrator. Before production, replace it with the Prisma/MariaDB models, use Argon2id password hashes, encrypt OTP seeds using a server-held key, store session-token hashes, and configure HTTPS. FIDO2/WebAuthn requires a valid local RP ID and a secure origin; it intentionally does not report false success while that server-side configuration is absent.
