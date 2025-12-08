'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TOCProps {
  sections: { id: string; title: string }[];
}

export const PrivacyTOC = ({ sections }: TOCProps) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setActiveId(id);
              }
            });
          },
          {
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0,
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  return (
    <>
      {/* Mobile / Tablet Horizontal Scroll */}
      {/*<div className='sticky top-[60rem] z-30 -mx-[16rem] mb-[32rem] overflow-x-auto border-b border-gray-100 bg-white/80 px-[16rem] py-[12rem] backdrop-blur-md scrollbar-hide tablet:top-[72rem] desktop:hidden'>*/}
      {/*  <div className='flex gap-[8rem]'>*/}
      {/*    {sections.map((section) => (*/}
      {/*      <button*/}
      {/*        key={section.id}*/}
      {/*        onClick={() => scrollToSection(section.id)}*/}
      {/*        className={cn(*/}
      {/*          'whitespace-nowrap rounded-full px-[16rem] py-[8rem] text-[13rem] font-medium transition-colors',*/}
      {/*          activeId === section.id*/}
      {/*            ? 'bg-d-black text-white'*/}
      {/*            : 'bg-gray-100 text-d-black hover:bg-gray-200'*/}
      {/*        )}*/}
      {/*      >*/}
      {/*        {section.title}*/}
      {/*      </button>*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Desktop Vertical Sidebar */}
      <aside className='sticky top-[100rem] hidden h-fit max-h-[calc(100vh-120rem)] w-[280rem] shrink-0 overflow-y-auto desktop:block'>
        <h3 className='mb-[16rem] text-[14rem] font-semibold uppercase tracking-wider text-gray-400'>Contents</h3>
        <nav className='flex flex-col border-l border-gray-200'>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                'relative border-l-2 py-[8rem] pl-[24rem] text-left text-[14rem] transition-all hover:text-d-black',
                activeId === section.id ? '-ml-[2rem] border-d-black font-semibold text-d-black' : 'border-transparent text-gray-500'
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
