# Reading Answer Sheet V2 - Mobile UX/UI Design Specification

> **Version:** 1.0  
> **Target Route:** `/[locale]/(protected)/practice/reading/results/[id]/v2`  
> **Breakpoint:** Mobile < 768px (`max-width: 767px`)  
> **Last Updated:** November 2025

---

## 1. Executive Summary

This specification defines the mobile-specific UX/UI patterns for the Reading Answer Sheet V2 page. The design brings sophisticated mobile patterns from V1 (tab switcher, answer tiles grid, filter sheet) while preserving V2's unique part-based question breakdown structure.

### Design Goals
1. **Quick Scanning** - Answer tiles grid for at-a-glance performance overview
2. **Progressive Disclosure** - Tab-based navigation between overview and detailed views
3. **Touch Optimization** - 44px minimum touch targets, comfortable spacing
4. **Reduced Cognitive Load** - Single-open accordion for focused review
5. **Contextual Actions** - Floating navigation for quick access to common actions

---

## 2. Mobile Layout Architecture

### 2.1 Overall Structure

```
┌─────────────────────────────────────────────────────────┐
│  MOBILE HEADER                                          │
│  [←] Reading Practice | Answer Sheet V2 | [Exit]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           SCORE SUMMARY CARD                    │    │
│  │   6/40 correct • Band 2.5 • 15% accuracy        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           MOBILE TAB SWITCHER                   │    │
│  │  ┌─────────────┐ ┌─────────────┐                │    │
│  │  │  Overview   │ │  Detailed   │  [Filters 40]  │    │
│  │  └─────────────┘ └─────────────┘                │    │
│  │  (animated sliding indicator)                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  OVERVIEW TAB:                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Showing: All]                                 │    │
│  │  ┌──┬──┬──┬──┬──┬──┬──┬──┐                      │    │
│  │  │01│02│03│04│05│06│07│08│ (Answer Tiles)       │    │
│  │  ├──┼──┼──┼──┼──┼──┼──┼──┤                      │    │
│  │  │09│10│11│12│13│14│15│16│                      │    │
│  │  ├──┼──┼──┼──┼──┼──┼──┼──┤                      │    │
│  │  │...                     │                      │    │
│  │  └──┴──┴──┴──┴──┴──┴──┴──┘                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  DETAILED TAB:                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PART NAVIGATION (Horizontal Pills)             │    │
│  │  [Part 1 (13)] [Part 2 (14)] [Part 3 (13)]     │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Part 1 Content                                 │    │
│  │  Task description + View Passage button         │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │ Block 1: True/False/Not Given (Q1-7)      │  │    │
│  │  │ ┌───────────────────────────────────────┐ │  │    │
│  │  │ │ Q1 [✓] Correct                        │ │  │    │
│  │  │ └───────────────────────────────────────┘ │  │    │
│  │  │ ┌───────────────────────────────────────┐ │  │    │
│  │  │ │ Q2 [✗] Incorrect  ▼ (expanded)        │ │  │    │
│  │  │ │ Your: False | Correct: True           │ │  │    │
│  │  │ └───────────────────────────────────────┘ │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  [FLOATING ACTION BUTTON] ●                             │
│  Bottom-right, fixed position                           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Mobile Tab Switcher

**Purpose:** Toggle between quick answer overview and detailed part-by-part breakdown.

#### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────┐  ┌───────────┐   │
│  │ ┌──────────────┐ ┌──────────────┐     │  │ Filters   │   │
│  │ │   Overview   │ │   Detailed   │     │  │    40     │   │
│  │ └──────────────┘ └──────────────┘     │  └───────────┘   │
│  │ [═══════════════]                     │                  │
│  │ (sliding indicator under active tab)  │                  │
│  └───────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

#### Specifications

**Container:**
```css
.tab-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: between;
  width: 100%;
  max-width: 260rem;
  padding: 4rem;
  background: rgba(var(--d-yellow-secondary), 0.7);
  border-radius: 999rem;
}
```

**Sliding Indicator:**
```typescript
// Framer Motion animation
<motion.span
  initial={false}
  animate={{ x: `${activeTabIndex * 100}%` }}
  transition={{ duration: 0.22, ease: 'easeOut' }}
  className="absolute bottom-[4rem] top-[4rem] w-1/2 rounded-[999rem] bg-white shadow-[0_6rem_18rem_rgba(0,0,0,0.08)]"
