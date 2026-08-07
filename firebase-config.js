// ตั้งค่าการเชื่อมต่อ Firebase — ใช้ร่วมกันทุกหน้า
const firebaseConfig = {
  apiKey: "AIzaSyD-MyrI-4pByLlvfVEiDKeWohWIqBzTAYg",
  authDomain: "repair-system-sc-69.firebaseapp.com",
  databaseURL: "https://repair-system-sc-69-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "repair-system-sc-69",
  storageBucket: "repair-system-sc-69.firebasestorage.app",
  messagingSenderId: "220475503838",
  appId: "1:220475503838:web:fb55b0ecef94b8b6bcbe4f",
  measurementId: "G-FVJMF5D78R"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const storage = firebase.storage();
