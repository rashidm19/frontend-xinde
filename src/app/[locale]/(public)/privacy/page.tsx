'use client';

import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PrivacyHeader } from './_components/PrivacyHeader';
import { PrivacyTOC } from './_components/PrivacyTOC';
import { PrivacySection } from './_components/PrivacySection';
import { PrivacyContactCard } from './_components/PrivacyContactCard';
import { PrivacyFooter } from './_components/PrivacyFooter';
import { PrivacyElement } from './_components/PrivacyContentRenderer';

export default function PrivacyPage() {
  const { t } = useCustomTranslations('privacyPolicy');
  const content = t.raw('content') as PrivacyElement[];

  const sections =
    content?.map((section, index) => ({
      id: `section-${index}`,
      title: section.title,
    })) || [];

  return (
    <div className='min-h-screen bg-[#FDFDFD]'>
      <PrivacyHeader />

      <main className='mx-auto max-w-[1200rem]'>
        <div className='relative flex flex-col items-start gap-[40rem] px-[16rem] tablet:px-[32rem] desktop:mt-[80rem] desktop:flex-row desktop:px-[40rem]'>
          <PrivacyTOC sections={sections} />

          <div className='flex w-full flex-1 flex-col gap-[40rem] pb-[80rem]'>
            <h1 className='text-center mt-[24rem] font-poppins text-[18rem] font-semibold text-d-black tablet:text-[18rem] desktop:hidden'>{t('title')}</h1>

            {content?.map((section, index) => (
              <PrivacySection key={index} id={`section-${index}`} index={index} title={section.title} elements={section.elements || []} />
            ))}

            <PrivacyContactCard />
          </div>
        </div>
      </main>

      <PrivacyFooter />
    </div>
  );
}