/>
```

**Tab Button:**
```css
.tab-button {
  position: relative;
  z-index: 1;
  width: 50%;
  padding: 8rem 16rem;
  font-size: 13rem;
  font-weight: 600;
  color: #4B4628;
  background: transparent;
  border-radius: 999rem;
  transition: color 0.15s ease;
}

.tab-button[data-state="active"] {
  color: var(--d-black);
}

.tab-button:focus-visible {
  outline: none;
  ring: 2px solid #8E7B45;
  ring-offset: 1px;
}
```

**Filter Button (beside tabs):**
```css
.filter-button {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 8rem 14rem;
  font-size: 12rem;
  font-weight: 600;
  color: #4B4628;
  background: transparent;
  border: 1px solid #E1D6B4;
  border-radius: 999rem;
  transition: background 0.15s ease;
}

.filter-button:hover {
  background: rgba(var(--d-yellow-secondary), 1);
}

.filter-count-badge {
  padding: 2rem 8rem;
  font-size: 11rem;
  font-weight: 600;
  color: #6F6335;
  background: #F5ECCC;
  border-radius: 999rem;
}
```

#### Interaction States
| State | Styling |
|-------|---------|
| Default | Tab text `#4B4628`, no indicator |
| Active | Tab text `#1A1A1A`, white indicator slide |
| Hover | Subtle text darken |
| Focus | `ring-2 ring-[#8E7B45] ring-offset-1` |

#### Animation Timing
- Indicator slide: `duration: 220ms`, `ease: easeOut`
- Respect `prefers-reduced-motion`: Set `duration: 0` when reduced motion enabled

---

### 3.2 Answer Tiles Grid (Overview Tab)

**Purpose:** Visual grid showing all 40 questions with color-coded status for quick scanning.

#### Visual Design
```
┌──────────────────────────────────────────────────────────────┐
│  Showing: All                                                │
│  ┌────┬────┬────┬────┬────┬────┬────┬────┐                   │
│  │ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │ 07 │ 08 │                   │
│  │ 🟢 │ 🟡 │ 🔴 │ 🟢 │ 🔴 │ 🔴 │ 🟡 │ 🟢 │                   │
│  ├────┼────┼────┼────┼────┼────┼────┼────┤                   │
│  │ 09 │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │                   │
│  │ 🔴 │ 🟢 │ 🟡 │ 🔴 │ 🟢 │ 🟡 │ 🔴 │ 🔴 │                   │
│  ├────┼────┼────┼────┼────┼────┼────┼────┤                   │
│  │ ... (continues to 40)                  │                   │
│  └────┴────┴────┴────┴────┴────┴────┴────┘                   │
└──────────────────────────────────────────────────────────────┘
```

#### Grid Specifications

**Container:**
```css
.tiles-container {
  display: flex;
  flex-direction: column;
  gap: 12rem;
  padding: 16rem 12rem;
  background: rgba(var(--d-yellow-secondary), 0.2);
  border: 1px solid rgba(#E1D6B4, 0.6);
  border-radius: 24rem;
}
```

**Active Filter Badge:**
```css
.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  width: fit-content;
  padding: 6rem 12rem;
  font-size: 12rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #6F6335;
  background: white;
  border-radius: 999rem;
}
```

