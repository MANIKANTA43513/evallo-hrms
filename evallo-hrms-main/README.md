Human Resource Management System (HRMS) – Full-Stack Project

A simple yet complete HRMS web application built with Node.js, Express, React, and a SQL database.
Supports authentication, organisation onboarding, employee & team management, and full audit logging.


---

📌 Features

1. Organisation & User Authentication

Create an organisation account

Register an admin user

Secure login (JWT)

Password hashing (bcrypt)

Protected routes for all CRUD operations


2. Employee Management

Add, update, delete employees

View a paginated list

Filter by organisation

Each employee can belong to multiple teams


3. Team Management

Add, update, delete teams

View team list with optional description

Assign or unassign employees


4. Many-to-Many Relationship

Employees ↔ Teams using a join table (employee_teams)

Safe assignment & unassignment endpoints


5. Audit Logging

The system stores a log for each operation:

User login / logout

Create / update / delete operations

Employee-team assignment actions


Stored in a logs table with:

action

user_id

organisation_id

timestamp

meta (JSON for flexible data)



---

🛠 Tech Stack

Backend

Node.js (v18+)

Express.js

Sequelize / TypeORM / Knex (ORM)

PostgreSQL or MySQL

JWT + bcrypt

dotenv, nodemon


Frontend

React (CRA or Vite)

Axios (API calls)

React Router



---

📂 Project Structure

hrms/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middlewares/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ db.js
│  │  └─ index.js
│  ├─ package.json
│  └─ .env
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  └─ services/
│  └─ package.json
└─ README.md


---

📌 Database Schema (Simplified)

Tables

organisations

users

employees

teams

employee_teams (many-to-many)

logs


Key Rules

Every record belongs to an organisation_id

Logs use JSONB (Postgres) to store metadata

Foreign keys use cascade operations where needed



---

🚀 Getting Started

1. Clone the Repository

git clone <repo-url>
cd hrms


---

📦 Backend Setup

2. Install Backend Dependencies

cd backend
npm install

3. Configure Environment Variables

Create a .env file:

PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=youruser
DB_PASS=yourpass
DB_NAME=hrms_db
JWT_SECRET=your_secret_key

4. Run Migrations

(Example if using Sequelize)

npx sequelize-cli db:migrate

5. Start Backend

npm run dev       # using nodemon


---

🖥 Frontend Setup

1. Install Frontend Dependencies

cd ../frontend
npm install

2. Configure API Base URL

Create .env in frontend:

REACT_APP_API_BASE=http://localhost:5000/api

3. Start Frontend

npm start


---

🔐 Authentication Flow

1. Register Organisation

POST /api/auth/register



2. Login

POST /api/auth/login



3. Use token in all further requests:



Authorization: Bearer <token>


---

🧩 API Endpoints (Overview)

Auth

Method	Endpoint	Description

POST	/api/auth/register	Create organisation + admin user
POST	/api/auth/login	Login & receive JWT


Employees

Method	Endpoint	Description

GET	/api/employees	List employees
POST	/api/employees	Create
GET	/api/employees/:id	View
PUT	/api/employees/:id	Update
DELETE	/api/employees/:id	Remove


Teams

Method	Endpoint	Description

GET	/api/teams	List teams
POST	/api/teams	Create
PUT	/api/teams/:id	Update
DELETE	/api/teams/:id	Remove


Assignments

Method	Endpoint	Description

POST	/api/teams/:teamId/assign	Assign employee
DELETE	/api/teams/:teamId/unassign	Remove assignment


Logs

Method	Endpoint	Description

GET	/api/logs	View audit logs (admin only)



---

📝 Logging Format

Example:

[TIMESTAMP] User '<user_id>' added new employee with ID <employee_id>.
[TIMESTAMP] User '<user_id>' updated employee <employee_id>.
[TIMESTAMP] User '<user_id>' logged in.
[TIMESTAMP] User '<user_id>' assigned employee <emp_id> to team <team_id>.

Internally saved as JSON:

{
  "action": "employee_created",
  "organisation_id": 1,
  "user_id": 3,
  "meta": { "employee_id": 17 }
}


---

🌐 Deployment Notes

Frontend → Vercel / Netlify

Backend → Render / Railway / VPS

Database → cloud PostgreSQL (Neon, Supabase, Render Postgres)


Add the environment variables in the hosting platform.


---

🎯 Bonus Improvements (Optional)

Role-based access control (admin, HR manager)

Pagination + filters

Docker Compose setup

Unit tests (Jest / Supertest)

Better UI/UX with component library



---

✔ Conclusion

This project covers full-stack development, authentication, SQL schema design, REST APIs, React UI, and audit logging.
A great assignment for demonstrating practical backend + frontend skills.