"use client";

import Link from "next/link";

import { SubscriptionAccessLabel } from "@/components/SubscriptionAccessLabel";
import { PracticeWritingCard } from "@/components/practice/PracticeWritingCard";
import { useCustomTranslations } from "@/hooks/useCustomTranslations";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

export function ListeningAudioCheckClient() {
  const { t, tImgAlts, tActions } = useCustomTranslations("practice.listening.audioCheck");
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  return (
    <main className='relative min-h-screen bg-d-mint'>
      <div className='relative z-[1] flex min-h-screen items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('listening')}
          headingLabel={null}
          durationLabel={null}
          partsLabel={null}
          partsValue={null}
          headingSlot={
            <div className='flex items-center gap-[16rem]'>
              <div className='flex size-[44rem] items-center justify-center rounded-full bg-d-mint'>
                <img src='/images/icon_listeningSection.svg' className='size-[22rem]' alt={tImgAlts('listening')} />
              </div>
              <div className='flex flex-col gap-[4rem] text-left'>
                <span className='text-[14rem] font-medium leading-none text-slate-600'>{t('title')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>{tActions('play')}</span>
              </div>
            </div>
          }
          className='max-w-[620rem] gap-[24rem] border-none bg-white px-[32rem] py-[28rem] shadow-[0_24rem_60rem_-44rem_rgba(15,23,42,0.28)]'
        >
          <section className='flex flex-col gap-[20rem] text-[15rem] leading-[1.65] text-slate-700'>
            <p className='text-center text-[16rem] font-semibold text-slate-700'>
              {t.rich('subtitle', {
                br: () => <br />,
              })}
            </p>

            <Link
              href='/practice/listening/test/'
              onClick={async event => {
                if (isCheckingAccess) {
                  event.preventDefault();
                  return;
                }
                const canStart = await requireSubscription();
                if (!canStart) {
                  event.preventDefault();
                }
              }}
              className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center gap-[6rem] rounded-[32rem] bg-d-green pb-[2rem] text-[18rem] font-semibold hover:bg-d-green/40 ${
                isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
              }`}
            >
              <img src='/images/icon_audioPlay.svg' alt={tImgAlts('play')} className='size-[16rem]' />
              {isCheckingAccess ? '...' : tActions('play')}
            </Link>
            <SubscriptionAccessLabel className='text-center text-[12rem]' />
          </section>
        </PracticeWritingCard>
      </div>
    </main>
  );
}
