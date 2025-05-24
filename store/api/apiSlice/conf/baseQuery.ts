import { 
    BaseQueryFn, 
    FetchArgs, 
    fetchBaseQuery, 
    FetchBaseQueryError 
  } from "@reduxjs/toolkit/query/react";
  
  import { 
    getAuthToken, 
    getRefreshToken, 
    isTokenExpired, 
    logout, 
    setAuthToken, 
    setRefreshToken 
  } from "@/lib/utils/authUtils";
  
  // ⚠️ baseQuery must be async now due to async token
  export const baseQueryWithoutReauth = fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_ENDPOINT, // expo uses EXPO_PUBLIC_
    prepareHeaders: async (headers) => {
      const token = await getAuthToken(); // ⬅️ Async
  
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
  
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("API_KEY", `${process.env.EXPO_PUBLIC_API_KEY}`);
      headers.set("SECRET_KEY", `${process.env.EXPO_PUBLIC_SECRET_KEY}`);
  
      return headers;
    },
  });
  
  // ✅ Async reauth base query
  export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let token = await getAuthToken(); // ⬅️ Async
  
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshToken(); // ⬅️ try to refresh
  
      if (!refreshed) {
        await logout();
        return { error: { status: 403, data: { message: "Token expired" } } };
      }
      token = await getAuthToken(); // re-fetch the new access token
    }
  
    let result = await baseQueryWithoutReauth(args, api, extraOptions);
  
    if (result.error && result.error.status === 403) {
      const refreshed = await refreshToken();
  
      if (refreshed) {
        result = await baseQueryWithoutReauth(args, api, extraOptions);
      } else {
        await logout();
      }
    }
  
    return result;
  };
  
  async function refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await getRefreshToken(); // ⬅️ Async
  
      if (!refreshToken) {
        return false;
      }
  
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_ENDPOINT}${process.env.EXPO_PUBLIC_REFRESH}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            "API_KEY": `${process.env.EXPO_PUBLIC_API_KEY}`,
            "SECRET_KEY": `${process.env.EXPO_PUBLIC_SECRET_KEY}`,
          },
          body: JSON.stringify({ refreshToken }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Token refresh failed");
      }
  
      const data = await response.json();
  
      await setAuthToken(data.accessToken);
  
      if (data.refresh_token) {
        await setRefreshToken(data.refresh_token);
      }
  
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  }
  