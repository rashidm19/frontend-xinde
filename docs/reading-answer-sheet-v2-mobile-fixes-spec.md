# Reading Answer Sheet V2 - Mobile Layout Fixes Design Specification

## Overview
This document provides exact CSS class changes for fixing 8 mobile layout issues in the Reading Answer Sheet V2 page.

---

## Issue 1: Accuracy Bar + Score Band Layout

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/score-summary-card.tsx`

**Line:** ~62 (the container wrapping the circular progress and band score)

**Problem:** The accuracy circle and band score card are laid out with flex + gap, but on mobile they should be centered and visually balanced.

### Current Classes
```tsx
<div className="flex items-center gap-[24rem]">
```

### New Classes
```tsx
<div className="flex w-full items-center justify-center gap-[24rem] tablet:w-auto tablet:justify-start">
```

### Explanation
- **`w-full`**: Makes the container take full width on mobile
- **`justify-center`**: Centers the accuracy ring and band card horizontally on mobile
- **`tablet:w-auto tablet:justify-start`**: Restores original behavior on tablet+

### Alternative (50% width approach)
If you prefer each element to take 50% width:
```tsx
// Parent container
<div className="flex w-full items-center gap-[24rem]">
  // Accuracy ring wrapper
  <div className="relative flex flex-1 items-center justify-center tablet:flex-none">
    // ...circular progress...
  </div>
  // Band score wrapper
  <div className="flex flex-1 flex-col items-center justify-center rounded-[16rem] bg-[#E7F2DD] px-[16rem] py-[12rem] tablet:flex-none">
    // ...band content...
  </div>
</div>
```

---

## Issue 2: Correct/Incorrect Blocks 50% Width

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/score-summary-card.tsx`

**Line:** ~86-93

**Problem:** The correct/incorrect stat badges use `flex-wrap` with `gap-[12rem]`, resulting in variable widths. Need each block to be exactly 50% width on mobile.

### Current Classes

**Container:**
```tsx
<div className="mt-[20rem] flex flex-wrap gap-[12rem] border-t border-[#E1D6B4]/60 pt-[20rem]">
```

**Each badge:**
```tsx
<div className={cn('flex items-center gap-[8rem] rounded-[999rem] px-[14rem] py-[8rem]', 'bg-[#E7F2DD]')}>
```

### New Classes

**Container:**
```tsx
<div className="mt-[20rem] grid grid-cols-2 gap-[12rem] border-t border-[#E1D6B4]/60 pt-[20rem]">
```

**Each badge:**
```tsx
<div className={cn('flex items-center justify-center gap-[8rem] rounded-[999rem] px-[14rem] py-[8rem]', 'bg-[#E7F2DD]')}>
```

### Explanation
- **`grid grid-cols-2`**: Enforces exact 50% width per column
- **`justify-center`** on children: Centers content within each 50% cell
- Removes `flex-wrap` in favor of explicit grid layout

---

## Issue 3: Overview Grid Horizontal Padding

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/mobile-answer-grid.tsx`

**Line:** ~52

**Problem:** The question tiles grid uses `gap-[6rem]` which may need better horizontal spacing.

### Current Classes
```tsx
<div className="grid grid-cols-8 gap-[6rem]" role="grid" aria-label="Answer overview grid">
```

### New Classes
```tsx
<div className="grid grid-cols-8 gap-x-[8rem] gap-y-[6rem]" role="grid" aria-label="Answer overview grid">
```

### Alternative (Responsive columns)
If tiles feel cramped, consider reducing columns on smallest screens:
```tsx
<div className="grid grid-cols-7 gap-[6rem] min-[360px]:grid-cols-8" role="grid" aria-label="Answer overview grid">
```

### Explanation
- **`gap-x-[8rem] gap-y-[6rem]`**: Increases horizontal gap while keeping vertical gap compact
- Alternative uses responsive column count for very narrow screens (< 360px)

---

## Issue 4: Part Tabs Line Break Fix

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/part-tabs.tsx`

**Line:** ~30-41

**Problem:** "Part 1" label + count badge may wrap to 2 lines on small screens.

