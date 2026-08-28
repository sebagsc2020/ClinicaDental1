// js/config.js
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
const auth = firebase.auth();
