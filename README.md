# 🩸 BloodMate

BloodMate is a modern, enterprise-ready Web-Based Blood Bank Management System. What was originally built as a desktop Java application has been completely overhauled into a high-performance, full-stack scalable web architecture. It flawlessly manages donors, live blood inventory tracking, gamified metrics, emergency hospital requests, campaigns, and dynamic statistics reporting.

🌐 **Production Domain:** [bloodmate.xyz](https://bloodmate.xyz)

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework:** React.js + Vite (Lightning-fast HMR)
- **Styling:** Tailwind CSS (Responsive utility-first) + Custom Index CSS overrides
- **Icons & Visualization:** Lucide React + Recharts (SVG metric charts)
- **State & Access:** Axios interceptors seamlessly parsing and routing JWT Auth flows.
- **Enterprise UI features:** HTML5 Webkit Speech Recognition for voice navigation, fully dynamic data tables, SVG Gamification Badges, Dark Mode support.

### Backend Systems
- **Framework:** Python + FastAPI (Async REST API logic)
- **Database:** SQLite (Easily swap to PostgreSQL by altering the `.env` `DATABASE_URL`)
- **ORM:** SQLAlchemy
- **Authentication:** Strict OAuth2 JSON Web Tokens (JWT) using secure `bcrypt`.
- **Infrastructure:** Separation of concerns using `routers`, `models`, `schemas`, and `deps`.

---

## 💻 Running the Project Locally

To run this beautifully decoupled project locally, you must run the server and the frontend simultaneously.

### 1. Database & APIs (FastAPI)
```bash
# Navigate to the backend directory
cd backend/

# Activate the virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies if you haven't natively installed them
pip install -r requirements.txt

# Boot the Uvicorn server automatically mapping to the SQLite logic
uvicorn app.main:app --reload
```
The API is now running natively on `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to see the beautiful auto-generated Swagger OpenAPI interface!

### 2. Frontend Interface (React)
```bash
# Open a second terminal window and navigate to the frontend block
cd frontend/

# Install the React components
npm install

# Run the lightning-fast Vite developer server
npm run dev
```
The Web Application is now rendering on `http://localhost:5173`.

---

## 🧬 Roles & Access

The platform dynamically restricts users immediately upon JWT assignment:
- **Admin Accounts:** Full read/write access to schedule actual Campaign Drives, Fulfill or Decline Hospital component requests, view detailed Donor Directories, and Export CSV logs. (Access securely mapped to the Admin Login Interface).
- **Donor (User) Accounts:** Fluid portal access to view overarching metrics and active blood bag thresholds without administrative overriding privileges. 

---

## ☁️ Deployment

For taking the application live mapping securely to `bloodmate.xyz` on a free AWS EC2 instance, refer strictly to `DEPLOYMENT.md` included inside the codebase root directory. 

It covers everything from server dependency generation, setting up continuous standard execution loops using `systemd`, bridging `Nginx` proxies efficiently, and generating free Let's Encrypt SSL certificates to trigger HTTPS.
