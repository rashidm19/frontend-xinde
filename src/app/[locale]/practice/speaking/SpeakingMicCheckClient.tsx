"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCustomTranslations } from "@/hooks/useCustomTranslations";
import { PracticeWritingCard } from "@/components/practice/PracticeWritingCard";
import { SubscriptionAccessLabel } from "@/components/SubscriptionAccessLabel";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const Mic = dynamic(() => import("./mic-check/_components/Mic").then(mod => mod.default), { ssr: false });

export function SpeakingMicCheckClient() {
  const { tImgAlts, tCommon, tActions } = useCustomTranslations("practice.speaking.micCheck");
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  return (
    <main className='relative min-h-screen bg-d-red-secondary'>
      <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('speaking')}
          headingLabel={tCommon('speaking')}
          durationLabel={tCommon('minCount', { count: 14 })}
          partsLabel={tCommon('parts')}
          partsValue='3'
          headingSlot={
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-red-secondary'>
                <img src='/images/icon_speakingSection.svg' className='size-[22rem]' alt={tImgAlts('speaking')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('speaking')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>{tCommon('minCount', { count: 14 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>3</div>
              </div>
            </div>
          }
          className='gap-[28rem]'
        >
          <div className='text-center'>
            <h1 className='text-[20rem] font-semibold leading-tight text-d-black'>Check your microphone</h1>
            <p className='mt-[12rem] text-[14rem] leading-[1.65] text-d-black/80'>Turn on the microphone through the browser</p>
          </div>

          <div className='my-[32rem] flex items-center justify-center'>
            <Mic />
          </div>

          <Link
            href='/practice/speaking/test'
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
            className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 ${
              isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
            }`}
          >
            {isCheckingAccess ? '...' : tActions('continue')}
          </Link>
          <SubscriptionAccessLabel className='mt-[10rem] text-center text-[12rem]' />
        </PracticeWritingCard>
      </div>
    </main>
  );
}
