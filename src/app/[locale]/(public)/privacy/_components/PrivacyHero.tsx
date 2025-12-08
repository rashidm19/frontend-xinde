'use client';

import { motion } from 'framer-motion';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const PrivacyHero = () => {
  const { t } = useCustomTranslations('privacyPolicy');
  const texts = t.raw('texts.intro') as string[];

  return (
    <div className='flex w-full flex-col items-center px-[20rem] pt-[40rem] text-center tablet:pt-[60rem] desktop:pt-[80rem]'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='flex max-w-[720rem] flex-col items-center'
      >
        <span className='mb-[16rem] rounded-full bg-d-green-secondary px-[12rem] py-[6rem] text-[12rem] font-medium text-d-black/60'>
          Last updated: January 2025
        </span>
        {texts && texts.length > 0 && (
           <div className='flex flex-col gap-[12rem] text-[16rem] leading-relaxed text-d-black/70 tablet:text-[18rem]'>
            {texts.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
