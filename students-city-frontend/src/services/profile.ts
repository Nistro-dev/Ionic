import api from './auth';

export interface ProfileData {
  pseudo: string;
  email: string;
  id?: number;
  roles?: string[];
}

export interface UpdateProfileData {
  pseudo: string;
  email: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileData> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<ProfileData> => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};
