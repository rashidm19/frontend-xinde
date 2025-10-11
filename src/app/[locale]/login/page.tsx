"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as NProgress from "nprogress";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthLoginError, postAuthLogin } from "@/api/POST_auth_login";
import { GoogleLoginError, postAuthLoginGoogle } from "@/api/POST_auth_login_google";
import { AuthAlert, AuthButton, AuthInput, AuthLayout, FormCard, OAuthButtons, PasswordInput } from "@/components/auth";
import { resetProfile } from "@/stores/profileStore";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface PageProps {
  params: {
    locale: string;
  };
}

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  invalid_audience: "Google sign-in isn’t configured correctly. Please try another method.",
  google_payload_incomplete: "Google didn’t return the expected data. Please try again.",
  invalid_token: "Your Google session expired. Try signing in again.",
  email_not_verified: "Verify your Google email before continuing.",
  USER_ALREADY_LINKED: "This Google account is already connected to another profile.",
  google_service_unavailable: "Google is temporarily unavailable. Please try again later.",
  google_prompt_blocked: "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
  default: "We couldn’t complete Google sign-in. Please try again or use email and password.",
};

export default function LoginPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleProcessing, setGoogleProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resolveGoogleError = useMemo(() => {
    return (key: string | undefined) => {
      if (!key) return GOOGLE_ERROR_MESSAGES.default;
      return GOOGLE_ERROR_MESSAGES[key] ?? GOOGLE_ERROR_MESSAGES.default;
    };
  }, []);

  const navigateAfterAuth = () => {
    NProgress.start();
    router.push(`/${locale}/profile`);
  };

  const handleGoogleCredential = async (credential: string) => {
    setGoogleProcessing(true);
    setGoogleError(null);
    setServerMessage(null);

    try {
      const result = await postAuthLoginGoogle({ token: credential });
      localStorage.setItem("token", result.token);
      resetProfile();
      navigateAfterAuth();
    } catch (error) {
      if (error instanceof GoogleLoginError) {
        setGoogleError(resolveGoogleError(error.code));
      } else {
        setGoogleError(GOOGLE_ERROR_MESSAGES.default);
      }
    } finally {
      setGoogleProcessing(false);
    }
  };

  const handleGoogleInitError = (errorKey: string) => {
    setGoogleError(resolveGoogleError(errorKey));
  };

  const onSubmit = async (values: LoginSchema) => {
    setServerMessage(null);
    setGoogleError(null);

    try {
      const result = await postAuthLogin(values);
      localStorage.setItem("token", result.token);
      resetProfile();
      navigateAfterAuth();
    } catch (error) {
      if (error instanceof AuthLoginError) {
        if (error.code === "account_locked") {
          setServerMessage({ type: "error", text: "Your account is temporarily locked. Please try again later." });
          return;
        }

        if (error.status === 404) {
          setError("email", { message: "We couldn’t find an account with that email." });
          return;
        }

        if (error.status === 401) {
          setError("password", { message: "Incorrect password. Try again or reset it." });
          return;
        }
      }

      setServerMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <AuthLayout>
      <FormCard title="Log into your account" subtitle="Log in to continue your IELTS journey.">
        <form className="flex flex-col gap-[20rem]" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-[16rem]">
            <AuthInput label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <PasswordInput label="Password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
            <div className="flex items-center justify-between text-[14rem] font-medium text-blue-600">
              <Link
                href={`/${locale}/password-recovery`}
                className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Forgot password?
              </Link>
              <Link
                href={`/${locale}/registration`}
                className="text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Create account
              </Link>
            </div>
          </div>

          <AuthButton type="submit" loading={isSubmitting}>
            Log in
          </AuthButton>

          <div className="relative flex items-center">
            <span className="h-[1rem] flex-1 bg-slate-200" />
            <span className="px-[12rem] text-[13rem] text-slate-400">or continue with</span>
            <span className="h-[1rem] flex-1 bg-slate-200" />
          </div>

          <OAuthButtons
            onGoogleCredential={handleGoogleCredential}
            onGoogleError={handleGoogleInitError}
            disabled={isSubmitting || googleProcessing}
            processing={googleProcessing}
          />

          <div aria-live="polite" className="flex flex-col gap-[12rem]">
            <AnimatePresence>
              {serverMessage ? (
                <AuthAlert
                  key={serverMessage.text}
                  variant={serverMessage.type === "error" ? "error" : "success"}
                  description={serverMessage.text}
                />
              ) : null}
            </AnimatePresence>
            <AnimatePresence>
              {googleError ? <AuthAlert key={googleError} variant="error" description={googleError} /> : null}
            </AnimatePresence>
          </div>
        </form>
      </FormCard>
    </AuthLayout>
  );
}
