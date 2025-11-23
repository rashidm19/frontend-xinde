'use client';

import Link, { type LinkProps } from 'next/link';
import { ReactNode, type MouseEventHandler } from 'react';

import { HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

type MotionAnchorProps = Omit<HTMLMotionProps<'a'>, 'href'>;

export interface AuthLinkButtonProps extends LinkProps, MotionAnchorProps {
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function AuthLinkButton({
  loading,
  disabled,
  children,
  className,
  href,
  as,
  replace,
  scroll,
  shallow,
  passHref,
  prefetch,
  locale,
  ...rest
}: AuthLinkButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = Boolean(disabled || loading);

  const { onClick, tabIndex, ...anchorProps } = rest;

  const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Link
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
      locale={locale}
      passHref={passHref ?? true}
      legacyBehavior
    >
      <motion.a
        whileHover={prefersReducedMotion || isDisabled ? undefined : { scale: 1.02, boxShadow: '0 18px 48px -26px rgba(30,64,175,0.45)' }}
        whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'relative flex h-[48rem] w-full items-center justify-center gap-[10rem] rounded-[18rem] bg-blue-600 text-[15rem] font-semibold text-white shadow-[0_18rem_50rem_-32rem_rgba(36,74,180,0.55)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 aria-disabled:cursor-not-allowed aria-disabled:bg-blue-400',
          className
        )}
        aria-busy={loading ? true : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : tabIndex}
        onClick={handleClick}
        {...anchorProps}
      >
        <span className={cn('flex items-center gap-[10rem]', loading && 'opacity-0')}>{children}</span>
        {loading ? (
          <span className='absolute inset-0 flex items-center justify-center' aria-hidden='true'>
            <span className='size-[20rem] animate-spin rounded-full border-[3rem] border-white/40 border-t-white' />
          </span>
        ) : null}
      </motion.a>
    </Link>
  );
}
