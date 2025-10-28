'use client';

import { useCallback, useEffect, useState } from 'react';

import { postUser } from '@/api/POST_user';
import { deleteProfile, ProfileUpdateRequest, ProfileUpdateResponse } from '@/api/profile';
import { ProfileEditFormValues } from './profileEditSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditFormSchema } from './profileEditSchema';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useProfile } from '@/hooks/useProfile';
import { regionSchema } from '@/types/types';
import { useMutation } from '@tanstack/react-query';
import { refreshProfile } from '@/stores/profileStore';
import { openConfirmationModal } from '@/stores/confirmationModalStore';
import { logout } from '@/lib/logout';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { useSubscription } from '@/hooks/useSubscription';

const DEFAULT_REGION = 'kz';

const resolveRegion = (region?: string | null): string => {
  const parsed = regionSchema.safeParse(region ?? undefined);
  if (parsed.success) {
    return parsed.data;
  }

  return DEFAULT_REGION;
};

interface UseProfileEditControllerOptions {
  onClose?: () => void;
}

export const useProfileEditController = ({ onClose }: UseProfileEditControllerOptions = {}) => {
  const router = useRouter();
  const { tActions } = useCustomTranslations();
  const { t: tProfileSettings } = useCustomTranslations('profileSettings.profileEditForm');
  const { profile, status, setProfile: setProfileInStore } = useProfile();
  const { hasActiveSubscription } = useSubscription();

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: {
      name: '',
      email: '',
      region: DEFAULT_REGION,
      oldPassword: '',
      newPassword: '',
    },
  });

  const resetForm = useCallback(
    (payload?: { name?: string | null; email?: string | null; region?: string | null }) => {
      form.reset({
        name: payload?.name ?? '',
        email: payload?.email ?? '',
        region: resolveRegion(payload?.region ?? undefined),
        oldPassword: '',
        newPassword: '',
      });
      setIsChangingPassword(false);
    },
    [form]
  );

  useEffect(() => {
    if (!profile || status === 'idle' || status === 'loading') {
      return;
    }

    resetForm({
      name: profile.name,
      email: profile.email,
      region: profile.region,
    });
  }, [profile, resetForm, status]);

  const closeAndNavigate = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const mutation = useMutation<ProfileUpdateResponse, Error, ProfileUpdateRequest>({
    mutationFn: postUser,
    onSuccess: async updatedUser => {
      setProfileInStore(updatedUser);
      let syncedProfile = updatedUser;

      try {
        const refreshed = await refreshProfile();
        if (refreshed) {
          syncedProfile = refreshed;
        }
      } catch (error) {
        console.error(error);
      }

      setProfileInStore(syncedProfile);
      resetForm({
        name: syncedProfile.name,
        email: syncedProfile.email,
        region: syncedProfile.region,
      });
      closeAndNavigate();
    },
  });

  const deleteAccountMutation = useMutation<void, Error>({
    mutationFn: deleteProfile,
    onSuccess: () => {
      logout();
      closeAndNavigate();
      nProgress.start();
      router.push('/');
    },
    onError: error => {
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<ProfileEditFormValues> = async values => {
    const payload: ProfileUpdateRequest = {
      name: values.name.trim(),
      region: values.region,
    };

    if (values.oldPassword && values.newPassword) {
      payload.oldPassword = values.oldPassword;
      payload.newPassword = values.newPassword;
    }

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error(error);
    }
  };

  const submitForm = form.handleSubmit(onSubmit);

  const handleDeleteAccount = useCallback(() => {
    openConfirmationModal({
      title: tProfileSettings('deleteAccount.title'),
      message: tProfileSettings('deleteAccount.description'),
      confirmText: tActions('deleteAccount'),
      cancelText: tActions('cancel'),
      variant: 'destructive',
      onConfirm: () => deleteAccountMutation.mutateAsync(),
    });
  }, [deleteAccountMutation, tActions, tProfileSettings]);

  const handleLogout = useCallback(() => {
    logout();
    closeAndNavigate();
    nProgress.start();
    router.push('/');
  }, [closeAndNavigate, router]);

  const isProfileLoading = status === 'idle' || status === 'loading';

  const formState = form.formState;

  return {
    profile,
    hasActiveSubscription,
    isProfileLoading,
    form,
    formState,
    isChangingPassword,
    setIsChangingPassword,
    onSubmit,
    submitForm,
    isSubmitting: mutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
    handleDeleteAccount,
    handleLogout,
  };
};
