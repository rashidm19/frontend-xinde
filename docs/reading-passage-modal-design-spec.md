# Reading Passage Modal & Text Display Design Specification

## Overview

This document specifies the UX/UI design for displaying full reading passage text, complete task instructions, and block text content in the Reading Answer Sheet V2 page.

---

## 1. Reading Passage Modal

### 1.1 Trigger: "View Passage" Button

**Location:** Within `PartContent` component, displayed as a prominent action in the part header area.

**Desktop Button Styling:**
```
Container:
- Display: inline-flex, items-center, gap-[10rem]
- Background: bg-[#4C7A3A] (green accent)
- Padding: px-[16rem] py-[10rem]
- Border-radius: rounded-[12rem]
- Typography: text-[13rem] font-semibold text-white
- Transition: hover:bg-[#3d6530] (darker green on hover)
- Focus: focus-visible:ring-2 focus-visible:ring-[#4C7A3A]/50 focus-visible:ring-offset-2

Icon (BookOpen or similar):
- Size: size-[16rem]
- Color: text-white
- Position: leading (before text)
```

**Mobile Button Styling:**
```
- Full width: w-full
- Justify: justify-center
- Rest same as desktop
```

**Button Placement:**
The button should appear in the part header section, inside the yellow task description box but as a separate action area below the task text.

```
┌─────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────┐ │
│ │ Part task description text...               │ │
│ │                                             │ │
│ │ ┌───────────────────────┐                  │ │
│ │ │ 📖 View Full Passage  │ (button)         │ │
│ │ └───────────────────────┘                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Block sections below...]                       │
└─────────────────────────────────────────────────┘
```

### 1.2 Desktop Modal (using ModalShell)

**Modal Configuration:**
```
Size: "lg" (960rem max-width for comfortable reading)
Title: "Reading Passage - Part {N}"
```

**Content Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Reading Passage - Part 1                              [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    [Passage Image]                      │ │
│  │                    (if available)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Passage text content begins here. The text should be       │
│  displayed with comfortable reading typography. Long         │
│  passages will scroll within the modal content area.        │
│                                                              │
│  Paragraphs should be properly spaced for readability.      │
│  The whitespace and line breaks from the original text      │
│  should be preserved using whitespace-pre-line styling.     │
│                                                              │
│  [Scrollable area for long content...]                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Content Styling:**
```
Container:
- Display: flex flex-col
- Gap: gap-[24rem]

Image Container (if picture exists):
- Border: border border-[#E1D6B4]
- Background: bg-[#F3EDD3]/30
- Border-radius: rounded-[16rem]
- Padding: p-[16rem]
- Max-width for image: max-w-[600rem] mx-auto

Image:
- Width: w-full
- Object-fit: object-contain
- Border-radius: rounded-[12rem]
- Alt text: "Reading passage illustration"

Passage Text:
- Typography: text-[15rem] leading-[1.8] text-slate-700
- White-space: whitespace-pre-line (preserve line breaks)
- Font-family: inherit (system default for readability)
- Paragraph spacing: Paragraphs separated by blank lines in source
```

### 1.3 Mobile Bottom Sheet (using BottomSheet)

**Configuration:**
```
Max-height: 85dvh (allow significant content view)
Hide handle: false (keep drag handle visible)
```

**Layout:**
```
┌────────────────────────────────────────┐
│              ━━━━━━━                   │  ← Drag handle
│                                        │
│  Reading Passage                       │
│  Part 1                          [X]   │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  [Image if available]                  │
│                                        │
│  Passage text content with proper      │
│  reading typography and spacing...     │
│                                        │
│  [Scrollable]                          │
│                                        │
└────────────────────────────────────────┘
```

**Header Styling:**
```
Container:
- Display: flex items-center justify-between
- Padding: px-[2rem] pb-[12rem]
- Gap: gap-[12rem]

Title Section:
- Subtitle: "Reading Passage" 
  - text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400
- Title: "Part {N}"
  - text-[18rem] font-semibold text-slate-900 leading-[1.4]

Close Button:
- Size: size-[36rem]
- Shape: rounded-full
- Border: border border-slate-200
- Background: bg-white
- Icon: X icon, size-[18rem]
- States: hover:bg-slate-100
```

**Content Area Styling:**
```
Container:
- Overflow: overflow-y-auto
- Padding-right: pr-[4rem] (scrollbar spacing)
- Display: flex flex-col gap-[20rem]

Image (if exists):
- Border-radius: rounded-[12rem]
- Border: border border-[#E1D6B4]
- Max-width: 100%

Text:
- Typography: text-[14rem] leading-[1.7] text-slate-700
- White-space: whitespace-pre-line
```

---

## 2. Full Task Text Display (Remove Truncation)

### 2.1 Current State (Problem)

The `block-section.tsx` currently uses `line-clamp-2` on the task text, truncating long instructions to just 2 lines.

```tsx
// Current (problematic)
<p className="line-clamp-2 text-[14rem] font-medium text-d-black">{block.task}</p>
```

### 2.2 Updated Design

**Remove the truncation entirely.** The task text should display in full within the collapsible header.

**Updated Task Text Styling:**
```
Container (clickable header button):
- Flex direction: flex-col gap-[4rem]
- Padding remains: px-[20rem] py-[16rem]

Task Text:
- Remove: line-clamp-2
- Typography: text-[14rem] font-medium text-d-black leading-[1.6]
- Display: block (full text, no truncation)
```

**Layout Adjustment:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ [▼] │
│ │ [KIND LABEL]  Questions 1-8                             │     │
│ │                                                         │     │
│ │ Complete the sentences below. Choose NO MORE THAN       │     │
│ │ THREE WORDS from the passage for each answer.           │     │
│ │                                                         │     │
│ │ Write your answers in boxes 1-8 on your answer sheet.   │     │
│ └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Users need to see the complete task instructions to understand what was asked
- Truncation hides critical information (word limits, special instructions)
- The accordion pattern already allows collapsing, so full text won't overwhelm

---

## 3. Block Text Content Display

### 3.1 Purpose

Some block types (especially `words`, `diagram`, fill-in-the-blank) have a `block.text` field containing the actual content with blanks (represented as `___` or similar markers). This text is currently NOT displayed.

### 3.2 Design Specification

**Location:** Displayed inside the expanded block content area, BEFORE the hint section and questions.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Block Header - Task, Kind Label]                          [▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Block Text / Content                                      │ │
│  │                                                           │ │
│  │ The ancient city was discovered in 1___. The excavation   │ │
│  │ revealed that inhabitants used 2___ for construction.     │ │
│  │ The artifacts suggest a 3___ society that valued...       │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Hint / Options: word1, word2, word3...                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Question Items...]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Block Text Container Styling:**
```
Container:
- Background: bg-white
- Border: border border-[#E1D6B4]/60
- Border-radius: rounded-[14rem]
- Padding: px-[16rem] py-[14rem]
- Margin-bottom: mb-[16rem]

Label (optional, for clarity):
- Text: "Passage Text:" or "Complete the following:"
- Typography: text-[11rem] font-semibold uppercase tracking-[0.1em] text-[#85784A]
- Margin-bottom: mb-[8rem]

Text Content:
- Typography: text-[13.5rem] leading-[1.75] text-d-black/85
- White-space: whitespace-pre-line (preserve line breaks)
- Word-break: break-words
```

