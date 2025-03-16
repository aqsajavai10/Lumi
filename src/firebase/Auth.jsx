import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState, createContext } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useSelector } from 'react-redux';


// Your existing Firebase config remains the same
const firebaseConfig = {
  apiKey: "AIzaSyDlHQYH7qv81iO-04pFOP47Efe8kms5NAs",
  authDomain: "testingestore-5a878.firebaseapp.com",
  projectId: "testingestore-5a878",
  storageBucket: "testingestore-5a878.appspot.com",
  messagingSenderId: "866805788601",
  appId: "1:866805788601:web:4864c99285d15028d59068",
  measurementId: "G-2PC7TLW2GJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export { db };

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const currentCart = useSelector(state => state.cart.value);
  const [userRole, setUserRole] = useState(null);

  const checkUserRole = async (uid) => {
    try {
      const roleDoc = await getDoc(doc(db, "roles", uid));
      return roleDoc.exists() ? roleDoc.data().role : "user";
    } catch (error) {
      console.error("Error checking user role:", error);
      return "user";
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
      return true;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "The email address is already in use by another account.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      case "auth/weak-password":
        return "The password is too weak.";
      case "auth/user-disabled":
        return "The user account has been disabled.";
      case "auth/user-not-found":
        return "There is no user record corresponding to this identifier.";
      case "auth/wrong-password":
        return "The password is invalid.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;

      // Update the user's profile
      await updateProfile(user, { displayName });

      // Send verification email
      await sendEmailVerification(user);
      setVerificationEmailSent(true);

      // Add user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        cart: currentCart,
        emailVerified: false,
      });

      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;
      
      if (!user.emailVerified) {
        throw new Error("Please verify your email before signing in.");
      }
      const role = await checkUserRole(user.uid);
      // Update the user's cart in Firestore with current cart state
      await setDoc(doc(db, "users", user.uid), {
        cart: currentCart,
        role: role // Store role in user document
      }, { merge: true });

      const userData = await getUserData(user.uid);
      setUser({ ...user, ...userData, role });
      setUserRole(role);
      setError(null);
      return { ...user, role };
    } catch (error) {
      if (error.message === "Please verify your email before signing in.") {
        setError(error.message);
      } else {
        setError(getErrorMessage(error.code));
      }
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setVerificationEmailSent(true);
        return true;
      } catch (error) {
        setError(getErrorMessage(error.code));
        throw error;
      }
    }
    return false;
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error("User document does not exist");
      }
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const updateUserData = async (uid, data) => {
    try {
      await setDoc(doc(db, "users", uid), data, { merge: true });
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          setUser({ ...firebaseUser, ...userData });
          
          // Update email verification status in Firestore
          if (firebaseUser.emailVerified) {
            await updateUserData(firebaseUser.uid, {
              emailVerified: true,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    error,
    loading,
    verificationEmailSent,
    signIn,
    signUp,
    signOut: signOutUser,
    getUserData,
    updateUserData,
    resendVerificationEmail,
    resetPassword,
    checkUserRole,
    userRole,
  };
}

export default AuthProvider;