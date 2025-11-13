# 🚀 Setup Guide - Handy Backend

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Setup Firebase

### 2.1 สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project"
3. ตั้งชื่อโปรเจกต์ (เช่น "handy-app")
4. เลือก Google Analytics (optional)
5. คลิก "Create project"

### 2.2 สร้าง Service Account

1. ใน Firebase Console ไปที่ **Project Settings** (⚙️)
2. เลือกแท็บ **Service Accounts**
3. คลิก **Generate new private key**
4. ไฟล์ JSON จะถูกดาวน์โหลด (เก็บไว้ปลอดภัย!)

### 2.3 เปิดใช้งาน Firestore

1. ใน Firebase Console ไปที่ **Firestore Database**
2. คลิก **Create database**
3. เลือก **Start in test mode** (สำหรับ development)
4. เลือก location (แนะนำ: asia-southeast1 สำหรับประเทศไทย)
5. คลิก **Enable**

### 2.4 เปิดใช้งาน Authentication

1. ใน Firebase Console ไปที่ **Authentication**
2. คลิก **Get started**
3. เปิดใช้งาน **Email/Password** provider
4. คลิก **Save**

### 2.5 ดู Web API Key

1. ใน Firebase Console ไปที่ **Project Settings**
2. ในแท็บ **General** จะเห็น **Web API Key**
3. Copy ค่านี้ไว้

## Step 3: Configure Environment Variables

1. Copy ไฟล์ `env.example` เป็น `.env`:

```bash
cp env.example .env
```

2. เปิดไฟล์ `.env` และกรอกข้อมูล:

```env
PORT=3000
NODE_ENV=development

# จากไฟล์ service account JSON ที่ดาวน์โหลดมา
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# จาก Firebase Console > Project Settings > General
FIREBASE_WEB_API_KEY=your-web-api-key

# สำหรับ Expo development
CORS_ORIGIN=http://localhost:8081
```

### วิธีหา Private Key จาก Service Account JSON

เปิดไฟล์ JSON ที่ดาวน์โหลดมา จะมีโครงสร้างแบบนี้:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  ...
}
```

Copy ค่าเหล่านี้ไปใส่ใน `.env`:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (ต้องมี `\n` ใน string)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

## Step 4: Run the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server จะรันที่ `http://localhost:3000`

ทดสอบด้วย:
```bash
curl http://localhost:3000/health
```

ควรได้ response:
```json
{
  "status": "ok",
  "message": "Handy API is running",
  "timestamp": "..."
}
```

## Step 5: Setup Firestore Indexes (Optional)

ถ้าใช้ query ที่ซับซ้อน อาจต้องสร้าง indexes:

1. ไปที่ Firebase Console > Firestore Database
2. คลิกแท็บ **Indexes**
3. Firebase จะแนะนำ indexes ที่ต้องสร้างเมื่อ query ครั้งแรก

## 🔧 Troubleshooting

### Error: "Firebase Admin initialized failed"
- ตรวจสอบว่า `.env` มีข้อมูลครบถ้วน
- ตรวจสอบว่า `FIREBASE_PRIVATE_KEY` มี `\n` ใน string
- ตรวจสอบว่า service account มี permission ที่ถูกต้อง

### Error: "CORS error"
- ตรวจสอบ `CORS_ORIGIN` ใน `.env`
- สำหรับ Expo: ใช้ `http://localhost:8081`
- สำหรับ production: ใช้ domain ของคุณ

### Error: "Permission denied"
- ตรวจสอบ Firestore Rules
- สำหรับ development: ใช้ test mode
- สำหรับ production: ตั้ง rules ที่เหมาะสม

## 📝 Next Steps

1. ✅ Backend พร้อมใช้งานแล้ว!
2. ต่อไป: Setup Firebase SDK ใน React Native app
3. ดู `README.md` สำหรับ API documentation

