import { useEffect } from 'react';

import { useProfileStore } from '@/stores/profileStore';

export const useProfile = () => {
  const profile = useProfileStore(state => state.profile);
  const status = useProfileStore(state => state.status);
  const error = useProfileStore(state => state.error);
  const fetchProfile = useProfileStore(state => state.fetchProfile);
  const setProfile = useProfileStore(state => state.setProfile);

  useEffect(() => {
    console.log(status);
    if (status === 'idle') {
      fetchProfile().catch(() => {
        // errors are stored in state; consumers can react to the status change
      });
    }
  }, [fetchProfile, status]);

  return { profile, status, error, fetchProfile, setProfile };
};
