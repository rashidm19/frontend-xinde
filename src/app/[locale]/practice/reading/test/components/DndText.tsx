import React, { useEffect, useState } from 'react';
import { transformStringToArrayV3 } from '@/lib/utils';

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
  value: any;
}

export const DndText = ({ block, value, setFieldValue }: DndMatchingProps) => {
  // Define the draggable options
  const draggableOptions = block.choices;
  const textSplitAsArray = transformStringToArrayV3(block.text);
  const [containerContents, setContainerContents] = useState<Record<string, string | null>>({});
  let qCount = 0;

  useEffect(() => {
    const initialState: Record<string, string | null> = {};

    block.questions.forEach(q => {
      const savedAnswer = value[q.number];
      if (savedAnswer) {
        const matched = block.choices.find(c => c.answer === savedAnswer);
        if (matched) {
          initialState[q.number] = matched.choice;
        } else {
          initialState[q.number] = null;
        }
      } else {
        initialState[q.number] = null;
      }
    });

    setContainerContents(initialState);
  }, [block.choices, block.questions, value]);

  const placedChoices = new Set(
    Object.values(containerContents).filter((id): id is string => !!id)
  );

  return (
    <div className='flex w-full flex-col gap-y-[48rem] rounded-[16rem] bg-white'>
      <DndContext onDragEnd={handleDragEnd} autoScroll={{ layoutShiftCompensation: false }}>
        {/* Droppable containers */}
        <div className='inline-flex flex-wrap items-center gap-x-[5rem] gap-y-[4rem] text-[16rem] leading-relaxed text-d-black'>
          {textSplitAsArray.map((str: any, index: number) => {
            if (str === '___') {
              qCount += 1;
              const actualQNumber = qCount;

              return (
                <Droppable
                  key={`span-${index}`}
                  id={actualQNumber.toString()}
                  className={`relative flex h-[28rem] w-[150rem] items-center justify-center rounded-[8rem] border-[1.5rem] border-dotted border-d-black/60 p-[10rem] text-center text-[16rem] font-normal leading-[22rem] tracking-[-0.2rem] text-d-black ${containerContents[actualQNumber] ? 'bg-d-yellow-secondary' : ''}`}
                >
                  {containerContents[actualQNumber] || actualQNumber}

                  {value[actualQNumber] && (
                    <img
                      src='/images/icon_close--black.svg'
                      alt='Close'
                      className='absolute right-0 top-1/2 z-10 size-[16rem] shrink-0 -translate-y-1/2 cursor-pointer'
                      onClick={() => handleClearAnswer(String(actualQNumber))}
                    />
                  )}
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
            <Draggable key={option.choice} id={option.choice} isSelected={placedChoices.has(option.choice)}>
              {option.choice}
            </Draggable>
          ))}
        </div>
      </DndContext>
    </div>
  );

  function handleDragEnd(event: any) {
    const { over, active } = event;

    if (over) {
      setContainerContents(prev => ({
        ...prev,
        [over.id]: active.id,
      }));
      setFieldValue(`${over.id}`, draggableOptions.find(option => option.choice === active.id)!.answer);
    }
  }

  function handleClearAnswer(id: string) {
    setContainerContents(prev => ({
      ...prev,
      [id]: null,
    }));
    setFieldValue(`${id}`, undefined);
  }
};
