'use client';

import axios from 'axios';
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProfile as fetchProfileApi } from '@/api/profile';
import type { User } from '@/types/types';

type ProfileStatus = 'idle' | 'loading' | 'success' | 'error';

const PROFILE_QUERY_KEY = ['me'] as const;

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data, status, fetchStatus, error } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfileApi,
  });

  const profile: User | null = data ?? null;

  let errorMessage: string | null = null;

  if (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      errorMessage = 'unauthorized';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Unknown error';
    }
  }

  const derivedStatus: ProfileStatus = (() => {
    if (status === 'success') {
      return 'success';
    }

    if (status === 'error') {
      return 'error';
    }

    if (fetchStatus === 'fetching') {
      return 'loading';
    }

    return 'idle';
  })();

  const setProfile = useCallback(
    (nextProfile: User) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, nextProfile);
    },
    [queryClient]
  );

  const fetchProfile = useCallback(async () => {
    const result = await queryClient.fetchQuery({
      queryKey: PROFILE_QUERY_KEY,
      queryFn: fetchProfileApi,
    });

    return result;
  }, [queryClient]);

  return { profile, status: derivedStatus, error: errorMessage, fetchProfile, setProfile };
};
