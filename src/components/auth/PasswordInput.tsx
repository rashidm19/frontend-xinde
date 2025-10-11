"use client";

import { forwardRef, useId, useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AuthInputProps } from "./AuthInput";

export const PasswordInput = forwardRef<HTMLInputElement, AuthInputProps>((props, ref) => {
  const { label, id, error, description, className, containerClassName, ...rest } = props;
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("flex flex-col gap-[8rem]", containerClassName)}>
      <label htmlFor={inputId} className="text-[14rem] font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(description ? descriptionId : undefined, error ? errorId : undefined)?.trim() || undefined}
          className={cn(
            "h-[52rem] w-full rounded-[18rem] bg-gray-50 px-[18rem] pr-[54rem] text-[16rem] text-gray-800 outline-none ring-1 ring-inset ring-gray-200 transition placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:bg-gray-100",
            error && "ring-rose-400 focus-visible:ring-rose-400",
            className
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible(prev => !prev)}
          className="absolute inset-y-0 right-[14rem] flex items-center text-gray-500 transition hover:text-gray-700 focus-visible:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-[20rem]" aria-hidden="true" /> : <Eye className="size-[20rem]" aria-hidden="true" />}
        </button>
      </div>
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
});

PasswordInput.displayName = "PasswordInput";