**Grid Layout:**
```css
.tiles-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6rem;
}

/* For smaller screens (< 360px) */
@media (max-width: 359px) {
  .tiles-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

**Individual Tile:**
```css
.answer-tile {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36rem;
  min-height: 36rem; /* Ensures 44px touch target with gap */
  font-size: 12rem;
  font-weight: 600;
  border-radius: 8rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.answer-tile:active {
  transform: scale(0.95);
}
```

#### Status Color Tokens

| Status | Background | Text | Border | Dot Color |
|--------|------------|------|--------|-----------|
| Correct | `#E7F2DD` | `#2F5E25` | `#C9E0B7` | `#4C7A3A` |
| Incorrect | `#FFE4E2` | `#9E2E2A` | `#FFD3CF` | `#C3423F` |
| Unanswered | `#f7f3da` | `#6F6335` | `#E8DCAC` | `#85784A` |
| Filtered Out | `#F5F3E8` | `#B5AC8A` | `#E1D6B4` | — |

#### Tile Interaction

**Tap Behavior:**
1. Tap tile → Switch to "Detailed" tab
2. Scroll to the corresponding question
3. Expand the question accordion

**Implementation:**
```typescript
const handleTilePress = (questionNumber: number) => {
  // 1. Switch tab
  setActiveMobileTab('detailed');
  
  // 2. Set pending focus (processed after tab animation)
  setPendingFocus(questionNumber);
};

// In useEffect, after tab switch completes:
useEffect(() => {
  if (pendingFocus !== null && activeMobileTab === 'detailed') {
    const questionNumber = pendingFocus;
    setPendingFocus(null);
    
    requestAnimationFrame(() => {
      scrollToQuestion(questionNumber);
      expandQuestion(questionNumber);
    });
  }
}, [pendingFocus, activeMobileTab]);
```

#### Animation
- Entry: Staggered fade-in (50ms between tiles)
- Tap: `scale: 0.95` on press
- Filter change: Crossfade tiles (200ms)

---

### 3.3 Mobile Part Navigation (Detailed Tab)

**Purpose:** Navigate between Part 1, 2, 3 within the detailed view.

#### Design Option A: Horizontal Pill Tabs (Recommended)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐            │ │
│  │ │  Part 1    │ │  Part 2    │ │  Part 3    │            │ │
│  │ │   (13)     │ │   (14)     │ │   (13)     │            │ │
│  │ └────────────┘ └────────────┘ └────────────┘            │ │
│  │ [══════════════]                                         │ │
│  │ (sliding indicator)                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Specifications:**
```css
.part-nav-container {
  position: relative;
  display: flex;
  width: 100%;
  padding: 4rem;
  background: rgba(var(--d-yellow-secondary), 0.7);
  border-radius: 999rem;
}

.part-nav-indicator {
  position: absolute;
  bottom: 4rem;
  left: 4rem;
  top: 4rem;
  width: calc(33.333% - 2.67rem);
  background: white;
  border-radius: 999rem;
  box-shadow: 0 6rem 18rem rgba(0, 0, 0, 0.08);
}

.part-button {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rem;
  padding: 10rem 12rem;
  font-size: 13rem;
  font-weight: 600;
  color: #4B4628;
  background: transparent;
  border-radius: 999rem;
}

.part-button[data-active="true"] {
  color: var(--d-black);
}

.part-count-badge {
  padding: 2rem 8rem;
  font-size: 11rem;
  font-weight: 600;
  border-radius: 999rem;
  transition: all 0.2s ease;
}

.part-count-badge[data-active="true"] {
  background: #4C7A3A;
  color: white;
}

.part-count-badge[data-active="false"] {
  background: rgba(#E1D6B4, 0.6);
  color: #6F6335;
}
```

#### Design Option B: Part Selector Bottom Sheet

Alternative for more detailed part info:

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Part 1 • 13 questions                         [▼]      │ │
│  │  2 correct • 5 incorrect • 6 unanswered                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Bottom Sheet (when opened):
┌──────────────────────────────────────────────────────────────┐
│  SELECT PART                                           [X]   │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Part 1                                  [ACTIVE] →    │  │
│  │  13 questions • 2✓ • 5✗ • 6○                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Part 2                                           →    │  │
│  │  14 questions • 3✓ • 7✗ • 4○                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Part 3                                           →    │  │
│  │  13 questions • 1✓ • 4✗ • 8○                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Recommendation:** Use Option A (Pill Tabs) for V2 to maintain consistency with V1's tab patterns and reduce interaction steps.

---

### 3.4 Mobile Filter Sheet

**Purpose:** Filter questions by status (All, Correct, Incorrect, Unanswered).

#### Visual Design
```
┌──────────────────────────────────────────────────────────────┐
│  FILTERS                                               [X]   │
│  Focus your review                                           │
│  Choose which answers you want to scan in the overview.      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  All questions                                    40   │  │
│  │  [✓ SELECTED - green border/bg]                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Correct                                           6   │  │
│  │  [ ] Not selected                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Incorrect                                        24   │  │
│  │  [ ] Not selected                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Unanswered                                       10   │  │
│  │  [ ] Not selected                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Specifications

**Sheet Container:**
```css
/* Uses existing BottomSheet component */
.filter-sheet-content {
  padding: 4rem;
}

.filter-sheet-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
  padding: 14rem 12rem;
  background: rgba(white, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #E1D6B4;
}

.filter-sheet-title {
  font-size: 18rem;
  font-weight: 600;
  color: var(--d-black);
}

.filter-sheet-subtitle {
  font-size: 13rem;
  color: rgba(var(--d-black), 0.65);
}
```

**Filter Option Button:**
```css
.filter-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14rem 18rem;
  font-size: 14rem;
  font-weight: 500;
  text-align: left;
  border: 1px solid #E1D6B4;
  border-radius: 20rem;
  transition: all 0.2s ease;
}

