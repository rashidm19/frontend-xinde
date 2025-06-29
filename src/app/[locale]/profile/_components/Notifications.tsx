import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const Notifications = () => {
  const { t } = useCustomTranslations('profile.notifications');

  return (
    <section className='min-h-[342rem] rounded-[16rem] bg-white p-[24rem]'>
      <div className='mb-[24rem] flex justify-between'>
        <h3 className='text-[20rem] font-medium leading-tight'>{t('title')}</h3>
      </div>
      <div className='flex cursor-pointer flex-col gap-y-[8rem]'>
        <div className='group rounded-[8rem] bg-d-light-gray px-[24rem] py-[20rem]'>
          <div className='flex items-center gap-x-[8rem]'>
            <div className='size-[10rem] rounded-full bg-d-violet' />
            <h4 className='text-[14rem] font-semibold'>{t('welcome')}</h4>
          </div>
          <p className='line-clamp-2 font-poppins text-[14rem] group-hover:line-clamp-none'>
            {t('description')}
          </p>
        </div>

        <div className='group rounded-[8rem] bg-d-light-gray px-[24rem] py-[20rem]'>
          <div className='flex items-center gap-x-[8rem]'>
            <div className='size-[10rem] rounded-full bg-d-violet' />
            <h4 className='text-[14rem] font-semibold'>{t('sell')}</h4>
          </div>
          <p className='line-clamp-2 font-poppins text-[14rem] group-hover:line-clamp-none'>{t('signupAction')}</p>
        </div>
      </div>
    </section>
  );
};
