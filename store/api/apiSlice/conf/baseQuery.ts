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

  import Constants from "expo-constants";

  interface ExpoExtraConfig {
    apiKey: string;
    secretKey: string;
    baseEndpoint: string;
  }

  const extraConfig = Constants.expoConfig?.extra as ExpoExtraConfig;

  const {
    apiKey,
    secretKey,
    baseEndpoint,
  } = extraConfig || {};
  
  // ⚠️ baseQuery must be async now due to async token
  export const baseQueryWithoutReauth = fetchBaseQuery({
    baseUrl: baseEndpoint, // expo uses EXPO_PUBLIC_
    prepareHeaders: async (headers) => {
      const token = await getAuthToken(); // ⬅️ Async
  
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
  
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("API_KEY", apiKey);
      headers.set("SECRET_KEY", secretKey);
  
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
        `${baseEndpoint}${process.env.EXPO_PUBLIC_REFRESH_TOKEN}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            "API_KEY": apiKey,
            "SECRET_KEY": secretKey,
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

      return false;
    }
  }
  