import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyC8c26DfiE6Byc5WnM-GdXVKFCmt-B2tVw",
  authDomain: "cryptoverse-58c77.firebaseapp.com",
  projectId: "cryptoverse-58c77",
  storageBucket: "cryptoverse-58c77.appspot.com",
  messagingSenderId: "730525975303",
  appId: "1:730525975303:web:5b3649e86c8531bfe47ba2"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
