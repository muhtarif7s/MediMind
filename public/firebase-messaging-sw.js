// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// These values are public and safe to include here.
firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-4363709614-c0c4b.firebaseapp.com",
  projectId: "studio-4363709614-c0c4b",
  storageBucket: "studio-4363709614-c0c4b.firebasestorage.app",
  messagingSenderId: "897830639835",
  appId: "1:897830639835:web:6b613db9498ff46a7794fe"
});

const messaging = firebase.messaging();
