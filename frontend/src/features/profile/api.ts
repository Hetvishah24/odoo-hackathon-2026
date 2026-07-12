import { apiClient } from "@/lib/api-client";
import type { MyProfileResponse, ProfileCompletionPayload } from "@/features/profile/types";

export const profileApi = {
  getMyProfile: async (): Promise<MyProfileResponse> => {
    const { data } = await apiClient.get<MyProfileResponse>("/users/me/profile");
    return data;
  },

  completeMyProfile: async (payload: ProfileCompletionPayload): Promise<MyProfileResponse> => {
    const { data } = await apiClient.post<MyProfileResponse>("/users/me/profile", payload);
    return data;
  },
};
