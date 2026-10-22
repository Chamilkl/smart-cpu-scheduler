# 📊 คู่มือการติดตั้งและตั้งค่าระบบ Admin Analytics Dashboard
## Smart CPU Scheduler – Version 1.0 (Educational Analytics Edition)

คู่มือฉบับนี้จัดทำขึ้นตามข้อกำหนดการพัฒนาระบบ (TOR) เพื่อแนะนำขั้นตอนการตั้งค่าฐานข้อมูล **Supabase PostgreSQL**, การกำหนดค่า **Environment Variables**, และการ Deploy ขึ้นบน **Vercel** ให้ระบบทำงานได้อย่างสมบูรณ์ภายใต้ข้อจำกัด **Free Tier**

---

### 1. สถาปัตยกรรมระบบการจัดเก็บสถิติ (System Flow)

```
ผู้เรียน / ผู้เข้าชม
       │
       ▼
Next.js Frontend (Smart CPU Scheduler)
       │
       ▼  (ส่ง Event แบบ Anonymous Beacon / Fetch)
Next.js Route Handlers (/api/analytics/track)
       │  [Rate Limiting, De-duplication, ตรวจสอบรูปแบบข้อมูล]
       ▼
Supabase PostgreSQL Database (analytics_events, analytics_simulations)
       │
       ▼  [Server-Side Aggregations & Admin Auth Verification]
Next.js Stats Route (/api/analytics/stats)
       │
       ▼
Admin Analytics Dashboard (/admin)
```

---

### 2. การสร้างและตั้งค่าฐานข้อมูล Supabase (Free Tier)

