import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const transformStringToArrayV2 = (input: string) => {
  return input.split(/(___)/).filter(Boolean);
};

export const transformStringToArrayV3 = (input: string) => {
  // Split by whitespace and filter out empty strings
  return input.split(/\s+/).filter(Boolean);
};
export const transformStringToArrayV4 = (input: string) => {
  // Split string into parts preserving linebreaks and input fields
  let inputCount = 0;
  let breakCount = 0;
  let stringCount = 0;

  return input
    .split(/(\n|___|[^\n___]+)/)
    .filter(Boolean)
    .map(part => {
      if (part === '___') {
        return { type: 'input', value: part, index: inputCount++ };
      } else if (part === '\n') {
        return { type: 'break', value: part, index: breakCount++ };
      } else {
        return { type: 'string', value: part, index: stringCount++ };
      }
    });
};

export function calculateIeltsOverall(listening: number = 0, reading: number = 0, writing: number = 0, speaking: number = 0): number {
  const scores = [listening, reading, writing, speaking];

  scores.forEach(s => {
    if (s < 0 || s > 9 || s % 0.5 !== 0) {
      return 0;
    }
  });

  const rawAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const rounded = Math.round(rawAvg * 2) / 2;

  return parseFloat(rounded.toFixed(1));
}
