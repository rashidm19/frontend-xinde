# Mobile Speed Selection Design Specification

**Component:** Audio Player - Playback Speed Selection  
**Target:** Mobile viewport (< 768px)  
**Author:** UI/UX Design Specialist  
**Date:** 2025-12-04  
**Status:** Design Review

---

## Executive Summary

This specification redesigns the playback speed selection for mobile users in the Listening Answer Sheet V2 audio player. The current implementation displays all 6 speed buttons (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x) in a horizontal row with flex-wrap, which creates a cluttered UI and consumes excessive vertical space on mobile devices.

**Recommended Solution:** BottomSheet pattern (consistent with existing app patterns like MobileFiltersSheet and MobileNavSheet)

---

## Design Decision Rationale

### Why BottomSheet over Select/Dropdown

| Criteria | BottomSheet | Select/Dropdown |
|----------|-------------|-----------------|
| Touch target size | ✅ Full-width options, excellent | ⚠️ Smaller tap targets |
| Gesture support | ✅ Swipe-to-dismiss, native feel | ❌ No gesture support |
| App consistency | ✅ Used in MobileFiltersSheet, MobileNavSheet | ⚠️ Less common pattern in app |
| Visual feedback | ✅ Clear active state, animation | ⚠️ Standard checkbox indicator |
| Mobile UX | ✅ Thumb-friendly, bottom sheet paradigm | ⚠️ Popover can obscure content |

**Decision: BottomSheet** — Provides superior mobile UX while maintaining design system consistency.

---

## Component Specifications

### 1. Trigger Button

The trigger replaces the current row of 6 buttons with a single compact button showing the active speed.

#### Visual Design

```
┌─────────────────────────┐
│  ⚡  1x  ⌄             │
└─────────────────────────┘
```

#### Specifications

| Property | Value | Notes |
|----------|-------|-------|
| Layout | Horizontal: Icon + Rate text + Chevron | Flex row, centered items |
| Width | Auto (min 80rem) | Content-driven width |
| Height | 44rem | WCAG minimum touch target |
| Background | `#F3EDD3` | App secondary yellow |
| Border | 1px solid `#E1D6B4` | Subtle definition |
| Border Radius | 999rem | Full pill shape |
| Padding | `10rem 14rem 10rem 12rem` | Left-Icon-Text-Chevron-Right |

#### Typography

| Element | Font Size | Font Weight | Color |
|---------|-----------|-------------|-------|
| Speed rate (e.g., "1x") | 13rem | 600 (semibold) | `#6F6335` |

#### Icon Specifications

| Icon | Size | Color | Position |
|------|------|-------|----------|
| Speed indicator (Gauge or Zap) | 16rem × 16rem | `#6F6335` | Left, gap 6rem |
| Chevron down | 14rem × 14rem | `#85784A` | Right, gap 6rem |

#### States

**Default:**
```css
background: #F3EDD3;
border: 1px solid #E1D6B4;
```

**Hover/Press:**
```css
background: #E1D6B4;
```

**Focus visible:**
```css
outline: none;
ring: 2px solid #8E7B45;
ring-offset: 2px;
```

---

### 2. Speed Selection BottomSheet

When the trigger is tapped, a bottom sheet slides up with all speed options.

#### Sheet Container

| Property | Value | Notes |
|----------|-------|-------|
| Max height | 60dvh | Shorter than filters sheet |
| Background | white/95 with backdrop-blur-lg | App standard |
| Border radius | 32rem (top corners) | App standard |
| Shadow | `0 -4px 24px rgba(0,0,0,0.1)` | App standard |
| Padding bottom | `env(safe-area-inset-bottom)` | iOS safe area |

#### Sheet Layout

```
┌──────────────────────────────────┐
│           ═══════                │  ← Drag handle (6rem × 80rem)
│                                  │
│  PLAYBACK SPEED           ╳     │  ← Header with close button
│  Choose your preferred rate      │
│                                  │
│  ┌────────────────────────────┐ │
│  │  ○  0.5x              Slow  │ │  ← Speed option
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  ○  0.75x                   │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  ●  1x              Normal ●│ │  ← Active option (filled)
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  ○  1.25x                   │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  ○  1.5x                    │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  ○  2x               Fast   │ │
│  └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

#### Header Section

| Property | Value |
|----------|-------|
| Padding | `14rem 16rem` |
| Border bottom | 1px solid `#E1D6B4` |
| Background | white/95 backdrop-blur |

**Header title:**
| Property | Value |
|----------|-------|
| Text | "Playback Speed" |
| Font size | 18rem |
| Font weight | 600 |
| Color | `#1A1A1A` (d-black) |

**Header subtitle:**
| Property | Value |
|----------|-------|
| Text | "Choose your preferred rate" |
| Font size | 13rem |
| Font weight | 400 |
| Color | `rgba(26,26,26,0.65)` |

**Close button:**
| Property | Value |
|----------|-------|
| Size | 32rem × 32rem |
| Background | white |
| Border | 1px solid `#D9CDA9` |
| Border radius | 50% |
| Icon | "×" at 16rem |
| Color | `#6F6335` |

---

### 3. Speed Option Items

Each speed option is a full-width button with clear active/inactive states.

#### Layout

| Property | Value |
|----------|-------|
| Width | 100% |
| Height | Auto (min 56rem) |
| Padding | `16rem 18rem` |
| Margin between | 10rem |
| Border radius | 16rem |
| Display | Flex, justify-between, align-center |

#### Content Structure

```
┌─────────────────────────────────────────┐
│  [Radio]   Rate Label        [Helper]  │
│    ●        1x               Normal    │
└─────────────────────────────────────────┘
```

