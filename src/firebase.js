import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser, 
  signOut as fbSignOut, 
  sendPasswordResetEmail as fbResetPassword, 
  onAuthStateChanged as fbOnAuthChange 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc as fbDoc, 
  getDoc as fbGetDoc, 
  setDoc as fbSetDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY' && firebaseConfig.apiKey !== '';

let app, auth, db;
export let isDemoMode = !hasFirebaseConfig;

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing real Firebase, falling back to Demo Mode:", error);
    isDemoMode = true;
  }
}

// --- MOCK DATABASE AND AUTHENTICATION SIMULATOR FOR DEMO MODE ---
const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('adhd_demo_users')) || [];
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem('adhd_demo_users', JSON.stringify(users));
};

const getLocalCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('adhd_demo_current_user')) || null;
  } catch (e) {
    return null;
  }
};

const setLocalCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('adhd_demo_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('adhd_demo_current_user');
  }
};

const demoListeners = new Set();

const notifyDemoListeners = (user) => {
  demoListeners.forEach(listener => listener(user));
};

// --- EXPORTED ADAPTER FUNCTIONS ---

export const logIn = async (email, password) => {
  if (isDemoMode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getLocalUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!foundUser) {
          reject({ code: 'auth/user-not-found', message: 'Usuario no encontrado.' });
        } else if (foundUser.password !== password) {
          reject({ code: 'auth/wrong-password', message: 'Contraseña incorrecta.' });
        } else {
          const userObj = { email: foundUser.email, uid: foundUser.uid };
          setLocalCurrentUser(userObj);
          notifyDemoListeners(userObj);
          resolve({ user: userObj });
        }
      }, 500); // Simulate network latency
    });
  } else {
    return fbSignIn(auth, email, password);
  }
};

export const signUp = async (email, password) => {
  if (isDemoMode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getLocalUsers();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          reject({ code: 'auth/email-already-in-use', message: 'El correo ya está registrado.' });
        } else {
          const newUser = {
            email,
            password,
            uid: 'demo_user_' + Math.random().toString(36).substr(2, 9)
          };
          users.push(newUser);
          saveLocalUsers(users);
          const userObj = { email: newUser.email, uid: newUser.uid };
          setLocalCurrentUser(userObj);
          notifyDemoListeners(userObj);
          resolve({ user: userObj });
        }
      }, 500);
    });
  } else {
    return fbCreateUser(auth, email, password);
  }
};

export const logOut = async () => {
  if (isDemoMode) {
    setLocalCurrentUser(null);
    notifyDemoListeners(null);
    return Promise.resolve();
  } else {
    return fbSignOut(auth);
  }
};

export const resetPassword = async (email) => {
  if (isDemoMode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getLocalUsers();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (!exists) {
          reject({ code: 'auth/user-not-found', message: 'No hay ningún usuario registrado con este correo.' });
        } else {
          resolve(); // Simulate success
        }
      }, 500);
    });
  } else {
    return fbResetPassword(auth, email);
  }
};

export const subscribeAuth = (callback) => {
  if (isDemoMode) {
    demoListeners.add(callback);
    // Call immediately with current state
    const currentUser = getLocalCurrentUser();
    // Use setTimeout to ensure callback runs asynchronously just like firebase
    setTimeout(() => callback(currentUser), 0);
    return () => {
      demoListeners.delete(callback);
    };
  } else {
    return fbOnAuthChange(auth, callback);
  }
};

export const getUserData = async (uid) => {
  if (isDemoMode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dataStr = localStorage.getItem(`adhd_demo_data_${uid}`);
        const data = dataStr ? JSON.parse(dataStr) : null;
        resolve({
          exists: () => !!data,
          data: () => data
        });
      }, 300);
    });
  } else {
    const docRef = fbDoc(db, 'users', uid);
    const docSnap = await fbGetDoc(docRef);
    return docSnap;
  }
};

export const saveUserData = async (uid, data) => {
  if (isDemoMode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`adhd_demo_data_${uid}`, JSON.stringify(data));
        resolve();
      }, 300);
    });
  } else {
    const docRef = fbDoc(db, 'users', uid);
    return fbSetDoc(docRef, data);
  }
};
