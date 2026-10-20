# 🧠 Smart CPU Scheduler (Version 2.0.1)

**Educational User Experience Improvement & Intelligent CPU Scheduling System**  
*(ระบบจำลองและเพิ่มประสิทธิภาพการจัดตารางการทำงานของหน่วยประมวลผลกลางอัจฉริยะเพื่อการศึกษา)*

เว็บไซต์สำหรับการเรียนรู้ จำลอง วิเคราะห์ และเปรียบเทียบประสิทธิภาพการจัดตารางการทำงานของ CPU สำหรับนักเรียน ปวช., ปวส., นักศึกษา และผู้สนใจทั่วไป ออกแบบด้วยหลักการ **Learner-Centered Design** ใช้งานได้ทันทีโดยไม่ต้องสมัครสมาชิก

---

## 🌟 จุดเด่นและฟังก์ชันใหม่ใน Version 2.0.1 (Educational UX Improvements)

| ฟังก์ชัน | รายละเอียดตาม TOR Version 2.0.1 |
|---|---|
| **Welcome Message System** | แบนเนอร์ข้อความต้อนรับและแนะนำสำหรับผู้เริ่มต้นบนหน้าแรก พร้อมปุ่มเริ่มทดลองใช้งานและดูวิธีใช้งานทันที |
| **5-Step User Guide** | คู่มือการใช้งาน 5 ขั้นตอน (เลือกอัลกอริทึม ➔ กำหนด Process ➔ เริ่มจำลอง ➔ ศึกษาผลลัพธ์ ➔ เปรียบเทียบ) พร้อมคำแนะนำ FCFS สำหรับผู้เริ่มต้น |
| **Technical Tooltips (14+ คำศัพท์)** | ไอคอน `(?)` อธิบายความหมาย สูตรคำนวณ และตัวอย่าง (PID, AT, BT, CT, TAT, WT, RT, Priority, Time Quantum, CPU Util, Throughput, Context Switch, Preemptive, Non-preemptive) |
| **Interactive Onboarding Tour** | ทัวร์แนะนำเว็บไซต์แบบโต้ตอบทีละขั้นตอน (Next, Back, Skip, Finish) และสามารถเปิดซ้ำได้ตลอดเวลา |
| **Beginner Mode (โหมดผู้เริ่มต้น)** | สวิตช์เปิด/ปิดโหมดเรียนรู้ แสดงคำอธิบายเพิ่มเติมและป้ายแนะนำอัลกอริทึม FCFS |
| **3 Educational Sample Presets** | ชุดข้อมูลตัวอย่าง 3 รูปแบบ: Basic Scheduling, Different Arrival Times, Different Burst Times |
| **Gantt Chart Learning Guide** | คำอธิบายวิธีอ่านผังแกนต์ แกนเวลา แถบสี จุดเริ่ม/สิ้นสุด CPU Idle และการแย่ง CPU (Preemption) |
| **Help Center (`/help`)** | ศูนย์ช่วยเหลือแบบครบวงจร รวมพจนานุกรมศัพท์เทคนิค, คำถามที่พบบ่อย (FAQs), และคู่มือสรุป |
| **Bilingual & Dual Theme** | รองรับภาษาไทย (ค่าเริ่มต้น) และภาษาอังกฤษ พร้อมสลับ Light Mode / Dark Mode ได้ตลอดเวลา |
| **Learner Settings Persistence** | จัดเก็บการตั้งค่าลง `localStorage` ตามคีย์มาตรฐาน: `smartcpu-language`, `smartcpu-theme`, `smartcpu-onboarding-completed`, `smartcpu-beginner-mode` |

---

## 🧮 อัลกอริทึมที่รองรับ

### 1. อัลกอริทึมมาตรฐาน
* **FCFS (First Come First Served):** มาก่อนได้ก่อน (Non-preemptive) — แนะนำสำหรับผู้เริ่มต้น
* **SJF (Shortest Job First):** งานสั้นที่สุดทำก่อน (Non-preemptive) — เวลารอคอยเฉลี่ยต่ำ
* **SRTF (Shortest Remaining Time First):** งานเหลือสั้นที่สุดทำก่อน (Preemptive SJF)
* **Round Robin (RR):** จัดสรรเวลาตาม Time Quantum (Preemptive) — เหมาะกับระบบโต้ตอบ
* **Priority Scheduling:** ทำตามลำดับความสำคัญ (ตัวเลขน้อย = สำคัญสูงสุด)

