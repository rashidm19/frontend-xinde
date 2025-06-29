'use client';
import Image from 'next/image';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

const RunningLineItem = ({ imageSrc, text }: { imageSrc: string; text: string }) => (
  <div className='ml-[24rem] flex items-center gap-x-[24rem]'>
    <div className='relative aspect-[30/30] w-[30rem] shrink-0'>
      <Image fill alt='Illustration' src={imageSrc} className='object-cover' />
    </div>
    <p className='whitespace-nowrap text-[14rem] font-semibold italic leading-[19rem]'>{text}</p>
  </div>
);

const itemsIcons = [
  '/images/illustration_ball.png',
  '/images/illustration_three-ball.png',
  '/images/illustration_microbe.png',
  '/images/illustration_pointy-microbe.png',
  '/images/illustration_orange-molecule.png',
];

export const RunningLine = () => {
  const { t } = useCustomTranslations('home');

  const items: string[] = t.raw('runningLine');

  return (
    <section className='overflow-hidden bg-white'>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .running-line {
          display: flex;
          animation: scroll 175s linear infinite;
          width: max-content;
        }

        .running-line:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className='running-line py-[16rem]'>
        {[...items, ...items].map((text, index) => (
          <RunningLineItem key={index} text={text} imageSrc={itemsIcons[index % itemsIcons.length]} />
        ))}
      </div>
    </section>
  );
};
