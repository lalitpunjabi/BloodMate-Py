<div align="center">
  <h1>🩸 BloodMate</h1>
  <h3>Enterprise-Grade Full-Stack Blood Bank Management System</h3>

  <p align="center">
    A highly scalable, AI-powered cloud architecture managing autonomous blood donors, live hospital inventory tracking, gamified metrics, targeted campaign drives, and dynamic analytical reporting.
  </p>
  
  **🌐 Live Production Environment:** [https://bloodmate.xyz](https://bloodmate.xyz)
  <br />
</div>

<hr />

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗄️ Database Architecture](#️-database-architecture)
- [💻 Running Locally](#-running-locally)
- [☁️ Cloud Deployment & CI/CD](#️-cloud-deployment--cicd)
- [🔒 Security & Authentication](#-security--authentication)

---

## ✨ Key Features

BloodMate replaces legacy systems with modern, interconnected modules that manage the entire lifecycle of blood donation and distribution:

*   **👥 Autonomous Donor & Recipient Management:** Users can manage their own donor profiles, track eligibility, update health details, and maintain comprehensive recipient profiles.
*   **🏥 Live Blood Inventory Tracking:** Administrators can manage blood units, dynamically track expiration dates, and monitor stock levels natively mapped by blood type.
*   **🚑 Emergency Blood Requests:** Create urgent or normal blood requests on behalf of patients via the hospital network, matched automatically with compatible live inventory.
*   **📢 Targeted Campaign Drives:** Organizers can spin up and market local geolocation-based donation campaigns.
*   **🏆 Gamification Mechanics:** Built-in algorithm rewarding points and "streaks" to users for proactive donations. These points map to Platinum, Gold, Silver, and Bronze shield thresholds to drive user engagement.
*   **🤖 AI Voice Assistant:** Features absolute bleeding-edge HTML5 `SpeechRecognition` webkit AI mounted globally to the DOM for fully hands-free navigation.
*   **📊 Dynamic Reporting Algorithms:** Native JavaScript abstraction layer allowing Admin instances to aggressively export raw database metric arrays straight into `.csv` files.
*   **👁️ Adaptive Security UI:** Front-end logic handles precise state triggers for Native `hide/unhide` password visibility seamlessly across both standard User and Admin authentications!

---

## 🛠️ Tech Stack

BloodMate utilizes a highly decoupled full-stack ecosystem optimized for maximum scalability.

### Frontend Ecosystem
- **Core Framework:** React.js + Vite (Lightning-fast HMR)
- **Routing:** React Router v7
- **Styling Architecture:** Tailwind CSS + Natively Hand-Coded Red Webkit Scrollbar injections.
- **Icons & Graphics:** Lucide React + Dynamic SVG Gamification Shields.
- **Data Visualization:** Recharts (Area charts for live metric mapping).
- **State & Networking:** Axios interceptors seamlessly negotiating rigorous JWT Auth security gates.

### Backend Infrastructure
- **Engine Framework:** Python + FastAPI (Massive async REST processing).
- **Data Validation:** Pydantic (Strong type-checking).
- **ORM Schema:** SQLAlchemy bridging the Python objects precisely into PostgreSQL tables.
- **Security Protocols:** Strict OAuth2 JSON Web Tokens (JWT) uniquely hardened via Native `bcrypt` cryptography.

### Database
- **Primary Engine:** Fully-managed Amazon Relational Database Service (RDS) Postgres (`psycopg2-binary` integration).

---

## 🗄️ Database Architecture

The data layer runs on a normalized Relational schema:
*   `Users`: Core authentication, JWT generation, Role-based mapping (Admin/User), Points/Streaks.
*   `Donor Profiles`: Links exactly to 1 user; tracks Blood Group, Last Donation, and Eligibility.
*   `Recipient Profiles`: Tracks external hospital patients, diagnosis, and required blood.
*   `Blood Units`: Represents physical inventory; tracks statuses (Available, Reserved, Used, Expired) and exact expiration thresholds.
*   `Blood Requests`: Live ticketing system mapping external hospital demands against internal blood units.
*   `Campaigns`: Location-based blood drive event management.

---

## 💻 Running Locally

To manually boot this massive architecture on your local desktop machine:

### 1. Database Initialization (FastAPI + PostgreSQL)
BloodMate requires a valid PostgreSQL database. It will immediately fail if using SQLite.

```bash
cd backend/

# 1. Establish python virtual environment
python -m venv venv
.\venv\Scripts\activate   # Linux/macOS: source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Environment & Database Configuration
cp .env.example .env
# Open .env and set your DATABASE_URL=postgresql://user:pass@host:5432/db

# 4. Generate the foundational Admin User
python create_admin.py --email admin@example.com --full-name "Admin"

# 5. Boot the engine 
uvicorn app.main:app --reload
```
*API is globally accessible @ `http://127.0.0.1:8000/docs`*

### 2. React Dashboard Interface
```bash
cd frontend/
npm install
npm run dev
```
*Application GUI renders natively @ `http://localhost:5173`*

---

## ☁️ Cloud Deployment & CI/CD

This application is fully structured and hosted live using enterprise deployment topologies. For a comprehensive walkthrough of setting up AWS EC2, Amazon RDS, NGINX, and Certbot, see the **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** documentation.

**Core Deployment Highlights:**
1. **AWS EC2 Hosting:** Natively off a resilient Ubuntu Linux container masked flawlessly behind an NGINX reverse proxy.
2. **AWS RDS Database:** Structurally decoupled PostgreSQL database, routed privately via VPC Security Groups.
3. **Automated CI/CD (GitHub Actions):** Push to `main` -> Pipeline intercepts securely via SSH -> Fetches updates -> Rebuilds React -> Restarts Python `systemd` daemon gracefully (Zero Downtime).
4. **SSL Cryptology:** Fully compliant `https` traffic via auto-renewing Let's Encrypt Certbot.

---

## 🔒 Security & Authentication

BloodMate takes security seriously:
*   **OAuth2 Password Bearer Forms:** Adheres perfectly to modern standardized login flow specifications.
*   **Bcrypt Hashing:** Passwords are never seen nor stored in plaintext. They utilize computational `salt` rounding.
*   **Role-based Guards:** Global REST endpoints natively protect against standard Users routing into Administrative actions. Attempts automatically throw robust `403 Forbidden` Exception responses.
*   **Separation of Concerns:** The database logic is physically protected inside a VPC that accepts only traffic from the internal web service. External connections are blocked globally by the underlying AWS infrastructure.
