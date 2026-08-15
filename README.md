# AI APPOINTMENT BOOKING API - BACKEND DOCUMENTATION

## 1. Overview and Tech Stack

This is the backend service for the AI Appointment Booking application. It provides secure authentication, appointment management, and an AI-driven chat extraction pipeline.

### Technologies Used:

- Node.js with Express: Core server framework.
- TypeScript: For strict type safety and better developer experience.
- PostgreSQL via Supabase: Cloud database storage.
- Prisma ORM: For type-safe database querying and schema management.
- Mistral AI: For natural language understanding and data extraction.
- Zod: For strict runtime request validation.
- JSON Web Tokens (JWT): For secure, stateless user authentication.
- Winston: For enterprise-grade logging.

## 2. Architectural Decisions and Tradeoffs

To ensure the application meets senior-level standards, several architectural patterns were implemented:

### Object-Oriented Routing and Controllers

Instead of writing monolithic route files (fat routes), the application uses an OOP approach. Routes only define paths and attach middlewares. Controllers handle HTTP requests and responses. Services handle pure business logic. This ensures a strict separation of concerns.

### The AI Data Extraction Pipeline (Crucial Tradeoff)

Allowing an AI to directly write to a database poses significant security and data-integrity risks. Instead, the AI is treated purely as a data extractor. It returns strictly formatted JSON, identifies missing fields, asks for them, and once it has Date, Time, and Title, it flags `isComplete: true`. The backend passes this back to the frontend for final confirmation, maintaining a human-in-the-loop fallback mechanism.

### Validation Middleware

Incoming requests are validated using Zod before reaching controllers. Malformed requests are intercepted early with errors, keeping controllers clean.

### Global Error Handling

A centralized middleware catches all errors, distinguishing between validation errors (400), custom HTTP exceptions (e.g., 401, 409), and unknown server errors (500). It ensures consistent JSON error responses without crashing the API.

### Database Normalization (Chat Memory)

Chat history is stored in normalized tables rather than large JSON arrays within session tables. This allows efficient retrieval of recent messages for multi-turn memory without performance issues as conversations grow.

## 3. Database Configuration and Schema Relations

The database layer is managed by **Prisma ORM** connecting to a **PostgreSQL** instance hosted on Supabase. The schema is highly normalized to ensure data integrity and efficient querying as the application scales.

### Core Models

- **User:** Stores authentication credentials (hashed passwords) and user metadata.
- **Appointment:** Stores finalized booking details (title, date, time).
- **ChatSession:** Acts as a container for distinct conversation threads between the user and the AI.
- **ChatMessage:** Stores individual messages (both user inputs and AI responses) alongside the structured JSON data extracted by Mistral.

### Entity Relationship Mapping

- **User ↔ Appointments (1-to-Many):** A user can have multiple appointments. The `Appointment` table includes a `userId` foreign key. Security is enforced at the service layer to ensure users only query appointments matching their JWT payload ID.
- **User ↔ Chat Sessions (1-to-Many):** A single user can initiate and manage multiple distinct chat threads over time.
- **Chat Session ↔ Chat Messages (1-to-Many):** Chat history is stored in a normalized `ChatMessage` table rather than as large JSON arrays within the session table. This allows highly efficient retrieval of recent messages for multi-turn memory without performance degradation as conversations grow.

---

## 4. API Endpoints Reference

### Authentication Endpoints

- **`POST /api/auth/signup`**
  - **Action:** Accepts an email and password. Validates the payload using Zod. Hashes the password using bcrypt. Creates a new `User` record in PostgreSQL.
  - **Access:** Public
- **`POST /api/auth/login`**
  - **Action:** Authenticates the user by comparing the provided password with the hashed password in the database. Upon success, generates and returns a signed JWT.
  - **Access:** Public

### AI Chat Endpoints

- **`POST /api/chat/send`**
  - **Action:** The core AI engine endpoint.
    1. Validates the user's JWT.
    2. Receives a user message and an optional `sessionId`. (Creates a new session if none is provided).
    3. Fetches the previous 5 messages from the database for multi-turn context.
    4. Sends the context and new message to Mistral AI to extract appointment details (Date, Time, Title).
    5. Saves both the user message and the AI's JSON response to the `ChatMessage` database table.
    6. Returns the AI's parsed JSON and conversational response to the frontend.
  - **Access:** Protected (Requires JWT)

### Appointment Endpoints

- **`GET /api/appointments`**
  - **Action:** Retrieves a list of all confirmed appointments belonging strictly to the authenticated user. Uses the `userId` from the JWT to ensure data isolation.
  - **Access:** Protected (Requires JWT)
- **`POST /api/appointments`**
  - **Action:** Once the AI has successfully extracted all necessary details and the user clicks "Confirm" on the frontend, this endpoint receives the final JSON payload. It validates the Date, Time, and Title, and securely writes a new `Appointment` record to the database.
  - **Access:** Protected (Requires JWT)

---

## 5. How It Works (Data Flow)

### Authentication Flow

When a user signs up, their password is encrypted with bcrypt and stored in PostgreSQL. On login, the hash is verified; if successful, a signed JWT is generated and returned to the client, which must be included in the `Authorization` header of all subsequent requests.

### The AI Chat Flow

1. User sends a message to the `/chat/send` endpoint.
2. **Chat Service** verifies the session ID or creates a new `ChatSession` record in the database.
3. The user's message is saved to the `ChatMessage` table.
4. The last 5 messages belonging to that session are fetched for context (**multi-turn memory**).
5. The conversation history is sent to the Mistral AI API with a strict system prompt demanding JSON output.
6. Mistral responds with a JSON object indicating missing information or success details.
7. The AI's response is saved to the `ChatMessage` table (storing both the text and the structured `extractedData`) and returned to the client.

### Appointment Flow

Once the extraction data is confirmed by the user on the frontend, a payload is sent to the `/appointments` endpoint to securely create an `Appointment` record in the database tied to their user ID.

---

## 6. Local Setup Instructions:

**Prerequisites:**
n- Node.js v20 or higher

- A free [Supabase](https://supabase.com/) account for PostgreSQL
- A free [Mistral AI API key](https://mistral.ai/)

**Steps:**

1. Clone repository & navigate to backend folder.
2. Run `npm install` to install dependencies.
3. Create `.env` file with variables:
   d - `PORT=3000`
   d - `DATABASE_URL="your_supabase_postgresql_connection_string"`
   d - `JWT_SECRET="any_secure_random_string"`
   d - `MISTRAL_API_KEY="your_mistral_api_key"`
   d - `FRONTEND_URL="http://localhost:5173"`
   e4. Sync database schema with ` npx prisma db push` .
   e5. Generate Prisma client with ` npx prisma generate` .
   e6. Start server with ` npm run dev` .
   e7. Access at [http://localhost:3000](http://localhost:3000) confirming connection via Winston logs.
