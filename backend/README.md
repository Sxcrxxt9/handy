# Handy Backend API

Backend API สำหรับแอป Handy ที่ใช้ Node.js + Express + Firebase (Firestore)

## 📋 Features

- ✅ Authentication (Firebase Auth)
- ✅ User Management (Volunteer/Disabled)
- ✅ Report System (Normal/SOS)
- ✅ Case Management (Volunteer assignment)
- ✅ Points & Redeem System
- ✅ Real-time updates support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project
- Firebase Admin SDK service account key

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup Firebase:**
   - ไปที่ [Firebase Console](https://console.firebase.google.com/)
   - สร้างโปรเจกต์ใหม่ (หรือใช้โปรเจกต์ที่มีอยู่)
   - ไปที่ Project Settings > Service Accounts
   - Generate new private key
   - Copy ข้อมูลไปใส่ใน `.env`

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Fill in `.env` file:**
```env
PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

FIREBASE_WEB_API_KEY=your-web-api-key
CORS_ORIGIN=http://localhost:8081
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server จะรันที่ `http://localhost:3000`

## 📚 API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ server

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก (ต้องมี Firebase token)
- `GET /api/auth/me` - ดูข้อมูลผู้ใช้ปัจจุบัน
- `PUT /api/auth/me` - อัปเดตข้อมูลผู้ใช้

### Reports
- `POST /api/reports` - สร้างรายงานใหม่ (Disabled only)
- `GET /api/reports/my-reports` - ดูรายงานของตัวเอง (Disabled)
- `GET /api/reports/available-cases` - ดูเคสที่พร้อมรับ (Volunteer)
- `GET /api/reports/my-cases` - ดูเคสที่รับแล้ว (Volunteer)
- `POST /api/reports/:reportId/accept` - รับเคส (Volunteer)
- `PATCH /api/reports/:reportId/status` - อัปเดตสถานะรายงาน
- `GET /api/reports/:reportId` - ดูรายงานรายละเอียด

### Redeem
- `POST /api/redeem` - สร้างคำขอแลกของรางวัล (Volunteer)
- `GET /api/redeem/my-redeems` - ดูประวัติการแลกของรางวัล (Volunteer)
- `GET /api/redeem/:redeemId` - ดูรายละเอียดการแลกของรางวัล

## 🔐 Authentication

API ใช้ Firebase Authentication โดยต้องส่ง token ใน header:

```
Authorization: Bearer <firebase-id-token>
```

## 📊 Database Structure

### Collections

**users**
- `uid` (string) - Firebase Auth UID
- `email` (string)
- `type` (string) - 'volunteer' or 'disabled'
- `name`, `surname`, `tel` (string)
- `points` (number) - สำหรับ volunteer เท่านั้น
- `createdAt`, `updatedAt` (timestamp)

**reports**
- `userId` (string) - UID ของผู้แจ้ง
- `type` (string) - 'normal' or 'sos'
- `details` (string)
- `location` (string)
- `latitude`, `longitude` (number)
- `status` (string) - 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
- `priority` (string) - 'high', 'medium', 'low'
- `assignedVolunteerId` (string | null)
- `createdAt`, `updatedAt` (timestamp)

**redeems**
- `volunteerId` (string)
- `rewardName`, `rewardDescription` (string)
- `pointsRequired` (number)
- `status` (string) - 'pending', 'approved', 'rejected', 'completed'
- `createdAt`, `updatedAt` (timestamp)

## 🎯 Points System

- **SOS Report (completed)**: +50 points
- **Normal Report (completed)**: +20 points
- **Redeem**: หัก points ตามที่กำหนด

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js       # Firebase configuration
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Report.js         # Report model
│   │   └── Redeem.js         # Redeem model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── reports.js        # Report routes
│   │   └── redeem.js         # Redeem routes
│   ├── middleware/
│   │   ├── auth.js           # Auth middleware
│   │   └── errorHandler.js   # Error handling
│   └── server.js             # Express server
├── .env.example
├── package.json
└── README.md
```

## 📝 Notes

- ใช้ Firebase Admin SDK สำหรับ backend operations
- ใช้ Firebase Auth สำหรับ client-side authentication
- CORS ตั้งค่าให้รองรับ Expo (port 8081)
- ใช้ Firestore เป็น database

## 🔗 Integration with Frontend

ใน React Native app ต้อง:
1. Setup Firebase SDK
2. Implement Firebase Auth
3. เก็บ Firebase ID token
4. ส่ง token ใน header ทุก request

Example:
```javascript
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();

axios.get('http://localhost:3000/api/reports/available-cases', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

