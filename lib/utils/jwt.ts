import {jwtDecode} from 'jwt-decode';
import { getAuthToken } from './authUtils';

interface JwtPayload {
  role: string;
  exp: number;
  [key: string]: any;
}

export const getUserRole = async (): Promise<string | null> => {
  const token = await getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
};
