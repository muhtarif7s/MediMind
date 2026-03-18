// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// These values are public and safe to include here.
firebase.initializeApp({
  apiKey: "AIzaSyDzIMwFdkcEehY69LjmK3i2B4tWuqn48hA",
  authDomain: "studio-4363709614-c0c4b.firebaseapp.com",
  projectId: "studio-4363709614-c0c4b",
  storageBucket: "studio-4363709614-c0c4b.firebasestorage.app",
  messagingSenderId: "897830639835",
  appId: "1:897830639835:web:6b613db9498ff46a7794fe"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png', // Fallback to PWA icon
    data: payload.data // Pass along data for deep linking
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click for deep linking
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Default to root, or use a specific path from payload data
  const targetPath = event.notification.data?.path || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then((c) => c.navigate(targetPath));
      }
      return clients.openWindow(targetPath);
    })
  );
});