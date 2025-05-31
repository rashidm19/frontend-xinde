import { useState } from 'react';

export const Referals = () => {
  const [status, setStatus] = useState('default');

  return (
    <section className='rounded-[16rem] bg-white p-[24rem]'>
      <h3 className='mb-[24rem] text-[20rem] font-medium leading-tight'>Build your dream-team</h3>
      <p className='mb-[32rem] text-[14rem] leading-tight'>Invite your friends to join the journey and experience the power of AI-driven IELTS preparation together!</p>
      <button
        onClick={async () => {
          setStatus('copied');
          setTimeout(() => {
            setStatus('default');
          }, 3000);
          var copyText = document.getElementById('ref-link') as HTMLInputElement;
          copyText.select();
          copyText.setSelectionRange(0, 99999);
          navigator.clipboard.writeText(copyText.value);
        }}
        type='button'
        className='group flex h-[54rem] w-full items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-light-gray hover:bg-d-green/40'
      >
        {status === 'copied' ? (
          <>
            <span className='text-[14rem] font-semibold'>Link copied</span>
          </>
        ) : (
          <>
            <img src='/images/icon_copy.svg' className={`size-[14rem] duration-100 group-hover:scale-[1.2]`} alt='copy' />
            <span className='text-[14rem] font-semibold'>Copy invite link</span>
          </>
        )}
        <input type='text' className='hidden' value='https://studybox.me/registration?ref=1542345' id='ref-link' />
      </button>
    </section>
  );
};
