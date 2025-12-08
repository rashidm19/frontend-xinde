'use client';

import { ArrowLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/auth/Logo';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const PrivacyHeader = () => {
  const { scrollY } = useScroll();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { t } = useCustomTranslations('privacyPolicy');
  const { tImgAlts } = useCustomTranslations('header');

  const headerOpacity = useTransform(scrollY, [0, 50], [0.9, 0.98]);
  const headerShadow = useTransform(scrollY, [0, 50], ['none', '0 10rem 30rem rgba(0,0,0,0.05)']);
  const headerBorder = useTransform(scrollY, [0, 50], ['rgba(255,255,255,0)', 'rgba(0,0,0,0.05)']);

  const switchLocale = (newLocale: string) => {
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  const backHref = returnUrl || `/${locale}`;

  return (
    <motion.header
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        opacity: headerOpacity,
        boxShadow: headerShadow,
        borderBottom: '1px solid',
        borderColor: headerBorder,
      }}
      className={cn(
        'sticky top-0 z-40 flex h-[60rem] w-full items-center justify-between px-[16rem] backdrop-blur-md transition-all tablet:h-[72rem] tablet:px-[32rem]'
      )}
    >
      <div className='flex flex-1 items-center gap-[12rem]'>
        <Link
          href={backHref}
          className='flex items-center gap-[8rem] rounded-[12rem] p-[8rem] text-d-black transition-colors hover:bg-black/5'
          aria-label={tImgAlts('back')}
        >
          <ArrowLeft className='size-[20rem]' />
        </Link>
      </div>

      <div className='flex flex-1 justify-center'>
        <span className='font-poppins text-[16rem] font-semibold text-d-black tablet:text-[18rem] desktop:block hidden'>{t('title')}</span>
      </div>

      <div className='flex flex-1 items-center justify-end gap-[12rem]'>
        <div className='flex items-center rounded-full bg-gray-100 p-[4rem]'>
          {['en', 'ru'].map((lang) => (
            <button
              key={lang}
              onClick={() => switchLocale(lang)}
              className={cn(
                'rounded-full px-[12rem] py-[4rem] text-[12rem] font-semibold uppercase transition-all',
                locale === lang ? 'bg-white text-d-black shadow-sm' : 'text-gray-500 hover:text-d-black'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className='hidden tablet:block'>
          <Logo className='h-[24rem] w-auto tablet:h-[28rem]' />
        </div>
      </div>
    </motion.header>
  );
};
