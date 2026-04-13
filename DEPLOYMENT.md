# AWS EC2 Deployment Guide for BloodMate

This guide provides a straightforward, beginner-friendly process for deploying the BloodMate full-stack application to a single AWS EC2 instance without Docker, Kubernetes, or Terraform.

## 1. AWS EC2 Instance Setup
1. Log in to your AWS Console, navigate to **EC2**, and click **Launch Instance**.
2. Select **Ubuntu Server 22.04 LTS** (or 24.04).
3. Choose instance type `t2.micro` (Free Tier eligible) or `t3.small`.
4. Create a new Key Pair (save the `.pem` file to SSH into your server).
5. Under **Network Settings**, ensure the following checkboxes are ticked:
   - Allow SSH traffic (Port 22)
   - Allow HTTP traffic (Port 80)
   - Allow HTTPS traffic (Port 443)
6. Launch instance. Wait for it to initialize, then find the Public IPv4 address.

## 2. Connect to your Server
Open your terminal and SSH:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

## 3. Server Preparation & Dependencies
Run the following commands to install Python, Node.js, and Nginx.
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git curl -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 4. GitHub Actions Automated Pipeline Setup
BloodMate utilizes a highly enterprise CI/CD pipeline via GitHub Actions. Instead of manually cloning code inside the server, GitHub will automatically do it for you securely via SSH!

### Setup Secrets
On your **GitHub Web Dashboard**, navigate to your `BloodMate-Py` repository.
1. Click **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.

You must create precisely these 3 secrets to allow the pipeline into your EC2 server:

* **Name:** `HOST`
  * **Secret:** Your AWS EC2 Public IPv4 Address (e.g. `12.34.56.78`)
* **Name:** `USERNAME`
  * **Secret:** `ubuntu` (Since you provisioned an Ubuntu Server)
* **Name:** `SSH_KEY`
  * **Secret:** The entire contents of your `.pem` key file (Open it in VSCode, copy everything from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----`).

## 5. Amazon RDS Postgres Database setup

To ensure massive enterprise scalability and absolute data safety against server crashes, BloodMate connects to an external **Amazon Relational Database Service (RDS)** rather than storing data directly on the web server.

1. Go back to your AWS Management Console and search for **RDS**.
2. Click **Create Database**.
3. Select **PostgreSQL** (Ensure you check the **Free Tier** template option!)
4. **Settings:** Name the DB instance `bloodmate-rds`. 
5. Set the Master Username to `bloodmate_admin` and manually type a Master Password.
6. **Connectivity:** Ensure **Public Access** is set to `No`. 
7. Create your database and wait for AWS to fully spin it up.
8. Once Active, click on the database and copy the **Endpoint** URL string (it looks like `bloodmate-rds.xxxxx.us-east-1.rds.amazonaws.com`).

### Crucial RDS Security Group Bridging
Because your RDS Database is heavily structurally protected, it mathematically blocks all internet traffic! You must explicitly allow your EC2 server to talk to it:
1. In the RDS dashboard, click the **VPC Security Group** attached to your database.
2. Edit its **Inbound Rules**.
3. Add a new Postgres (port 5432) rule and select the specific Security Group attached to your *EC2 Server* as the Source (this bridges the EC2 machine directly to the database).

## 6. First Time Manual Git Clone
For the GitHub Action to orchestrate perfectly, the pipeline expects the code to reside precisely in `/home/ubuntu/BloodMate-Py`. 
SSH into your EC2 terminal natively once and run:
```bash
git clone <YOUR_GIT_REPO_URL> BloodMate-Py
cd BloodMate-Py/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Construct your backend environment variable securely replacing the RDS_ENDPOINT_URL with the massive string you copied from AWS:
```bash
echo "DATABASE_URL=postgresql://bloodmate_admin:BloodMate-rds2026@bloodmate-rds.cbwqoak205d5.ap-south-1.rds.amazonaws.com:5432/postgres" > .env
echo "SECRET_KEY=46ad8a6d981a2441e0e2e20f0babd013becab71fde39f930247674195060205d" >> .env
```

## 7. Systemd API Demonization
To ensure FastAPI boots beautifully and stays alive globally, establish a core `systemd` wrapper securely around it:
```bash
sudo nano /etc/systemd/system/BloodMate-Py.service
```

Paste the following securely (Ensuring paths match your capitalization):
```ini
[Unit]
Description=Gunicorn/Uvicorn instance to serve BloodMate API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/BloodMate-Py/backend
Environment="PATH=/home/ubuntu/BloodMate-Py/backend/venv/bin"
ExecStart=/home/ubuntu/BloodMate-Py/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4

[Install]
WantedBy=multi-user.target
```

Execute it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now BloodMate-Py
```

**Now, anytime you `git commit` and `git push` to `main`, GitHub Actions will natively intercept your push, automatically log into the server, natively rebuild React's production bundle, and cleanly bounce `bloodmate.service` with zero downtime!**

## 8. Nginx Setup & Domain Routing
Go to your domain provider (Hostinger, where you purchased your `.xyz` domain) and point your **A Record** to your EC2 Public IP Address.

Configure Nginx to serve the React frontend on `/` and proxy the backend to `/api/v1`.
See the provided `nginx.conf` file in the root of the project.

Copy the config to Nginx:
```bash
sudo cp /home/ubuntu/BloodMate-Py/nginx.conf /etc/nginx/sites-available/BloodMate-Py
sudo ln -s /etc/nginx/sites-available/BloodMate-Py /etc/nginx/sites-enabled/
# Remove default nginx config
sudo rm /etc/nginx/sites-enabled/default

sudo systemctl restart nginx
```

## 9. HTTPS Setup (Let's Encrypt / Certbot)
Secure your web application with a free SSL certificate.
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d bloodmate.xyz -d www.bloodmate.xyz
```
Follow the prompts to auto-configure Nginx for HTTPS. Certbot automatically sets up a cron job to renew the certificate.

> [!SUCCESS]
> You are done! Visit `https://bloodmate.xyz` to see BloodMate live in production.
