import React, { useEffect, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Draggable } from '@/components/ui/Draggable';
import { Droppable } from '@/components/ui/Droppable';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface DndMatchingProps {
  block: {
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

export const DndMatching = ({ block, value, setFieldValue }: DndMatchingProps) => {
  const { tImgAlts } = useCustomTranslations();

  // Define the draggable options
  const draggableOptions = block.choices;
  const [containerContents, setContainerContents] = useState<Record<string, string | null>>({});

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

  const placedChoices = new Set(Object.values(containerContents).filter((id): id is string => !!id));

  return (
    <div className='flex w-full flex-col gap-y-[48rem] rounded-[16rem] bg-white'>
      <DndContext onDragEnd={handleDragEnd} autoScroll={{ layoutShiftCompensation: false }}>
        {/* Droppable containers */}
        <div className='flex flex-col items-start justify-start gap-x-[8rem] gap-y-[16rem] text-[16rem] leading-tight tracking-[-0.2rem] text-d-black'>
          {block.questions.map((q: any) => (
            <div className='flex items-center gap-x-[10rem]' key={`question-${q.number}`}>
              <p className='w-[350rem]'>{q.question}</p>
              <Droppable
                id={q.number}
                className={`relative flex h-[32rem] min-w-[150rem] max-w-[250rem] items-center rounded-[8rem] border-[1.5rem] border-dotted border-d-black/60 p-[10rem] text-left text-[16rem] font-normal leading-[26rem] tracking-[-0.2rem] text-d-black ${containerContents[q.number] ? 'bg-d-yellow-secondary' : ''}`}
              >
                {containerContents[q.number] || ''}

                {value[q.number] && (
                  <img
                    alt={tImgAlts('close')}
                    src='/images/icon_close--black.svg'
                    onClick={() => handleClearAnswer(q.number)}
                    className='absolute left-full top-1/2 size-[16rem] shrink-0 -translate-y-1/2'
                  />
                )}
              </Droppable>{' '}
            </div>
          ))}
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