.filter-option:hover {
  background: rgba(var(--d-yellow-secondary), 0.5);
}

.filter-option[aria-pressed="true"] {
  background: #F0F6E8;
  border-color: #5e7a3f;
  color: #2F5E25;
}

.filter-option-count {
  font-size: 13rem;
  font-weight: 600;
  color: #85784A;
}
```

**Close Button:**
```css
.filter-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32rem;
  height: 32rem;
  min-width: 32rem;
  font-size: 16rem;
  font-weight: 600;
  color: #6F6335;
  background: white;
  border: 1px solid #D9CDA9;
  border-radius: 50%;
  transition: background 0.15s ease;
}

.filter-close-button:hover {
  background: rgba(var(--d-yellow-secondary), 0.6);
}
```

#### Behavior
- Opening: Slide up from bottom, backdrop fade in
- Selection: Tap option → Apply filter → Auto-close sheet
- Close: Tap X button or drag sheet down

---

### 3.5 Question Accordion - Single-Open Mode

**Purpose:** Ensure only one question is expanded at a time on mobile for focused review.

#### Behavior Specification

```typescript
// State management
const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

// Toggle handler
const handleToggleQuestion = (questionNumber: number) => {
  setExpandedQuestionId(prev => 
    prev === questionNumber ? null : questionNumber
  );
};
```

#### Visual Adjustments for Mobile

**Question Header (Collapsed):**
```css
.question-header-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rem;
  width: 100%;
  padding: 12rem 14rem;
  text-align: left;
  min-height: 52rem; /* Touch target */
}

.question-number-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26rem;
  height: 26rem;
  font-size: 12rem;
  font-weight: 600;
  color: white;
  border-radius: 50%;
}

