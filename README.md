# 🩸 BloodMate - Full-Stack Blood Bank Management System

BloodMate is a modernized, enterprise-grade Web-Based Blood Bank Management System. Originally conceived as a localized concept, it has been massively overhauled into a highly scalable, AI-powered cloud architecture. 

It manages autonomous blood donors, live hospital inventory tracking, gamified metrics, targeted campaign drives, and dynamic analytical reporting algorithms.

🌐 **Live Production Interface:** [https://bloodmate.xyz](https://bloodmate.xyz)

---

## 🏗️ Technical Architecture

### Frontend Ecosystem
- **Framework:** React.js + Vite (Lightning-fast HMR & Optimization)
- **Styling:** Tailwind CSS + Natively Hand-Coded Red Webkit Scrollbar injections
- **Icons & Graphics:** Lucide React + Dynamic SVG Gamification Shields
- **Data Visualization:** Recharts (Area charts for live metric mapping)
- **State & Access:** Axios interceptors seamlessly negotiating rigorous JWT Auth security gates.

### Advanced Enterprise Features
- **AI Voice Assistant:** Features an absolute bleeding-edge HTML5 `SpeechRecognition` webkit AI mounted globally to the DOM for fully hands-free navigation.
- **Export Data Layer:** Native javascript abstraction layer allowing Admin instances to aggressively export raw database metric arrays straight into `.csv` logic.
- **Gamification Mechanics:** Integrated algorithm mapping user points to Platinum, Gold, Silver, and Bronze shield thresholds to drive user engagement.
- **Password Obfuscation:** Front-end logic handles precise state triggers for Native `hide/unhide` password visibility seamlessly across both standard User and Admin authentications!

### Backend Infrastructure
- **Engine:** Python + FastAPI (Massive async REST processing and type-checking via Pydantic)
- **Database Engine:** Amazon Relational Database Service (RDS) running fully-managed PostgreSQL (`psycopg2-binary` integration).
- **ORM Schema:** SQLAlchemy bridging the python objects precisely into PostgreSQL tables.
- **Security Protocols:** Strict OAuth2 JSON Web Tokens (JWT) uniquely hardened via Native `bcrypt` cryptology hashes. 

---

## ☁️ Cloud Deployment & CI/CD Pipeline

This application isn't just a prototype—it is fully structured and hosted live using enterprise deployment topologies:

1. **AWS EC2 Hosting:** The web server runs natively off a resilient Ubuntu Linux container masked flawlessly behind an NGINX reverse proxy.
2. **AWS RDS Database:** The PostgreSQL database is structurally decoupled from the web-server to protect it against crashing; it is routed privately via VPC Security Groups.
3. **Automated CI/CD (GitHub Actions):** Whenever changes are pushed to `main`, an automated yaml pipeline natively intercepts the push, securely SSH authenticates into the AWS server, natively pulls the git update, dynamically resets the React modules, and gracefully restarts the python API using `systemd` daemon logic—with absolute zero downtime.
4. **SSL Cryptology:** Fully compliant `https` traffic authenticated by automated Let's Encrypt Certbot crons.

---

## 💻 Running Locally

To manually boot this massive architecture on your local desktop machine:

**1. Database Initialization (FastAPI + PostgreSQL):**
```bash
cd backend/
# Boot your python wrapper
.\venv\Scripts\activate
# Create backend\.env from backend\.env.example and point it to your PostgreSQL database
# Synchronize missing elements
pip install -r requirements.txt
# Fire up the engine 
uvicorn app.main:app --reload
```
*API is accessible internally mapped @ `http://127.0.0.1:8000/docs`*

**2. React Dashboard Interface:**
```bash
cd frontend/
npm install
npm run dev
```
*Application GUI renders @ `http://localhost:5173`*

## Database Access

BloodMate is now configured to use **PostgreSQL only**. The backend will fail to start unless `DATABASE_URL` points to a PostgreSQL instance such as AWS RDS.

Example `backend/.env`:

```env
DATABASE_URL=postgresql://bloodmate_admin:YOUR_PASSWORD@your-rds-endpoint.amazonaws.com:5432/bloodmate
SECRET_KEY=generate-a-long-random-secret
```

Create the first application admin user with:

```bash
cd backend/
.\venv\Scripts\python.exe create_admin.py --email admin@example.com --full-name "BloodMate Admin"
```

You will be prompted for the password securely. This creates or updates a user in the `users` table with `role=admin`.

To inspect tables from a PostgreSQL client:

```sql
\dt
SELECT * FROM users;
SELECT * FROM donor_profiles;
SELECT * FROM blood_units;
SELECT * FROM blood_requests;
SELECT * FROM campaigns;
```
