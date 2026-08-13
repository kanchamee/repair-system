// ===== ค่าคงที่: สถานะปัญหา =====
const STATUS_META = {
  received:   { label: "รับเรื่องแล้ว",            color: "#FFDD66", border: "#F0C400", emoji: "📥" },
  inprogress: { label: "กำลังดำเนินการ",           color: "#6EC3F4", border: "#2B9BE0", emoji: "🔧" },
  done:       { label: "ดำเนินการเสร็จแล้ว",       color: "#7FDDA0", border: "#3FBE6C", emoji: "✅" },
  waiting:    { label: "รออุปกรณ์/รองบประมาณ",     color: "#F4877E", border: "#E2493D", emoji: "⏳" }
};
const STATUS_ORDER = ["received", "inprogress", "done", "waiting"];

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.received;
}

// ===== ค่าคงที่: ประเภทปัญหา =====
const PROBLEM_TYPES = {
  electric: "ระบบไฟฟ้า",
  plumbing: "ระบบประปา",
  fan: "พัดลม",
  aircon: "เครื่องปรับอากาศ",
  other: "อื่นๆ"
};
const PROBLEM_EMOJI = {
  electric: "⚡", plumbing: "🚰", fan: "🌀", aircon: "❄️", other: "🔩"
};

const MONTH_NAMES = {
  "01": "มกราคม", "02": "กุมภาพันธ์", "03": "มีนาคม", "04": "เมษายน",
  "05": "พฤษภาคม", "06": "มิถุนายน", "07": "กรกฎาคม", "08": "สิงหาคม",
  "09": "กันยายน", "10": "ตุลาคม", "11": "พฤศจิกายน", "12": "ธันวาคม"
};

// ===== วันที่ปัจจุบันแบบไทย สำหรับ input date (ล็อคโซนเวลากรุงเทพ) — ใช้แค่วันที่ ไม่ใช้เวลา =====
function getBangkokNowForInput() {
  const now = new Date();
  const bangkok = new Date(now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60000);
  return bangkok.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getMonthFromInputValue(value) {
  // value: YYYY-MM-DD -> คืนค่าเดือนแบบ "MM"
  if (!value || value.length < 7) return "01";
  return value.slice(5, 7);
}

function formatDateThai(isoOrTimestamp) {
  const d = new Date(isoOrTimestamp);
  return d.toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric"
  });
}

// ===== บีบอัดรูปภาพฝั่งเบราว์เซอร์ก่อนอัปโหลด =====
function compressImage(file, maxWidth = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("บีบอัดรูปไม่สำเร็จ"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== แปลง Blob เป็น base64 data URL =====
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ===== บีบอัดรูปแล้วแปลงเป็น base64 เก็บลง Realtime Database โดยตรง (ไม่ใช้ Firebase Storage เพื่อให้ใช้แผนฟรีได้) =====
async function uploadCompressedImage(file, folder = "reports") {
  const compressedBlob = await compressImage(file);
  return await blobToDataUrl(compressedBlob);
}

// ===== helper: สร้าง <option> จาก array/object =====
function optionsHtml(items, placeholder) {
  let html = placeholder ? `<option value="">${placeholder}</option>` : "";
  if (Array.isArray(items)) {
    items.forEach((it) => (html += `<option value="${it}">${it}</option>`));
  } else {
    Object.entries(items).forEach(([k, v]) => (html += `<option value="${k}">${v}</option>`));
  }
  return html;
}

// ===== เปิด/ปิด popup ทั่วไป =====
function showOverlay(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hideOverlay(id) {
  document.getElementById(id).classList.add("hidden");
}

// ===== lightbox รูปภาพ =====
function openLightbox(url, caption) {
  const box = document.getElementById("lightbox");
  document.getElementById("lightbox-img").src = url;
  document.getElementById("lightbox-caption").textContent = caption || "";
  box.classList.remove("hidden");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
