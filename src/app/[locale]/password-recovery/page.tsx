"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthResetPasswordError, postAuthResetPassword } from "@/api/POST_auth_reset_password";
import { AuthAlert, AuthButton, AuthInput, AuthLayout, FormCard } from "@/components/auth";

const recoverySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

type RecoverySchema = z.infer<typeof recoverySchema>;

interface PageProps {
  params: {
    locale: string;
  };
}

export default function PasswordRecoveryPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverySchema>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: RecoverySchema) => {
    try {
      setServerMessage(null);
      await postAuthResetPassword(values);
      setServerMessage({ type: "success", text: "We sent a reset link to your email." });
      setTimeout(() => {
        router.push(`/${locale}/password-recovery/sent`);
      }, 400);
    } catch (error) {
      if (error instanceof AuthResetPasswordError) {
        setServerMessage({ type: "error", text: error.message || "We couldn’t find an account with that email." });
        return;
      }

      setServerMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <AuthLayout>
      <FormCard title="Password recovery" subtitle="We’ll email you a link to reset your password.">
        <form className="flex flex-col gap-[20rem]" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthInput label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

          <AuthButton type="submit" loading={isSubmitting}>
            Reset password
          </AuthButton>

          <Link
            href={`/${locale}/login`}
            className="text-[14rem] font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Back to login
          </Link>

          <div aria-live="polite" className="min-h-[32rem]">
            <AnimatePresence>
              {serverMessage ? (
                <AuthAlert
                  key={serverMessage.text}
                  variant={serverMessage.type === "error" ? "error" : "success"}
                  description={serverMessage.text}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </form>
      </FormCard>
    </AuthLayout>
  );
}
