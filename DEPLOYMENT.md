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

## 4. Cloning and Backend Setup
Clone your repository (replace with your actual git repo):
```bash
git clone <YOUR_GIT_REPO> bloodmate
cd bloodmate/backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file for production
echo "DATABASE_URL=sqlite:///./sql_app.db" > .env
# Note: For PostgreSQL, use DATABASE_URL=postgresql://user:password@localhost/dbname
echo "SECRET_KEY=your_super_secret_jwt_key_here" >> .env
```

## 5. Running Backend with Systemd
Instead of keeping the terminal open, we run FastAPI continuously using `systemd`.

Create the service file:
```bash
sudo nano /etc/systemd/system/bloodmate.service
```

Paste the following (adjust paths if needed):
```ini
[Unit]
Description=Gunicorn/Uvicorn instance to serve BloodMate API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/bloodmate/backend
Environment="PATH=/home/ubuntu/bloodmate/backend/venv/bin"
ExecStart=/home/ubuntu/bloodmate/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start bloodmate
sudo systemctl enable bloodmate
```

## 6. Frontend Build
```bash
cd /home/ubuntu/bloodmate/frontend
npm install
npm run build
```
This generates a `dist` folder. We will serve this statically.

## 7. Nginx Setup & Domain Routing
Go to your domain provider (Hostinger, where you purchased your `.xyz` domain) and point your **A Record** to your EC2 Public IP Address.

Configure Nginx to serve the React frontend on `/` and proxy the backend to `/api/v1`.
See the provided `nginx.conf` file in the root of the project.

Copy the config to Nginx:
```bash
sudo cp /home/ubuntu/bloodmate/nginx.conf /etc/nginx/sites-available/bloodmate
sudo ln -s /etc/nginx/sites-available/bloodmate /etc/nginx/sites-enabled/
# Remove default nginx config
sudo rm /etc/nginx/sites-enabled/default

sudo systemctl restart nginx
```

## 8. HTTPS Setup (Let's Encrypt / Certbot)
Secure your web application with a free SSL certificate.
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d bloodmate.xyz -d www.bloodmate.xyz
```
Follow the prompts to auto-configure Nginx for HTTPS. Certbot automatically sets up a cron job to renew the certificate.

> [!SUCCESS]
> You are done! Visit `https://bloodmate.xyz` to see BloodMate live in production.
