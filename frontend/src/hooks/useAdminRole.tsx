import { ProfileData } from "@/components/ProfileDialog";
import { getProfileData } from "@/lib/auth";
import * as React from "react";



const useIsSuperAdmin = () => {
  const user = getProfileData<ProfileData>();
  return user?.roleName === "Super Admin" || user?.roleName === "Division Super Admin" || user?.roleName === "District Super Admin";
};

export default useIsSuperAdmin;