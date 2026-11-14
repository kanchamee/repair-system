# Repair System (ระบบแจ้งซ่อมอุปกรณ์)

ระบบแจ้งซ่อมอุปกรณ์และติดตามสถานะสำหรับโรงเรียน/หน่วยงาน ทำงานแบบ Serverless โดยเชื่อมต่อกับ Firebase Realtime Database และโฮสต์บน GitHub Pages

## โครงสร้างหน้าเว็บ
- `index.html` — หน้าหลัก เมนูเข้าถึงฟังก์ชันต่างๆ
- `report.html` — หน้าฟอร์มแจ้งซ่อมอุปกรณ์ (พร้อมระบบบีบอัดรูปภาพและตรวจสอบความปลอดภัย)
- `status.html` — ติดตามสถานะแจ้งซ่อมตามสถานที่ โดยไม่เปิดเผยข้อมูลส่วนบุคคลของผู้แจ้ง
- `admin.html` — แดชบอร์ดผู้ดูแลระบบ (ระบบล็อกอินด้วย Salted SHA-256, ป้องกัน Brute-force, กรองข้อมูล, อัปเดตสถานะ, ตอบกลับพร้อมรูปภาพ และส่งออกรายงาน)

## มาตรการความปลอดภัย (Security Features)
- **การยืนยันตัวตนและการจัดการเซสชัน**: ตรวจสอบรหัสผ่านผู้ดูแลระบบด้วย Salted SHA-256 Hash ผ่าน Web Crypto API, มีระบบหน่วงเวลาและล็อกบัญชีอัตโนมัติเมื่อใส่รหัสผิดติดต่อกันเกิน 5 ครั้ง, มี Session Timeout (30 นาที) และปุ่มออกจากระบบ
- **ป้องกัน XSS (Cross-Site Scripting)**: ตรวจสอบและแปลง HTML Entities (`escapeHtml`) ครอบคลุมทั้ง attribute, script และ inline handlers, ทำความสะอาด URL ของรูปภาพ (`sanitizeImageUrl`) รับเฉพาะ raster data URLs และ HTTPS ที่ปลอดภัย
- **ป้องกัน CSV / Formula Injection (CWE-1236)**: ทำความสะอาดข้อมูล (`sanitizeExcelValue`) ก่อนส่งออกเป็นไฟล์ Excel ป้องกันคำสั่งที่เป็นสูตรสเปรดชีต
- **การปกป้องข้อมูลส่วนบุคคล (PDPA / Privacy)**: หน้าติดตามสถานะสาธารณะจะไม่เปิดเผยอีเมล เบอร์โทร หรือเลขประจำตัวนักเรียน
- **จำกัดขนาดและความปลอดภัยของไฟล์**: ตรวจสอบชนิดไฟล์ (เฉพาะ JPG, PNG, WebP) และจำกัดขนาดไม่เกิน 10MB ก่อนประมวลผล ป้องกัน Denial of Service
- **Content Security Policy (CSP)**: กำหนด Content-Security-Policy และ Referrer-Policy ในทุกหน้าเว็บ

## การตั้งค่าและเปลี่ยนรหัสผ่านแอดมิน (Admin PIN Configuration)
รหัสผ่านแอดมินเริ่มต้นคือ `6933` ซึ่งถูกเข้ารหัสแบบ Salted SHA-256:
- ค่า Salt: `repair-system-sc-69-salt`
- ตัวแปรใน `admin.html`: `ADMIN_PIN_HASH`

หากต้องการเปลี่ยนรหัสผ่าน สามารถคำนวณ Hash ใหม่ได้ด้วย Node.js:
```bash
node -e 'const crypto = require("crypto"); console.log(crypto.createHash("sha256").update("repair-system-sc-69-salt" + "YOUR_NEW_PIN").digest("hex"));'
```
แล้วนำค่า Hash ที่ได้ไปวางแทนที่ `ADMIN_PIN_HASH` ใน `admin.html`

## การติดตั้ง Security Rules ใน Firebase
นำไฟล์ `database.rules.json` ไปติดตั้งใน Firebase Console (เมนู **Realtime Database > Rules**) หรือใช้คำสั่ง Firebase CLI:
```bash
firebase deploy --only database
```

## การทดสอบระบบ (Testing)
รันชุดการทดสอบความปลอดภัยและการทำงาน (Unit & Regression Tests) ด้วย Node.js:
```bash
npm test
```
