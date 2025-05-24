import { IRootState } from "@/store/api"
import { router } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux"

export const useRoleGuard = (allowedRoles: string[]) => {
  const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
  const role = useSelector((state: IRootState) => state.auth.role);

  useEffect(() => {
      // Handle redirection for unauthenticated users
      if (!isAuthenticated) {
          router.replace('/unauthorized');
          return;  // Stop further processing if not authenticated
      }

      // Handle redirection for users with unauthorized roles
      if (role && allowedRoles.length && !allowedRoles.includes(role)) {
          router.replace('/unauthorized');  // Redirect to unauthorized page
      }
  }, [isAuthenticated, role, allowedRoles]);
};
