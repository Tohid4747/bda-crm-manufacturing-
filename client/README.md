# BDA CRM — Business Development Associate Team Module
### A Manufacturing Company CRM & Sales Pipeline Management System

A full-stack MERN application built for managing BDA (Business Development Associate) teams in a manufacturing company. It includes lead pipeline management, client tracking, activity logs, team performance analytics, and role-based dashboards for Admin and BDA users.

---

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **HTTP Client:** Axios
- **Drag & Drop:** @hello-pangea/dnd
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## Folder Structure

```
bda-crm-manufacturing/
│
├── client/                        # React frontend
│   ├── public/
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Page-level components
│       ├── context/               # Auth and global state (Context API)
│       ├── hooks/                 # Custom React hooks
│       ├── utils/                 # Helper functions
│       ├── routes/                # Protected and public route wrappers
│       └── constants/             # API base URL and app constants
│
├── server/                        # Node.js + Express backend
│   ├── config/                    # Database connection config
│   ├── controllers/               # Route handler logic
│   ├── middleware/                # Auth middleware and error handlers
│   ├── models/                    # Mongoose schemas
│   └── routes/                    # Express route definitions
│
├── .gitignore
└── README.md
```

---

## Features

### Authentication
- JWT-based login and register
- Role-based access control — Admin and BDA roles
- Protected routes on frontend

### Lead Management
- Add, edit, delete leads
- Lead status pipeline — New → Contacted → Qualified → Proposal → Closed Won → Closed Lost
- Assign leads to BDA members (Admin only)
- Filter by status, assigned rep, and date
- Search leads by name or company

### Kanban Board
- Visual drag and drop board grouped by lead status
- Moving a card auto-updates the lead status in the database
- Toggle between Table view and Kanban view

### Client Management
- Auto-convert a lead to a client when marked as Closed Won
- View all clients with deal value and assigned BDA

### Activity Log & Follow-ups
- Log calls, emails, and meetings against leads
- Set follow-up dates
- View overdue and due-today follow-ups on dashboard

### Dashboard & Analytics
- **Admin:** Total leads, clients, BDA count, pie chart, bar chart, top performers table
- **BDA:** My leads, my closed deals, my pipeline chart, my upcoming follow-ups

### Team Management (Admin Only)
- View all BDA members with performance stats
- Deactivate BDA members

### Extra Features
- Export leads to CSV
- Notification badge for due follow-ups
- Fully responsive UI
- Loading states and error handling throughout
- 404 Not Found page

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Tohid4747/bda-crm-manufacturing.git
cd bda-crm-manufacturing
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file inside the `client/` folder:

```
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

---

## Environment Variables

### Server — `server/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Port for the Express server (default: 5000) |

### Client — `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |

---

## Running the App Locally

### Backend
```bash
cd server
npm run dev
```
Runs on: `http://localhost:5000`

### Frontend
```bash
cd client
npm run dev
```
Runs on: `http://localhost:5173`

> Make sure both are running at the same time for the app to work.

---

## Screenshots

> Screenshots will be added after deployment.

| Dashboard | Lead Pipeline | Kanban Board |
|---|---|---|
| coming soon | coming soon | coming soon |

---

## Live Demo

> 🔗 Live URL: **Coming soon — will be updated after deployment**

---

## Author

**Tohid Mulla**
- GitHub: [@Tohid4747](https://github.com/Tohid4747)
- Email: tohidmulla444@gmail.com

---

> Built as part of the MERN Stack Developer Internship Technical Assessment — Isaii AI
