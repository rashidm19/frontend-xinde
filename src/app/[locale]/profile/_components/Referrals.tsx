import { useState } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const Referrals = () => {
  const { t, tImgAlts, tActions, tMessages } = useCustomTranslations('profile.referrals');

  const [status, setStatus] = useState('default');

  return (
    <section className='rounded-[16rem] bg-white p-[24rem]'>
      <h3 className='mb-[24rem] text-[20rem] font-medium leading-tight'>{t('title')}</h3>
      <p className='mb-[32rem] text-[14rem] leading-tight'>{t('invite')}</p>
      <button
        type='button'
        className='group flex h-[54rem] w-full items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-light-gray hover:bg-d-green/40'
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
      >
        {status === 'copied' ? (
          <>
            <span className='text-[14rem] font-semibold'>{tMessages('linkCopied')}</span>
          </>
        ) : (
          <>
            <img src='/images/icon_copy.svg' className={`size-[14rem] duration-100 group-hover:scale-[1.2]`} alt={tImgAlts('copy')} />
            <span className='text-[14rem] font-semibold'>{tActions('copyInviteLink')}</span>
          </>
        )}
        <input type='text' className='hidden' value='https://studybox.me/registration?ref=1542345' id='ref-link' />
      </button>
    </section>
  );
};
