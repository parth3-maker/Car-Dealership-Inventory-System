<<<<<<< HEAD
# Velocity Motors — Car Dealership Inventory System

A full-stack car dealership inventory application built with **Test-Driven Development (TDD)**. Customers can browse and purchase vehicles; dealership staff (admins) manage inventory.

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Lucide Icons, CSS     |
| Backend  | Node.js, Express, TypeScript, Prisma ORM          |
| Database | SQLite                                            |
| Auth     | JWT + bcrypt password hashing                     |
| Testing  | Jest + Supertest                                  |

## Features

- **Authentication** — Register, login, JWT-based sessions, USER and ADMIN roles
- **Vehicle catalog** — Browse all vehicles with stock status indicators
- **Search & filter** — By make, model, category, and price range
- **Purchase** — Authenticated users can buy vehicles (decrements stock)
- **Admin inventory** — Add, edit, delete, and restock vehicles (admin only)

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed. Defaults work for local development.

### 3. Set up the database

```bash
npm run db:setup
```

This runs Prisma migrations and seeds sample users and vehicles.

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Seed Accounts

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@velocity.com    | admin123  |
| User  | customer@velocity.com | user123   |

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start backend and frontend together  |
| `npm run dev:backend`| Start backend only                   |
| `npm run dev:frontend`| Start frontend only                 |
| `npm run test:backend`| Run backend integration tests       |
| `npm run db:setup`   | Migrate and seed the database        |

## API Endpoints

### Auth

| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| POST   | `/api/auth/register`| No   | Register a user    |
| POST   | `/api/auth/login`   | No   | Login, returns JWT |

### Vehicles

| Method | Endpoint                      | Auth  | Description              |
|--------|-------------------------------|-------|--------------------------|
| GET    | `/api/vehicles`               | Yes   | List all vehicles        |
| GET    | `/api/vehicles/search`        | Yes   | Search with query params |
| POST   | `/api/vehicles`               | Admin | Create a vehicle         |
| PUT    | `/api/vehicles/:id`           | Admin | Update a vehicle         |
| DELETE | `/api/vehicles/:id`           | Admin | Delete a vehicle         |
| POST   | `/api/vehicles/:id/purchase`  | Yes   | Purchase one unit        |
| POST   | `/api/vehicles/:id/restock`   | Admin | Add stock                |

## Project Structure

```
├── backend/
│   ├── prisma/          # Schema and migrations
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # JWT auth & admin guard
│   │   ├── routes/      # Express routers
│   │   └── tests/       # Jest integration tests
│   └── src/seed.ts      # Database seed script
├── frontend/
│   └── src/
│       ├── App.tsx      # Main SPA
│       ├── api.ts       # API client
│       └── index.css    # UI styles
└── package.json         # Root dev scripts
```

## Running Tests

```bash
npm run test:backend
```

Tests use an isolated SQLite database (`backend/test.db`) and cover authentication, vehicle CRUD, search, purchase, and restock flows.
=======
# Car-Dealership-Inventory-System
Developed a full-stack Car Dealership Inventory System using the MERN Stack for managing vehicle inventory, user authentication, and vehicle purchases.
>>>>>>> bca421025f91f02b61b0d38dd3cfa93df5d311ec

Screenshots For The Project


![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20195950.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200218.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200234.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200240.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200249.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200254.png?raw=true)

![This_Is_image](https://github.com/parth3-maker/Car-Dealership-Inventory-System/blob/main/Screenshot%202026-07-12%20200302.png?raw=true)
