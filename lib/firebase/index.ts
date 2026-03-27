export { auth, default as app } from "./config";
export { db } from "./firestore";
export { storage } from "./storage";
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  logout,
} from "./auth";