### Current Classes (button element)
```tsx
<button
  className={cn(
    'relative z-[1] flex flex-1 items-center justify-center gap-[6rem] rounded-[999rem] px-[12rem] py-[10rem] text-[13rem] font-semibold transition tablet:flex-none tablet:px-[20rem]',
    // ...conditional classes
  )}
>
```

### New Classes
```tsx
<button
  className={cn(
    'relative z-[1] flex flex-1 items-center justify-center gap-[4rem] whitespace-nowrap rounded-[999rem] px-[10rem] py-[10rem] text-[12rem] font-semibold transition tablet:gap-[6rem] tablet:px-[20rem] tablet:text-[13rem] tablet:flex-none',
    // ...conditional classes
  )}
>
```

### Additional: Badge classes adjustment

**Current:**
```tsx
<span className="rounded-[999rem] px-[8rem] py-[2rem] text-[11rem] font-semibold transition">
```

**New:**
```tsx
<span className="rounded-[999rem] px-[6rem] py-[2rem] text-[10rem] font-semibold transition tablet:px-[8rem] tablet:text-[11rem]">
```

### Explanation
- **`whitespace-nowrap`**: Prevents text wrapping
- **`gap-[4rem]`**: Reduced gap on mobile (was 6rem)
- **`px-[10rem]`**: Slightly reduced horizontal padding on mobile
- **`text-[12rem]`**: Slightly smaller text on mobile to fit content
- Badge: Smaller padding and font size on mobile to save horizontal space

---

## Issue 5: View Passage Button Full Width

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/part-content.tsx`

**Line:** ~17-28

**Problem:** The "View Passage" button uses `shrink-0 inline-flex` and doesn't take full width on mobile.

### Current Structure & Classes

**Container:**
```tsx
<div className="flex items-center justify-between gap-[12rem]">
  <p className="flex-1 text-[13rem] leading-[1.6] text-d-black/80">{part.task}</p>
  <button className="inline-flex shrink-0 items-center gap-[6rem] ...">
```

### New Structure & Classes

**Container:**
```tsx
<div className="flex flex-col gap-[12rem] tablet:flex-row tablet:items-center tablet:justify-between">
  <p className="text-[13rem] leading-[1.6] text-d-black/80 tablet:flex-1">{part.task}</p>
  <button className="flex w-full items-center justify-center gap-[6rem] rounded-[999rem] bg-[#4C7A3A] px-[14rem] py-[10rem] text-[12rem] font-semibold text-white shadow-[0_8rem_20rem_-12rem_rgba(76,122,58,0.4)] transition hover:bg-[#3C612E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2 tablet:w-auto tablet:shrink-0 tablet:py-[8rem]">
```

### Explanation
- **Container**: Changed to `flex-col` on mobile so elements stack, `tablet:flex-row` restores horizontal layout
- **Task paragraph**: Removed `flex-1` on mobile (not needed when stacked)
- **Button changes:**
  - Removed `inline-flex shrink-0` → Added `flex w-full`
  - Added `justify-center` to center content
  - Added `py-[10rem]` for slightly taller touch target on mobile
  - Added `tablet:w-auto tablet:shrink-0 tablet:py-[8rem]` to restore original tablet+ behavior

---

## Issue 6: Block Metadata Vertical Stacking

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/block-section.tsx`

**Line:** ~49-56

**Problem:** Kind label and question range appear on same line. Need vertical stacking on mobile.

### Current Classes
```tsx
<div className="flex items-center gap-[10rem]">
  <span className="rounded-[8rem] bg-[#F3EDD3] px-[10rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#6F6335]">
    {kindLabel}
  </span>
  <span className="text-[12rem] font-medium text-d-black/50">{questionsRange}</span>
</div>
```

### New Classes
```tsx
<div className="flex flex-col items-start gap-[6rem] tablet:flex-row tablet:items-center tablet:gap-[10rem]">
  <span className="rounded-[8rem] bg-[#F3EDD3] px-[10rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#6F6335]">
    {kindLabel}
  </span>
  <span className="text-[12rem] font-medium text-d-black/50">{questionsRange}</span>
</div>
```

