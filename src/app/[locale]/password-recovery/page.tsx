"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { AuthResetPasswordError, postAuthResetPassword } from "@/api/POST_auth_reset_password";
import { AuthAlert, AuthButton, AuthInput, AuthLayout, CaptchaGate, FormCard } from "@/components/auth";
import { useCaptcha, type CaptchaExecutionResult } from "@/hooks/useCaptcha";

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
  const [captchaMessage, setCaptchaMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const captcha = useCaptcha({ action: "auth_password_recovery", locale });
  const tCaptcha = useTranslations("auth.captcha");

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
    setServerMessage(null);
    setCaptchaMessage(null);

    let captchaResult: CaptchaExecutionResult | null = null;

    if (captcha.enabled) {
      try {
        captchaResult = await captcha.execute({ action: "auth_password_recovery" });
      } catch (error) {
        setCaptchaMessage(tCaptcha("errors.unavailable"));
        captcha.requireChallenge("network");
        return;
      }

      if (!captchaResult || !captcha.provider) {
        setCaptchaMessage(tCaptcha("errors.unavailable"));
        captcha.requireChallenge("manual");
        return;
      }
    }

    try {
      await postAuthResetPassword({
        ...values,
        ...(captcha.enabled && captchaResult && captcha.provider
          ? {
              captchaToken: captchaResult.token,
              captchaProvider: captcha.provider,
              captchaMode: captchaResult.mode,
            }
          : {}),
      });
      setServerMessage({ type: "success", text: "We sent a reset link to your email." });
      captcha.handleBackendResult(true);
      setTimeout(() => {
        router.push(`/${locale}/password-recovery/sent`);
      }, 400);
    } catch (error) {
      if (error instanceof AuthResetPasswordError) {
        if (error.code === "captcha_low_score") {
          captcha.handleBackendResult(false, "low_score");
          setCaptchaMessage(tCaptcha("server.lowScore"));
          return;
        }

        if (error.code === "captcha_unavailable") {
          captcha.handleBackendResult(false, "network");
          captcha.requireChallenge("network");
          setCaptchaMessage(tCaptcha("errors.unavailable"));
          return;
        }

        if (error.code === "captcha_required" || error.code === "captcha_failed" || error.code === "captcha_timeout") {
          captcha.handleBackendResult(false, "backend");
          setCaptchaMessage(tCaptcha("server.challenge"));
          return;
        }

        if (error.code && error.code.startsWith("captcha")) {
          captcha.handleBackendResult(false, "backend");
          setCaptchaMessage(tCaptcha("server.challenge"));
          return;
        }

        setServerMessage({ type: "error", text: error.message || "We couldn’t find an account with that email." });
        captcha.handleBackendResult(false);
        return;
      }

      captcha.handleBackendResult(false);
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
            <CaptchaGate controller={captcha} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Link
              href={`/${locale}/login`}
              className="text-[13rem] font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Back to login
            </Link>
          </motion.div>

          {(serverMessage?.type === "error" || serverMessage?.type === "success" || !!captchaMessage) && (
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
              <AnimatePresence>
                {captchaMessage ? <AuthAlert key={captchaMessage} variant="error" description={captchaMessage} /> : null}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.form>
      </FormCard>
    </AuthLayout>
  );
}
