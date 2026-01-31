# 🚀 AI Lead Scoring & Follow-Up System

A full-stack application that captures inbound leads, uses AI to score intent, and automatically generates smart follow-up emails. Built with production-ready backend practices and AI integration.

---

## ✨ Features

- Lead capture with validation (FastAPI + Pydantic)
- AI-based lead scoring (intent & score)
- Automatic Slack alerts for high-intent leads
- AI-generated follow-up emails
- Rate-limited public APIs
- MongoDB for persistence
- Simple Admin Dashboard (React)

---

## 🛠 Tech Stack

### Backend
- FastAPI
- Python
- MongoDB
- Groq LLM (LLaMA)
- Pydantic
- Uvicorn

### Frontend
- React
- Plain CSS

### Integrations
- Slack Webhooks
- Groq AI API

---

## 📂 Project Structure

backend/
│── app/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── db.py
│   └── main.py
│
frontend/
│── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
.env.example
.gitignore
README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
git clone <repo-url>
cd AI-LEAD-SCORING

---

### 2️⃣ Backend Setup

cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

Create `.env` file:
MONGO_URI=
GROQ_API_KEY=
SLACK_WEBHOOK_URL=

Run backend:
uvicorn app.main:app --reload

Backend URL:
http://localhost:8000

Swagger Docs:
http://localhost:8000/docs

---

### 3️⃣ Frontend Setup

cd frontend
npm install
npm start

Frontend URL:
http://localhost:3000

---

## 🔐 Demo Admin Login

Email: admin@example.com
Password: admin123

---

## 🤖 AI Workflow

- Leads are evaluated using AI based on role, company size, problem description, and budget
- High-intent leads trigger Slack notifications
- Follow-up emails are generated using a strict JSON-only prompt
- Safe fallbacks ensure reliability if AI fails

---

## 📌 Future Enhancements

- JWT authentication
- Email sending integration
- Follow-up analytics
- Docker support
- Role-based access control

---

## 👨‍💻 Author

Bhargav Reddy kancharla
