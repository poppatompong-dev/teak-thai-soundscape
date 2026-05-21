# Soundscape Survey - System Documentation

เอกสารฉบับนี้อธิบายโครงสร้างและการทำงานของระบบ "Soundscape Survey" ซึ่งเป็นแพลตฟอร์มสำหรับรับฟังความเห็นและสำรวจความต้องการจุดติดตั้งระบบเสียงตามสาย (PA) หรือนำไปประยุกต์ใช้กับแบบสำรวจความต้องการอื่นๆ สำหรับหน่วยงานราชการ

## 1. Project Overview
ระบบถูกพัฒนาขึ้นในรูปแบบ Single Page Application (SPA) เพื่อให้ตอบสนองผู้ใช้งานได้อย่างรวดเร็ว โดยมีเป้าหมายหลักคือ:
- ให้เจ้าหน้าที่ตามส่วนราชการต่างๆ สามารถเข้ามากรอกแจ้งความต้องการได้อย่างง่ายดายผ่านมือถือและคอมพิวเตอร์
- ผู้ดูแลระบบ (Admin) สามารถดูภาพรวมข้อมูล จัดการแบบสำรวจ นำออกเป็นไฟล์ Excel และปรับแต่งข้อมูลทั่วไปของแบบสำรวจได้เองโดยไม่ต้องแก้โค้ด

## 2. Tech Stack
- **Frontend Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS + Shadcn UI (Radix UI)
- **Routing**: React Router DOM
- **Mock Backend**: `json-server` สำหรับจำลอง RESTful API (อ่าน/เขียนข้อมูลจากไฟล์ `db.json`)
- **Other Utilities**:
  - `xlsx` สำหรับการนำออก (Export) ข้อมูลเป็นไฟล์ Excel
  - `qrcode.react` สำหรับการสร้าง QR Code ลิงก์ระบบ
  - `lucide-react` สำหรับไอคอนในระบบ

## 3. Key Features

### 3.1 Dynamic Survey Configuration
ข้อมูลหลักของแบบสำรวจไม่ได้ถูกเขียนตายตัวในโค้ด แต่จะถูกดึงมาจาก API (`GET /settings`) เพื่อให้ปรับเปลี่ยนได้ยืดหยุ่น:
- `orgName`: ชื่อหน่วยงาน/องค์กร (เช่น เทศบาลนครนครสวรรค์)
- `surveyTitle`: ชื่อแบบสำรวจ
- `surveyDescription`: คำอธิบายและวัตถุประสงค์ (เช่น คำอธิบายว่าระบบ PA คืออะไร)
- `contactInfo`: ข้อมูลการติดต่อหน่วยงาน
- `openDate` / `closeDate`: ช่วงเวลาที่ระบบจะเปิดรับข้อมูลอัตโนมัติ
- `isOpen`: สวิตช์ปิดฉุกเฉิน (Manual Override)

### 3.2 Landing & Survey Flow
- **Landing Page (`/`)**: แสดงภาพรวมแบบสำรวจ พร้อมบอกสถานะว่าอยู่ในช่วงเปิดรับหรือไม่ หากไม่อยู่ในช่วงเวลา จะล็อกปุ่มเข้าสู่แบบสำรวจ
- **Survey Page (`/survey`)**: ฟอร์มกรอกข้อมูลแบ่งเป็นขั้นตอน (Stepper) มีการตรวจสอบ (Validation) เพื่อให้แน่ใจว่าได้ข้อมูลครบถ้วน
- **Confirmation Page (`/confirmation`)**: หน้าแสดงผลหลังจากการบันทึกข้อมูลเรียบร้อยแล้ว

### 3.3 Admin Dashboard (`/admin/dashboard`)
- เข้าสู่ระบบผ่าน `/login` (ใช้ session storage ง่ายๆ จำลองสิทธิ์ admin)
- **สถิติภาพรวม (Overview)**: นับจำนวนคำขอ อาคารที่มีการร้องขอ ความเร่งด่วน ฯลฯ
- **ตั้งค่าระบบ (Configuration)**: มีฟอร์มให้เปลี่ยนค่า `orgName`, `surveyTitle`, ฯลฯ และช่วงเวลาแบบสำรวจได้โดยตรง
- **ตารางจัดการข้อมูล (Data Table)**: ดูรายการทั้งหมด สามารถกดลบ แก้ไขระดับความเร่งด่วน หรือนำข้อมูลออกเป็น Excel ได้
- **การสร้าง QR Code**: ระบบจะดึง Domain ที่รันอยู่ปัจจุบัน (เช่น URL บน Vercel) มาสร้าง QR Code แจกจ่ายผู้ใช้ได้ทันที

## 4. Folder Structure (Key Directories)
```
/src
  /components    # Reusable UI components (Shadcn + Tailwind)
  /hooks         # Custom React hooks (เช่น use-toast)
  /pages         # React Router Page components (Landing, Survey, Dashboard)
  /survey        # Logic และ Components เฉพาะเจาะจงของฝั่งแบบสำรวจ (Steps, Context, Validation)
  App.tsx        # Main application router layout
/db.json         # Mock database file
```

## 5. Development & Deployment

### การรันโปรเจกต์ (Local)
1. ติดตั้ง dependencies: `npm install`
2. รัน Frontend: `npm run dev`
3. รัน Mock Backend: `npm run api` (เพื่อสตาร์ท `json-server` ที่พอร์ต 3001)

### การนำขึ้น Vercel (Production)
- Frontend สามารถ Deploy ขึ้น Vercel ได้โดยตรงผ่าน GitHub Integration
- *หมายเหตุ*: ในส่วนของฐานข้อมูล (Backend) หากขึ้น Production จริงๆ ระบบต้องเปลี่ยนจากการใช้ `json-server` ไปเป็น Database Services อื่น (เช่น Firebase, Supabase, Vercel Postgres) เนื่องจาก Vercel เป็น Serverless environment ไม่สามารถแก้ไขไฟล์ `db.json` แล้วบันทึกแบบถาวรบนระบบ Production ได้