### Explanation
- **`flex-col items-start gap-[6rem]`**: Stack vertically, align left, tighter gap on mobile
- **`tablet:flex-row tablet:items-center tablet:gap-[10rem]`**: Restore horizontal layout on tablet+

---

## Issue 7: Long Task Text Presentation

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/block-section.tsx`

**Line:** ~57

**Problem:** Full task text displayed, may be too long on mobile. Need better presentation.

### Current Classes
```tsx
<p className="text-[14rem] font-medium leading-[1.5] text-d-black">{block.task}</p>
```

### New Classes
```tsx
<p className="text-[13rem] font-medium leading-[1.6] text-d-black/90 tablet:text-[14rem] tablet:leading-[1.5] tablet:text-d-black">{block.task}</p>
```

### Explanation
- **`text-[13rem]`**: Slightly smaller font on mobile (was 14rem)
- **`leading-[1.6]`**: Increased line height for better readability with longer text
- **`text-d-black/90`**: Slightly softer color for easier reading of dense text
- **`tablet:*`**: Restores original styling on tablet+

### Alternative: Line Clamp (if truncation is acceptable)
```tsx
<p className="line-clamp-2 text-[13rem] font-medium leading-[1.6] text-d-black/90 tablet:line-clamp-none tablet:text-[14rem] tablet:leading-[1.5] tablet:text-d-black">{block.task}</p>
```
This would truncate to 2 lines on mobile with ellipsis.

---

## Issue 8: Icon Aspect Ratio Fix

**File:** `src/app/[locale]/(protected)/practice/reading/results/[id]/v2/_components/question-item.tsx`

**Line:** ~71-73

**Problem:** Status icons may appear squished. Need to maintain proper aspect ratio with min-width.

### Current Classes

**Icon container:**
```tsx
<span className={cn('flex size-[28rem] items-center justify-center rounded-full text-white', config.dot)}>
  <StatusIcon className="size-[14rem]" />
</span>
```

### New Classes

**Icon container:**
```tsx
<span className={cn('flex size-[28rem] min-w-[28rem] items-center justify-center rounded-full text-white', config.dot)}>
  <StatusIcon className="size-[14rem] min-w-[14rem] shrink-0" />
</span>
```

### Explanation
- **Container `min-w-[28rem]`**: Prevents container from shrinking below 28rem width
- **Icon `min-w-[14rem] shrink-0`**: Ensures icon never shrinks, maintains aspect ratio
- `shrink-0` on the icon explicitly prevents flex shrinking

---

## Summary Table

| Issue | File | Fix Type | Key Changes |
|-------|------|----------|-------------|
| 1 | score-summary-card.tsx | Centering | `w-full justify-center` |
| 2 | score-summary-card.tsx | Grid layout | `grid grid-cols-2` |
| 3 | mobile-answer-grid.tsx | Gap adjustment | `gap-x-[8rem] gap-y-[6rem]` |
| 4 | part-tabs.tsx | Prevent wrap | `whitespace-nowrap`, smaller sizes |
| 5 | part-content.tsx | Full width | `flex-col` + `w-full` on mobile |
| 6 | block-section.tsx | Vertical stack | `flex-col` on mobile |
| 7 | block-section.tsx | Text sizing | Smaller font, better line-height |
| 8 | question-item.tsx | Aspect ratio | `min-w-*` + `shrink-0` |

---

## Implementation Notes

1. **Breakpoint Reference:** The project uses `tablet:` prefix which maps to tablet breakpoint (typically 768px+)

2. **Unit System:** All values use `rem` units with a custom scale (e.g., `[14rem]`)

3. **Testing:** After implementation, test on:
   - iPhone SE (375px width) - smallest common viewport
   - iPhone 12/13/14 (390px width)
   - iPhone 12/13/14 Plus (428px width)
   - Android common (360px width)

4. **Accessibility:** All fixes maintain or improve touch target sizes (minimum 44px recommended)

5. **RTL Consideration:** None of these fixes impact RTL layout compatibility
