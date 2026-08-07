// ===== ข้อมูลสถานที่ทั้งหมดของโรงเรียน ใช้ร่วมกันทั้งฟอร์มแจ้งซ่อม/ติดตามสถานะ/แอดมิน =====

// ห้องน้ำ: อาคาร -> { floors, lockedFloor, sides, types }
const BATHROOM_BUILDINGS = {
  "1": { floors: [1, 2, 3, 4], sides: ["ฝั่งโภชนาการ", "ฝั่งห้องกิจกรรม"], types: ["ชาย", "หญิง"] },
  "2": { floors: [3], lockedFloor: true, sides: null, types: ["ชาย", "หญิง"] },
  "3": { floors: [1, 2, 3, 4, 5, 6, 7], sides: null, types: ["ชาย", "หญิง"] },
  "4": { floors: [1, 2, 3], sides: null, types: ["ชาย", "หญิง"] },
  "5": { floors: [1, 2, 3, 4], sides: null, types: ["ชาย", "หญิง"] },
  "6": { floors: [1, 2], sides: null, types: ["ชาย", "หญิง"] }
};

// ห้องหมวด: กลุ่มสาระ -> รายชื่อห้อง
const SUBJECT_GROUPS = {
  "วิทยาศาสตร์และเทคโนโลยี": ["อาคาร 1 ชั้น 3 (1320)", "อาคาร 3 ชั้น 4 (3401)"],
  "คณิตศาสตร์": ["อาคาร 1 ชั้น 4 (1420-1421)", "อาคาร 3 ชั้น 4 (3406)", "อาคาร 6 ชั้น 3 (6307)"],
  "สังคมศึกษา ศาสนาและวัฒนธรรม": ["อาคาร 6 ชั้น 3 (6300)", "ห้องพระพุทธ อาคาร 6 ชั้น 4 (6400)", "ห้องศูนย์พอเพียง อาคาร 6 ชั้น 4 (6407)"],
  "ภาษาต่างประเทศ": ["อาคาร 1 ชั้น 2", "Foreign Language Center อาคาร 1 ชั้น 2", "อาคาร 3 ชั้น 7 (3707-3708)"],
  "ภาษาไทย": ["อาคาร 3 ชั้น 2", "ห้องศูนย์ภาษาไทย อาคาร 3 ชั้น 2", "อาคาร 3 ชั้น 5 (3507)", "อาคาร 3 ชั้น 6 (3607)"],
  "สุขศึกษาและพลศึกษา": ["อาคาร 4 ชั้น 2"],
  "ศิลปะ": ["อาคาร 3 ชั้น 3", "อาคาร 3 ชั้น 2"],
  "การงานอาชีพ": ["อาคาร 3 ชั้น 2"],
  "งานแนะแนว": ["อาคาร 3 ชั้น 3 (3305-3307)"]
};

// ห้องสำนักงาน: ล็อคที่อาคาร 1 ชั้น 2 ทุกห้อง
const OFFICE_LOCATION_LABEL = "อาคาร 1 ชั้น 2";
const OFFICE_ROOMS = [
  "ห้องกลุ่มบริหารงานทั่วไป",
  "ห้องแผนงานและสารสนเทศ",
  "ห้องพัสดุ",
  "ห้องกลุ่มบริหารงานงบประมาณ",
  "ห้องผู้อำนวยการ",
  "ห้อง ISO",
  "ห้องวิชาการ",
  "ห้องทะเบียน"
];

const LOCATION_TYPE_LABEL = {
  classroom: "ห้องเรียน",
  bathroom: "ห้องน้ำ",
  subject: "ห้องหมวด",
  office: "ห้องสำนักงาน"
};
const LOCATION_TYPE_EMOJI = {
  classroom: "🏫", bathroom: "🚻", subject: "📚", office: "🗄️"
};

// ===== สร้าง label แสดงผลของสถานที่จาก locationDetail =====
function buildLocationLabel(locationType, detail) {
  if (locationType === "classroom") {
    return `ห้องเรียน ${detail.roomNumber}`;
  }
  if (locationType === "bathroom") {
    let s = `ห้องน้ำ อาคาร ${detail.building} ชั้น ${detail.floor}`;
    if (detail.side) s += ` (${detail.side})`;
    s += ` - ห้องน้ำ${detail.type}`;
    return s;
  }
  if (locationType === "subject") {
    return `ห้องหมวด${detail.group} - ${detail.room}`;
  }
  if (locationType === "office") {
    return `${detail.room} (${OFFICE_LOCATION_LABEL})`;
  }
  return "";
}

// ===== วาด dropdown ของห้องน้ำ ตามอาคารที่เลือก =====
function renderBathroomFields(container, building, prefix) {
  const cfg = BATHROOM_BUILDINGS[building];
  if (!cfg) { container.innerHTML = ""; return; }

  let html = "";
  if (cfg.lockedFloor) {
    html += `<input type="hidden" id="${prefix}-floor" value="${cfg.floors[0]}">
      <p class="locked-note">ชั้น: ${cfg.floors[0]} (ล็อคอัตโนมัติ)</p>`;
  } else {
    html += `<label>ชั้น</label>
      <select id="${prefix}-floor" required>
        ${optionsHtml(cfg.floors.map(String), "-- เลือกชั้น --")}
      </select>`;
  }
  if (cfg.sides) {
    html += `<label>ฝั่ง</label>
      <select id="${prefix}-side" required>
        ${optionsHtml(cfg.sides, "-- เลือกฝั่ง --")}
      </select>`;
  }
  html += `<label>ประเภทห้องน้ำ</label>
    <select id="${prefix}-type" required>
      ${optionsHtml(cfg.types, "-- เลือกประเภท --")}
    </select>`;
  container.innerHTML = html;
}
