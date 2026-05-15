# CLAUDE.md

This file gives coding-agent guidance for working in this repository.

## Project Identity

Feedback Platform is a Flask + MongoDB app with a static HTML/CSS/JavaScript frontend. The UI was redesigned from a Lovable-generated reference, but the runtime app is not React and does not require a frontend build step.

## First Files To Read

Read these before making broad changes:

- `README.md` for setup and route documentation.
- `ARCHITECTURE.md` for system structure and data flow.
- `Backend/app.py` for Flask, Socket.IO, static serving, and environment config.
- `Backend/database.py` for MongoDB config.
- `Frontend/script.js` for auth behavior.
- `Frontend/messaging.js` for chat behavior.

## Run Commands

From the project root on Windows PowerShell:

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python app.py
```

Open:

```text
http://127.0.0.1:5000/
```

Validation commands:

```powershell
Backend\venv\Scripts\python.exe -m py_compile Backend\app.py Backend\database.py Backend\Routes\auth_routes.py Backend\Routes\feedback_routes.py Backend\Models\user_models.py
node --check Frontend\script.js
node --check Frontend\messaging.js
```

## Environment

The root `.env` file is local-only and ignored by Git. Use `.env.example` as the template.

Important variables:

- `FLASK_SECRET_KEY`
- `FLASK_DEBUG`
- `FLASK_HOST`
- `FLASK_PORT`
- `ALLOW_UNSAFE_WERKZEUG`
- `WTF_CSRF_ENABLED`
- `SOCKET_CORS_ORIGINS`
- `MONGO_URI`
- `MONGO_DB_NAME`

Do not hardcode secrets, MongoDB connection strings, host, or port values in Python files.

## Architecture Rules

- Keep the current app as Flask serving static frontend files unless the user explicitly asks for a framework migration.
- Do not introduce React/Vite/Tailwind build tooling into the main app without explicit approval.
- Keep Lovable output as reference only. The ignored `Lovable-UI/` directory is not runtime source.
- Preserve same-origin Socket.IO connection in `Frontend/messaging.js` with `io()` unless there is a deployment-specific reason to change it.
- Preserve existing endpoint paths unless changing all callers and documentation together.

## Frontend Rules

The frontend is split by page:

- Auth: `Frontend/index.html`, `Frontend/styles/style.css`, `Frontend/script.js`
- Dashboard: `Frontend/main.html`, `Frontend/styles/main.css`, `Frontend/messaging.js`

Do not rename these DOM IDs without updating JavaScript:

- `loginForm`
- `signupForm`
- `username`
- `password`
- `signupUsername`
- `signupEmail`
- `signupPassword`
- `confirmPassword`
- `messageInput`
- `sendButton`
- `search`
- `activeName`
- `activeStatus`
- `activeAvatar`

Do not rename these JavaScript-dependent classes without updating JavaScript:

- `.messages`
- `.contact-card`
- `.mobile-back`

## Backend Rules

Authentication lives in:

```text
Backend/Routes/auth_routes.py
```

Feedback routes live in:

```text
Backend/Routes/feedback_routes.py
```

MongoDB collection handles live in:

```text
Backend/database.py
```

The route `/api/retrive` is misspelled but documented. Add a correctly spelled alias only if needed; do not remove the old route without checking callers.

## Git Hygiene

Do not commit:

- `.env`
- `Backend/venv/`
- `__pycache__/`
- `*.pyc`
- `Lovable-UI/`
- temporary server logs

These are covered by `.gitignore`.

## Known Risks

- CSRF enforcement is disabled by default through `WTF_CSRF_ENABLED=False`.
- Chat messages are only broadcast live; they are not stored.
- Dashboard contacts/messages are sample static data.
- `load_user()` may need MongoDB `ObjectId` conversion for robust session restoration.
- Some backend imports are unused and can be cleaned during a dedicated cleanup pass.

## Preferred Change Style

- Keep changes scoped and document behavior when routes, environment variables, or DOM contracts change.
- Prefer simple static HTML/CSS/JS patterns over adding dependencies.
- Run syntax checks before handing work back.
- Update `README.md` and `ARCHITECTURE.md` when changing setup, routes, config, or data flow.
