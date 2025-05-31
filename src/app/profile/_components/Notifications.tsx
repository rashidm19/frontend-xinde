import React from 'react';

export const Notifications = () => {
  return (
    <section className='min-h-[342rem] rounded-[16rem] bg-white p-[24rem]'>
      <div className='mb-[24rem] flex justify-between'>
        <h3 className='text-[20rem] font-medium leading-tight'>Notifications</h3>
      </div>
      <div className='flex cursor-pointer flex-col gap-y-[8rem]'>
        <div className='group rounded-[8rem] bg-d-light-gray px-[24rem] py-[20rem]'>
          <div className='flex items-center gap-x-[8rem]'>
            <div className='size-[10rem] rounded-full bg-d-violet' />
            <h4 className='text-[14rem] font-semibold'>Welcome to Studybox!</h4>
          </div>
          <p className='line-clamp-2 font-poppins text-[14rem] group-hover:line-clamp-none'>
            Welcome to your AI-powered IELTS training platform! Get yourself prepared for your next exam.
          </p>
        </div>

        <div className='group rounded-[8rem] bg-d-light-gray px-[24rem] py-[20rem]'>
          <div className='flex items-center gap-x-[8rem]'>
            <div className='size-[10rem] rounded-full bg-d-violet' />
            <h4 className='text-[14rem] font-semibold'>-10% for the Premium plan</h4>
          </div>
          <p className='line-clamp-2 font-poppins text-[14rem] group-hover:line-clamp-none'>Sign up now and enjoy an exclusive discount for both Mock Exams & Practice</p>
        </div>
      </div>
    </section>
  );
};
