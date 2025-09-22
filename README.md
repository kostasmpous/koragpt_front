# KoraGPT Frontend

> ⚡️ The backend for this project is here: [koragpt_back](https://github.com/kostasmpous/koragpt_back)

KoraGPT is a **Next.js 15 + React 19** client that signs users in, lets them browse their chat history, and talk to large-language-model providers through a single interface.

---

## Layout and State Management

- The custom `_app` wraps every non-auth page with:
    - `AuthProvider`
    - `ProtectedRoute`
    - Left-hand `Sidebar`

  → Ensures authenticated screens always share the same layout while `/login` and `/register` stay bare-bones.

- **Authentication state** is stored in `AuthContext`.  
  It:
    - Hydrates tokens from `localStorage`
    - Decorates Axios with the bearer token
    - Exposes login/logout helpers
    - Redirects to `/login` when a session goes missing

---

## Page Tour

- **`/login`** – Username/password form that calls the login helper, shows inline errors, and links new users to registration.
- **`/register`** – Collects profile details, posts to `/api/auth/signup`, and confirms success before sending users back to the sign-in screen.
- **`/chat/[id]`** – Main conversation view:
    - Polls the REST backend for messages
    - Normalises them into assistant/user bubbles
    - Lets you pick an AI provider + model
    - Uses the Composer to send replies to `/api/messages`
- **`SettingsDialog`** – User settings:
  - Two-tab dialog for **Security** (email/password) and **Billing/Profile** (name, address, etc.)
  - Fetches current profile from `/api/users/me` when opened
  - Saves updates via `PATCH /api/users/me` and `POST /api/users/me/password`


---

## Shared Interface Pieces

- **Sidebar** – Loads the signed-in user’s chats from `/api/chats/users/{userId}/chats`, highlights the active thread, spawns new chats, opens Settings, and provides a logout button.
- **Composer** – Grows with your text, sends messages to `/api/messages`, and supports Enter-to-send with optional cancel mid-flight.
- **Settings dialog** – Two-tab modal for changing email/password or basic billing/profile details; it pulls the current profile on open and persists edits back to `/api/users/me`.
- **ProtectedRoute** – Simple gatekeeper that waits for auth hydration before redirecting unauthenticated visitors to `/login`.

---

## Backend Integration

- All API calls go through `src/lib/api.js`:
    - Base URL: `http://localhost:8080`
    - Automatically attaches the stored bearer token
    - Shares Axios configuration across the app

👉 Adjust that base URL if your backend runs elsewhere.

---

## Running Locally

1. Install dependencies with your preferred Node package manager:

   ```bash
   npm install
   # or
   pnpm install
    ```
2. Start the dev server with 
   ```bash
   npm run dev
    ```
    then visit http://localhost:3000.

---

## Screenshots

#### Login & Register Page:
![login.png](img/login.png)

![register.png](img/register.png)

#### Home Page
![home_page.png](img/home_page.png)

#### New Chat

![new_chat.png](img/new_chat.png)

#### OpenAI and Gemini test:

![openai_text.png](img/openai_text.png)
![gemini_text.png](img/gemini_text.png)

#### Settings page:

![settings1.png](img/settings1.png)
![settings2.png](img/settings2.png)
