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
  if (!value || typeof value !== "string" || value.length < 7) return "01";
  return value.slice(5, 7);
}

function formatDateThai(isoOrTimestamp) {
  if (!isoOrTimestamp) return "-";
  const d = new Date(isoOrTimestamp);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric"
  });
}

// ===== การตรวจสอบความปลอดภัยไฟล์รูปภาพ =====
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "กรุณาเลือกไฟล์รูปภาพ" };
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "รองรับเฉพาะไฟล์รูปภาพประเภท JPG, PNG และ WebP เท่านั้น" };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return { valid: false, error: "ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB" };
  }
  return { valid: true };
}

// ===== บีบอัดรูปภาพฝั่งเบราว์เซอร์ก่อนอัปโหลด =====
function compressImage(file, maxWidth = 1280, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const check = validateImageFile(file);
    if (!check.valid) {
      return reject(new Error(check.error));
    }
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
      img.onerror = () => reject(new Error("ไม่สามารถเปิดไฟล์รูปภาพได้"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("เกิดข้อผิดพลาดในการอ่านไฟล์"));
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
  const check = validateImageFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }
  const compressedBlob = await compressImage(file);
  return await blobToDataUrl(compressedBlob);
}

// ===== helper: สร้าง <option> จาก array/object =====
function optionsHtml(items, placeholder) {
  let html = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : "";
  if (Array.isArray(items)) {
    items.forEach((it) => {
      const val = escapeHtml(String(it));
      html += `<option value="${val}">${val}</option>`;
    });
  } else if (items && typeof items === "object") {
    Object.entries(items).forEach(([k, v]) => {
      html += `<option value="${escapeHtml(k)}">${escapeHtml(v)}</option>`;
    });
  }
  return html;
}

// ===== เปิด/ปิด popup ทั่วไป =====
function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

// ===== lightbox รูปภาพ (ปลอดภัย ไม่ใช้ innerHTML) =====
function openLightbox(url, caption) {
  const safeUrl = sanitizeImageUrl(url);
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if (!box || !img) return;

  if (safeUrl) {
    img.src = safeUrl;
    img.alt = caption || "รูปภาพ";
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
  if (cap) cap.textContent = caption || "";
  box.classList.remove("hidden");
}
function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (box) box.classList.add("hidden");
}

// ===== ป้องกัน XSS (HTML Entity Encoding) =====
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

// ===== ป้องกัน XSS จาก URL รูปภาพ (รองรับเฉพาะ raster base64 และ HTTPS) =====
function sanitizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  // Safe base64 image data URLs (jpeg, png, webp only - strictly no svg/html)
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  // Safe https URLs (e.g. Firebase storage or trusted CDN images)
  if (/^https:\/\/[^\s"'<>]+$/i.test(trimmed)) {
    return trimmed;
  }
  return "";
}

// ===== ป้องกัน CSV / Excel Formula Injection (CWE-1236) =====
function sanitizeExcelValue(val) {
  if (val === undefined || val === null) return "";
  if (typeof val !== "string") return val;
  // Disarm formula triggers: =, +, -, @, tab (\t), carriage return (\r)
  if (/^[=+\-@\t\r]/.test(val)) {
    return "'" + val;
  }
  return val;
}

// Export for Node.js test environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STATUS_META,
    STATUS_ORDER,
    getStatusMeta,
    PROBLEM_TYPES,
    PROBLEM_EMOJI,
    MONTH_NAMES,
    getBangkokNowForInput,
    getMonthFromInputValue,
    formatDateThai,
    compressImage,
    blobToDataUrl,
    uploadCompressedImage,
    optionsHtml,
    showOverlay,
    hideOverlay,
    openLightbox,
    closeLightbox,
    escapeHtml,
    sanitizeImageUrl,
    sanitizeExcelValue,
    validateImageFile,
    MAX_IMAGE_FILE_SIZE,
    ALLOWED_IMAGE_MIME_TYPES
  };
}