.question-preview {
  flex: 1;
  font-size: 13rem;
  color: rgba(var(--d-black), 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-status-pill {
  padding: 4rem 10rem;
  font-size: 11rem;
  font-weight: 600;
  border-radius: 999rem;
  white-space: nowrap;
}
```

**Question Content (Expanded):**
```css
.question-content-mobile {
  padding: 12rem 14rem;
  border-top: 1px solid rgba(#E1D6B4, 0.4);
}

.answer-comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rem;
}

.answer-box {
  padding: 10rem 12rem;
  border-radius: 10rem;
}

.answer-label {
  font-size: 10rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #85784A;
}

.answer-value {
  margin-top: 4rem;
  font-size: 14rem;
  font-weight: 500;
}
```

#### Animation
```typescript
// Expand/collapse animation
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

### 3.6 Floating Navigation Button (FAB)

**Purpose:** Quick access to common actions: View Passage, Filters, Jump to Part.

#### Visual Design
```
                                              ┌─────────────┐
                                              │             │
                                              │     ☰      │
                                              │             │
                                              └─────────────┘
                                              Fixed bottom-right
```

#### FAB Specifications
```css
.floating-nav-button {
  position: fixed;
  bottom: 24rem;
  right: 20rem;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rem;
  height: 52rem;
  background: #4C7A3A;
  border-radius: 50%;
  box-shadow: 0 8rem 24rem -8rem rgba(76, 122, 58, 0.5),
              0 4rem 12rem -4rem rgba(0, 0, 0, 0.15);
  color: white;
  transition: transform 0.2s ease, background 0.2s ease;
}

.floating-nav-button:hover {
  background: #3C612E;
}

.floating-nav-button:active {
  transform: scale(0.95);
}

.floating-nav-button-icon {
  width: 22rem;
  height: 22rem;
}
```

#### FAB Menu (Bottom Sheet)
```
┌──────────────────────────────────────────────────────────────┐
│  QUICK ACTIONS                                         [X]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  📖 View Passage                                   →   │  │
│  │  Read the full reading passage for this part           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  🔍 Filter Questions                               →   │  │
│  │  Show only correct, incorrect, or unanswered           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ────────────────────────────────────────────────────────    │
│  JUMP TO PART                                                │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │   Part 1     │ │   Part 2     │ │   Part 3     │          │
│  │   13 Q's     │ │   14 Q's     │ │   13 Q's     │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Menu Item Specifications
```css
.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 14rem;
  width: 100%;
  padding: 14rem 16rem;
  text-align: left;
  border: 1px solid #E1D6B4;
  border-radius: 16rem;
  transition: background 0.15s ease;
}

.fab-menu-item:hover {
  background: rgba(var(--d-yellow-secondary), 0.4);
}

.fab-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rem;
  height: 36rem;
  background: rgba(var(--d-yellow-secondary), 0.7);
  border-radius: 10rem;
}

.fab-menu-label {
  font-size: 14rem;
  font-weight: 600;
  color: var(--d-black);
}

.fab-menu-description {
  font-size: 12rem;
  color: rgba(var(--d-black), 0.6);
}
```

#### Part Jump Buttons
```css
.part-jump-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rem;
}

.part-jump-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
  padding: 12rem 10rem;
  font-size: 13rem;
  font-weight: 600;
  color: #4B4628;
  background: white;
  border: 1px solid #E1D6B4;
  border-radius: 12rem;
  transition: all 0.15s ease;
}

.part-jump-button[data-active="true"] {
  background: #F0F6E8;
  border-color: #5e7a3f;
  color: #2F5E25;
}

.part-jump-count {
  font-size: 11rem;
  font-weight: 500;
  color: #85784A;
}
```

---

## 4. Data Flow and State Management

### 4.1 Mobile-Specific State

```typescript
interface MobileState {
  // Tab switcher
  activeMobileTab: 'overview' | 'detailed';
  
  // Part navigation (detailed tab)
  activePart: 'part_1' | 'part_2' | 'part_3';
  
  // Filters
  activeFilter: 'all' | 'correct' | 'incorrect' | 'unanswered';
  
  // Accordion (single-open)
  expandedQuestionId: number | null;
  
  // Sheet states
  filtersSheetOpen: boolean;
  fabMenuOpen: boolean;
  passageModalOpen: boolean;
  
  // Navigation state
  pendingFocus: number | null; // Question to scroll to after tab switch
}
```

### 4.2 Question Normalization for Tiles

```typescript
interface NormalizedQuestion {
  number: number;          // 1-40
  status: 'correct' | 'incorrect' | 'unanswered';
  partKey: 'part_1' | 'part_2' | 'part_3';
  blockIndex: number;
}

// Flatten all questions from all parts for tiles grid
function normalizeQuestionsForTiles(data: PracticeReadingResultV2): NormalizedQuestion[] {
  const questions: NormalizedQuestion[] = [];
  
  (['part_1', 'part_2', 'part_3'] as const).forEach(partKey => {
    const part = data.reading[partKey];
    part.blocks.forEach((block, blockIndex) => {
      const blockQuestions = getQuestionsFromBlock(block);
      blockQuestions.forEach(q => {
        const status = !q.user_answer || q.user_answer.trim() === '' 
          ? 'unanswered' 
          : q.correct 
            ? 'correct' 
            : 'incorrect';
        
        questions.push({
          number: q.number,
          status,
          partKey,
          blockIndex,
        });
      });
    });
  });
  
  return questions.sort((a, b) => a.number - b.number);
}
```

### 4.3 Filter Counts

```typescript
interface FilterCounts {
  all: number;
  correct: number;
  incorrect: number;
  unanswered: number;
}

