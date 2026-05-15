# Architecture

This project is a small Flask application that serves a static frontend and exposes JSON plus Socket.IO endpoints for authentication, feedback storage, and messaging.

## System Overview

```text
Browser
  |
  | HTTP static files, JSON fetch calls, Socket.IO
  v
Flask app: Backend/app.py
  |
  | route blueprints
  v
Backend/Routes/
  |
  | MongoDB collection access
  v
Backend/database.py
  |
  v
MongoDB: feedback_db
```

The frontend is deliberately plain HTML, CSS, and JavaScript. A Lovable-generated React/TanStack/Tailwind design was used as inspiration, then manually ported into the static frontend so the project can continue to run through Flask without a separate frontend build step.

## Runtime Components

### Flask Application

`Backend/app.py` owns:

- Flask app creation.
- Static frontend serving from `Frontend/`.
- CORS setup.
- Flask-Login setup.
- Flask-WTF CSRF setup.
- Socket.IO setup.
- Route blueprint registration.
- Runtime configuration from `.env`.

The app serves `Frontend/index.html` from `/`. Other frontend files are available through Flask static serving because the app is configured with:

```python
static_folder="../Frontend"
static_url_path=""
```

### MongoDB Layer

`Backend/database.py` creates a MongoDB client and exposes collection handles:

- `feedback_collection`
- `users_collection`

Configuration comes from:

- `MONGO_URI`
- `MONGO_DB_NAME`

Default local database:

```text
mongodb://localhost:27017/
feedback_db
```

### Authentication Routes

`Backend/Routes/auth_routes.py` owns:

- `POST /register`
- `POST /api/login`
- `GET /api/logout`
- `GET /csrf-token`

Registration stores users in MongoDB with:

- `username`
- `email`
- hashed `password`
- `active`
- `fs_uniquifier`

Login uses `User.get_user_by_username()` from `Backend/Models/user_models.py`, checks the password hash, then starts a Flask-Login session with `login_user(user)`.

CSRF token generation exists, but CSRF enforcement is currently controlled by:

```text
WTF_CSRF_ENABLED=False
```

### Feedback Routes

`Backend/Routes/feedback_routes.py` owns:

- `POST /api/feedback`
- `GET /api/retrive`

The retrieve endpoint is currently spelled `retrive`. Keep this spelling unless updating all callers or adding a compatibility alias.

### Socket.IO Messaging

`Backend/app.py` listens for:

```text
connect
chat message
```

When a client emits `chat message`, the backend broadcasts the message to all other connected clients:

```python
emit("chat message", msg, broadcast=True, include_self=False)
```

The frontend connects with:

```js
io()
```

That means it connects to the same origin serving the page, which works better than hardcoding `127.0.0.1`.

## Frontend Architecture

### Auth Page

Files:

- `Frontend/index.html`
- `Frontend/styles/style.css`
- `Frontend/script.js`

Responsibilities:

- Display the redesigned Loop login/signup experience.
- Toggle between login and signup forms.
- Submit login to `POST /api/login`.
- Submit signup to `POST /register`.
- Redirect successful login to `./main.html`.

Important DOM IDs preserved for JavaScript:

- `loginForm`
- `signupForm`
- `username`
- `password`
- `signupUsername`
- `signupEmail`
- `signupPassword`
- `confirmPassword`
- `signupLink`
- `loginLink`

### Messaging Dashboard

Files:

- `Frontend/main.html`
- `Frontend/styles/main.css`
- `Frontend/messaging.js`

Responsibilities:

- Display nav rail, conversations, active chat, and composer.
- Filter contacts by search query.
- Switch active contact.
- Add outgoing and incoming message bubbles.
- Emit and receive Socket.IO `chat message` events.
- Support mobile conversation-list/chat-panel switching.

Important DOM IDs/classes preserved for JavaScript:

- `messageInput`
- `sendButton`
- `search`
- `activeName`
- `activeStatus`
- `activeAvatar`
- `.messages`
- `.contact-card`
- `.mobile-back`

## Configuration

The root `.env` file is loaded explicitly by both `Backend/app.py` and `Backend/database.py`.

```text
FLASK_SECRET_KEY=change-this-local-development-secret
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
ALLOW_UNSAFE_WERKZEUG=True
WTF_CSRF_ENABLED=False
SOCKET_CORS_ORIGINS=*
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=feedback_db
```

`.env` is ignored by Git. `.env.example` is the committed template.

## Data Flow

### Signup

```text
Frontend/index.html
  -> Frontend/script.js
  -> POST /register
  -> auth_routes.register_user()
  -> users_collection.insert_one()
  -> MongoDB users
```

### Login

```text
Frontend/index.html
  -> Frontend/script.js
  -> POST /api/login
  -> auth_routes.login()
  -> User.get_user_by_username()
  -> users_collection.find_one()
  -> check_password_hash()
  -> login_user()
```

### Chat Message

```text
Frontend/main.html
  -> Frontend/messaging.js
  -> socket.emit("chat message", message)
  -> Backend/app.py handle_chat_message()
  -> emit("chat message", message, broadcast=True, include_self=False)
  -> other connected browsers
```

### Feedback Storage

```text
Client
  -> POST /api/feedback
  -> feedback_routes.feedback()
  -> feedback_collection.insert_one()
  -> MongoDB feedbacks
```

## Design Decisions

- Keep the frontend static to avoid adding a Node/Vite build pipeline.
- Keep Lovable's generated repo as reference only, not as runtime source.
- Use CSS custom properties for the redesigned color system.
- Use Font Awesome icons because the existing project already used Font Awesome.
- Use `python-dotenv` for predictable local configuration.
- Keep Socket.IO same-origin with `io()` to work across local, tunnel, and deployed origins.

## Known Technical Debt

- `GET /api/retrive` has a typo in the route name.
- CSRF generation exists, but frontend token submission is currently disabled.
- Some imports in `auth_routes.py` are unused and can be cleaned later.
- Chat messages are not persisted to MongoDB.
- Contacts/messages in the dashboard are static sample UI data.
- Login uses username, while the Lovable reference auth used email.
- `load_user()` queries MongoDB by string `_id`; MongoDB `_id` values are usually `ObjectId`, so persisted login sessions may need an `ObjectId` conversion if session restoration fails.

## Safe Change Guidelines

- Preserve existing route paths unless updating frontend callers too.
- Keep `.env` out of Git.
- Do not commit `Backend/venv`, `__pycache__`, or `Lovable-UI`.
- If converting to React later, treat that as a larger architectural migration, not a small UI patch.
