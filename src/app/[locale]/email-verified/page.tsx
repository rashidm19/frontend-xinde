import Link from 'next/link';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function EmailVerified() {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('emailVerified');

  return (
    <main>
      <section className='relative flex min-h-[1024rem] items-center'>
        <img className='absolute left-0 top-[114rem] h-auto w-[951rem]' src='/images/illustration_flower2.png' alt={tImgAlts('flower')} />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <div className='flex w-[846rem] flex-col gap-y-[64rem] rounded-[24rem] bg-white p-[80rem] shadow-card'>
            <div className='flex items-center justify-center'>
              <figure className='flex items-center gap-x-[6rem]'>
                <img src='/images/logo.svg' className='size-[35rem]' alt={tImgAlts('logo')} />
                <div className='font-poppins text-[20rem] font-semibold'>{tCommon('studybox')}</div>
              </figure>
              {/* <div className='text-[20rem] leading-none text-d-black/60'>madinanurgalieva@gmail.com</div> */}
            </div>
            <div className='flex flex-col gap-y-[32rem]'>
              <h1 className='text-center font-poppins text-[56rem] font-semibold leading-none tracking-[-2rem]'>{t('confirmation')}</h1>
              <p className='text-center text-[24rem] font-medium leading-none'>{t('confirmMessage')}</p>
            </div>
            <Link href='/login' className='mx-auto flex h-[65rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'>
              <span className='text-[24rem] font-medium leading-none'>{tActions('login')}</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
