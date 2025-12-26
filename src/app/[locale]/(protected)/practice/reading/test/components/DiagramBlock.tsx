import React, { useEffect, useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Draggable } from '@/components/ui/Draggable';
import { Droppable } from '@/components/ui/Droppable';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface DiagramBlockProps {
  block: {
    kind: string;
    diagram_url?: string;
    picture?: string;
    hint?: string; // <-- options live here (newline-separated)
    questions: {
      question: string;
      number: string | number;
    }[];
  };
  setFieldValue: (field: string, value: string | undefined) => void;
  control: any; // Passed from useForm
  value: any; // form values
}

function parseHintOptions(hint?: string): string[] {
  if (!hint) return [];
  return hint
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

export const DiagramBlock = ({ block, value, setFieldValue }: DiagramBlockProps) => {
  const imageUrl = block.diagram_url || block.picture;
  const { tImgAlts } = useCustomTranslations();

  // Draggable options are derived from hint lines
  const draggableOptions = useMemo(() => parseHintOptions(block.hint), [block.hint]);

  // Each droppable container holds a chosen option string (or null)
  const [containerContents, setContainerContents] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const initialState: Record<string, string | null> = {};

    block.questions?.forEach(q => {
      const key = q.number.toString();
      const savedAnswer = value?.[q.number]; // stored as option text
      if (typeof savedAnswer === 'string' && savedAnswer.trim()) {
        // If saved answer exists but is not in current hint options, keep it empty (or keep savedAnswer if you prefer)
        initialState[key] = draggableOptions.includes(savedAnswer) ? savedAnswer : null;
      } else {
        initialState[key] = null;
      }
    });

    setContainerContents(initialState);
  }, [block.questions, draggableOptions, value]);

  const placedChoices = useMemo(() => new Set(Object.values(containerContents).filter((v): v is string => !!v)), [containerContents]);

  function handleDragEnd(event: any) {
    const { over, active } = event;
    if (!over) return;

    const targetId = over.id.toString(); // question number
    const draggedValue = active.id as string; // option text

    setContainerContents(prev => ({
      ...prev,
      [targetId]: draggedValue,
    }));

    // Save the selected option text as the answer
    setFieldValue(`${targetId}`, draggedValue);
  }

  function handleClearAnswer(id: string) {
    setContainerContents(prev => ({
      ...prev,
      [id]: null,
    }));
    setFieldValue(`${id}`, undefined);
  }

  return (
    <div className='flex w-full flex-col gap-y-[32rem] rounded-[16rem] bg-white'>
      {/* Diagram Image at the top */}
      {imageUrl && (
        <div className='flex justify-center'>
          <img src={imageUrl} alt='Diagram' className='max-w-full rounded-[8rem] object-contain' style={{ maxHeight: '400rem' }} />
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd} autoScroll={{ layoutShiftCompensation: false }}>
        {/* Questions List */}
        <div className='flex flex-col items-start justify-start gap-x-[8rem] gap-y-[16rem] text-[16rem] leading-tight tracking-[-0.2rem] text-d-black'>
          {block.questions?.map(q => {
            const id = q.number.toString();
            const current = containerContents[id];

            return (
              <div className='flex items-center gap-x-[10rem]' key={`question-${id}`}>
                <span className='w-[25rem] font-medium'>{q.number}</span>

                <Droppable
                  id={id}
                  className={`relative flex h-[32rem] min-w-[150rem] max-w-[250rem] items-center rounded-[8rem] border-[1.5rem] border-dotted border-d-black/60 p-[10rem] text-left text-[16rem] font-normal leading-[26rem] tracking-[-0.2rem] text-d-black ${
                    current ? 'bg-d-yellow-secondary' : ''
                  }`}
                >
                  {current || ''}

                  {value?.[q.number] && (
                    <img
                      alt={tImgAlts('close')}
                      src='/images/icon_close--black.svg'
                      onClick={() => handleClearAnswer(id)}
                      className='absolute left-full top-1/2 size-[16rem] shrink-0 -translate-y-1/2'
                    />
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>

        {/* Draggable options (from hint) */}
        <div className='mb-[20rem] flex flex-wrap gap-[8rem]'>
          {draggableOptions.map(option => (
            <Draggable key={option} id={option} isSelected={placedChoices.has(option)}>
              {option}
            </Draggable>
          ))}
        </div>
      </DndContext>
    </div>
  );
};
