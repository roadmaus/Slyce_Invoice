# Design Philosophy — Brutalist / Utilitarian

## Core Principle
Raw, bold, function-first. Every element earns its place. No decoration without purpose.

## Typography
- **Data & Numbers**: `JetBrains Mono` — monospace, precise, mechanical
- **Headings & Labels**: `DM Sans` bold/black — clean sans-serif contrast
- Labels are uppercase with wide letter-spacing (`0.15–0.25em`)

## Layout
- Strict visible grid structure with exposed borders
- Zero border-radius everywhere — no rounded corners
- Dense but readable spacing — utilitarian padding
- 3-column header grid with visible vertical dividers

## Color
- High contrast: near-black on white (light), near-white on dark (dark mode)
- Single accent color: amber `#F59E0B` — used only for interactive states (hover, focus)
- No gradients, no shadows, no blur effects

## Borders
- Thick `2px solid` borders for primary structure
- `1.5px` for inputs and secondary elements
- `1px` for table row dividers
- Dashed borders for "add" actions

## Inputs
- Transparent background, bottom-border-only in table cells
- Monospace font for all editable data
- Amber underline on focus — no rings, no glow
- Number spinner arrows hidden

## Buttons
- Generate button: full-width, inverted colors (foreground bg, background text)
- Hover: amber takeover
- Add button: dashed border, uppercase monospace, muted until hover
- Tag buttons: tight inline-flex, thin border, monospace pricing

## Micro-details
- Position numbers: zero-padded (`01`, `02`), bold monospace
- Currency values: right-aligned, monospace, bold
- Totals separated by thick top border
- Inverted header bar (white-on-black / black-on-white)

## What This Is Not
- No rounded corners
- No soft shadows or glassmorphism
- No pastel colors or gradients
- No decorative icons or illustrations
- No animation beyond subtle hover transitions (`0.1–0.15s`)
