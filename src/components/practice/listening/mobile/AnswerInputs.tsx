"use client";

import * as React from "react";

import { CheckboxSquare } from "@/components/ui/checkboxSquare";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface RadioOptionRowProps {
  id: string;
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
}

export const RadioOptionRow: React.FC<RadioOptionRowProps> = ({ id, value, label, description, selected, disabled, onFocus }) => {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex w-full items-center gap-[14rem] rounded-[14rem] border border-transparent bg-white px-[16rem] py-[14rem] text-[15rem] font-medium text-d-black shadow-[0_8rem_24rem_rgba(56,56,56,0.08)] transition",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-d-light-gray/60",
        selected ? "border-d-green/70 bg-d-light-gray" : undefined,
      )}
    >
      <RadioGroupItem id={id} value={value} disabled={disabled} onFocus={onFocus} className="shrink-0" />

      <div className="flex flex-1 flex-col gap-[4rem]">
        <span>{label}</span>
        {description ? <span className="text-[13rem] font-normal text-d-black/70">{description}</span> : null}
      </div>
    </Label>
  );
};

export interface CheckboxOptionRowProps {
  id: string;
  label: React.ReactNode;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean, value: string) => void;
  onFocus?: () => void;
}

export const CheckboxOptionRow: React.FC<CheckboxOptionRowProps> = ({ id, label, value, checked, disabled, onChange, onFocus }) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex w-full items-center gap-[14rem] rounded-[14rem] border border-transparent bg-white px-[16rem] py-[14rem] text-[15rem] font-medium text-d-black shadow-[0_8rem_24rem_rgba(56,56,56,0.08)] transition",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-d-light-gray/60",
        checked ? "border-d-green/70 bg-d-light-gray" : undefined,
      )}
    >
      <CheckboxSquare
        id={id}
        checked={checked}
        value={value}
        disabled={disabled}
        onCheckedChange={state => onChange(Boolean(state), value)}
        className="shrink-0"
        onFocus={onFocus}
      />
      <span className="flex-1">{label}</span>
    </label>
  );
};

export interface TextAnswerInputProps extends React.ComponentProps<typeof Input> {}

export const TextAnswerInput: React.FC<TextAnswerInputProps> = ({ className, ...props }) => {
  return (
    <Input
      {...props}
      className={cn(
        "h-[34rem] rounded-[10rem] border-[1.5rem] border-d-black/60 bg-white px-[14rem] text-center text-[15rem] font-medium text-d-black",
        "placeholder:text-d-black/50 focus:border-d-black focus:bg-d-light-gray",
        className,
      )}
    />
  );
};
