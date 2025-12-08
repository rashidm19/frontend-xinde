'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export const PrivacyFooter = () => {
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className='mt-[80rem] flex w-full flex-col items-center justify-between gap-[16rem] border-t border-black/5 py-[32rem] text-[13rem] text-d-black/60 tablet:flex-row tablet:px-[32rem] desktop:px-[40rem]'>
      <div>
        © {year} Studybox. All rights reserved.
      </div>
      <div className='flex gap-[24rem]'>
        <Link href={`/docs/terms.pdf`} target="_blank" className='hover:text-d-black'>
          Terms
        </Link>
        <Link href={`/${locale}/privacy`} className='hover:text-d-black'>
          Privacy
        </Link>
        <Link href='mailto:info@studybox.kz' className='hover:text-d-black'>
          Contact
        </Link>
      </div>
    </footer>
  );
};
