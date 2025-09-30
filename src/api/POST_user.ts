import axiosInstance from '@/lib/axiosInstance';

import {
  profileUpdatePayloadSchema,
  profileUpdateRequestSchema,
  profileUpdateResponseSchema,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
} from './profile';

export async function postUser(input: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
  const parsedInput = profileUpdateRequestSchema.parse(input);

  const payload = profileUpdatePayloadSchema.parse({
    ...(parsedInput.grade !== undefined ? { grade: parsedInput.grade.toString() } : {}),
    ...(parsedInput.name !== undefined ? { name: parsedInput.name } : {}),
    ...(parsedInput.region ? { region: parsedInput.region } : {}),
    ...(parsedInput.oldPassword && parsedInput.newPassword
      ? { old_password: parsedInput.oldPassword, new_password: parsedInput.newPassword }
      : {}),
  });

  const response = await axiosInstance.post('/auth/profile', payload, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    throw new Error(`POST /auth/profile failed: ${response.status} ${text}`);
  }

  return profileUpdateResponseSchema.parse(response.data);
}
