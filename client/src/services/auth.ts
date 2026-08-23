import { api } from "@/utils/api";
import type { AuthUser } from "@/types";

export interface ProfileStats {
  datasetsCount: number;
  totalRowsManaged: number;
  savedInsightsCount: number;
  reportsCount: number;
}

export interface ProfileResponse {
  user: AuthUser;
  stats: ProfileStats;
}

export async function fetchProfileStats(): Promise<ProfileResponse> {
  const response = await api.get<ProfileResponse>("/api/auth/profile/stats");
  return response.data;
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.put<{ success: boolean; message: string }>("/api/auth/profile/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}
