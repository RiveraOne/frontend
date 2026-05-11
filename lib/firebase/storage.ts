import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "./config";

export const storage = getStorage(app);

export async function uploadReceipt(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `users/${userId}/receipts/${Date.now()}-${safeName}`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return getDownloadURL(objectRef);
}
