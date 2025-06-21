'use client';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const RunningLineItem = ({ imageSrc, text }: { imageSrc: string; text: string }) => (
  <div className='ml-[24rem] flex items-center gap-x-[24rem]'>
    <div className='relative aspect-[30/30] w-[30rem] shrink-0'>
      <Image fill alt='Illustration' src={imageSrc} className='object-cover' />
    </div>
    <p className='whitespace-nowrap text-[14rem] font-semibold italic leading-[19rem]'>{text}</p>
  </div>
);

const items = [
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
  { imageSrc: '/images/illustration_ball.png', text: 'Comprehensive Performance Analytics' },
  { imageSrc: '/images/illustration_three-ball.png', text: 'Adaptive Test Preparation' },
  { imageSrc: '/images/illustration_microbe.png', text: 'Real-time Feedback and Assessment' },
  { imageSrc: '/images/illustration_pointy-microbe.png', text: 'Authorized partner of IDP IELTS in Kazakhstan' },
  { imageSrc: '/images/illustration_orange-molecule.png', text: 'Interactive Study Materials' },
];

export const RunningLine = () => {
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
        {[...items, ...items].map((item, index) => (
          <RunningLineItem key={index} imageSrc={item.imageSrc} text={item.text} />
        ))}
      </div>
    </section>
  );
};
