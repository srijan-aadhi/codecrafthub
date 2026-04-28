# CodeCraftHub API

## Project overview
CodeCraftHub is a simple Node.js + Express REST API for tracking personal learning courses.
It is designed for beginners who want to practice core REST concepts without using a database.
All course data is stored in a local JSON file (`courses.json`).

## Features
- Create, read, update, and delete courses (CRUD).
- File-based storage with automatic `courses.json` creation.
- Input validation for required fields.
- Status validation (`Not Started`, `In Progress`, `Completed`).
- Friendly error messages for common issues.

## Installation instructions
1. Clone or download this project.
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

## How to run the application
Run the server:

```bash
npm start
```

The API will start on:

`http://localhost:5000`

You can also test the health route:

- `GET /` -> `CodeCraftHub API is running.`

## API endpoint documentation
Base URL: `http://localhost:5000`

### 1) Create course
**Endpoint:** `POST /api/courses`

**Request body:**

```json
{
  "name": "Node.js Basics",
  "description": "Learn Express and REST fundamentals",
  "target_date": "2026-05-15",
  "status": "Not Started"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Node.js Basics\",\"description\":\"Learn Express and REST fundamentals\",\"target_date\":\"2026-05-15\",\"status\":\"Not Started\"}"
```

**Success response (201):**

```json
{
  "id": 1,
  "name": "Node.js Basics",
  "description": "Learn Express and REST fundamentals",
  "target_date": "2026-05-15",
  "status": "Not Started",
  "created_at": "2026-04-27T18:30:00.000Z"
}
```

---

### 2) Get all courses
**Endpoint:** `GET /api/courses`

**Example cURL:**

```bash
curl http://localhost:5000/api/courses
```

**Success response (200):**

```json
[
  {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn Express and REST fundamentals",
    "target_date": "2026-05-15",
    "status": "Not Started",
    "created_at": "2026-04-27T18:30:00.000Z"
  }
]
```

---

### 3) Get a specific course
**Endpoint:** `GET /api/courses/:id`

**Example cURL:**

```bash
curl http://localhost:5000/api/courses/1
```

**Success response (200):**

```json
{
  "id": 1,
  "name": "Node.js Basics",
  "description": "Learn Express and REST fundamentals",
  "target_date": "2026-05-15",
  "status": "Not Started",
  "created_at": "2026-04-27T18:30:00.000Z"
}
```

---

### 4) Update a course
**Endpoint:** `PUT /api/courses/:id`

**Request body (all fields required):**

```json
{
  "name": "Advanced Node.js",
  "description": "Deep dive into middleware and architecture",
  "target_date": "2026-06-01",
  "status": "In Progress"
}
```

**Example cURL:**

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Advanced Node.js\",\"description\":\"Deep dive into middleware and architecture\",\"target_date\":\"2026-06-01\",\"status\":\"In Progress\"}"
```

**Success response (200):**

```json
{
  "id": 1,
  "created_at": "2026-04-27T18:30:00.000Z",
  "name": "Advanced Node.js",
  "description": "Deep dive into middleware and architecture",
  "target_date": "2026-06-01",
  "status": "In Progress"
}
```

---

### 5) Delete a course
**Endpoint:** `DELETE /api/courses/:id`

**Example cURL:**

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

**Success response (200):**

```json
{
  "message": "Course deleted successfully.",
  "course": {
    "id": 1,
    "name": "Advanced Node.js",
    "description": "Deep dive into middleware and architecture",
    "target_date": "2026-06-01",
    "status": "In Progress",
    "created_at": "2026-04-27T18:30:00.000Z"
  }
}
```

## Common error responses
- `400 Bad Request` for missing required fields or invalid status/date values.
- `404 Not Found` when a course ID does not exist.
- `500 Internal Server Error` for file read/write or server-level errors.

## Troubleshooting
- **`Cannot find module 'express'`**  
  Run `npm install` in the project root.

- **Port 5000 already in use**  
  Stop the process using port 5000, then restart with `npm start`.

- **`courses.json` is missing**  
  The app auto-creates it on startup. If startup fails, check folder permissions.

- **Invalid status error**  
  Use exactly one of these values:
  - `Not Started`
  - `In Progress`
  - `Completed`

- **Date validation error**  
  Use `YYYY-MM-DD` format (for example, `2026-12-31`).
