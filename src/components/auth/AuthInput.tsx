"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, id, error, description, className, containerClassName, type = "text", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    return (
      <div className={cn("flex flex-col gap-[6rem]", containerClassName)}>
        <label htmlFor={inputId} className="text-[13rem] font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(description ? descriptionId : undefined, error ? errorId : undefined)?.trim() || undefined}
          className={cn(
            "h-[46rem] rounded-[14rem] bg-gray-50 px-[16rem] text-[15rem] text-gray-800 outline-none ring-1 ring-inset ring-gray-200 transition placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:bg-gray-100",
            error && "ring-rose-400 focus-visible:ring-rose-400",
            className
          )}
          {...props}
        />
        {description ? (
          <p id={descriptionId} className="text-[13rem] text-gray-500">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-[13rem] font-medium text-rose-500">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
