"use client";

import { GoogleLoginButton } from "./GoogleLoginButton";

interface OAuthButtonsProps {
  onGoogleCredential?: (credential: string) => void;
  onGoogleError?: (errorKey: string) => void;
  disabled?: boolean;
  processing?: boolean;
}

export function OAuthButtons({ onGoogleCredential, onGoogleError, disabled, processing }: OAuthButtonsProps) {
  return (
    <GoogleLoginButton
      label="Continue with Google"
      onCredential={credential => onGoogleCredential?.(credential)}
      onError={onGoogleError}
      disabled={disabled}
      loading={processing}
      className="inline-flex w-full items-center justify-center gap-[12rem] rounded-[18rem] border border-gray-200 bg-white px-[16rem] py-[14rem] text-[16rem] font-medium text-gray-800 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}
