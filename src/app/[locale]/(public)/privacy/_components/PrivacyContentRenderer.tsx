import React from 'react';
import { cn } from '@/lib/utils';

export interface PrivacyElement {
  title: string;
  elements?: PrivacyElement[];
}

export const PrivacyContentRenderer = ({ elements, level = 0 }: { elements: PrivacyElement[]; level?: number }) => {
  if (!elements || elements.length === 0) return null;

  return (
    <ul className={cn('flex flex-col gap-[12rem]', level > 0 && 'ml-[20rem] list-disc pl-[20rem]')}>
      {elements.map((el, index) => (
        <li key={index} className='text-[15rem] leading-relaxed text-d-black/80 tablet:text-[16rem]'>
          <span dangerouslySetInnerHTML={{ __html: el.title }} />
          {el.elements && (
            <div className='mt-[12rem]'>
              <PrivacyContentRenderer elements={el.elements} level={level + 1} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
