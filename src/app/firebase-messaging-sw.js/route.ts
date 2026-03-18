
import { NextResponse } from 'next/server';

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "studio-4363709614-c0c4b.firebaseapp.com",
    projectId: "studio-4363709614-c0c4b",
    storageBucket: "studio-4363709614-c0c4b.appspot.com", // Corrected value
    messagingSenderId: "897830639835",
    appId: "1:897830639835:web:6b613db9498ff46a7794fe",
  };

  const swScript = `
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

    const firebaseConfig = ${JSON.stringify(firebaseConfig)};
    
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
      );
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  `;

  return new NextResponse(swScript, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}