### 2. อัลกอริทึมนวัตกรรม AICS
* **AICS (Adaptive Intelligent CPU Scheduler):** อัลกอริทึมปรับตัวอัจฉริยะที่วิเคราะห์ 14 Workload Features และเลือก Scheduling Policy พร้อมปรับ Time Quantum อัตโนมัติ

### 3. ระบบ AI Recommendation
* โมเดล **Random Forest Classifier** วิเคราะห์คุณลักษณะภาระงานและแนะนำอัลกอริทึมที่เหมาะสมที่สุดพร้อมแสดงเหตุผลประกอบ

---

## 📊 ตัวชี้วัดประสิทธิภาพ (Metrics)

* **Completion Time (CT):** เวลาที่งานเสร็จสิ้นสมบูรณ์
* **Turnaround Time (TAT):** $TAT = CT - AT$
* **Waiting Time (WT):** $WT = TAT - BT$
* **Response Time (RT):** $RT = \text{เวลาที่ได้รับ CPU ครั้งแรก} - AT$
* **CPU Utilization (%):** $(\text{เวลาที่ CPU ทำงานจริง} \div \text{เวลารวม}) \times 100$
* **Throughput:** $\text{จำนวนงานที่เสร็จ} \div \text{เวลารวม}$
* **Context Switches:** จำนวนครั้งที่ CPU สลับการทำงานระหว่างโพรเซส

---

## 🚀 วิธีการเปิดใช้งานระบบ (Quick Start)

### ทางเลือกที่ 1: ดับเบิลคลิกไฟล์เดียวเปิดระบบทั้งหมด (แนะนำ)
ดับเบิลคลิกที่ไฟล์:
📁 `start_all.bat`  
*(สคริปต์จะเริ่มทั้ง Backend และ Frontend และเปิดหน้าเว็บเบราว์เซอร์ http://localhost:3000 ให้อัตโนมัติ)*

### ทางเลือกที่ 2: รันแยกทีละส่วน
* **Backend:** ดับเบิลคลิก `run_backend.bat` หรือ
  ```bash
  cd backend
  venv\Scripts\activate
  uvicorn main:app --reload --host 127.0.0.1 --port 8000
  ```
  *(Swagger API Docs: http://127.0.0.1:8000/docs)*

* **Frontend:** ดับเบิลคลิก `run_frontend.bat` หรือ
  ```bash
  cd frontend
  node node_modules\next\dist\bin\next dev -H 127.0.0.1 -p 3000
  ```
  *(Web App: http://127.0.0.1:3000)*

---

## 🧪 การทดสอบระบบ (Testing)

### 1. Unit Tests (Simulation Correctness)
```bash
cd backend
venv\Scripts\activate
python -m pytest -o pythonpath=. tests -v
```
*(ผ่าน 12/12 รายการครอบคลุมทุกอัลกอริทึมและตัวชี้วัด)*

### 2. ชุดข้อมูลทดสอบ 100 ชุด (ตาม TOR)
```bash
cd backend
python scripts/generate_test_datasets.py
```
*(บันทึกลงไฟล์ `backend/data/test_datasets_100.json`)*

### 3. Frontend Type Checking & Build
```bash
cd frontend
npm run build
```
*(ผ่าน 9/9 Routes ด้วย 0 errors และ 0 warnings)*

---

## 📂 โครงสร้างโปรเจกต์

```
CPU/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── ai/               # AI Model, Recommender, AICS, Trainer
│   │   ├── routers/          # API Routers (simulation, ai, processes, history, admin)
│   │   ├── simulation/       # Engine (fcfs, sjf, srtf, round_robin, priority, metrics)
│   │   ├── database.py       # SQLite connection
│   │   ├── models.py         # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── data/                 # test_datasets_100.json
│   ├── scripts/              # generate_test_datasets.py
│   └── tests/                # test_algorithms.py
├── frontend/                 # Next.js 14 App Router
│   └── src/
│       ├── app/              # Routes: /, /simulator, /compare, /history, /help, /admin
│       ├── components/       # UI, GanttChart, MetricsDashboard, Tooltips, Onboarding, Guides
│       ├── contexts/         # LanguageContext, ThemeContext, BeginnerModeContext
│       └── lib/              # constants, types, utils, api, i18n
├── start_all.bat             # วันคลิกเปิดระบบทั้งหมด
├── run_backend.bat
├── run_frontend.bat
└── README.md
```

---

## 📜 สิทธิ์และการใช้งาน
พัฒนาขึ้นเพื่อเป็นนวัตกรรมซอฟต์แวร์เพื่อการศึกษา สาขาเทคนิคคอมพิวเตอร์ ประจำปีการศึกษา 2569
