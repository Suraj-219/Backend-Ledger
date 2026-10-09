# Backend Ledger Management System

A backend-focused financial ledger API built with **Node.js, Express.js, MongoDB, and Mongoose**. The project demonstrates account management, JWT-based authentication, double-entry transaction recording, idempotency checks, and immutable ledger entries.

## Project Overview

The Backend Ledger Management System records financial activity as ledger entries instead of relying only on a manually updated balance. Each transfer is represented by a **DEBIT** entry for the sending account and a **CREDIT** entry for the receiving account. The account balance is calculated from its ledger history.

> **Note:** This is an educational portfolio project, not a production banking or payment platform. Review and test transaction consistency, authorization, and deployment settings before using it for real funds.

## Features

- **User authentication:** Register and log in with JWT-based authentication.
- **Password hashing:** Passwords are hashed with `bcryptjs` before storage.
- **Token revocation on logout:** Logged-out tokens are stored in a blacklist and rejected by protected middleware.
- **Account management:** Create accounts and retrieve the authenticated user's accounts.
- **Ledger-derived balances:** Calculate balances from total credits minus total debits.
- **Double-entry transaction records:** Store debit and credit entries for a transfer.
- **Idempotency checks:** Use a unique idempotency key to help prevent duplicate processing when a request is retried.
- **Immutable ledger entries:** Schema rules and middleware prevent common update/delete operations on existing ledger records.
- **System-user authorization:** Restrict the initial-funds endpoint to authenticated system users.
- **Email notifications:** Send registration and transaction emails through Nodemailer/Gmail OAuth2 configuration.
- **MongoDB sessions:** Transaction processing uses a MongoDB session to group database writes.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs`
- `cookie-parser`
- Nodemailer
- dotenv

## Architecture

```text
Client / Postman
      |
      v
Express REST API
      |
      +--> Authentication & Authorization Middleware
      |
      +--> Controllers
      |      +--> Authentication
      |      +--> Accounts
      |      +--> Transactions
      |
      +--> Mongoose Models
             +--> User
             +--> Account
             +--> Transaction
             +--> Ledger
             +--> Blacklisted Token
                    |
                    v
                  MongoDB
```

## Transaction Workflow

1. The client submits the source account, destination account, amount, and an idempotency key.
2. The API validates the required fields and verifies that both accounts exist and are active.
3. The service checks whether the idempotency key has already been used.
4. The sender's balance is calculated from ledger entries and checked against the requested amount.
5. A transaction record is created with a pending status.
6. A debit ledger entry is created for the source account.
7. A credit ledger entry is created for the destination account.
8. The transaction is marked completed and the database session is committed.
9. The API returns a response; the transaction endpoint also attempts to send an email notification.

The intended accounting relationship is:

```text
Account balance = Total credits - Total debits
```

## API Endpoints

Base URL for local development: `http://localhost:3000`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `GET` | `/` | Check whether the service is running | Public |
| `POST` | `/api/auth/register` | Register a user and create an account | Public |
| `POST` | `/api/auth/login` | Log in and receive a JWT | Public |
| `POST` | `/api/auth/logout` | Revoke the current token and clear the cookie | Token required for effective revocation |
| `POST` | `/api/accounts` | Create an account | Authenticated |
| `GET` | `/api/accounts` | Get the logged-in user's accounts | Authenticated |
| `GET` | `/api/accounts/balance/:accountId` | Get a user's ledger-derived account balance | Authenticated; account ownership checked |
| `POST` | `/api/transactions` | Create a transfer | Authenticated |
| `POST` | `/api/transactions/system/initial-funds` | Create an initial-funds transaction | System user only |

### Example transfer request

`POST /api/transactions`

```json
{
  "fromAccount": "SOURCE_ACCOUNT_ID",
  "toAccount": "DESTINATION_ACCOUNT_ID",
  "amount": 100,
  "idempotencyKey": "unique-request-key-001"
}
```

Send the JWT using the `Authorization: Bearer <token>` header or the authentication cookie, according to your client setup.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Suraj-219/Backend-Ledger.git
cd Backend-Ledger
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Add your own credentials; **never commit real secrets to GitHub**.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret

EMAIL_USER=your_gmail_address
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
```

Email settings are used by the Nodemailer service. Configure Google OAuth2 correctly or adapt/disable email delivery for your environment.

### 4. Run the server

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The server listens on port `3000` in the current configuration. The root route should return:

```text
Ledger Service is up and running
```

For deployment platforms that provide a `PORT` environment variable, configure the server to listen on `process.env.PORT` before deploying to that platform.

## Data Models

- **User:** Name, email, password hash, system-user flag, timestamps.
- **Account:** Owner, currency, status, system-user flag, timestamps.
- **Transaction:** Source account, destination account, amount, status, idempotency key, timestamps.
- **Ledger:** Account, amount, transaction reference, debit/credit type, timestamps.
- **Blacklisted token:** JWT recorded during logout so middleware can reject it.

## Security and Reliability Considerations

This project includes several useful patterns, but it should not be considered production-ready without further review. Before handling real financial activity:

- Ensure all transfer writes and related balance checks are safe under concurrent requests.
- Use `try/catch` and rollback/`endSession()` handling consistently for MongoDB sessions.
- Validate that the authenticated user owns the source account and is authorized to initiate each transfer.
- Validate that amounts are finite positive numbers and use a money-safe representation (such as integer minor units or Decimal128).
- Ensure system-user privileges cannot be self-assigned through public registration.
- Configure secure cookie options, CORS, rate limiting, centralized error handling, and request validation.
- Add automated unit and integration tests.
- Configure email sending so a mail failure cannot misrepresent the status of a committed transaction.
- Verify that your MongoDB deployment supports transactions (replica set or sharded cluster).

## Live Deployment

- **Live API:** https://backend-ledger-3eb5.onrender.com
- **GitHub Repository:** https://github.com/Suraj-219/Backend-Ledger

## What I Learned

- Designing REST APIs with Express.js.
- Implementing JWT authentication and token blacklisting.
- Modeling users, accounts, transactions, and ledger entries with Mongoose.
- Applying double-entry accounting concepts to backend transaction records.
- Using idempotency keys to handle repeated requests.
- Calculating balances from ledger history.
- Managing configuration with environment variables.

## Author

**Suraj Pal**

- GitHub: [Suraj-219](https://github.com/Suraj-219)

---

If you find this project useful, feel free to explore the repository and share feedback.
