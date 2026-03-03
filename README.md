# 📚 Book Store

A modern Angular 19 application demonstrating scalable frontend architecture,
OpenAPI integration, JWT authentication, and a custom Node.js mock backend.

---

# 🚀 Tech Stack

## Frontend

- Angular 19 (Standalone APIs)
- Angular Signals (state management)
- Angular Material (custom themed)
- RxJS
- ngx-translate (i18n)
- SCSS design system

## Backend (Mock Server)

- Node.js
- Connect middleware
- File-based JSON database
- JWT (mocked authentication)
- Custom REST handlers

---

# 📦 Project Architecture

The application follows a **feature-based modular architecture** with a clear separation of concerns.

## 1️⃣ Core Layer (`src/app/core`)

Contains reusable infrastructure:

- **guards** → route protection (authGuard)
- **interceptors** → HTTP token injection
- **models** → shared domain models
- **resolvers** → route data preloading
- **ui/notifications** → global toast system

This layer contains no feature-specific logic.

---

## 2️⃣ Feature Modules (`src/app/modules`)

### 🔐 Auth Module

```
modules/auth
├── data        → AuthStore (signals-based session state)
├── services    → AuthService (OpenAPI integration)
├── ui          → Login dialog component
```

Responsibilities:

- Login
- Logout
- JWT storage (localStorage)
- User state management

---

### 📖 Books Module

```
modules/books
├── data        → BooksStore (signals-based state)
├── pages       → Overview & List pages
├── services    → Dialog abstraction
├── ui          → Reusable UI components
```

Responsibilities:

- List books
- Overview (infinite scroll)
- CRUD operations
- Filtering & pagination
- Modal details view

State is managed via Angular Signals — no NgRx used.

---

## 3️⃣ Shared Layer

Reusable UI + utilities:

```
shared/
├── models
├── services/confirm
└── ui/confirm-dialog
```

---

## 4️⃣ Shell Layer

```
shell/
├── app-shell
└── top-bar
```

Contains global layout and navigation.

---

# 🔐 Authentication Flow

1. User opens Login dialog
2. Credentials sent to:

```
POST /v1/auth/login
```

3. Server returns:

```
{
  accessToken: "...",
  tokenType: "Bearer",
  expiresIn: 3600,
  user: { username, displayName }
}
```

4. AuthStore persists:

- mxs.auth.token
- mxs.auth.user

5. HTTP interceptor injects:

```
Authorization: Bearer <token>
```

---

# 📂 Folder Structure

```
.
├── mocks
│   ├── api
│   ├── api-data
│   └── db
├── openapi
│   └── generated
│       ├── api
│       └── model
└── src
    ├── app
    │   ├── core
    │   ├── modules
    │   │   ├── auth
    │   │   └── books
    │   ├── shared
    │   └── shell
    ├── assets
    │   ├── i18n
    │   ├── img
    │   └── sass
    └── environments
```

---

# 🛠 Setup Instructions

## 1️⃣ Install Dependencies

```
npm install
```

---

## 2️⃣ Start Mock Backend

```
node mocks/server.js
```

Mock server runs at:

```
http://localhost:3001/book-store-bff
```

---

## 3️⃣ Run Angular Application

```
npm start
```

or

```
ng serve
```

Application runs at:

```
http://localhost:4200
```

---

# 🔄 Regenerate OpenAPI Client

If `openapi.yaml` changes:

```
npx openapi-generator-cli generate   -i openapi.yaml   -g typescript-angular   -o openapi/generated
```

Restart Angular after regeneration.

---

# 🎨 Design System

Custom SCSS variables are located in:

```
src/assets/sass/
```

Material default theme colors are overridden to match custom design tokens.

---

# 📈 Features Overview

✔ Infinite scroll overview (3 cards per row)  
✔ Server-driven filtering (onSale query)  
✔ Reactive Forms with validation  
✔ Modal dialogs for CRUD  
✔ JWT authentication  
✔ Route guards  
✔ Custom Material theme  
✔ Signals-based store architecture

---

# 📘 Angular Migration Guide

See separate file:

```
ANGULAR_MIGRATION.md
```

---

# 👨‍💻 Author

Eduard Khachatryan  
Senior Frontend Engineer  
Angular Architecture & Scalable Frontend Systems
