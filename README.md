# Feedback Platform

A Flask-backed feedback and messaging platform with a static HTML/CSS/JavaScript frontend. The current UI was reimagined from the Lovable-generated `team-connect-ui` concept and adapted back into this existing Flask project without converting the app to React.

## What The App Does

- Provides login and signup screens backed by Flask routes.
- Stores registered users in MongoDB.
- Serves a responsive messaging dashboard from Flask static files.
- Supports real-time chat events through Flask-SocketIO.
- Includes a refreshed dashboard UI with a navigation rail, conversation list, active chat panel, feedback-styled messages, and mobile conversation switching.

## Project Structure

```text
Feedback-Platform/
  Backend/
    app.py                  Flask app, static frontend serving, Socket.IO setup
    database.py             MongoDB connection and collection handles
    requirements.txt        Python dependencies
    Models/
      user_models.py        Flask-Login compatible user wrapper
    Routes/
      auth_routes.py        Register, login, logout, CSRF token route
      feedback_routes.py    Feedback create/retrieve routes
  Frontend/
    index.html              Login/signup UI
    main.html               Messaging dashboard UI
    script.js               Auth form behavior and API calls
    messaging.js            Chat UI, contact filtering, Socket.IO behavior
    styles/
      style.css             Auth page styles
      main.css              Messaging dashboard styles
    assets/                 Existing image assets
  .env                      Local development configuration
  .env.example              Safe environment template
```

## Environment Variables

The backend reads configuration from the root `.env` file using `python-dotenv`.

| Variable | Purpose | Local default |
|---|---|---|
| `FLASK_SECRET_KEY` | Secret key for Flask sessions and auth-related signing. | `change-this-local-development-secret` |
| `FLASK_DEBUG` | Enables Flask debug mode. | `True` |
| `FLASK_HOST` | Host used by `socketio.run`. | `0.0.0.0` |
| `FLASK_PORT` | Port used by `socketio.run`. | `5000` |
| `ALLOW_UNSAFE_WERKZEUG` | Allows Flask-SocketIO to run with Werkzeug for local development. | `True` |
| `WTF_CSRF_ENABLED` | Enables or disables Flask-WTF CSRF checks. | `False` |
| `SOCKET_CORS_ORIGINS` | Allowed origins for Socket.IO. | `*` |
| `MONGO_URI` | MongoDB connection string. | `mongodb://localhost:27017/` |
| `MONGO_DB_NAME` | MongoDB database name. | `feedback_db` |

For a real deployment, replace `FLASK_SECRET_KEY`, restrict `SOCKET_CORS_ORIGINS`, and review whether CSRF should be enabled.

## Setup

From the project root:

```powershell
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Make sure MongoDB is running locally, or update `MONGO_URI` in `.env` to point to your MongoDB instance.

## Running Locally

From `Backend/` with the virtual environment active:

```powershell
python app.py
```

Then open:

```text
http://127.0.0.1:5000/
```

The Flask app serves `Frontend/index.html` at `/`. After login, the frontend redirects to `Frontend/main.html`.

## Backend Routes

### Auth

`POST /register`

Expected JSON:

```json
{
  "username": "daniel",
  "email": "daniel@example.com",
  "password": "password123"
}
```

Creates a MongoDB user document with a hashed password, active flag, and Flask-Security `fs_uniquifier`.

`POST /api/login`

Expected JSON:

```json
{
  "username": "daniel",
  "password": "password123"
}
```

Checks the stored password hash and starts a Flask-Login session.

`GET /api/logout`

Requires login. Ends the Flask-Login session.

`GET /csrf-token`

Generates a CSRF token and stores it in the session. CSRF checks are currently disabled by `WTF_CSRF_ENABLED=False`.

### Feedback

`POST /api/feedback`

Expected JSON:

```json
{
  "message": "This is my feedback"
}
```

Stores a feedback message and timestamp in MongoDB.

`GET /api/retrive`

Returns stored feedback records. The route name is currently spelled `retrive`.

## Socket.IO Events

The frontend connects with:

```js
io()
```

That makes the browser connect to the same origin that served the page.

The chat flow uses the event:

```text
chat message
```

When a client sends a message, the backend broadcasts it to other connected clients.

## Frontend Notes

### Auth Screen

`Frontend/index.html` and `Frontend/styles/style.css` define the redesigned auth experience:

- Loop brand panel.
- Login/signup segmented tabs.
- Username, email, password, and confirm-password form states.
- Existing backend endpoints preserved through `Frontend/script.js`.

### Dashboard

`Frontend/main.html` and `Frontend/styles/main.css` define the redesigned messaging dashboard:

- Left icon navigation on desktop.
- Conversation list with search and unread badges.
- Active chat header with status and action icons.
- Message timeline with user, other-user, and feedback-styled bubbles.
- Composer with attach, emoji, and send controls.
- Mobile behavior that swaps between conversation list and chat panel.

### JavaScript

`Frontend/script.js` handles:

- Switching between login and signup.
- Calling `/api/login`.
- Calling `/register`.
- Showing backend errors cleanly.

`Frontend/messaging.js` handles:

- Socket.IO connection.
- Sending and receiving `chat message` events.
- Adding message bubbles to the conversation.
- Contact selection.
- Search filtering.
- Mobile back navigation.

## Lovable Reference

The Lovable repo was cloned locally as `Lovable-UI/` for design reference. It is ignored by Git because the actual implementation was ported into the existing `Frontend/` files.

The Lovable source used a React/TanStack/Tailwind stack. This project remains plain HTML/CSS/JavaScript so it continues to fit the current Flask static-file setup.

## Current Development Notes

- `Backend/requirements.txt` now includes `python-dotenv` for `.env` support.
- `.env` is ignored by Git because it can contain secrets.
- `.env.example` is safe to commit and can be copied when setting up another machine.
- Python `__pycache__` files are ignored and should not be committed.
