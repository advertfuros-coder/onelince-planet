---
description: How to maintain and extend the Admin Panel
---

# Admin Panel Maintenance Workflow

## 1. Overview

The admin panel is built with a modular architecture under `src/app/admin/(admin)`.
Each feature has a dedicated directory (e.g., `products`, `sellers`, `settings`).

## 2. Adding New Features

To add a new feature (e.g., "Blog Management"):

1.  **Create API Endpoint**:

    - Create `src/app/admin/(admin)/blog/route.js`.
    - Implement GET/POST/PUT/DELETE methods.
    - Ensure `verifyToken` and role checks are in place.

2.  **Create Page Component**:

    - Create `src/app/admin/(admin)/blog/page.jsx`.
    - Use `useAuth` hook for token access.
    - Fetch data in `useEffect`.

3.  **Update Sidebar**:
    - Add the new link to `src/app/components/admin/Sidebar.jsx` (if applicable).

## 3. Global Settings

- The settings page is located at `src/app/admin/(admin)/settings/page.jsx`.
- It uses the `GlobalSetting` Mongoose model.
- When adding new global configurations, update the Schema in `src/lib/db/models/GlobalSetting.js` first.

## 4. Analytics & AI

- The Analytics dashboard (`src/app/admin/(admin)/analytics`) fetches data from `/api/admin/analytics`.
- The AI predictions utilize the `predict=true` query parameter to invoke the Gemini model.

## 5. Security Checklist

- **Always** verify the token in API routes:
  ```javascript
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'admin') { ... }
  ```
- **Frontend**: Use `if (user && user.role !== 'admin')` checks to prevent unauthorized UI access.