**Left side:**
- Radio indicator (visual only, 20rem circle)
- Rate label (e.g., "0.5x", "1x", "2x")

**Right side:**
- Optional helper text for edge speeds

#### Speed Options Data

| Rate | Label | Helper Text |
|------|-------|-------------|
| 0.5 | 0.5x | Slow |
| 0.75 | 0.75x | — |
| 1 | 1x | Normal |
| 1.25 | 1.25x | — |
| 1.5 | 1.5x | — |
| 2 | 2x | Fast |

#### Inactive Option Styles

| Property | Value |
|----------|-------|
| Background | `#FFFDF0` |
| Border | 1px solid `#E1D6B4` |
| Radio circle | 20rem, border 2px `#D9CDA9`, bg transparent |
| Rate text | 15rem semibold `#4B4628` |
| Helper text | 13rem regular `#85784A` |

#### Active Option Styles

| Property | Value |
|----------|-------|
| Background | `#F0F6E8` |
| Border | 1px solid `#5e7a3f` |
| Radio circle | 20rem, bg `#4C7A3A`, inner dot 10rem white |
| Rate text | 15rem semibold `#2F5E25` |
| Helper text | 13rem regular `#4C7A3A` |

#### Option States

**Hover/Press (inactive):**
```css
background: #F5ECCC;
```

**Focus visible:**
```css
outline: none;
ring: 2px solid #8E7B45;
ring-offset: 2px;
```

---

## Interaction Flow

### Opening the Sheet

1. User taps the speed trigger button
2. Sheet slides up from bottom (spring animation, 250ms)
3. Overlay fades in (150ms)
4. Focus moves to the sheet container
5. Current speed option is visually highlighted

### Selecting a Speed

1. User taps a speed option
2. Option immediately shows active state
3. Audio playback rate updates
4. Sheet auto-closes (200ms slide down)
5. Trigger button updates to show new speed
6. Focus returns to trigger button

### Dismissing Without Selection

**Methods:**
- Tap close button (×)
- Tap overlay
- Swipe down gesture (threshold: 25% height or velocity > 700px/s)
- Press Escape key (if keyboard connected)

**Animation:**
- Sheet slides down (200ms ease-in-out)
- Overlay fades out (120ms)

---

## Animation Specifications

### Sheet Enter

```javascript
{
  initial: { y: '100%' },
  animate: { 
    y: 0,
    transition: { 
      type: 'spring', 
      duration: 0.25, 
      damping: 22, 
      stiffness: 320 
    }
  }
}
```

### Sheet Exit

```javascript
{
  exit: { 
    y: '100%',
    transition: { 
      duration: 0.2, 
      ease: 'easeInOut' 
    }
  }
}
```

### Option Selection

```javascript
// Immediate state change, no delay
// Consider subtle scale pulse on selection
{
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
}
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Touch targets | All interactive elements ≥ 44rem × 44rem |
| Color contrast | Text colors meet 4.5:1 ratio |
| Focus indicators | 2px ring with offset |
| Screen reader | Proper ARIA roles and labels |
| Reduced motion | Respect `prefers-reduced-motion` |

### ARIA Implementation

**Trigger button:**
```jsx
<button
  type="button"
  aria-haspopup="dialog"
  aria-expanded={isOpen}
  aria-label={`Playback speed: ${currentRate}x. Tap to change`}
>
```

**Sheet:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="speed-sheet-title"
>
```

**Options (radio group pattern):**
```jsx
<div role="radiogroup" aria-label="Playback speed options">
  <button
    role="radio"
    aria-checked={isActive}
    aria-label={`${rate}x speed${helper ? `, ${helper}` : ''}`}
  >
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus between interactive elements |
| Enter/Space | Select focused option, close sheet |
| Escape | Close sheet without selection |
| Arrow Up/Down | Navigate between speed options |

---

## Responsive Behavior

### Breakpoint Transition

| Viewport | Behavior |
|----------|----------|
| < 768px (mobile) | BottomSheet with trigger button |
| ≥ 768px (tablet+) | Current inline button row (unchanged) |

The component should use `useMediaQuery('(max-width: 767px)')` to conditionally render either:
- **Mobile:** Trigger + BottomSheet
- **Desktop/Tablet:** Current inline 6-button row

---

## Component Props Interface

```typescript
interface SpeedSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRate: number;
  onRateChange: (rate: number) => void;
}

interface SpeedTriggerProps {
  currentRate: number;
  onClick: () => void;
}
```

---

## Visual Reference: Existing Patterns

The design follows established patterns from:

1. **MobileFiltersSheet** (`listening-answer-sheet-v2/mobile-filters-sheet.tsx`)
   - Same header structure
   - Same option button layout
   - Same active/inactive states

2. **AudioPlayer inline controls** (`audio-player.tsx`)
   - Same color tokens
   - Same button styling patterns
   - Same typography scale

---

## Implementation Notes

1. **Reuse existing BottomSheet component** from `src/components/ui/bottom-sheet.tsx`
2. **Extract speed options** to a constant array for maintainability
3. **Preserve keyboard navigation** within the sheet using arrow keys
4. **Test with VoiceOver/TalkBack** for screen reader compatibility
5. **Ensure smooth transition** between mobile/desktop layouts

---

## Approval Checklist

- [ ] Design spec reviewed by Product Manager
- [ ] Accessibility requirements verified
- [ ] Animation timing approved
- [ ] Mobile viewport tested (320px - 767px)
- [ ] Developer handoff complete

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Initial design specification | UI/UX Design Specialist |
