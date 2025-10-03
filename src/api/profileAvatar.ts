'use client';

import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';

const avatarResponseSchema = z.object({
  avatar: z.union([z.string().min(1), z.null()]).optional(),
});

type AvatarResponse = z.infer<typeof avatarResponseSchema>;

const parseAvatarResponse = (data: unknown): string | null => {
  const parsed: AvatarResponse = avatarResponseSchema.parse(data);
  return parsed.avatar ?? null;
};

const buildAvatarFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append('avatar', file);
  return formData;
};

export const getProfileAvatar = async (): Promise<string | null> => {
  const response = await axiosInstance.get('/auth/profile/avatar');
  return parseAvatarResponse(response.data);
};

export const uploadProfileAvatar = async (file: File): Promise<string | null> => {
  const response = await axiosInstance.post('/auth/profile/avatar', buildAvatarFormData(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return parseAvatarResponse(response.data);
};

export const updateProfileAvatar = async (file: File): Promise<string | null> => {
  const response = await axiosInstance.post('/auth/profile/avatar/update', buildAvatarFormData(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return parseAvatarResponse(response.data);
};

export const deleteProfileAvatar = async (): Promise<void> => {
  await axiosInstance.delete('/auth/profile/avatar');
};
