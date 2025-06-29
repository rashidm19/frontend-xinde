import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface Props {
  className?: string;
}

export const Footer = ({ className }: Props) => {
  const { tCommon } = useCustomTranslations();

  return <footer className={cn('absolute bottom-[24rem] w-full text-center text-[12rem]', className)}>{tCommon('allRightsReserved')}</footer>;
};
