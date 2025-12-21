import { PracticeReadingBlock } from '@/types/PracticeReading';

export function transformMatchingToDragDrop(block: PracticeReadingBlock): PracticeReadingBlock {
  if (block.kind !== 'matching') return block;

  // Extract the first choice from label "A. Some text"
  const initialChoices = [...(block.choices as any[])];
  
  // Often the first option is stored in choices_label like "A. Chek Lap Kok airport only"
  // We need to parse it and add it to the choices list so it becomes a draggable item
  if (typeof block.choices_label === 'string') {
    // Regex matches "A. Some text", "A . Some text", "A) Some text" etc.
    const match = block.choices_label.match(/^([A-Z])[\.\)]\s*(.*)$/);
    if (match) {
      initialChoices.unshift({ answer: match[1], choice: match[2] });
    } else {
        // Fallback if regex doesn't match but we have a label (though unlikely given the format)
        // We might just want to use the whole label or ignore it if it doesn't fit the pattern.
        // For now, let's assume strict format or skip.
    }
  }

  return {
    ...block,
    kind: 'dragdrop',
    questions: block.answers, // Rename answers to questions
    choices: initialChoices,
    // Explicitly undefined unused properties to avoid confusion, though not strictly necessary in JS
    answers: undefined,       
    choices_label: undefined  
  };
}
