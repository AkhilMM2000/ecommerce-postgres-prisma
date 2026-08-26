# Ecommerce Backend with PostgreSQL and Prisma

A practical backend project for learning how to build an ecommerce API using Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

## Project Goal

The goal of this project is to understand how a real backend application is structured, starting from a basic Express server and gradually adding database models, Prisma ORM, authentication, and ecommerce features.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM

## Current Features

- Basic Express server setup
- JSON middleware configured
- Health check route
- TypeScript build setup
- Development server with auto-restart

## Planned Features

- PostgreSQL database connection
- Prisma schema and migrations
- User model
- Product model
- Cart model
- Order and order item models
- REST API routes for ecommerce operations
- Authentication and authorization
- Environment variable configuration

## Getting Started

### 1. Install dependencies

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd install
```

### 2. Run in development mode

```bash
npm run dev
```

On Windows PowerShell:

```bash
npm.cmd run dev
```

### 3. Build the project

```bash
npm run build
```

### 4. Start the compiled server

```bash
npm start
```

## API Endpoints

### Health Check

```http
GET /
```

Response:

```json
{
  "message": "E-commerce API is running"
}
```

## Project Structure

```text
ecommerce-postgres/
+-- src/
|   +-- index.ts
+-- package.json
+-- package-lock.json
+-- tsconfig.json
+-- README.md
```

## Learning Focus

This project is being built step by step to practice backend development concepts such as API design, database modeling, ORM usage, migrations, validation, error handling, and clean project structure.
