import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function Draggable(props: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex w-fit cursor-move items-center justify-center rounded-[4rem] border-[1.5rem] border-d-black px-[6rem] py-[4rem] text-[16rem] font-normal leading-[26rem] tracking-[-0.2rem] text-d-black ${props.isSelected && 'bg-d-yellow-secondary'}`}
    >
      {props.children}
    </div>
  );
}
