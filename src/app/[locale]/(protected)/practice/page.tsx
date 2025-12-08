import { redirect } from 'next/navigation';

type PageProps = {
  params: {
    locale: string;
  };
};

export default function Page({ params }: PageProps) {
  redirect(`/${params.locale}/dashboard`);
}

// 'use client';
//
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//
// import { Header } from '@/components/Header';
// import Link from 'next/link';
// import { useCustomTranslations } from '@/hooks/useCustomTranslations';
// import React from 'react';
// import { useProfile } from '@/hooks/useProfile';
// import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
// import { SubscriptionStatusBanner } from '@/components/SubscriptionStatusBanner';
//
// export default function Page() {
//   const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('practice');
//
//   const { profile } = useProfile();
//
//   const tabs = [
//     { icon: '/images/icon_writingSection.svg', key: 'writing' },
//     { icon: '/images/icon_readingSection.svg', key: 'reading' },
//     { icon: '/images/icon_listeningSection.svg', key: 'listening' },
//     { icon: '/images/icon_speakingSection.svg', key: 'speaking' },
//   ];
//
//   return (
//     <>
//       <Header name={profile?.name} avatar={profile?.avatar ?? undefined} />
//       <main>
//         <div className='container max-w-[1440rem] p-[40rem]'>
//           <SubscriptionStatusBanner className='mb-[24rem]' />
//           <Tabs defaultValue='writing'>
//             <TabsList className='mb-[24rem] gap-x-[8rem] rounded-[40rem] bg-white p-[8rem]'>
//               {tabs.map((tab, index) => (
//                 <TabsTrigger key={index} className='h-[45rem] w-[118rem] gap-x-[8rem] rounded-[40rem] bg-white data-[state=active]:bg-d-blue-secondary' value={tab.key}>
//                   <img src={tab.icon} alt={tImgAlts(tab.key)} className='w-[14rem]' />
//                   <span className='text-[14rem] font-semibold'>{tCommon(tab.key)}</span>
//                 </TabsTrigger>
//               ))}
//             </TabsList>
//
//             <TabsContent value='writing' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-blue-secondary p-[16rem]'>
//               <img
//                 alt={tImgAlts('molecule')}
//                 src='/images/illustration_molecule--02.png'
//                 className='pointer-events-none absolute right-0 top-0 h-auto w-[324rem] mix-blend-multiply'
//               />
//               <img
//                 alt={tImgAlts('flower')}
//                 src='/images/illustration_torusArray--02.png'
//                 className='pointer-events-none absolute bottom-0 left-0 h-auto w-[360rem] mix-blend-multiply'
//               />
//
//               <div className='flex justify-between'>
//                 <div className='flex gap-x-[8rem]'>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     ~ {tCommon('minutesCount', { count: 60 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('partsCount', { count: 2 })}
//                   </div>
//                 </div>
//               </div>
//
//               <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
//                 <h1 className='text-[32rem] font-medium leading-none'>{t('writing.title')}</h1>
//                 <p className='text-center text-[14rem] font-medium leading-tight'>
//                   {t.rich('writing.subtitle', {
//                     br: () => <br />,
//                   })}
//                 </p>
//                 <Link
//                   href='/practice/writing/customize'
//                   className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
//                 >
//                   {tActions('takeTheTest')}
//                 </Link>
//                 <SubscriptionAccessLabel className='mt-[12rem] text-center' />
//               </div>
//             </TabsContent>
//             <TabsContent value='reading' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-yellow-secondary p-[16rem]'>
//               <img
//                 alt={tImgAlts('pyramid')}
//                 src='/images/illustration_pyramide.png'
//                 className='pointer-events-none absolute right-[28rem] top-[8rem] h-auto w-[228rem] rotate-[12deg] opacity-30 mix-blend-multiply'
//               />
//               <img
//                 alt={tImgAlts('softball')}
//                 src='/images/illustration_softball.png'
//                 className='pointer-events-none absolute bottom-[-160rem] left-[60rem] h-auto w-[321rem] opacity-30 mix-blend-multiply'
//               />
//
//               <div className='flex justify-between'>
//                 <div className='flex gap-x-[8rem]'>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     ~ {tCommon('minutesCount', { count: 60 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('partsCount', { count: 3 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('questionsCount', { count: 40 })}
//                   </div>
//                 </div>
//               </div>
//
//               <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
//                 <h1 className='text-[32rem] font-medium leading-none'>{t('reading.title')}</h1>
//                 <p className='text-center text-[14rem] font-medium leading-tight'>
//                   {t.rich('reading.subtitle', {
//                     br: () => <br />,
//                   })}
//                 </p>
//                 <Link
//                   href='/practice/reading/rules'
//                   className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
//                 >
//                   {tActions('takeTheTest')}
//                 </Link>
//                 <SubscriptionAccessLabel className='mt-[12rem] text-center' />
//               </div>
//             </TabsContent>
//             <TabsContent value='listening' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-mint p-[16rem]'>
//               <img
//                 alt={tImgAlts('bread')}
//                 src='/images/illustration_bread.png'
//                 className='pointer-events-none absolute right-[37rem] top-[28rem] h-auto w-[220rem] opacity-60 mix-blend-multiply'
//               />
//               <img
//                 alt={tImgAlts('abstract')}
//                 src='/images/illustration_abstract.png'
//                 className='pointer-events-none absolute bottom-[-10rem] left-[-50rem] h-auto w-[302rem] rotate-[8deg] opacity-60 mix-blend-multiply'
//               />
//
//               <div className='flex justify-between'>
//                 <div className='flex gap-x-[8rem]'>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     ~ {tCommon('minutesCount', { count: 40 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('partsCount', { count: 4 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('questionsCount', { count: 40 })}
//                   </div>
//                 </div>
//               </div>
//
//               <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
//                 <h1 className='text-[32rem] font-medium leading-none'>{t('listening.title')}</h1>
//                 <p className='text-center text-[14rem] font-medium leading-tight'>
//                   {t.rich('listening.subtitle', {
//                     br: () => <br />,
//                   })}
//                 </p>
//                 <Link
//                   href='/practice/listening/rules'
//                   className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
//                 >
//                   {tActions('takeTheTest')}
//                 </Link>
//                 <SubscriptionAccessLabel className='mt-[12rem] text-center' />
//               </div>
//             </TabsContent>
//             <TabsContent value='speaking' className='practice-tabs-shadow relative h-[738rem] overflow-hidden rounded-[16rem] bg-d-red-secondary p-[16rem]'>
//               <img
//                 alt={tImgAlts('flower')}
//                 src='/images/illustration_flowerOrange.png'
//                 className='pointer-events-none absolute bottom-[-100rem] left-[-10rem] h-auto w-[392rem] rotate-[-16deg] opacity-20 mix-blend-multiply'
//               />
//               <img
//                 alt={tImgAlts('halfspheres')}
//                 src='/images/illustration_halfspheres.png'
//                 className='pointer-events-none absolute bottom-[-40rem] right-[40rem] h-auto w-[264rem] rotate-[-8deg] opacity-20 mix-blend-multiply'
//               />
//
//               <div className='flex justify-between'>
//                 <div className='flex gap-x-[8rem]'>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     ~ {tCommon('minutesCount', { count: 14 })}
//                   </div>
//                   <div className='flex h-[37rem] items-center justify-center rounded-[32rem] bg-white px-[20rem] text-[14rem] font-medium'>
//                     {tCommon('partsCount', { count: 3 })}
//                   </div>
//                 </div>
//               </div>
//
//               <div className='mt-[228rem] flex w-full flex-col items-center gap-y-[32rem]'>
//                 <h1 className='text-[32rem] font-medium leading-none'>{t('speaking.title')}</h1>
//                 <p className='text-center text-[14rem] font-medium leading-tight'>
//                   {t.rich('speaking.subtitle', {
//                     br: () => <br />,
//                   })}
//                 </p>
//                 <Link
//                   href='/practice/speaking/customize'
//                   className='flex h-[64rem] w-[328rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40'
//                 >
//                   {tActions('takeTheTest')}
//                 </Link>
//                 <SubscriptionAccessLabel className='mt-[12rem] text-center' />
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </main>
//       <footer className='mb-[24rem] text-center text-[12rem]'>{tCommon('allRightsReserved')}</footer>
//     </>
//   );
// }