/**
 * @fileOverview Secure Firebase configuration.
 * Pulls from environment variables to prevent sensitive key leaks in Git.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-4363709614-c0c4b.firebaseapp.com",
  projectId: "studio-4363709614-c0c4b",
  storageBucket: "studio-4363709614-c0c4b.appspot.com",
  messagingSenderId: "897830639835",
  appId: "1:897830639835:web:6b613db9498ff46a7794fe",
  measurementId: "",
};
