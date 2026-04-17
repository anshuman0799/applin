# Applin — AI-Powered Job Application Tracker

Applin is a full-stack AI-powered job application management platform built with Next.js 15. It helps users manage their entire job search process in one place — tracking applications, statuses, and notes.

---

## Tech Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 15 (App Router)               |
| Language         | TypeScript                            |
| Styling          | Tailwind CSS                          |
| Authentication   | NextAuth.js v5 (beta)                 |
| Database         | PostgreSQL (Supabase)                 |
| ORM              | Prisma                                |
| Validation       | Zod                                   |
| Forms            | React Hook Form + @hookform/resolvers |
| Data Fetching    | TanStack Query                        |
| Password Hashing | bcryptjs                              |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/anshuman0799/applin.git
cd applin
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

| Variable          | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string (Supabase recommended)     |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL`    | App URL (e.g. `http://localhost:3000`)                  |

### 4. Run database migrations

```bash
pnpm prisma migrate dev
```

### 5. Seed the default demo data

```bash
pnpm db:seed
```

This creates a default local user you can sign in with:

| Field        | Value                        |
| ------------ | ---------------------------- |
| Email        | `postman-tester@example.com` |
| Password     | `testpass123`                |
| Display name | `Postman Tester`             |

Default seeded applications:

| Company       | Role                      | Stage     | Notes                       |
| ------------- | ------------------------- | --------- | --------------------------- |
| OpenAI        | Software Engineer         | Interview | Includes 3 interview rounds |
| Anthropic     | Forward Deployed Engineer | Applied   | Fresh application           |
| Example Corp  | Product Engineer          | Screening | Recruiter pipeline          |
| Northstar AI  | Platform Engineer         | Rejected  | Closed by company           |
| Studio Labs   | Frontend Engineer         | Accepted  | Offer accepted              |
| Orbit Systems | Backend Engineer          | Withdrawn | Closed by user              |

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method   | Path                                  | Description                            | Auth Required |
| -------- | ------------------------------------- | -------------------------------------- | ------------- |
| `POST`   | `/api/auth/register`                  | Register a new user                    | No            |
| `POST`   | `/api/auth/signin`                    | Sign in (NextAuth)                     | No            |
| `GET`    | `/api/auth/session`                   | Get current session                    | No            |
| `GET`    | `/api/applications`                   | List all applications for current user | Yes           |
| `POST`   | `/api/applications`                   | Create a new application               | Yes           |
| `GET`    | `/api/applications/:id`               | Get a single application with notes    | Yes           |
| `PATCH`  | `/api/applications/:id`               | Update an application                  | Yes           |
| `DELETE` | `/api/applications/:id`               | Delete an application                  | Yes           |
| `GET`    | `/api/applications/:id/notes`         | Get all notes for an application       | Yes           |
| `POST`   | `/api/applications/:id/notes`         | Add a note to an application           | Yes           |
| `PATCH`  | `/api/applications/:id/notes/:noteId` | Update a note                          | Yes           |
| `DELETE` | `/api/applications/:id/notes/:noteId` | Delete a note                          | Yes           |

---

## Project Structure

```
applin/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handlers
│   │   │   └── register/route.ts       # User registration
│   │   └── applications/
│   │       ├── route.ts                # GET all, POST new
│   │       └── [id]/
│   │           ├── route.ts            # GET one, PATCH, DELETE
│   │           └── notes/
│   │               ├── route.ts        # GET notes, POST note
│   │               └── [noteId]/route.ts  # PATCH, DELETE note
├── lib/
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth config
│   └── validations/
│       ├── application.ts              # Zod schemas for applications
│       └── note.ts                     # Zod schemas for notes
├── types/
│   └── index.ts                        # Shared TypeScript types
├── prisma/
│   └── schema.prisma                   # Database schema
├── .env.example                        # Environment variable template
└── README.md
```

---

## Application Pipeline

The app uses six default stages in this order:

1. `Applied`
2. `Screening`
3. `Interview`
4. `Withdrawn`
5. `Rejected`
6. `Accepted`

`Interview` supports multiple internal rounds that can be added, renamed, reordered, and deleted in the UI.

---

## Response Format

All API endpoints return consistent JSON responses:

**Success:**

```json
{ "data": { ... } }
```

**Error:**

```json
{ "error": "Error message here" }
```
