import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================
// Replace the placeholder values below with your own Firebase project's configuration.
// You can find this in your Firebase project settings under "General".
export const firebaseConfig = {
  apiKey: "AIzaSyBZHqUCqBIOf3STQ20VDHRmPM75kwrQboY",
  authDomain: "social-story-generator-465716.firebaseapp.com",
  projectId: "social-story-generator-465716",
  storageBucket: "social-story-generator-465716.firebasestorage.app",
  messagingSenderId: "49359298043",
  appId: "1:49359298043:web:14f952c68cd3335a923f5e"
};
// =================================================================

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


export { app, auth, db, googleProvider };