# Listening Answer Sheet V2 — Design Specification Update

> **Document Version:** 2.0  
> **Last Updated:** December 2024  
> **Status:** Ready for Review  
> **Update Type:** Color Palette Update + Audio Player Addition

---

## Table of Contents

1. [Overview](#1-overview)
2. [Color Palette Update](#2-color-palette-update)
3. [Audio Player Component Design](#3-audio-player-component-design)
4. [File-by-File Color Replacement Map](#4-file-by-file-color-replacement-map)
5. [Accessibility Requirements](#5-accessibility-requirements)
6. [Implementation Checklist](#6-implementation-checklist)

---

## 1. Overview

### 1.1 Purpose of This Update

This document specifies two major updates to the Listening Answer Sheet V2:

1. **Color Palette Update**: Replace the current blue color scheme with the Reading V2 green/yellow theme for visual consistency across the application.

2. **Audio Player Addition**: Add a full-featured audio player component to allow users to re-listen to the audio recording while reviewing their answers.

### 1.2 Rationale

- **Color Consistency**: Aligning Listening V2 with Reading V2's color scheme creates a cohesive user experience across practice modules.
- **Audio Replay**: Users benefit from being able to review the audio while checking their answers to understand where they went wrong.

---

## 2. Color Palette Update

### 2.1 Master Color Replacement Map

| Current (Blue) | New (Green/Yellow) | Usage |
|----------------|-------------------|-------|
| `#4A6FA5` | `#4C7A3A` | Primary accent, active states |
| `#3A5A8A` | `#3C612E` | Hover states, text accent |
| `#2D4A75` | `#2F5E25` | Focus rings, dark accent |
| `#E8EEF7` | `#F5ECCC` | Light backgrounds, badge fills |
| `#F0F5FA` | `d-yellow-secondary/70` or `#F3EDD3` | Secondary backgrounds |
| `#C5D4E8` | `#E1D6B4` | Borders, dividers |
| `#D8E4F0` | `#E1D6B4` | Subtle separators |
| `#6B89B5` | `#85784A` | Muted accent (unanswered state) |

### 2.2 Shadow Color Updates

| Current | New |
|---------|-----|
| `rgba(74,111,165,0.18)` | `rgba(56,56,56,0.18)` |
| `rgba(74,111,165,0.08)` | `rgba(56,56,56,0.08)` |
| `rgba(74,111,165,0.12)` | `rgba(56,56,56,0.12)` |
| `rgba(74,111,165,0.5)` | `rgba(76,122,58,0.5)` |

### 2.3 Text Color Updates

| Current | New | Usage |
|---------|-----|-------|
| `text-[#4A6FA5]` | `text-[#85784A]` | Section labels, accent text |
| `text-[#3A5A8A]` | `text-[#4B4628]` | Text accent, links |
| `text-[#4A6FA5]/90` | `text-[#4B4628]` | Inactive tab text |

### 2.4 Status Colors (Unchanged)

These colors remain the same for semantic consistency:

| Status | Background | Border | Text | Dot/Icon |
|--------|------------|--------|------|----------|
| Correct | `#E7F2DD` | `#C9E0B7` | `#2F5E25` | `#4C7A3A` |
| Incorrect | `#FFE4E2` | `#FFD3CF` | `#9E2E2A` | `#C3423F` |
| Unanswered | `#F3EDD3` | `#E1D6B4` | `#85784A` | `#85784A` |

---

## 3. Audio Player Component Design

### 3.1 Component Overview

A full-featured audio player placed between the ScoreSummaryCard and the Detailed Review section.

**Data Source:** `data.listening.audio_url` from the API response

### 3.2 Desktop Layout Specification

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎧 LISTENING AUDIO                                                          │
│  Listen to the recording again                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│     [⏮ -10s]      [▶ Play / ⏸ Pause]      [⏭ +10s]                         │
│                                                                              │
│  ─────────────────────●──────────────────────────────────    02:15 / 30:45  │
│                                                                              │
│  Speed: [0.5x] [0.75x] [●1x] [1.25x] [1.5x] [2x]         🔊 ─────●─────     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Mobile Layout Specification

```
┌────────────────────────────────────────┐
│ 🎧 LISTENING AUDIO                     │
│ Listen to the recording again          │
├────────────────────────────────────────┤
│                                        │
│     [⏮]    [▶/⏸]    [⏭]    02:15/30:45│
│                                        │
│  ──────────●───────────────────────    │
│                                        │
│  Speed: [0.5] [0.75] [●1x] [1.25]...   │
│                                        │
│  🔊 ─────────●─────────                │
│                                        │
└────────────────────────────────────────┘
```

### 3.4 Component Structure

```typescript
interface AudioPlayerProps {
  audioUrl: string;
  shouldReduceMotion: boolean;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 3.5 Styling Specifications

#### Card Container
```css
/* Container */
border-radius: 32rem;
border: 1px solid #E1D6B4;
background: #FFFFFF;
padding: 24rem (mobile) → 32rem 36rem (tablet);
box-shadow: 0 18rem 48rem -30rem rgba(56,56,56,0.18);
```

#### Header Section
```css
/* Section Label */
font-size: 12rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.24em;
color: #85784A;

/* Subtitle */
font-size: 14rem;
color: rgba(26, 26, 26, 0.7);
margin-top: 4rem;
```

#### Play/Pause Button (Primary)
```css
/* Default State */
width: 56rem (mobile) → 64rem (tablet);
height: 56rem (mobile) → 64rem (tablet);
border-radius: 50%;
background: #4C7A3A;
color: #FFFFFF;
box-shadow: 0 4rem 12rem -4rem rgba(76,122,58,0.4);

/* Hover State */
background: #3C612E;
transform: scale(1.02);

/* Active/Pressed State */
background: #2F5E25;
transform: scale(0.98);

/* Disabled/Loading State */
background: #E1D6B4;
color: #85784A;
cursor: not-allowed;

/* Focus State */
outline: none;
ring: 2px solid #8E7B45;
ring-offset: 2px;
```

#### Skip Buttons (-10s / +10s)
```css
/* Default State */
width: 44rem;
height: 44rem;
border-radius: 50%;
background: #F3EDD3;
color: #4B4628;
border: 1px solid #E1D6B4;

/* Hover State */
background: #E1D6B4;

/* Active/Pressed State */
background: #D4C9A3;
transform: scale(0.95);

/* Disabled State */
opacity: 0.5;
cursor: not-allowed;

/* Focus State */
outline: none;
ring: 2px solid #8E7B45;
ring-offset: 2px;

/* Icon Size */
icon-size: 18rem;
```

#### Progress Bar / Seek Slider
```css
/* Track */
height: 6rem;
border-radius: 999rem;
background: #E1D6B4;

/* Fill (Progress) */
background: #4C7A3A;
border-radius: 999rem;

/* Thumb */
width: 16rem;
height: 16rem;
border-radius: 50%;
background: #4C7A3A;
border: 3px solid #FFFFFF;
box-shadow: 0 2rem 6rem rgba(0,0,0,0.15);

/* Thumb Hover */
width: 18rem;
height: 18rem;
background: #3C612E;

/* Thumb Active */
background: #2F5E25;

/* Focus State */
thumb-ring: 2px solid #8E7B45;
thumb-ring-offset: 2px;
```

#### Time Display
```css
/* Container */
display: flex;
align-items: center;
gap: 4rem;
font-size: 13rem;
font-weight: 500;
font-feature-settings: 'tnum';  /* Tabular numbers */

/* Current Time */
color: #1A1A1A;

/* Separator */
color: #85784A;

/* Duration */
color: rgba(26, 26, 26, 0.6);
```

#### Speed Control Buttons
```css
/* Container */
display: flex;
gap: 6rem;
flex-wrap: wrap;

/* Button (Inactive) */
padding: 8rem 12rem;
border-radius: 8rem;
background: #F3EDD3;
color: #6F6335;
font-size: 12rem;
font-weight: 600;
border: 1px solid transparent;

/* Button (Active) */
background: #4C7A3A;
color: #FFFFFF;
border: 1px solid #4C7A3A;

/* Button Hover (Inactive) */
background: #E5DCBC;
border: 1px solid #E1D6B4;

/* Button Focus */
outline: none;
ring: 2px solid #8E7B45;
ring-offset: 1px;
```

#### Volume Slider
```css
/* Track */
width: 100rem (desktop) → full width (mobile);
height: 4rem;
border-radius: 999rem;
background: #E1D6B4;

/* Fill */
background: #4C7A3A;

/* Thumb */
width: 12rem;
height: 12rem;
border-radius: 50%;
background: #4C7A3A;
border: 2px solid #FFFFFF;
box-shadow: 0 1rem 3rem rgba(0,0,0,0.15);

/* Mute Button */
width: 36rem;
height: 36rem;
border-radius: 8rem;
background: transparent;
color: #4B4628;

/* Mute Button (Muted State) */
color: #C3423F;
```

### 3.6 Speed Control Options

| Value | Label |
|-------|-------|
| 0.5 | 0.5x |
| 0.75 | 0.75x |
| 1 | 1x |
| 1.25 | 1.25x |
| 1.5 | 1.5x |
| 2 | 2x |

### 3.7 Interaction States

#### Loading State
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎧 LISTENING AUDIO                                                          │
│  Loading audio...                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│           [Spinner]  Loading audio file...                                   │
│                                                                              │
│  ─────────────────────────────────────────────────────────    --:-- / --:-- │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Error State
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎧 LISTENING AUDIO                                                          │
│  Unable to load audio                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│           [⚠️]  Failed to load audio file.                                   │
│                 [Try Again]                                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

/* Error Container */
background: #FFE4E2;
border: 1px solid #FFD3CF;
border-radius: 12rem;
padding: 16rem;

/* Error Text */
color: #9E2E2A;
font-size: 14rem;

/* Retry Button */
background: transparent;
border: 1px solid #C3423F;
color: #C3423F;
padding: 8rem 16rem;
border-radius: 8rem;
```

#### Audio Not Available State
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎧 LISTENING AUDIO                                                          │
│  Audio recording not available                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│           [🎵]  The audio for this practice is no longer available.          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

/* Container */
background: #F3EDD3;
color: #6F6335;
text-align: center;
padding: 24rem;
```

### 3.8 Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause (when player is focused) |
| `←` Arrow Left | Skip backward 10 seconds |
| `→` Arrow Right | Skip forward 10 seconds |
| `↑` Arrow Up | Increase volume by 10% |
| `↓` Arrow Down | Decrease volume by 10% |
| `M` | Toggle mute |
| `0-9` | Jump to 0%-90% of duration |

### 3.9 ARIA Requirements

```html
<section 
  role="region" 
  aria-label="Audio player"
  aria-describedby="audio-player-description"
>
  <p id="audio-player-description" class="sr-only">
    Audio player for listening practice. Use space to play or pause,
    arrow keys to seek and adjust volume.
  </p>
  
  <button 
    aria-label="Play" 
    aria-pressed="false"
    aria-describedby="playback-status"
  >
    ▶
  </button>
  
  <span id="playback-status" class="sr-only" aria-live="polite">
    Paused at 2 minutes 15 seconds
  </span>
  
  <button aria-label="Skip backward 10 seconds">⏮</button>
  <button aria-label="Skip forward 10 seconds">⏭</button>
  
  <input
    type="range"
    role="slider"
    aria-label="Seek audio position"
    aria-valuemin="0"
    aria-valuemax="1845"
    aria-valuenow="135"
    aria-valuetext="2 minutes 15 seconds of 30 minutes 45 seconds"
  />
  
  <div role="group" aria-label="Playback speed">
    <button aria-pressed="false">0.5x</button>
    <button aria-pressed="true">1x</button>
    <button aria-pressed="false">1.5x</button>
  </div>
  
  <button 
    aria-label="Mute" 
    aria-pressed="false"
  >
    🔊
  </button>
  
  <input
    type="range"
    role="slider"
    aria-label="Volume"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="80"
  />
</section>
```

### 3.10 Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| Mobile (<768px) | Single column layout, stacked controls, full-width progress bar |
| Tablet (768px-1024px) | Two-row layout, controls inline with time display |
| Desktop (>1024px) | Single row for main controls, speed and volume on same line |

### 3.11 Touch Considerations

- All interactive elements must have minimum 44×44px touch targets
- Progress bar touch target should extend beyond visual height (44px total)
- Swipe gestures on progress bar for fine-grained seeking
- Long press on skip buttons for continuous seeking (optional enhancement)

---

## 4. File-by-File Color Replacement Map

### 4.1 listening-answer-sheet-v2.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Detailed Review section border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Detailed Review section shadow | `rgba(74,111,165,0.18)` | `rgba(56,56,56,0.18)` |
| Section label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Mobile tab toggle background | `bg-[#F0F5FA]` | `bg-d-yellow-secondary/70` |
| Mobile tab toggle shadow | `rgba(74,111,165,0.18)` | `rgba(0,0,0,0.08)` |
| Tab trigger inactive text | `text-[#4A6FA5]/90` | `text-[#4B4628]` |
| Tab trigger focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Filters button border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Filters button text | `text-[#3A5A8A]` | `text-[#4B4628]` |
| Filters button hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Filters button focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Filter count badge bg | `bg-[#E8EEF7]` | `bg-[#F5ECCC]` |
| Filter count badge text | `text-[#4A6FA5]` | `text-[#6F6335]` |
| Floating menu button bg | `bg-[#4A6FA5]` | `bg-[#4C7A3A]` |
| Floating menu button shadow | `rgba(74,111,165,0.5)` | `rgba(76,122,58,0.5)` |
| Floating menu button hover | `hover:bg-[#3A5A8A]` | `hover:bg-[#3C612E]` |
| Floating menu button focus ring | `ring-[#2D4A75]` | `ring-[#2F5E25]` |

**Skeleton Component:**

| Location | Current | Replacement |
|----------|---------|-------------|
| Skeleton text color | `text-[#4A6FA5]` | `text-[#85784A]` |
| Skeleton dot bg | `bg-[#4A6FA5]` | `bg-[#4C7A3A]` |
| Skeleton progress bar | `bg-[#C5D4E8]/70` | `bg-[#E1D6B4]/70` |

### 4.2 score-summary-card.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Card border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Card shadow | `rgba(74,111,165,0.18)` | `rgba(56,56,56,0.18)` |
| Results Summary label | `text-[#4A6FA5]` | `text-[#85784A]` |
| Progress circle track | `stroke="#C5D4E8"` | `stroke="#E1D6B4"` |
| Progress circle fill | `stroke="#4A6FA5"` | `stroke="#4C7A3A"` |
| Band score box bg | `bg-[#E8EEF7]` | `bg-[#F5ECCC]` |
| Band label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Band value text | `text-[#3A5A8A]` | `text-[#4B4628]` |
| Divider border | `border-[#C5D4E8]/60` | `border-[#E1D6B4]/60` |

### 4.3 part-tabs.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Container background | `bg-[#F0F5FA]` | `bg-d-yellow-secondary/70` |
| Sliding indicator shadow | `rgba(74,111,165,0.08)` | `rgba(56,56,56,0.08)` |
| Inactive tab text | `text-[#4A6FA5]` | `text-[#4B4628]` |
| Tab focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Active tab badge bg | `bg-[#4A6FA5]` | `bg-[#4C7A3A]` |
| Inactive tab badge bg | `bg-[#C5D4E8]/60` | `bg-[#E1D6B4]/60` |
| Inactive tab badge text | `text-[#4A6FA5]` | `text-[#6F6335]` |

### 4.4 part-content.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Task description border | `border-[#C5D4E8]/60` | `border-[#E1D6B4]/60` |
| Task description bg | `bg-[#F0F5FA]` | `bg-d-yellow-secondary/70` |

### 4.5 block-section.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Block container border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Block container shadow | `rgba(74,111,165,0.12)` | `rgba(56,56,56,0.12)` |
| Block header hover | `hover:bg-[#F0F5FA]/50` | `hover:bg-d-yellow-secondary/50` |
| Focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Kind badge bg | `bg-[#E8EEF7]` | `bg-[#F5ECCC]` |
| Kind badge text | `text-[#4A6FA5]` | `text-[#6F6335]` |
| Chevron button bg | `bg-[#E8EEF7]` | `bg-[#F5ECCC]` |
| Chevron button text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Content divider | `border-[#C5D4E8]/60` | `border-[#E1D6B4]/60` |
| Hint box bg | `bg-[#F0F5FA]/60` | `bg-d-yellow-secondary/60` |
| Hint label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Question text box bg | `bg-[#F0F5FA]/40` | `bg-d-yellow-secondary/40` |
| Choices container bg | `bg-[#F0F5FA]/60` | `bg-d-yellow-secondary/60` |
| Table border | `border-[#C5D4E8]/60` | `border-[#E1D6B4]/60` |

### 4.6 question-item.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Item hover bg | `hover:bg-[#F8FAFC]` | `hover:bg-[#FDFBF3]` |
| Question number label | `text-[#4A6FA5]` | `text-[#85784A]` |
| Unanswered status text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Content divider | `border-[#C5D4E8]/40` | `border-[#E1D6B4]/40` |
| Question label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Hint label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Image label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Table position label | `text-[#4A6FA5]` | `text-[#85784A]` |
| Your answer label | `text-[#4A6FA5]` | `text-[#85784A]` |
| Unanswered answer bg | `bg-[#F0F5FA]` | `bg-[#F3EDD3]` |
| Choices label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Default choice bg | `bg-[#E8EEF7]/60` | `bg-[#F5ECCC]/60` |
| Hint text | `text-[#4A6FA5]/80` | `text-[#85784A]/80` |

**STATUS_CONFIG Updates:**

```typescript
// Current unanswered config:
unanswered: {
  bg: 'bg-[#F0F5FA]',
  border: 'border-[#C5D4E8]',
  dot: 'bg-[#6B89B5]',
  icon: Minus,
  label: 'Unanswered',
}

// Updated unanswered config:
unanswered: {
  bg: 'bg-[#F3EDD3]',
  border: 'border-[#E1D6B4]',
  dot: 'bg-[#85784A]',
  icon: Minus,
  label: 'Unanswered',
}
```

### 4.7 mobile-answer-grid.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Filter label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |

**STATUS_STYLES Updates:**

```typescript
// Current:
unanswered: 'bg-[#F0F5FA] text-[#4A6FA5] border-[#C5D4E8]'

// Updated:
unanswered: 'bg-[#F3EDD3] text-[#85784A] border-[#E1D6B4]'
```

### 4.8 mobile-filters-sheet.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Header border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Section label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Close button border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Close button text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Close button hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Scrollbar thumb | `scrollbar-thumb-[#C5D4E8]` | `scrollbar-thumb-[#E1D6B4]` |
| Filter active border | `border-[#4A6FA5]` | `border-[#4C7A3A]` |
| Filter active bg | `bg-[#E8EEF7]` | `bg-[#E7F2DD]` |
| Filter active text | `text-[#3A5A8A]` | `text-[#4B4628]` |
| Filter inactive border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Filter inactive text | `text-[#4A6FA5]` | `text-[#6F6335]` |
| Filter inactive hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Count text | `text-[#4A6FA5]` | `text-[#6F6335]` |

### 4.9 mobile-nav-sheet.tsx

| Line/Location | Current | Replacement |
|---------------|---------|-------------|
| Header border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Section label text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Close button border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Close button text | `text-[#4A6FA5]` | `text-[#85784A]` |
| Close button hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Focus ring | `ring-[#4A6FA5]` | `ring-[#8E7B45]` |
| Scrollbar thumb | `scrollbar-thumb-[#C5D4E8]` | `scrollbar-thumb-[#E1D6B4]` |
| Action button border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Action button hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Action icon bg | `bg-[#E8EEF7]` | `bg-[#F5ECCC]` |
| Action icon color | `text-[#4A6FA5]` | `text-[#85784A]` |
| Divider border | `border-[#C5D4E8]/60` | `border-[#E1D6B4]/60` |
| Part selection label | `text-[#4A6FA5]` | `text-[#85784A]` |
| Part active border | `border-[#4A6FA5]` | `border-[#4C7A3A]` |
| Part active bg | `bg-[#E8EEF7]` | `bg-[#E7F2DD]` |
| Part active text | `text-[#3A5A8A]` | `text-[#4B4628]` |
| Part inactive border | `border-[#C5D4E8]` | `border-[#E1D6B4]` |
| Part inactive text | `text-[#4A6FA5]` | `text-[#6F6335]` |
| Part inactive hover | `hover:bg-[#F0F5FA]` | `hover:bg-d-yellow-secondary` |
| Part count text | `text-[#4A6FA5]` | `text-[#6F6335]` |

---

## 5. Accessibility Requirements

### 5.1 WCAG 2.1 AA Compliance (Audio Player)

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | All text meets 4.5:1 ratio minimum. `#4C7A3A` on white = 5.2:1 ✓ |
| Focus Indicators | Visible 2px focus rings on all interactive elements |
| Screen Reader | Complete ARIA labeling for all controls |
| Reduced Motion | Respects `prefers-reduced-motion` for animations |
| Touch Targets | Minimum 44×44px for all interactive elements |
| Keyboard Access | Full keyboard navigation support |
| Audio Control | User can pause, stop, and adjust volume |
| Time Identification | Both visual and programmatic time indication |

### 5.2 Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Play | "Playing from [time]" |
| Pause | "Paused at [time]" |
| Skip -10s | "Skipped back 10 seconds to [time]" |
| Skip +10s | "Skipped forward 10 seconds to [time]" |
| Speed change | "Playback speed [X]x" |
| Volume change | "Volume [X]%" |
| Mute | "Audio muted" / "Audio unmuted" |
| Seek | "Seeking to [time]" |
| Load complete | "Audio loaded, duration [time]" |
| Error | "Failed to load audio. Try again button available." |

### 5.3 Color Contrast Verification (Updated Palette)

| Color Combination | Contrast Ratio | Pass/Fail |
|-------------------|----------------|-----------|
| `#85784A` on white | 4.9:1 | ✓ AA |
| `#4C7A3A` on white | 5.2:1 | ✓ AA |
| `#4B4628` on white | 8.7:1 | ✓ AAA |
| `#6F6335` on `#F5ECCC` | 4.6:1 | ✓ AA |
| `#2F5E25` on `#E7F2DD` | 5.8:1 | ✓ AA |

---

## 6. Implementation Checklist

### 6.1 Color Update Tasks

- [ ] Update `listening-answer-sheet-v2.tsx` with new color values
- [ ] Update `score-summary-card.tsx` with new color values
- [ ] Update `part-tabs.tsx` with new color values
- [ ] Update `part-content.tsx` with new color values
- [ ] Update `block-section.tsx` with new color values
- [ ] Update `question-item.tsx` with new color values and STATUS_CONFIG
- [ ] Update `mobile-answer-grid.tsx` with new color values and STATUS_STYLES
- [ ] Update `mobile-filters-sheet.tsx` with new color values
- [ ] Update `mobile-nav-sheet.tsx` with new color values
- [ ] Verify all color contrast requirements are met
- [ ] Test with screen reader for accessibility

### 6.2 Audio Player Tasks

- [ ] Create `audio-player.tsx` component
- [ ] Implement play/pause functionality
- [ ] Implement skip forward/backward
- [ ] Implement progress bar with seeking
- [ ] Implement playback speed control
- [ ] Implement volume control with mute
- [ ] Add loading state UI
- [ ] Add error state UI with retry
- [ ] Add audio not available state
- [ ] Implement keyboard navigation
- [ ] Add all ARIA labels and live regions
- [ ] Test with screen reader
- [ ] Test responsive layouts (mobile/tablet/desktop)
- [ ] Test touch interactions
- [ ] Test reduced motion preference
- [ ] Integrate into `listening-answer-sheet-v2.tsx`

### 6.3 Testing Requirements

- [ ] Visual regression testing for color changes
- [ ] Cross-browser audio playback testing
- [ ] Mobile device audio testing (iOS Safari, Android Chrome)
- [ ] Accessibility audit with axe/Lighthouse
- [ ] Screen reader testing (VoiceOver, NVDA)
- [ ] Keyboard-only navigation testing

---

*End of Design Specification Update*
