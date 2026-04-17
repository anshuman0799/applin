# Applin Postman Guide

Base URL: `http://localhost:3000`

Importable collection: `postman/Applin.postman_collection.json`

Seeded credentials after `pnpm db:seed` or `pnpm db:reset`:

- Email: `postman-tester@example.com`
- Password: `testpass123`

Local database scripts:

- `pnpm db:start`
- `pnpm db:stop`
- `pnpm db:seed`
- `pnpm db:reset`

## Auth flow

Protected routes use the Auth.js session cookie.

1. Register a user with `POST /api/auth/register`
2. Fetch CSRF token with `GET /api/auth/csrf`
3. Sign in with `POST /api/auth/callback/credentials`
4. Reuse the Postman cookie jar for protected requests

## Public endpoints

### Register

`POST /api/auth/register`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "name": "Postman Tester",
  "email": "postman-tester@example.com",
  "password": "testpass123"
}
```

### Fetch CSRF token

`GET /api/auth/csrf`

Returns:

```json
{
  "csrfToken": "..."
}
```

### Sign in with credentials

`POST /api/auth/callback/credentials`

Headers:

- `Content-Type: application/x-www-form-urlencoded`

Body type: `x-www-form-urlencoded`

- `email`: `postman-tester@example.com`
- `password`: `testpass123`
- `csrfToken`: value from `GET /api/auth/csrf`
- `callbackUrl`: `http://localhost:3000`

### Current session

`GET /api/auth/session`

Requires the session cookie created by the credentials callback.

## Protected endpoints

### List applications

`GET /api/applications`

### Create application

`POST /api/applications`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "company": "OpenAI",
  "role": "Software Engineer",
  "jobLink": "https://example.com/jobs/123",
  "location": "Remote",
  "status": "Screening"
}
```

### Get application

`GET /api/applications/:id`

### Update application

`PATCH /api/applications/:id`

Headers:

- `Content-Type: application/json`

Body example:

```json
{
  "status": "Interview Round 2",
  "location": "San Francisco, CA"
}
```

### Delete application

`DELETE /api/applications/:id`

### List notes for an application

`GET /api/applications/:id/notes`

### Create note

`POST /api/applications/:id/notes`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "content": "Recruiter reached out and scheduled intro call."
}
```

### Update note

`PATCH /api/applications/:id/notes/:noteId`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "content": "Recruiter reached out, intro call completed, waiting on next round."
}
```

### Delete note

`DELETE /api/applications/:id/notes/:noteId`

## Verified local test flow

- Registered `postman-tester@example.com`
- Authenticated through `POST /api/auth/callback/credentials`
- Created and updated an application
- Created, updated, and deleted a note
- Deleted the application and confirmed the list is empty again
