# MariaDB schema

Copy `.env.example` to `.env`, set a local MariaDB connection URL, then run:

```powershell
cd database
npx prisma migrate dev --name init
```

`encryptedSecret` is intentionally not a plain-text column. The Python service must encrypt the TOTP/HOTP seed before persistence and decrypt it only in local process memory during verification.
