import { apiRequest } from "@/lib/api/client";
import { type UserProfile, userProfileSchema } from "../types/profile.type";

export async function getMyProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/profile", {
    method: "GET",
    includeStoreHeader: false,
    schema: userProfileSchema,
  });
}
