// ============================================================
// FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCsTQoWZnMmcYwt2vjRQUPNUOKbHj3ZKqA",
  authDomain: "clinicadental1.firebaseapp.com",
  projectId: "clinicadental1",
  storageBucket: "clinicadental1.firebasestorage.app",
  messagingSenderId: "85943745725",
  appId: "1:85943745725:web:65e02bdb2c5abee1e2cbd4",
  measurementId: "G-74CV5LL9F7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================================
// UTILITIES GLOBALES
// ============================================================
function $(id) { return document.getElementById(id); }
function qs(sel, ctx=document) { return ctx.querySelector(sel); }
function qsa(sel, ctx=document) { return ctx.querySelectorAll(sel); }
function openModal(html) { const c=$('modal-generic-content'); c.innerHTML=html; $('modal-generic').classList.add('active'); }
function closeModal() { $('modal-generic').classList.remove('active'); }
function showToast(msg, type) { alert('🔔 '+msg); }
function formatDate(d) { if (!d) return ''; return d.slice(0,10); }