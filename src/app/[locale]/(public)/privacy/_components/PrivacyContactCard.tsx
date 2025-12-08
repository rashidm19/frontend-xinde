'use client';

import Link from 'next/link';

export const PrivacyContactCard = () => {
  return (
    <div className='mt-[40rem] rounded-2xl border border-gray-100 bg-white/40 p-[24rem] backdrop-blur-sm tablet:p-[32rem]'>
      <h2 className='mb-[16rem] font-poppins text-[20rem] font-semibold text-d-black tablet:text-[24rem]'>
        Contact Us
      </h2>
      <p className='text-[16rem] leading-relaxed text-d-black/80'>
        If you have any questions about this Privacy Policy, please contact us at{' '}
        <Link href='mailto:info@studybox.kz' className='font-medium text-d-blue hover:underline'>
          info@studybox.kz
        </Link>
        .
      </p>
    </div>
  );
};
