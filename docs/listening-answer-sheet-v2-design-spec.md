# Listening Answer Sheet V2 — Design Specification

> **Document Version:** 1.0  
> **Last Updated:** December 2024  
> **Status:** Ready for Review  
> **Based On:** Reading Answer Sheet V2 Design

---

## Table of Contents

1. [Overview](#1-overview)
2. [Color Palette](#2-color-palette)
3. [Typography & Spacing](#3-typography--spacing)
4. [Layout Structure](#4-layout-structure)
5. [Component Specifications](#5-component-specifications)
6. [Mobile Adaptations](#6-mobile-adaptations)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Key Differences from Reading V2](#9-key-differences-from-reading-v2)

---

## 1. Overview

### 1.1 Purpose
The Listening Answer Sheet V2 provides a detailed, question-by-question breakdown of listening practice results. It adapts the established Reading V2 design patterns while incorporating listening-specific requirements:

- **4 Parts** instead of 3 (Part 1, Part 2, Part 3, Part 4)
- **No Passage Feature** (listening has audio, not text passages)
- **Blue/Purple Theme** to distinguish from Reading's green theme

### 1.2 Data Structure Reference
```typescript
interface PracticeListeningResultV2 {
  id: number;
  listening_id: number;
  title: string;
  completed_at: string | null;
  score: number | null;
  correct_answers_count: number;
  listening: {
    rules: string;
    audio_url: string;
    questions_count: number;
    part_1: ListeningPartFeedback;
    part_2: ListeningPartFeedback;
    part_3: ListeningPartFeedback;
    part_4: ListeningPartFeedback;  // Additional part
  };
}

interface ListeningPartFeedback {
  questions_count: number;
  blocks: ListeningBlockFeedback[];
}

// Block kinds: 'words', 'test', 'titles', 'matching', 'checkboxes', 'table'
```

### 1.3 Question Type Labels
```typescript
const KIND_LABELS: Record<string, string> = {
  'words': 'Sentence Completion',
  'test': 'Multiple Choice',
  'titles': 'Title Matching',
  'matching': 'Matching',
  'checkboxes': 'Multiple Selection',
  'table': 'Table Completion',
};
```

---

## 2. Color Palette

### 2.1 Primary Colors (Blue Theme)

| Token | Hex Code | Usage |
|-------|----------|-------|
| `listening-primary` | `#4A6FA5` | Primary accent, floating button, active tab badges |
| `listening-primary-dark` | `#3A5A8A` | Hover states, focus rings |
| `listening-primary-darker` | `#2D4A75` | Ring offset, emphasized borders |
| `listening-secondary` | `#E8EEF7` | Light backgrounds, secondary highlights |
| `listening-secondary-light` | `#F0F5FA` | Tab toggle background, subtle fills |

### 2.2 Background Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `page-bg` | `#FFFDF0` | Page background (warm cream - consistent) |
| `card-bg` | `#FFFFFF` | Card backgrounds |
| `task-bg` | `#F0F5FA` | Task description backgrounds |
| `hint-bg` | `#E8EEF7` | Hint/options section background |

### 2.3 Border Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `border-primary` | `#C5D4E8` | Card borders, dividers |
| `border-light` | `#D8E4F0` | Subtle separators |
| `border-active` | `#4A6FA5` | Active state borders |

### 2.4 Text Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `text-primary` | `#1A1A1A` | Main headings, primary content (d-black) |
| `text-secondary` | `#4A5568` | Subtitles, descriptions |
| `text-muted` | `#6B7280` | Hints, labels |
| `text-accent` | `#3A5A8A` | Accent text, section headers |

### 2.5 Status Colors (Consistent with Reading V2)

| Status | Background | Border | Text | Dot/Icon |
|--------|------------|--------|------|----------|
| Correct | `#E7F2DD` | `#C9E0B7` | `#2F5E25` | `#4C7A3A` |
| Incorrect | `#FFE4E2` | `#FFD3CF` | `#9E2E2A` | `#C3423F` |
| Unanswered | `#F0F5FA` | `#C5D4E8` | `#4A6FA5` | `#6B89B5` |

### 2.6 Band Score Display

| Token | Hex Code | Usage |
|-------|----------|-------|
| `band-bg` | `#E8EEF7` | Band score card background |
| `band-text` | `#3A5A8A` | Band score value |
| `band-label` | `#4A6FA5` | "Band" label text |

---

## 3. Typography & Spacing

### 3.1 Typography Scale

| Element | Mobile | Tablet+ | Weight | Line Height |
|---------|--------|---------|--------|-------------|
| Page Title | 20rem | 28rem | 700 | 1.2 |
| Section Header | 18rem | 18rem | 600 | 1.3 |
| Section Label | 12rem | 12rem | 600 | 1.4 |
| Body Text | 13rem | 14rem | 400-500 | 1.6 |
| Caption | 11rem | 12rem | 600 | 1.4 |
| Badge Text | 10rem | 11rem | 600 | 1.0 |

### 3.2 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4rem | Inline gaps |
| `space-sm` | 8rem | Small gaps between related elements |
| `space-md` | 12rem | Standard component padding |
| `space-lg` | 16rem | Section gaps |
| `space-xl` | 20rem | Major section separations |
| `space-2xl` | 24rem | Card padding mobile |
| `space-3xl` | 28rem | Card padding desktop |

### 3.3 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8rem | Small badges, inputs |
| `radius-md` | 12rem | Answer cards, buttons |
| `radius-lg` | 16rem | Question blocks |
| `radius-xl` | 20rem | Task description boxes |
| `radius-2xl` | 32rem | Main cards, sections |
| `radius-full` | 999rem | Pills, circular elements |

---

## 4. Layout Structure

### 4.1 Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (Desktop: WritingFeedbackHeader)                     │
│  Title: "Listening Answer Sheet"                             │
├──────────────────────────────────────────────────────────────┤
│  HEADER (Mobile: MobileHeader)                               │
│  Title: "Listening Practice" | Tag: "Answer Sheet V2"        │
│  Variant: 'listening'                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  SCORE SUMMARY CARD                                    │  │
│  │  • Test title & completion date                        │  │
│  │  • Circular progress (correct/total)                   │  │
│  │  • Band score display (blue theme)                     │  │
│  │  • Correct/Incorrect count badges                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  DETAILED REVIEW SECTION                               │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Header: "Detailed Review"                       │  │  │
│  │  │  Subtitle: "Question-by-Question Breakdown"      │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  MOBILE: Overview/Detailed Toggle + Filters Btn  │  │  │
│  │  │  DESKTOP: Part Tabs (1, 2, 3, 4) directly        │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  PART TABS (4 parts)                             │  │  │
│  │  │  [Part 1 (n)] [Part 2 (n)] [Part 3 (n)] [Part 4] │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  PART CONTENT                                    │  │  │
│  │  │  • Task description box (NO View Passage button) │  │  │
│  │  │  • Block sections with question items            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

FLOATING ELEMENTS:
• Back to Top Button (bottom-right)
• Mobile: Navigation Menu Button (bottom-right, above Back to Top)
```

### 4.2 Container Specifications

```css
/* Main container */
max-width: 1180rem;
padding-x: 20rem (mobile) → 48rem (tablet) → 64rem (desktop);
padding-top: 24rem (mobile) → 48rem (tablet) → 56rem (desktop);
padding-bottom: 96rem;
spacing-y: 28rem (mobile) → 40rem (tablet+);
```

---

## 5. Component Specifications

### 5.1 Score Summary Card

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  Results Summary (label)                                     │
│  [Test Title]                                                │
│  Completed on [Date/Time]                                    │
│                                                              │
│        ┌─────────┐    ┌─────────┐                            │
│        │   ○     │    │  Band   │                            │
│        │  XX/YY  │    │   X.X   │                            │
│        └─────────┘    └─────────┘                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌─────────────────┐                   │
│  │ ✓ XX Correct   │    │ ✗ XX Incorrect  │                   │
│  └────────────────┘    └─────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

**Styling:**
```css
/* Card */
border-radius: 32rem;
border: 1px solid #C5D4E8;  /* Blue-tinted border */
background: #FFFFFF;
padding: 24rem (mobile) → 32rem 36rem (tablet);
box-shadow: 0 18rem 48rem -30rem rgba(74, 111, 165, 0.18);

/* Circular Progress */
stroke-track: #C5D4E8;
stroke-progress: #4A6FA5;  /* Blue instead of green */

/* Band Score Box */
background: #E8EEF7;
border-radius: 16rem;
padding: 16rem 12rem;

/* Band Label */
color: #4A6FA5;
font-size: 11rem;
text-transform: uppercase;
letter-spacing: 0.2em;

/* Band Value */
color: #3A5A8A;
font-size: 28rem;
font-weight: 700;
```

### 5.2 Detailed Review Section Header

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  DETAILED REVIEW (uppercase label)                           │
│  Question-by-Question Breakdown (heading)                    │
└──────────────────────────────────────────────────────────────┘
```

**Styling:**
```css
/* Section label */
font-size: 12rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.24em;
color: #4A6FA5;  /* Blue accent */

/* Section heading */
font-size: 18rem;
font-weight: 600;
color: #1A1A1A;
```

### 5.3 Part Tabs (4 Parts)

**Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│  [Part 1 (n)] [Part 2 (n)] [Part 3 (n)] [Part 4 (n)]          │
│       ↑                                                        │
│   Active tab has sliding indicator                             │
└────────────────────────────────────────────────────────────────┘
```

**Key Changes from Reading V2:**
- 4 tabs instead of 3
- Width calculation: `w-[calc(25%-3rem)]` for sliding indicator
- May need horizontal scroll on narrow mobile devices

**Styling:**
```css
/* Container */
background: #F0F5FA;  /* Light blue-tinted */
border-radius: 999rem;
padding: 4rem;

/* Sliding Indicator */
background: #FFFFFF;
box-shadow: 0 6rem 18rem rgba(74, 111, 165, 0.08);
width: calc(25% - 3rem);  /* Adjusted for 4 tabs */

/* Tab Button */
padding: 10rem 8rem (mobile) → 10rem 16rem (tablet);
font-size: 12rem (mobile) → 13rem (tablet);

/* Active Tab Badge */
background: #4A6FA5;  /* Blue */
color: #FFFFFF;

/* Inactive Tab Badge */
background: #C5D4E8/60;
color: #4A6FA5;

/* Focus Ring */
ring-color: #4A6FA5;
```

**Mobile Considerations for 4 Tabs:**
```css
/* If tabs don't fit, enable horizontal scroll */
@media (max-width: 360px) {
  .part-tabs-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    min-width: 280rem;
  }
}
```

### 5.4 Part Content (No Passage)

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  Task Description Box                                        │
│  "Complete the notes below. Write ONE WORD ONLY..."         │
│  (NO View Passage button)                                    │
├──────────────────────────────────────────────────────────────┤
│  Block Section 1                                             │
│  Block Section 2                                             │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

**Styling:**
```css
/* Task Description Box */
background: #F0F5FA;  /* Blue-tinted */
border: 1px solid #C5D4E8/60;
border-radius: 20rem;
padding: 16rem 14rem;

/* Task Text */
font-size: 13rem;
line-height: 1.6;
color: rgba(26, 26, 26, 0.8);
```

### 5.5 Block Section

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Sentence Completion] (badge)    Questions 1-5              │
│  "Write ONE WORD ONLY for each answer."                      │
│                                              [▼ Chevron]     │
├──────────────────────────────────────────────────────────────┤
│  COLLAPSED/EXPANDED CONTENT:                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Hint / Options (if available)                         │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Question Item 1                                       │  │
│  │  Question Item 2                                       │  │
│  │  ...                                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Styling:**
```css
/* Block Container */
border: 1px solid #C5D4E8;
border-radius: 16rem;
background: #FFFFFF;
box-shadow: 0 12rem 32rem -24rem rgba(74, 111, 165, 0.12);

/* Kind Badge */
background: #E8EEF7;  /* Blue-tinted */
padding: 4rem 10rem;
border-radius: 8rem;
font-size: 11rem;
text-transform: uppercase;
letter-spacing: 0.15em;
color: #4A6FA5;

/* Chevron Button */
background: #E8EEF7;
color: #4A6FA5;
size: 32rem;
border-radius: 50%;

/* Hint Box */
background: #F0F5FA/60;
border-radius: 12rem;
padding: 14rem;
margin-bottom: 16rem;
```

### 5.6 Question Item

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  ● Question 1                               [Correct]        │
│    "What is the name of..."                                  │
├──────────────────────────────────────────────────────────────┤
│  EXPANDED:                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────┐  │
│  │  YOUR ANSWER       │  │  CORRECT ANSWER                │  │
│  │  "answer text"     │  │  "correct text"                │  │
│  └────────────────────┘  └────────────────────────────────┘  │
│                                                              │
│  Choices (if multiple choice):                               │
│  [A. option] [B. option ✓] [C. option ✗] [D. option]        │
└──────────────────────────────────────────────────────────────┘
```

**Status Indicator Styling:**
```css
/* Correct */
.status-correct {
  background: #4C7A3A;  /* Keep green for correctness */
}

/* Incorrect */
.status-incorrect {
  background: #C3423F;  /* Red */
}

/* Unanswered */
.status-unanswered {
  background: #6B89B5;  /* Blue-gray */
}
```

**Answer Display:**
```css
/* Your Answer Box - Correct */
background: #E7F2DD;
color: #2F5E25;

/* Your Answer Box - Incorrect */
background: #FFE4E2;
color: #9E2E2A;

/* Your Answer Box - Unanswered */
background: #F0F5FA;
color: #4A6FA5;

/* Correct Answer Box */
background: #E7F2DD;
color: #2F5E25;
```

---

## 6. Mobile Adaptations

### 6.1 Mobile Header
```
variant: 'listening'
title: 'Listening Practice'
tag: 'Answer Sheet V2'
```

The existing `MobileHeader` component already supports the `listening` variant with appropriate border and background colors.

### 6.2 Mobile Tab Toggle (Overview/Detailed)

**Styling:**
```css
/* Toggle Container */
background: #F0F5FA;  /* Blue-tinted */
border-radius: 999rem;
padding: 4rem;

/* Sliding Indicator */
background: #FFFFFF;
box-shadow: 0 6rem 18rem rgba(74, 111, 165, 0.18);

/* Tab Button Active */
color: #1A1A1A;

/* Tab Button Inactive */
color: #4A6FA5/90;

/* Focus Ring */
ring-color: #4A6FA5;
```

### 6.3 Mobile Answer Grid

Same as Reading V2, using the status colors defined above.

```css
/* Grid */
display: grid;
grid-template-columns: repeat(8, 1fr);
gap: 6rem;

/* Cell */
size: 33.35rem;
border-radius: 10rem;
font-size: 12rem;
font-weight: 600;
```

### 6.4 Mobile Filters Button

```css
/* Button */
border: 1px solid #C5D4E8;
border-radius: 999rem;
padding: 8rem 14rem;
font-size: 12rem;
font-weight: 600;
color: #3A5A8A;

/* Count Badge */
background: #E8EEF7;
color: #4A6FA5;
```

### 6.5 Floating Menu Button

```css
/* Button */
position: fixed;
bottom: 32rem;
right: 24rem;
size: 52rem;
border-radius: 50%;
background: #4A6FA5;  /* Blue instead of green */
color: #FFFFFF;
box-shadow: 
  0 8rem 24rem -8rem rgba(74, 111, 165, 0.5),
  0 4rem 12rem -4rem rgba(0, 0, 0, 0.15);

/* Hover */
background: #3A5A8A;

/* Focus Ring */
ring-color: #2D4A75;
```

### 6.6 Mobile Navigation Sheet (Modified)

**Changes from Reading V2:**
- **Remove** "View Passage" button entirely
- Support 4 parts in "Jump to Part" section

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  QUICK ACTIONS (label)                                       │
│  Navigation (heading)                                   [×]  │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │  [Filter Icon]  Filter Questions                       │  │
│  │  Show only correct, incorrect, or unanswered           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  JUMP TO PART                                                │
│  ┌──────────┐ ┌──────────┐                                   │
│  │ Part 1   │ │ Part 2   │                                   │
│  │ n Q's    │ │ n Q's    │                                   │
│  └──────────┘ └──────────┘                                   │
│  ┌──────────┐ ┌──────────┐                                   │
│  │ Part 3   │ │ Part 4   │                                   │
│  │ n Q's    │ │ n Q's    │                                   │
│  └──────────┘ └──────────┘                                   │
└──────────────────────────────────────────────────────────────┘
```

**Part Selection Grid (2x2):**
```css
/* Grid for 4 parts */
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 10rem;

/* Part Button Active */
border: 1px solid #4A6FA5;
background: #E8EEF7;
color: #3A5A8A;

/* Part Button Inactive */
border: 1px solid #C5D4E8;
background: #FFFFFF;
color: #4A5568;
```

---

## 7. Interaction Patterns

### 7.1 Animations

All animations follow the Reading V2 patterns with `useReducedMotion` support:

| Interaction | Duration | Easing | Details |
|-------------|----------|--------|---------|
| Tab Slide | 220ms | easeOut | Sliding indicator animation |
| Section Expand | 250ms | easeInOut | Height + opacity animation |
| Card Hover | 200ms | - | Subtle scale (1.005) |
| Question Focus | - | smooth scroll | scroll-behavior: smooth |
| Count Animation | 1200ms | cubic-bezier | Counting up effect |

### 7.2 Focus States

All interactive elements use:
```css
focus-visible:outline-none;
focus-visible:ring-2;
focus-visible:ring-offset-2;
focus-visible:ring-[#4A6FA5];
```

### 7.3 Scroll Behaviors

- **Back to Top Button:** Appears after 300px scroll
- **Question Focus:** Smooth scroll to centered element
- **Mobile Sheets:** Scroll within sheet content

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | All text meets 4.5:1 ratio minimum |
| Focus Indicators | Visible focus rings on all interactive elements |
| Screen Reader | ARIA labels, roles, and live regions |
| Reduced Motion | Respects `prefers-reduced-motion` |
| Touch Targets | Minimum 44×44px for interactive elements |

### 8.2 ARIA Attributes

```html
<!-- Part Tabs -->
<div role="tablist">
  <button role="tab" aria-selected="true">Part 1</button>
  <button role="tab" aria-selected="false">Part 2</button>
  ...
</div>

<!-- Block Section -->
<button aria-expanded="true/false">...</button>

<!-- Answer Grid -->
<div role="grid" aria-label="Answer overview grid">
  <button role="gridcell" aria-label="Question 1, correct">1</button>
  ...
</div>

<!-- Status Live Region -->
<span aria-live="polite">Showing all questions</span>
```

### 8.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between interactive elements |
| Enter/Space | Activate buttons, expand sections |
| Arrow Keys | Navigate within grids (optional enhancement) |
| Escape | Close bottom sheets |

---

## 9. Key Differences from Reading V2

### 9.1 Summary of Changes

| Aspect | Reading V2 | Listening V2 |
|--------|------------|--------------|
| Parts | 3 (part_1, part_2, part_3) | 4 (part_1, part_2, part_3, part_4) |
| Primary Color | `#4C7A3A` (green) | `#4A6FA5` (blue) |
| Secondary Color | `#E7F2DD` (light green) | `#E8EEF7` (light blue) |
| Passage Feature | Yes (View Passage button + modal) | No |
| Floating Button | Green background | Blue background |
| Tab Width | 33.333% | 25% |
| Nav Sheet | Has passage option | Only filters + parts |
| Question Types | TFNG, Paragraph, Diagram, etc. | Words, Test, Titles, Matching, Checkboxes, Table |

### 9.2 Components to Remove

1. **PassageModal** - Not needed (no text passages)
2. **View Passage Button** in PartContent - Remove entirely
3. **Passage Option** in MobileNavSheet - Remove from quick actions

### 9.3 Components to Modify

1. **PartTabs** - Support 4 parts, adjust width calculations
2. **MobileNavSheet** - 2x2 grid for parts, remove passage option
3. **MobileAnswerGrid** - Update PartKey type to include `part_4`
4. **All color references** - Use blue palette instead of green
5. **ScoreSummaryCard** - Blue-themed band score display

### 9.4 Type Definitions Updates

```typescript
// Update PartKey type
type PartKey = 'part_1' | 'part_2' | 'part_3' | 'part_4';

// Update partCounts type
partCounts: Record<PartKey, number>;

// Update PARTS constant
const PARTS: { key: PartKey; label: string }[] = [
  { key: 'part_1', label: 'Part 1' },
  { key: 'part_2', label: 'Part 2' },
  { key: 'part_3', label: 'Part 3' },
  { key: 'part_4', label: 'Part 4' },
];
```

---

## Appendix A: Component File Structure

```
src/app/[locale]/(protected)/practice/listening/results/[id]/v2/
├── page.tsx
└── _components/
    ├── listening-answer-sheet-v2.tsx      # Main orchestrating component
    ├── score-summary-card.tsx             # Adapted for blue theme
    ├── part-tabs.tsx                      # 4 parts support
    ├── part-content.tsx                   # No passage feature
    ├── block-section.tsx                  # Listening question types
    ├── question-item.tsx                  # Same structure, blue unanswered
    ├── mobile-answer-grid.tsx             # 4-part support
    ├── mobile-filters-sheet.tsx           # Blue theme
    └── mobile-nav-sheet.tsx               # No passage, 2x2 parts
```

---

## Appendix B: Implementation Checklist

- [ ] Create route `src/app/[locale]/(protected)/practice/listening/results/[id]/v2/page.tsx`
- [ ] Adapt ScoreSummaryCard with blue theme
- [ ] Create PartTabs with 4-part support
- [ ] Create PartContent without passage feature
- [ ] Adapt BlockSection with listening KIND_LABELS
- [ ] Adapt QuestionItem with listening-specific handling
- [ ] Create MobileAnswerGrid with 4-part support
- [ ] Create MobileFiltersSheet with blue theme
- [ ] Create MobileNavSheet without passage option, 2x2 parts
- [ ] Add types for Listening V2 to proper type file
- [ ] Connect to API endpoint for Listening V2 results
- [ ] Test all responsive breakpoints
- [ ] Verify accessibility requirements
- [ ] Verify reduced motion support

---

*End of Design Specification*
