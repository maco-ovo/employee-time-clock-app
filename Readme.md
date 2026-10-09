# Northstar Logistics — Employee Time Clock

WD-302 final project · ABC Holding Ltd.

## Team

- Member A — Makoto (maco-ovo)
- Member B — Nicola (ThreeDeeNotBee)
- Member C — Joy (JoyIsHappii)
- Member D — Patricio (p4t0110)

## Business

Northstar Logistics, a warehouse and logistics company and a subsidiary of ABC Holding Ltd.
About 40 employees clock in and out of their shifts; managers see who is working right now and
how many hours each person logged each week.

## Live link

<LIVE_URL>  
https://employee-time-clock-app-gamma.vercel.app/

## Test accounts

These are test accounts created by the seed script, not real credentials.

| Role     | Email            | Password       | Lands on    |
| -------- | ---------------- | -------------- | ----------- |
| Admin    | `admin@abc.test` | `Admin123!`    | `/admin`    |
| Employee | `alex@abc.test`  | `Employee123!` | `/employee` |

The seed script also creates four more employees (`sam@`, `jo@`, `mia@`, `ken@abc.test`, same
employee password) with two weeks of past shifts.

## Run locally

Requirements: Node.js 20 or later and a PostgreSQL database (we use a free [Neon](https://neon.tech) project).

```bash
cd time-clock-app
npm install

# 1. Environment variables
cp .env.example .env        # then fill in the four values below

# 2. Create the tables, generate the Prisma client, and load the sample data
npx prisma migrate deploy
npm run db:generate
npm run seed                # 1 admin + 5 employees + two weeks of closed shifts. Safe to run again.

# 3. Start the app
npm run dev                 # http://localhost:3000
```

| Variable           | What to put there                                                                     |
| ------------------ | ------------------------------------------------------------------------------------- |
| `DIRECT_URL`       | Neon **pooled** connection string (the host contains `-pooler`). Used by the app.     |
| `SESSION_SECRET`   | Random string of at least 32 characters. Generate one with `openssl rand -base64 48`. |
| `COMPANY_TIMEZONE` | The company time zone as an IANA name. We use: <TODO: fill in, e.g. `Area/City`>      |

## Tech stack

Next.js (App Router) · React · Tailwind CSS · PostgreSQL on Neon · Prisma · deployed on Vercel.
Login uses our own cookie sessions (signed token in an httpOnly cookie) and bcrypt password hashes,
with no third-party auth provider. Every API route and page checks the signed-in user and role on the server.

## Deployment

The app is deployed on Vercel with a Neon database. The connection strings and `SESSION_SECRET`
live only in Vercel's environment variables, never in this repository.

---
