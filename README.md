Task Manager API

A secure Task Management REST API built using Node.js and Express.js, integrating:

PostgreSQL → User authentication
MongoDB → Task storage
JWT → Authentication
Swagger → API documentation
Mongoose → MongoDB ORM
bcrypt → Password hashing

This application allows users to:

Register
Login
Authenticate using JWT
Create tasks
View tasks
Update tasks
Delete tasks
Enforce user-level authorization
Tech Stack
Node.js
Express.js
PostgreSQL
MongoDB
Mongoose
JWT Authentication
Swagger (OpenAPI)
bcrypt
dotenv
Project Architecture
task-manager-api/

project-root/
│
├── config/
│   ├── db.js
│   ├── mongo.js
│   └── swagger.js
│
├── controllers/
│   ├── authController.js
│   └── taskController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validateMiddleware.js
│
├── models/
│   ├── Task.js
│   └── User.js
│
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
│
├── utils/
│   └── generateToken.js
│
├── .env
├── server.js
└── README.md

Folder Structure Explanation
config/

Handles database and Swagger configuration.

db.js

Creates PostgreSQL connection pool.

Used for:

User authentication
User storage
mongo.js

Connects to MongoDB using Mongoose.

Used for:

Task storage
swagger.js

Defines:

API documentation
Request schemas
Response schemas
Security definitions
controllers/

Contains business logic.

authController.js

Handles:

User registration
Login
Profile retrieval

Security:

Password hashing using bcrypt
JWT token generation
taskController.js

Handles:

Create task
Get tasks
Get task by ID
Update task
Delete task

Security:

User ownership validation
Only task owner can modify task
middleware/

Reusable request processing logic.

authMiddleware.js

Responsible for:

Extracting JWT token
Verifying token
Attaching user to request
errorMiddleware.js

Handles:

Validation errors
MongoDB errors
PostgreSQL errors
Duplicate records
Invalid IDs
models/

Defines database schema.

Task.js

MongoDB schema.

Task
 ├── title
 ├── description
 ├── dueDate
 ├── status
 ├── userId
 ├── createdAt
 └── updatedAt
User.js

Creates PostgreSQL table automatically.

users
 ├── id
 ├── email
 └── password
routes/

Defines API endpoints.

authRoutes.js
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
taskRoutes.js
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
utils/
generateToken.js

Creates JWT token.

expiresIn: 7 days
Design Decisions
1. Hybrid Database Architecture

PostgreSQL is used for:

Structured data
Authentication
Transactions
Unique constraints

MongoDB is used for:

Flexible task data
Fast CRUD operations
Schema flexibility

This separation improves:

Scalability
Performance
Maintainability
2. JWT Authentication

Chosen because:

Stateless
Secure
Scalable
Industry standard
3. Middleware-Based Architecture

Separates:

Authentication
Validation
Error handling
Logging

Improves:

Code reusability
Maintainability
Testability
4. Swagger API Documentation

Provides:

Interactive API testing
Request validation
Response schemas
Developer usability
Environment Variables

Create .env

PORT=5001

JWT_SECRET=mysecretkey

POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=taskdb
POSTGRES_PORT=5432

MONGO_URI=mongodb://127.0.0.1:27017/taskdbr
Database Setup
Step 1 — Install PostgreSQL

Mac:

brew install postgresql

Windows:

Download from:

https://www.postgresql.org/download/
Step 2 — Start PostgreSQL

Mac:

brew services start postgresql

Windows:

Start service from:

Services → PostgreSQL
Step 3 — Create Database
psql -U postgres

Then:

CREATE DATABASE taskdb;
Step 4 — Install MongoDB

Mac:

brew install mongodb-community

Windows:

Download from:

https://www.mongodb.com/try/download/community
Step 5 — Start MongoDB
mongod
Installation
git clone <repository-url>
cd task-manager-api

Install dependencies:

npm install
Run Application
npm start

Server starts on:

http://localhost:5001

Swagger:

http://localhost:5001/api-docs
API Authentication

All protected routes require:

Authorization: Bearer <token>

Example:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
API Documentation
Register User

POST

/api/auth/register

Request:

{
  "email": "user@example.com",
  "password": "123456"
}

Response:

201 Created
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
Login

POST

/api/auth/login

Request:

{
  "email": "user@example.com",
  "password": "123456"
}

Response:

200 OK
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
Get Profile

GET

/api/auth/profile

Header:

Authorization: Bearer <token>

Response:

200 OK
{
  "id": 1,
  "iat": 1710000000,
  "exp": 1710600000
}
Create Task

POST

/api/tasks

Header:

Authorization: Bearer <token>

Request:

{
  "title": "Buy milk",
  "description": "From store",
  "status": "pending"
}

Response:

201 Created
Get All Tasks

GET

/api/tasks
Get Task By ID

GET

/api/tasks/:id
Update Task

PATCH

/api/tasks/:id
Delete Task

DELETE

/api/tasks/:id
Authorization Rule

Users can only access their own tasks.

Example:

User A:

userId = 1

User B:

userId = 2

If User B tries:

GET /api/tasks/<UserA_TaskId>

Response:

404 Task not found
Error Handling

Centralized error middleware handles:

Invalid token
Duplicate email
Validation errors
Invalid MongoDB ID
Unauthorized access
Database errors

Example:

{
  "message": "Invalid credentials"
}
Validation

Handled automatically via:

Mongoose schema
Middleware
Database constraints

Examples:

Missing email
Invalid password
Duplicate email
Invalid task ID
Security Features
Password hashing (bcrypt)
JWT authentication
Authorization middleware
Input validation
Centralized error handling
User-level access control
Testing via Swagger

Open:

http://localhost:5001/api-docs

Steps:

Register
Copy token
Click Authorize
Paste token
Test endpoints
Video Demonstration Guide (5 Minutes)

Record screen and show exactly this.

1. Setup (30 seconds)

Show:

npm install
npm start

Then open:

http://localhost:5001/api-docs
2. Register User

Show:

POST

/api/auth/register

Response:

201 Created
3. Login

Show:

POST

/api/auth/login

Copy token.

4. Create Task

Show:

POST

/api/tasks
5. View Tasks

Show:

GET

/api/tasks
6. Update Task

Show:

PATCH

/api/tasks/:id
7. Delete Task

Show:

DELETE

/api/tasks/:id
8. Authorization Test (Important)

Create:

User A
User B

Login as User B.

Try:

GET /api/tasks/<UserA_TaskId>

Show:

404 Task not found

Say:

"This demonstrates user-level authorization."

9. Error Handling Demo

Try:

Login with wrong password

Show:

401 Invalid credentials

Then:

GET /api/tasks

Without token.

Show:

401 No token
Run Commands Summary
npm install
npm start

Swagger:

http://localhost:5001/api-docs