**Blank Marker Styling (future enhancement):**
If blanks are consistently marked (e.g., `___` or `{1}___`), they could be styled distinctly:
```
Blank indicators (1___, 2___, etc.):
- Background: bg-[#F3EDD3]
- Padding: px-[6rem] py-[2rem]
- Border-radius: rounded-[4rem]
- Font-weight: font-medium
- Color: text-[#6F6335]
```

**Conditional Display:**
Only show this section when `block.text` exists and has meaningful content (not empty or whitespace-only).

```tsx
{block.text && block.text.trim().length > 0 ? (
  <div className="block-text-container">...</div>
) : null}
```

---

## 4. Diagram Block Enhancement

### 4.1 Current State

Diagram blocks have a `diagram_url` field but it may not be prominently displayed in the answer review.

### 4.2 Design Specification

For `kind: "diagram"` blocks, display the diagram image in the expanded content area.

**Location:** After block text (if any), before hint/questions.

**Styling:**
```
Container:
- Border: border border-[#E1D6B4]
- Background: bg-[#FDFCF7]
- Border-radius: rounded-[14rem]
- Padding: p-[12rem]
- Margin-bottom: mb-[16rem]
- Text-align: center

Image:
- Max-width: max-w-full
- Max-height: max-h-[400rem]
- Object-fit: object-contain
- Border-radius: rounded-[10rem]
- Margin: mx-auto
```

---

## 5. Responsive Behavior Summary

### 5.1 Breakpoints

Following the project's existing breakpoint system:
- Mobile: < 768px
- Tablet: 768px - 1023px  
- Desktop: ≥ 1024px

### 5.2 Passage Modal Adaptations

| Aspect | Mobile | Tablet/Desktop |
|--------|--------|----------------|
| Container | BottomSheet | ModalShell (lg) |
| Max height | 85dvh | 85vh |
| Padding | 18rem sides | 32rem sides |
| Close action | X button + swipe down | X button + backdrop click |
| Image max-width | 100% | 600rem |
| Text size | 14rem | 15rem |

### 5.3 Block Section Adaptations

| Aspect | Mobile | Tablet/Desktop |
|--------|--------|----------------|
| Header padding | px-[16rem] py-[12rem] | px-[20rem] py-[16rem] |
| Task text size | 13rem | 14rem |
| Block text size | 13rem | 13.5rem |
| Content padding | px-[16rem] py-[12rem] | px-[20rem] py-[16rem] |

