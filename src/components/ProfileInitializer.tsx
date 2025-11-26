'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchProfile } from '@/api/profile';
import { ME_QUERY_KEY } from '@/lib/queryKeys';
import { useProfileStore } from '@/stores/profileStore';

type ProfileStatus = 'idle' | 'loading' | 'success' | 'error';

type ReactQueryStatus = 'pending' | 'error' | 'success';
type ReactQueryFetchStatus = 'idle' | 'fetching' | 'paused';

const deriveStatus = (status: ReactQueryStatus, fetchStatus: ReactQueryFetchStatus): ProfileStatus => {
  if (status === 'success') {
    return 'success';
  }

  if (status === 'error') {
    return 'error';
  }

  if (fetchStatus === 'fetching' || fetchStatus === 'paused') {
    return 'loading';
  }

  return 'idle';
};

const deriveErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'unauthorized';
    }

    return error.message ?? 'Request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const ProfileInitializer = () => {
  const profileQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchProfile,
    staleTime: 300_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const nextStatus = deriveStatus(profileQuery.status, profileQuery.fetchStatus);

    useProfileStore.setState({
      profile: profileQuery.data ?? null,
      status: nextStatus,
      error: nextStatus === 'error' ? deriveErrorMessage(profileQuery.error) : null,
    });
  }, [profileQuery.data, profileQuery.status, profileQuery.fetchStatus, profileQuery.error]);

  return null;
};
