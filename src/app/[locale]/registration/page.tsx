"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { Globe2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as NProgress from "nprogress";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthRegisterError, postAuthRegister } from "@/api/POST_auth_register";
import { GoogleLoginError, postAuthLoginGoogle } from "@/api/POST_auth_login_google";
import { AuthAlert, AuthButton, AuthInput, AuthLayout, FormCard, OAuthButtons, PasswordInput } from "@/components/auth";
import { REGIONS, type RegionValue } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { resetProfile } from "@/stores/profileStore";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    region: z.enum(REGIONS.map(region => region.value) as [RegionValue, ...RegionValue[]], {
      errorMap: () => ({ message: "Select your region" }),
    }),
    agreement: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine(data => Boolean(data.region), {
    path: ["region"],
    message: "Select your region",
  });

type RegisterSchema = z.infer<typeof registerSchema>;

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

export default function RegistrationPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleProcessing, setGoogleProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      region: REGIONS[0]?.value ?? "kz",
      agreement: false,
    },
  });

  const selectedRegion = watch("region");
  const isAgreementChecked = watch("agreement");

  const resolveGoogleError = useMemo(() => {
    return (key: string | undefined) => {
      if (!key) return GOOGLE_ERROR_MESSAGES.default;
      return GOOGLE_ERROR_MESSAGES[key] ?? GOOGLE_ERROR_MESSAGES.default;
    };
  }, []);

  const navigateToProfile = () => {
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
      navigateToProfile();
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

  const onSubmit = async (values: RegisterSchema) => {
    try {
      setServerMessage(null);
      setGoogleError(null);
      await postAuthRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        region: values.region,
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("studybox.auth.email", values.email);
      }

      setServerMessage({ type: "success", text: "Account created. Please verify your email." });
      setTimeout(() => {
        router.push(`/${locale}/email-confirmation`);
      }, 400);
    } catch (error) {
      if (error instanceof AuthRegisterError) {
        if (error.code === "email_in_use") {
          setServerMessage({ type: "error", text: "This email is already registered." });
        } else {
          setServerMessage({ type: "error", text: error.message || "Registration failed. Try again." });
        }
        return;
      }

      setServerMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <AuthLayout>
      <FormCard title="Create your account" subtitle="Start your preparation with AI guidance.">
        <form className="flex flex-col gap-[20rem]" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-[16rem]">
            <AuthInput label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
            <AuthInput label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <PasswordInput label="Password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />

            <div className="flex flex-col gap-[8rem]">
              <label htmlFor="region" className="text-[14rem] font-medium text-gray-700">
                Region
              </label>
              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-[18rem] top-1/2 size-[18rem] -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <select
                  id="region"
                  {...register("region")}
                  value={selectedRegion}
                  onChange={event => setValue("region", event.target.value as RegionValue, { shouldValidate: true })}
                  className={cn(
                    "h-[52rem] w-full appearance-none rounded-[18rem] bg-gray-50 pl-[48rem] pr-[18rem] text-[16rem] text-gray-800 outline-none ring-1 ring-inset ring-gray-200 transition focus-visible:ring-2 focus-visible:ring-blue-400",
                    errors.region && "ring-rose-400 focus-visible:ring-rose-400"
                  )}
                  autoComplete="country"
                >
                  {REGIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value.toUpperCase()} — {option.label}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-[18rem] top-1/2 size-[12rem] -translate-y-1/2 text-gray-400" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 1L5 5 1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {errors.region ? <p className="text-[13rem] font-medium text-rose-500">{errors.region.message}</p> : null}
            </div>

            <label className="flex items-start gap-[12rem] text-[14rem] text-gray-600">
              <input
                type="checkbox"
                {...register("agreement")}
                checked={isAgreementChecked}
                onChange={event => setValue("agreement", event.target.checked, { shouldValidate: true })}
                className="mt-[4rem] size-[18rem] rounded-[4rem] border border-slate-300 accent-blue-600"
              />
              <span>I agree to the StudyBox Terms and Privacy Policy.</span>
            </label>
            {errors.agreement ? <p className="text-[13rem] font-medium text-rose-500">{errors.agreement.message}</p> : null}
          </div>

          <AuthButton type="submit" loading={isSubmitting}>
            Create account
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

          <div className="flex flex-col gap-[12rem] text-[14rem] text-slate-600">
            <Link
              href={`/${locale}/login`}
              className="text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Already have an account? Log in
            </Link>
          </div>

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