---

## 6. Accessibility Requirements

### 6.1 Passage Modal

- **Focus management:** Focus should move to modal on open, return to trigger on close
- **Keyboard navigation:** Escape key closes modal
- **Screen reader:** Modal title announced, content labeled appropriately
- **Aria attributes:**
  - `aria-modal="true"` on modal container
  - `aria-labelledby` pointing to title
  - Close button has `aria-label="Close passage"`

### 6.2 Block Section

- **Expandable section:** Already using `aria-expanded` on header button
- **Focus visible:** Existing focus ring styling maintained
- **Reading order:** Logical order (task → block text → hint → questions)

### 6.3 Color Contrast

All text colors meet WCAG AA requirements:
- Primary text (`text-d-black`): High contrast on `bg-white` and `bg-[#FFFDF0]`
- Secondary text (`text-d-black/70`, `text-slate-600`): Adequate contrast
- Labels (`text-[#6F6335]` on `bg-[#F3EDD3]`): Verify 4.5:1 ratio

---

## 7. Animation & Motion

### 7.1 Modal Transitions

Following existing patterns with `framer-motion`:

**Desktop Modal:**
```
Overlay: opacity 0 → 1 (duration: 0.25s, ease: easeOut)
Content: opacity 0 → 1, scale 0.96 → 1 (duration: 0.28s, ease: easeOut)
```

**Mobile Bottom Sheet:**
```
Overlay: opacity 0 → 1 (duration: 0.15s, ease: easeOut)
Content: y 100% → 0 (spring, duration: 0.25s, damping: 22, stiffness: 320)
```

### 7.2 Reduced Motion

All animations respect `prefers-reduced-motion` via `useReducedMotion()`:
- When reduced motion preferred: instant transitions (duration: 0)
- Pass `shouldReduceMotion` to child components as needed

---

## 8. State Management

### 8.1 Modal State

```tsx
// In PartContent or parent component
const [passageModalOpen, setPassageModalOpen] = useState(false);
```

### 8.2 Props Flow

```
ReadingAnswerSheetV2
  └── PartContent
        ├── passageModalOpen, setPassageModalOpen (local state)
        ├── part.text (passage content)
        ├── part.picture (passage image)
        └── BlockSection
              └── block.text (fill-in-blank content)
```

---

## 9. Component Structure Summary

### 9.1 New Component: ReadingPassageModal

```tsx
interface ReadingPassageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partNumber: 1 | 2 | 3;
  passageText: string;
  passagePicture: string | null;
}
```

### 9.2 Updated: PartContent

- Add "View Full Passage" button
- Manage modal open state
- Render ReadingPassageModal

### 9.3 Updated: BlockSection

- Remove `line-clamp-2` from task text
- Add block.text display section
- Add diagram image display for diagram blocks

---

## 10. Visual Reference

### 10.1 Color Palette (Reading Theme)

| Purpose | Color | Usage |
|---------|-------|-------|
| Page background | `#FFFDF0` | Main background |
| Card background | `#FFFFFF` | Block containers |
| Border primary | `#E1D6B4` | Card and section borders |
| Accent green | `#4C7A3A` | Primary buttons, correct indicators |
| Light yellow | `#F3EDD3` | Tags, highlights |
| Text primary | `d-black` | Main content |
| Text secondary | `#85784A`, `#6F6335` | Labels, muted text |

### 10.2 Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Modal title | 22rem | 600 | 1.4 |
| Section header | 18rem | 600 | 1.4 |
| Block task | 14rem | 500 | 1.6 |
| Passage text | 15rem (14rem mobile) | 400 | 1.8 (1.7 mobile) |
| Block text | 13.5rem | 400 | 1.75 |
| Labels | 11-12rem | 600 | 1.4 |

---

## 11. Implementation Notes for Developers

1. **Modal Component Location:** Create `reading-passage-modal.tsx` in the `_components` folder alongside other components

2. **Reuse Pattern:** Follow the exact pattern from `writing-task-modal.tsx` for desktop/mobile responsive switching

3. **Block Text Visibility:** Only render block text section when `block.text?.trim()` is truthy

4. **Performance:** The modal content should use lazy rendering (only mount when open) - this is handled by AnimatePresence

5. **Translation Keys:** Add new keys for button and modal labels:
   - `reading.answerSheet.viewPassage` → "View Full Passage"
   - `reading.answerSheet.passageTitle` → "Reading Passage"
   - `reading.answerSheet.passageTextLabel` → "Passage Text"

---

## Summary of Changes

| Component | Change | Priority |
|-----------|--------|----------|
| PartContent | Add "View Full Passage" button + modal trigger | High |
| New: ReadingPassageModal | Modal/BottomSheet for full passage | High |
| BlockSection | Remove `line-clamp-2` from task text | High |
| BlockSection | Add block.text display section | High |
| BlockSection | Add diagram_url image display | Medium |
