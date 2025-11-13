import axios from 'axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchProfile as fetchProfileApi } from '@/api/profile';
import { User } from '@/types/types';

type ProfileStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProfileStore {
  profile: User | null;
  status: ProfileStatus;
  error: string | null;
  fetchProfile: (force?: boolean) => Promise<User | null>;
  setProfile: (profile: User) => void;
  reset: () => void;
}

const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const useProfileStore = create<ProfileStore>()(
  devtools(
    (set, get) => ({
      profile: null,
      status: 'idle',
      error: null,
      fetchProfile: async (force = false) => {
        const { status } = get();

        if (!force && (status === 'loading' || status === 'success')) {
          return get().profile;
        }

        set({ status: 'loading', error: null });

        try {
          const profile = await fetchProfileApi();
          set({ profile, status: 'success', error: null });
          return profile;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            if (statusCode === 401) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
              }
              set({ profile: null, status: 'error', error: 'unauthorized' });
              return null;
            }
          }

          set({ error: parseErrorMessage(error), status: 'error' });

          throw error;
        }
      },
      setProfile: profile => {
        set({ profile, status: 'success', error: null });
      },
      reset: () => set({ profile: null, status: 'idle', error: null }),
    }),
    {
      name: 'profile-store',
      anonymousActionType: 'PROFILE_STORE',
    }
  )
);

export const fetchProfileOnce = () => useProfileStore.getState().fetchProfile();

export const refreshProfile = () => useProfileStore.getState().fetchProfile(true);

export const setProfile = (profile: User) => useProfileStore.getState().setProfile(profile);

export const resetProfile = () => useProfileStore.getState().reset();
