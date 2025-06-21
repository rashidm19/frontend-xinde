import { motion } from 'framer-motion';
import React from 'react';

export default function Button({ isActive, toggleMenu }: { isActive: boolean; toggleMenu: () => void }) {
  return (
    <div className='absolute right-[16rem] top-[16rem] z-[190] size-[38rem] cursor-pointer overflow-hidden rounded-[12rem] tablet:hidden'>
      <motion.div className='relative h-full w-full' animate={{ top: isActive ? '-100%' : '0%' }} transition={{ duration: 0.5, type: 'tween', ease: [0.76, 0, 0.24, 1] }}>
        <div className='hover:perspective-text-hover group h-full w-full bg-[#c9fd74]' onClick={toggleMenu}>
          <BurgerMenu color='#383838' />
        </div>
        <div className='hover:perspective-text-hover group h-full w-full bg-d-black' onClick={toggleMenu}>
          <BurgerMenu color='#FFF' />
        </div>
      </motion.div>
    </div>
  );
}

function BurgerMenu({ color }: { color: string }) {
  return (
    <div className='preserve-3d duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] flex h-full w-full flex-col items-center justify-center transition-transform group-hover:rotate-x-90 desktop:hidden'>
      <div className='duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] flex flex-col gap-[3rem] transition-all group-hover:-translate-y-full group-hover:opacity-0'>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ backgroundColor: color }} className='h-[2rem] w-[18rem] shrink-0 rounded-full' />
        ))}
      </div>
      <div className='-rotate-x-90 duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] absolute flex origin-bottom translate-y-[9rem] flex-col gap-[3rem] opacity-0 transition-all group-hover:opacity-100'>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ backgroundColor: color }} className='h-[2rem] w-[18rem] shrink-0 rounded-full' />
        ))}
      </div>
    </div>
  );
}
