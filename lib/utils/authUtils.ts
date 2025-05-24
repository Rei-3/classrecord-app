import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { jwtDecode } from 'jwt-decode';

const SECRET_KEY = 'ARy9yMevgWXnEAF3oJJD15TRl2ljIoUPkd+QLlihNZk'; // base64 string
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const FNAME='fname';
const LNAME='lname';
const USERNAME='username';


interface DecodedToken {
  exp: number;
}

export const setFname = async (fname: string) => {
  await SecureStore.setItemAsync(FNAME, fname);
}
export const setLname = async (lname: string) => {
  await SecureStore.setItemAsync(LNAME, lname);
}
export const setUsername = async (username: string) => {
  await SecureStore.setItemAsync(USERNAME, username);
}

export const getFname = async (): Promise<string | null> => {
  const fname = await SecureStore.getItemAsync(FNAME);
  if (!fname) return null;
  return fname;
}
export const getLname = async (): Promise<string | null> => {
  const lname = await SecureStore.getItemAsync(LNAME);
  if (!lname) return null;
  return lname;
}
export const getUsername = async (): Promise<string | null> => {
  const username = await SecureStore.getItemAsync(USERNAME);
  if (!username) return null;
  return username;
}

export const removeCred = async () =>{
  await SecureStore.deleteItemAsync(FNAME);
  await SecureStore.deleteItemAsync(LNAME);
  await SecureStore.deleteItemAsync(USERNAME);
}

// 🔐 Encrypt data using HMAC SHA-256
const encryptData = async (data: string): Promise<string> => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data + SECRET_KEY
  );
  return hash + ':' + data;
};

// 🔓 Decrypt data (not real decryption — just checks structure)
const decryptData = async (encrypted: string): Promise<string | null> => {
  const parts = encrypted.split(':');
  if (parts.length !== 2) return null;
  const [hash, data] = parts;
  const checkHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data + SECRET_KEY
  );
  return checkHash === hash ? data : null;
};

// ✅ Store token
export const setAuthToken = async (token: string) => {
  const encrypted = await encryptData(token);
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, encrypted);
};

export const setRefreshToken = async (token: string) => {
  const encrypted = await encryptData(token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, encrypted);
};

// 🧾 Get token
export const getAuthToken = async (): Promise<string | null> => {
  const encrypted = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (!encrypted) return null;
  return await decryptData(encrypted);
};

export const getRefreshToken = async (): Promise<string | null> => {
  const encrypted = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!encrypted) return null;
  return await decryptData(encrypted);
};

// ❌ Remove token
export const removeAuthToken = async () => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const logout = async () => {
  await removeAuthToken();
  await removeRefreshToken();
};

// ⏰ Check if token expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 10;
    return decoded.exp < currentTime + bufferTime;
  } catch (err) {
    console.error('Error decoding token:', err);
    return true;
  }
  
};
export function getUserRoleFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.role || null;
  } catch {
    return null;
  }
}