function calculateFilterCounts(questions: NormalizedQuestion[]): FilterCounts {
  return {
    all: questions.length,
    correct: questions.filter(q => q.status === 'correct').length,
    incorrect: questions.filter(q => q.status === 'incorrect').length,
    unanswered: questions.filter(q => q.status === 'unanswered').length,
  };
}
```

---

## 5. Interaction Flows

### 5.1 Tile → Question Navigation Flow

```
User taps tile Q16 in Overview
         │
         ▼
┌────────────────────────────┐
│ 1. Set activeMobileTab =   │
│    'detailed'              │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 2. Set pendingFocus = 16   │
└────────────────────────────┘
         │
         ▼ (after tab animation)
┌────────────────────────────┐
│ 3. Determine which part    │
│    Q16 belongs to          │
│    (e.g., Part 2)          │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 4. Set activePart =        │
│    'part_2'                │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 5. Scroll to Q16 element   │
│    with offset for header  │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 6. Set expandedQuestionId  │
│    = 16                    │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 7. Clear pendingFocus      │
└────────────────────────────┘
```

### 5.2 Filter Application Flow

```
User taps "Filters" button
         │
         ▼
┌────────────────────────────┐
│ Open filtersSheetOpen      │
└────────────────────────────┘
         │
         ▼
User selects "Incorrect"
         │
         ▼
┌────────────────────────────┐
│ 1. Set activeFilter =      │
│    'incorrect'             │
│ 2. Close filter sheet      │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ 3. Tiles grid filters to   │
│    show only incorrect     │
│    (others dimmed/hidden)  │
└────────────────────────────┘
```

---

## 6. Touch and Accessibility

### 6.1 Touch Targets

| Element | Minimum Size | Actual Size |
|---------|--------------|-------------|
| Tab buttons | 44px | 48rem (with padding) |
| Answer tiles | 44px | 36rem + 6rem gap = 42rem |
| Filter options | 44px | 56rem (height) |
| Accordion headers | 44px | 52rem (min-height) |
| FAB | 44px | 52rem |
| Close buttons | 44px | 44rem |

### 6.2 ARIA Implementation

**Tab Switcher:**
```html
<div role="tablist" aria-label="View mode">
  <button role="tab" aria-selected="true" aria-controls="overview-panel" id="overview-tab">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="detailed-panel" id="detailed-tab">
    Detailed
  </button>
</div>
<div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
  <!-- Overview content -->
</div>
<div role="tabpanel" id="detailed-panel" aria-labelledby="detailed-tab" hidden>
  <!-- Detailed content -->
</div>
```

**Answer Tiles:**
```html
<div role="grid" aria-label="Answer overview grid">
  <div role="row">
    <button 
      role="gridcell" 
      aria-label="Question 1, Correct"
      onClick={() => focusQuestion(1)}
    >
      1
    </button>
    <!-- ... -->
  </div>
</div>
```

**Filter Sheet:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="filter-title">
  <h2 id="filter-title">Filters</h2>
  <div role="radiogroup" aria-label="Filter by status">
    <button role="radio" aria-checked="true">All questions</button>
    <button role="radio" aria-checked="false">Correct</button>
    <!-- ... -->
  </div>
</div>
```

**Accordion:**
```html
<button 
  aria-expanded="false" 
  aria-controls="question-16-content"
  id="question-16-header"
>
  Question 16
</button>
<div 
  id="question-16-content" 
  role="region" 
  aria-labelledby="question-16-header"
  hidden
>
  <!-- Question details -->
</div>
```

### 6.3 Focus Management

1. **Tab switch:** Focus moves to first interactive element in new tab panel
2. **Filter sheet close:** Focus returns to filter button
3. **Question expand:** Focus remains on header button
4. **FAB menu close:** Focus returns to FAB button
5. **Tile tap → Question:** Focus moves to expanded question

### 6.4 Reduced Motion

```typescript
const shouldReduceMotion = useReducedMotion() ?? false;

// All animations conditional
<motion.div
  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
/>
```

---

## 7. Responsive Behavior