1. สมัครใช้งานหรือเข้าสู่ระบบที่ [Supabase](https://supabase.com)
2. กดปุ่ม **New Project** ตั้งชื่อโปรเจกต์ เช่น `smart-cpu-analytics` และกำหนดรหัสผ่านฐานข้อมูล (Database Password)
3. เลือกภูมิภาคโฮสต์ (Region) เช่น **Singapore (Southeast Asia)** เพื่อความรวดเร็วในการเชื่อมต่อ
4. ไปที่เมนู **SQL Editor** ทางแถบเมนูด้านซ้าย
5. คัดลอกสคริปต์ SQL จากไฟล์ในโปรเจกต์:
   ```
   supabase/migrations/01_create_analytics_tables.sql
   ```
6. วางสคริปต์ลงในช่อง SQL Editor แล้วกดปุ่ม **Run**
7. ระบบจะสร้าง:
   - ตาราง `analytics_events` (จัดเก็บ Page Views, AI Calls, บทเรียน, แบบฝึกหัด)
   - ตาราง `analytics_daily_summary` (สรุปข้อมูลรายวันเพื่อประหยัดการอ่านฐานข้อมูล)
   - ตาราง `analytics_simulations` (สถิติการรันอัลกอริทึม CPU)
   - ดัชนี (Indexes) เพื่อการสืบค้นที่รวดเร็ว
   - นโยบายความปลอดภัย Row Level Security (RLS)
   - ฟังก์ชันคำนวณสรุปสถิติ `refresh_analytics_daily_summary()`

---

### 3. การคัดลอกค่าเชื่อมต่อ API (Supabase Credentials)

1. ในหน้าแดชบอร์ด Supabase ไปที่ **Project Settings** (ไอคอนฟันเฟือง) -> **API**
2. คัดลอกค่าต่อไปนี้:
   - **Project URL** -> นำไปใส่ใน `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys (anon / public)** -> นำไปใส่ใน `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys (service_role / secret)** -> นำไปใส่ใน `SUPABASE_SERVICE_ROLE_KEY` *(สำคัญ: ห้ามเปิดเผยคีย์นี้ในฝั่ง Frontend อย่างเด็ดขาด)*

---

### 4. การตั้งค่า Environment Variables

#### สำหรับการทดสอบในเครื่อง (Local Development)
คัดลอกไฟล์ตัวอย่าง `.env.local.example` เป็น `.env.local` ในโฟลเดอร์ `frontend/`:
```bash
cp frontend/.env.local.example frontend/.env.local
```

แก้ไขค่าใน `frontend/.env.local`:
```env
# URL สำหรับ Backend คำนวณ AI บน Render หรือเครื่องตนเอง
NEXT_PUBLIC_API_URL=http://localhost:8000

# ข้อมูลเชื่อมต่อ Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJh...your-service-role-key

# การป้องกันความปลอดภัยหน้า Admin
ADMIN_PASSWORD=admin_cpu_scheduler_2026
ADMIN_SESSION_SECRET=a_very_strong_random_secret_string_min_32_chars
```

#### สำหรับการ Deploy บน Vercel (Production)
1. ไปที่แดชบอร์ดของโปรเจกต์บน **Vercel**
2. ไปที่ **Settings** -> **Environment Variables**
3. เพิ่มตัวแปรทั้งหมด 6 ตัวข้างต้นให้ตรงกัน:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (เลือกเฉพาะ Production/Preview Server Environment)
   - `ADMIN_PASSWORD` (กำหนดรหัสผ่านสำหรับผู้ดูแลระบบ)
   - `ADMIN_SESSION_SECRET` (กำหนดข้อความลับสำหรับเซ็น Session Cookie)
4. ทำการ **Redeploy** โปรเจกต์

---

### 5. วิธีเข้าใช้งาน Admin Analytics Dashboard

1. เปิดเว็บไซต์ไปที่ URL: `https://your-domain.vercel.app/admin` หรือคลิกเมนู **"ผู้ดูแลระบบ" (Admin)** ในแถบนำทาง
2. ระบบจะแสดงหน้าจอเข้าสู่ระบบความปลอดภัย (Admin Authentication Gate)
3. กรอกรหัสผ่านที่ตั้งไว้ในตัวแปร `ADMIN_PASSWORD` (ค่าเริ่มต้น: `admin_cpu_scheduler_2026`)
4. เมนูที่สามารถใช้งานได้:
   - **Overview (ภาพรวม):** ดู Total Visitors, Today Visitors, Active (5 นาที), Traffic Trend, Popular Pages, Device Share
   - **Website Analytics:** กราฟเส้นและแท่งแสดงแนวโน้มผู้เข้าชมและหน้าที่นิยม
   - **Learning Analytics:** สถิติการเปิดอ่านคู่มือ 5 ขั้นตอน และบทเรียน
   - **CPU Simulation Analytics:** สถิติจำนวนครั้งและสัดส่วนการรัน FCFS, SJF, SRTF, RR, Priority, AICS
   - **AI & AICS Analytics:** สถิติการขอคำแนะนำ AI, การเปรียบเทียบอัลกอริทึม, อัตราความสำเร็จ
   - **Quiz Analytics:** สถิติการทำแบบฝึกหัด 5 ข้อ คะแนนเฉลี่ยรวม และหัวข้อที่ตอบผิดบ่อย
   - **Reports:** สรุปข้อมูลสำหรับพิมพ์หรือส่งออก PDF พร้อมตัวกรอง 7 วัน, 30 วัน, 90 วัน, หรือกำหนดเอง
   - **Settings:** ตรวจสอบสถานะ AI Model, สั่ง Retrain Model AI (ฟังก์ชันเดิม), และตรวจสอบสถานะฐานข้อมูล

---

### 6. การจัดการต้นทุนให้อยู่ในกรอบ Free Tier (Cost Optimization)

ระบบถูกออกแบบตามข้อกำหนด TOR Section 8 เพื่อความประหยัดสูงสุด:
- **Client-side Throttling & De-duplication:** ป้องกันการส่ง Page View ซ้ำซ้อนจากการรีเฟรชถี่ๆ โดยระบบจะนับเฉพาะการเปลี่ยนหน้าจริงหรือเว้นช่วงเกิน 5 วินาที
- **Rate Limiting:** จำกัดจำนวนคำขอ Analytics API สูงสุด 60 ครั้ง/นาที ต่อ Session ป้องกัน Bot หรือการกดรัว
- **Batching & Aggregation:** ระบบคำนวณสรุปสถิติผ่าน Database Indexes ช่วยลดโหลด CPU และ Bandwidth ของ Supabase Free Plan ได้อย่างมีประสิทธิภาพ
- **Zero Heavy Background Tasks on CPU Backend:** ระบบ Analytics ทำงานแยกออกจาก Python Backend บน Render ทำให้ระบบหลักไม่ช้าลงและไม่เสียค่าใช้จ่ายเพิ่มเติม
