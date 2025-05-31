import React, { useState } from 'react';
import { transformStringToArrayV2, transformStringToArrayV3 } from '@/lib/utils';

import { DndContext } from '@dnd-kit/core';
import { Draggable } from '@/components/ui/Draggable';
import { Droppable } from '@/components/ui/Droppable';

interface DndMatchingProps {
  block: {
    text: string;
    questions: {
      question: string;
      number: string;
    }[];
    choices: {
      choice: string;
      answer: string;
    }[];
  };
  setFieldValue: any;
}

export const DndText = ({ block, setFieldValue }: DndMatchingProps) => {
  // Define the draggable options
  const draggableOptions = block.choices;
  const textSplitedAsArray = transformStringToArrayV3(block.text);
  const [containerContents, setContainerContents] = useState<Record<string, string | null>>({});
  let qCount = 0;

  return (
    <div className='flex w-full flex-col gap-y-[48rem] rounded-[16rem] bg-white'>
      <DndContext onDragEnd={handleDragEnd} autoScroll={{ layoutShiftCompensation: false }}>
        {/* Droppable containers */}
        <div className='inline-flex flex-wrap items-center gap-x-[5rem] gap-y-[4rem] text-[16rem] leading-relaxed text-d-black'>
          {textSplitedAsArray.map((str: any, index: number) => {
            if (str === '___') {
              qCount += 1;
              return (
                <Droppable
                  key={`span-${index}`}
                  id={qCount.toString()}
                  className={`flex h-[28rem] w-[150rem] items-center justify-center rounded-[8rem] border-[1.5rem] border-dotted border-d-black/60 p-[10rem] text-center text-[16rem] font-normal leading-[22rem] tracking-[-0.2rem] text-d-black ${containerContents[qCount] ? 'bg-d-yellow-secondary' : ''}`}
                >
                  {containerContents[qCount] || qCount}
                </Droppable>
              );
            } else {
              return <span key={`span-${index}`}>{str}</span>;
            }
          })}
        </div>

        {/* Display draggable options */}
        <div className='mb-[20rem] flex flex-wrap gap-[8rem]'>
          {draggableOptions.map((option: any) => (
            <Draggable key={option.choice} id={option.choice}>
              {option.choice}
            </Draggable>
          ))}
        </div>
      </DndContext>
    </div>
  );

  function handleDragEnd(event: any) {
    console.log(event);
    const { over, active } = event;
    if (over) {
      setContainerContents(prev => ({
        ...prev,
        [over.id]: active.id,
      }));
      setFieldValue(`${over.id}`, draggableOptions.find(option => option.choice === active.id)!.answer);
    }
  }
};
