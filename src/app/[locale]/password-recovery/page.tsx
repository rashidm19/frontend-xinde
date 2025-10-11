"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

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

  const formVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <AuthLayout>
      <FormCard title="Let’s help you back in" subtitle="Pop in your email and we’ll send a gentle nudge to reset your password.">
        <motion.form
          className="flex flex-col gap-[18rem]"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          variants={prefersReducedMotion ? undefined : formVariants}
        >
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <AuthInput label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <AuthButton type="submit" loading={isSubmitting}>
              Send reset link
            </AuthButton>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Link
              href={`/${locale}/login`}
              className="text-[13rem] font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Back to login
            </Link>
          </motion.div>

          {(serverMessage?.type === "error" || serverMessage?.type === "success") && (
            <motion.div variants={prefersReducedMotion ? undefined : itemVariants} aria-live="polite" className="min-h-[32rem]">
              <AnimatePresence>
                {serverMessage ? (
                  <AuthAlert
                    key={serverMessage.text}
                    variant={serverMessage.type === "error" ? "error" : "success"}
                    description={serverMessage.text}
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.form>
      </FormCard>
    </AuthLayout>
  );
}
