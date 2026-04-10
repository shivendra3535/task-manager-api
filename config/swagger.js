require("dotenv").config();
const path = require("path");
const swaggerJsDoc = require("swagger-jsdoc");

const port = process.env.PORT || 5001;
const serverUrl =
  process.env.API_BASE_URL || `http://127.0.0.1:${port}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description:
        "Auth uses PostgreSQL; tasks use MongoDB. Send JWT as: Authorization: Bearer <token>",
    },
    servers: [
      {
        url: serverUrl,
        description: "API server",
      },
    ],
    tags: [
      { name: "Auth", description: "Register, login, profile" },
      { name: "Tasks", description: "Task CRUD (requires JWT)" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token from login or register. Swagger sends it as a Bearer token.",
        },
      },
      schemas: {
        RegisterLoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", format: "password", minLength: 1 },
          },
        },
        AuthSuccess: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                email: { type: "string" },
              },
            },
          },
        },
        ErrorMessage: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            dueDate: { type: "string", format: "date-time", nullable: true },
            status: { type: "string", enum: ["pending", "completed"] },
            userId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Buy milk" },
            description: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["pending", "completed"] },
          },
        },
        JwtPayload: {
          type: "object",
          description: "Decoded JWT on profile",
          properties: {
            id: { type: "integer" },
            iat: { type: "integer" },
            exp: { type: "integer" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterLoginBody" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSuccess" },
                },
              },
            },
            "400": {
              description: "Validation or user exists",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorMessage" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterLoginBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSuccess" },
                },
              },
            },
            "400": {
              description: "Missing email/password",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorMessage" },
                },
              },
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorMessage" },
                },
              },
            },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Current user (JWT)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "JWT payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/JwtPayload" },
                },
              },
            },
            "401": {
              description: "Missing or invalid token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorMessage" },
                },
              },
            },
          },
        },
      },
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List my tasks",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create task",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskInput" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by id",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId",
            },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Not found" },
          },
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update task (PATCH)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskInput" },
              },
            },
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Tasks"],
          summary: "Update task (PUT)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskInput" },
              },
            },
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Not found" },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Update task (POST, same as PATCH)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskInput" },
              },
            },
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Not found" },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete task",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Task deleted" },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Not found" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsDoc(options);
