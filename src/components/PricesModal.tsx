import React from 'react';
import { DialogClose } from './ui/dialog';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const PricesModal = () => {
  const { t, tImgAlts, tActions } = useCustomTranslations('pricesModal');

  const demoIncludes: string[] = t.raw('demo.includes');
  const premiumIncludes: string[] = t.raw('premium.includes');

  const premiumTypes = ['monthly', 'quarterly'];

  return (
    <ScrollArea className='h-[100dvh] tablet:h-[684rem] tablet:w-[96dvw] desktop:h-[726rem] desktop:w-[1280rem]'>
      <section className='relative flex flex-col overflow-auto rounded-[40rem] bg-white p-[24rem] tablet:p-[32rem] desktop:p-[56rem]'>
        <DialogClose className='absolute right-[24rem] top-[24rem] z-[200] shrink-0 desktop:right-[56rem] desktop:top-[56rem]'>
          <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[24rem] shrink-0' />
        </DialogClose>

        <div className='container relative z-10 flex flex-col items-center desktop:max-w-[1440rem]'>
          <div className='flex flex-col items-center'>
            <h1 className='mb-[24rem] mr-[50rem] text-[30rem] font-semibold leading-[120%] tablet:text-center tablet:text-[28rem] tablet:leading-[120%] desktop:mb-[64rem] desktop:text-[40rem] desktop:leading-[120%]'>
              Upgrade to Premium <br className='hidden tablet:block desktop:hidden' /> to get the unlimited access
            </h1>

            <div className='flex flex-col gap-[24rem] tablet:flex-row tablet:gap-[12rem] desktop:gap-x-[24rem]'>
              {/* Demo/Free Plan */}
              <div className='flex h-[320rem] w-[342rem] flex-col gap-y-[12rem] rounded-[16rem] bg-d-light-gray p-[32rem] pb-[44rem] tablet:h-[500rem] tablet:w-[300rem] tablet:gap-y-[20rem] desktop:h-[500rem] desktop:w-[370rem] desktop:gap-y-[32rem]'>
                <h2 className='font-poppins text-[32rem] font-medium'>{t('demo.title')}</h2>

                <div className='flex flex-col gap-y-[12rem] tablet:gap-y-[16rem] desktop:gap-y-[20rem]'>
                  {demoIncludes?.map((item, index) => (
                    <div key={index} className='flex items-center gap-x-[12rem]'>
                      <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='size-[16rem]' />
                      <span className='text-[14rem] leading-[120%] tablet:text-[16rem] tablet:leading-[130%] desktop:leading-[120%]'>{item}</span>
                    </div>
                  ))}
                </div>

                <div className='mt-auto flex flex-col'>
                  <h3 className='mb-[12rem] text-center text-[32rem] font-medium tablet:mb-[24rem] tablet:text-start desktop:mb-[38rem]'>{t('demo.price')}</h3>
                  <p className='mx-auto -mb-[10rem] text-center text-[14rem] font-semibold text-black/60 tablet:-mb-[0rem] desktop:mb-0'>{t('demo.about')}</p>
                </div>
              </div>

              {/* Monthly/Quarterly Premium Plan */}
              {premiumTypes.map((type, index) => (
                <div
                  key={index}
                  className={`relative flex h-[430rem] w-[342rem] flex-col gap-y-[12rem] rounded-[16rem] ${type === 'quarterly' ? 'bg-d-violet' : 'bg-d-blue'} p-[32rem] text-white tablet:h-[500rem] tablet:w-[300rem] tablet:gap-y-[20rem] desktop:h-[500rem] desktop:w-[370rem] desktop:gap-y-[32rem]`}
                >
                  {type === 'quarterly' && (
                    <div className='absolute -top-[18rem] right-0 flex items-center gap-x-[8rem] rounded-full bg-d-black px-[34rem] py-[6rem] text-[14rem] text-white'>
                      <div className='size-[10rem] rounded-full bg-d-green'></div>
                      <span className='font-poppins text-[14rem] font-medium tablet:text-[16rem]'>save 20% monthly</span>
                    </div>
                  )}

                  <div className={`absolute -bottom-[0rem] right-0 ${type === 'quarterly' ? 'aspect-[462/428]' : 'aspect-[458/330]'} w-[213rem] mix-blend-soft-light`}>
                    <Image
                      src={`/images/icon_subscription--0${type === 'quarterly' ? '1' : '2'}.png`}
                      alt={tImgAlts('premiumPlan')}
                      className='rounded-br-[16rem] object-cover'
                      fill
                    />
                  </div>

                  <h2 className='font-poppins text-[32rem] font-medium'>{t('premium.title')}</h2>

                  <div className='flex flex-col gap-y-[12rem] tablet:gap-y-[16rem] desktop:gap-y-[20rem]'>
                    {premiumIncludes?.map((item, index) => (
                      <div key={index} className='flex items-center gap-x-[12rem]'>
                        <img src='/images/icon_check--white.svg' alt={tImgAlts('check')} className='size-[16rem]' />
                        <span className='text-[14rem] leading-[120%] tablet:text-[16rem] tablet:leading-[130%] desktop:leading-[120%]'>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className='mt-auto'>
                    <h3 className='text-[32rem] font-medium'>
                      {t.rich('premium.price', {
                        price: type === 'quarterly' ? '6 600 ₸' : '2 750 ₸',
                        monthCount: type === 'quarterly' ? '3' : '',
                        span: chunks => <span className='text-[14rem] font-normal tablet:text-[16rem]'>{chunks}</span>,
                      })}
                    </h3>
                    <button className='relative z-[200] w-full rounded-full bg-d-green py-[16rem] text-[18rem] font-medium text-black hover:bg-d-green/90'>
                      {tActions('upgrade')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ScrollArea>
  );
};
