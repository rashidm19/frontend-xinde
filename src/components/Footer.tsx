import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export const Footer = ({ className }: Props) => {
  return <footer className={cn('absolute bottom-[24rem] w-full text-center text-[12rem]', className)}>© All rights reserved</footer>;
};
