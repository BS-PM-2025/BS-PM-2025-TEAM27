# 🌍 Jaffa Explorer – Fullstack App (Django + React)

This is the complete fullstack application for **Jaffa Explorer**, a platform that showcases tourist attractions, businesses, events, and user-generated content in Jaffa. It includes:

- 🧠 **Backend**: Django + Django REST Framework
- 🎨 **Frontend**: React + Tailwind CSS + i18next
- 🛡️ **Auth**: JWT Authentication (visitor, business, admin roles)

---

## 🚀 Getting Started from Zero

### 🔧 Requirements

- Python 3.10+ installed
- Node.js + npm installed
- Git installed

---

## 📦 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BS-PM-2025/BS-PM-2025-TEAM27.git
cd jaffa-explorer
```

Assumes project structure like:

```
jaffa-explorer/
│
├── backend/         # Django backend
└── frontend/        # React frontend
```

---

## ⚙️ Backend Setup (Django)

### 2. Setup Python Environment

(Optional but recommended)

```bash
cd backend
python -m venv venv
venv\Scripts\activate         
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create `.env` File

Create `backend/.env` and fill with:

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
EMAIL_HOST_USER=noreply@jaffaexplorer.com
EMAIL_HOST_PASSWORD=your-password
ADMIN_EMAIL=admin@jaffaexplorer.com
```

### 5. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Run Django Server

```bash
python manage.py runserver
```

API should now be running at [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🌐 Frontend Setup (React)

### 7. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 8. Run React App

```bash
npm start
```

App will be available at [http://localhost:3000](http://localhost:3000)

---

## 🔐 Credentials and Roles

- Admin can log in from `/admin-login`
- Visitors and Businesses register separately
- Admin approves/declines business accounts

---

## 📁 Requirements

### Python (`backend/requirements.txt`)

```txt
asgiref==3.8.1
Django==5.2
django-cors-headers==4.7.0
djangorestframework==3.16.0
djangorestframework_simplejwt==5.5.0
pillow==11.2.1
PyJWT==2.9.0
python-dotenv==1.1.0
sqlparse==0.5.3
tzdata==2025.2
```

### Node.js (`frontend/package.json`)

Make sure to include the dependencies in your `frontend/package.json` (already handled by `npm install`).

---

## 💬 Contact

For help or contributions, email us at **admin@jaffaexplorer.com**