### 7.1 Breakpoint Detection

```typescript
// Use existing pattern from V1
const isMobile = useMediaQuery('(max-width: 767px)');

// Render mobile-specific components conditionally
{isMobile ? (
  <MobileTabSwitcher ... />
) : (
  // Desktop renders without tab switcher
  null
)}
```

### 7.2 Component Visibility by Breakpoint

| Component | Mobile (< 768px) | Tablet/Desktop (≥ 768px) |
|-----------|------------------|--------------------------|
| Tab Switcher | ✅ Visible | ❌ Hidden |
| Answer Tiles (Overview) | ✅ In tab | ❌ Hidden or separate section |
| Filter Button | ✅ Visible | ❌ Use FilterPillsBar instead |
| Filter Bottom Sheet | ✅ Bottom sheet | ❌ Use FilterPillsBar |
| Part Pill Tabs | ✅ Compact | ✅ Expanded with more info |
| FAB | ✅ Visible | ❌ Hidden (use inline buttons) |
| Question Accordion | ✅ Single-open | ✅ Multi-open allowed |

---

## 8. Animation Specifications Summary

| Animation | Duration | Easing | Reduced Motion |
|-----------|----------|--------|----------------|
| Tab indicator slide | 220ms | easeOut | instant |
| Tab content fade | 200ms | easeOut | instant |
| Accordion expand/collapse | 200ms | easeInOut | instant |
| Tile press feedback | 150ms | ease | none |
| Tiles stagger entry | 50ms per tile | easeOut | instant all |
| Bottom sheet open | 300ms | spring | instant |
| FAB press | 150ms | ease | none |
| Part indicator slide | 220ms | easeOut | instant |

---

## 9. Implementation Checklist

### Phase 1: Core Mobile Structure
- [ ] Add mobile detection hook (`useMediaQuery`)
- [ ] Create `MobileTabSwitcher` component
- [ ] Implement tab state management
- [ ] Add conditional rendering based on tab

### Phase 2: Answer Tiles Grid
- [ ] Create `AnswerTilesGridV2` component
- [ ] Implement question normalization from V2 data structure
- [ ] Add tile status coloring
- [ ] Implement tile tap → question navigation

### Phase 3: Filter System
- [ ] Create `ReadingFiltersSheetV2` component
- [ ] Add filter state management
- [ ] Connect filters to tile grid display
- [ ] Add filter count calculations

### Phase 4: Part Navigation
- [ ] Update `PartTabs` for mobile styling
- [ ] Add part navigation from tiles (determine question → part)
- [ ] Implement scroll-to-question functionality

### Phase 5: Accordion Behavior
- [ ] Add single-open mode to `QuestionItem`
- [ ] Implement expand state management at page level
- [ ] Connect tile navigation to accordion expand

### Phase 6: Floating Navigation
- [ ] Create `FloatingNavButton` component
- [ ] Create `QuickActionsSheet` component
- [ ] Implement quick action handlers
- [ ] Add FAB visibility logic (hide when at top)

### Phase 7: Polish
- [ ] Add all animations with reduced motion support
- [ ] Implement proper ARIA labels
- [ ] Test touch targets
- [ ] Cross-browser testing on mobile devices

---

## 10. Design Deliverables Summary

This specification provides complete guidance for implementing the mobile V2 experience:

| Deliverable | Status |
|-------------|--------|
| Mobile tab switcher layout and animations | ✅ Specified |
| Answer tiles grid styling and interaction | ✅ Specified |
| Part navigation mobile adaptation | ✅ Specified |
| Filter sheet layout | ✅ Specified |
| Accordion single-open behavior | ✅ Specified |
| Floating nav button and sheet | ✅ Specified |
| State management patterns | ✅ Specified |
| Data normalization approach | ✅ Specified |
| Accessibility requirements | ✅ Specified |
| Animation specifications | ✅ Specified |
| Implementation checklist | ✅ Provided |

---

*This specification extends the main V2 design spec with mobile-specific patterns. All measurements use the project's `rem` unit system where `1rem = 1px` equivalent. Implementation should follow existing V1 patterns in `reading-answer-sheet.tsx` and `reading-filters-sheet.tsx` as reference.*
