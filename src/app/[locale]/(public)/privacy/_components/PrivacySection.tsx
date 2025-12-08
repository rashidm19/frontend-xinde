'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { PrivacyContentRenderer, PrivacyElement } from './PrivacyContentRenderer';

interface PrivacySectionProps {
  id: string;
  title: string;
  elements: PrivacyElement[];
  index: number;
}

export const PrivacySection = ({ id, title, elements, index }: PrivacySectionProps) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className='scroll-mt-[100rem] rounded-2xl border border-gray-100 bg-white/40 p-[24rem] backdrop-blur-sm transition-all hover:bg-white/60 tablet:p-[32rem]'
    >
      <h2 className='mb-[24rem] font-poppins text-[20rem] font-semibold text-d-black tablet:text-[24rem]'>
        {title}
      </h2>
      <PrivacyContentRenderer elements={elements} />
    </motion.section>
  );
};
