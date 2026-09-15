---
name: Clinical Tactile Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#004f35'
  on-tertiary: '#ffffff'
  tertiary-container: '#006948'
  on-tertiary-container: '#76eab6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-trust, analytical interface for enterprise pharmacovigilance, clinical drug safety monitoring, and regulatory compliance workflows. The aesthetic merges clinical architectural precision with subtle, functional soft-surface neumorphism—achieving physical tactile tactility without sacrificing information density or computational rigor.

### Personality & Emotional Response
- **Authority & Reliability:** Delivers the visual weight of validated medical hardware combined with ultra-responsive modern software. Users feel absolute certainty in data provenance and system state.
- **Cognitive Clarity:** Eliminates distracting visual clutter, harsh synthetic glows, or decorative transparencies. Every surface elevation, indentation, and color cue conveys operational status, audit trails, and signal thresholds.
- **Tactile Interaction:** Interactive elements emulate calibrated physical control panels—raised surfaces invite interaction, while recessed wells denote captured input and confirmed parameters.

### Design Movement
**Sophisticated Clinical Neumorphism**: A disciplined, low-contrast execution of dual-shadow surfaces (specular top-left light highlights balanced by cool slate bottom-right ground shadows) applied over monolithic, matte medical-slate backdrops. Recessed inner bevels and precise inset shadows are reserved strictly for inputs, telemetry wells, and pressed controls to preserve data legibility.

## Colors

The chromatic architecture utilizes a controlled, low-strain clinical palette calibrated specifically for exhaustive review cycles across clinical trials and adverse event databases.

### Surface Architecture
- **Base Canvas (`#EEF3F8`):** The foundational clinical slate-gray plane. All tactile highlights and shadows derive relative to this precise luminance.
- **Surface Extruded (`#F4F8FC`):** Micro-shifted above canvas for elevated cards, active toggles, and floating analytical inspectors.
- **Surface Recessed (`#E5ECF3`):** Inset foundation for search fields, data filter bays, and telemetry tracking wells.

### Brand & Functional Accents
- **Primary Clinical Blue (`#1D4ED8`):** Designates verified regulatory actions, validated signal confirmation, and primary system controls. Accompanied by `#2563EB` for hover interactions and `#1E40AF` for pressed/engaged states.
- **Secondary Analytical Slate-Cyan (`#0284C7`):** Represents algorithmic inferences, machine learning confidence scoring, and dynamic query filtering.
- **Neutral Structural Slate (`#64748B`):** System scaffolding, structural labels, inactive states, and peripheral axes. Deep slate (`#0F172A`) governs primary data text to secure WCAG AAA contrast ratios against all soft-extruded surfaces.

### Semantic Triage & Severity Scale
- **Signal Critical / Accelerated Alert (`#E11D48`):** High-priority adverse events, death/life-threatening flags, regulatory rejection notices.
- **Signal Elevated / Investigation Pending (`#D97706`):** Moderate anomaly detection, pending multi-country compliance discrepancies.
- **Signal Cleared / Validated Baseline (`#059669`):** Safe baseline, closed investigation, successful health authority submission.
- **Informational Telemetry (`#2563EB`):** Standard operational processing, queued ingestion, system telemetry.

## Typography

Typography balances clinical legibility with mathematical structure. We pair **Hanken Grotesk** for primary interface narrative and narrative analytics with **JetBrains Mono** for alphanumeric telemetry, dosage measurements, MedDRA terminology codes, ICSR case identifiers, and statistical confidence intervals.

### Typographic Discipline
- **Hanken Grotesk:** Configured with deliberate tabular figure support where needed, neutral tracking, and strict structural weightings (Regular 400 for long narrative review, Semi-Bold 600 for card headers, and Bold 700 for executive aggregate values).
- **JetBrains Mono:** Enforces total horizontal rhythm across multidimensional tabular sets, regulatory serial designations (e.g., `FAERS-2024-8849-B`), p-value scoring (`p < 0.001`), and machine-learning anomaly weights.
- **Optical Rendering:** Sub-pixel antialiasing must be locked across all light slate backgrounds. Text color never uses pure black; high-emphasis text relies on `#0F172A` to prevent visual vibration against double-shadowed extrusions.

## Layout & Spacing

Layouts conform to a dense 12-column variable grid engineered to sustain continuous multi-parameter telemetry, batch regulatory verification tables, and dynamic signal filtration trees side-by-side.

### Layout Model
- **Workbench Shell:** Desktop workflows operate within a fixed-height, zero-body-scroll command matrix. The primary navigation rail occupies a static vertical extruded bar (68px condensed, 240px expanded). The workspace fluidly distributes remaining horizontal space between filtering docks, data ledgers, and real-time inspector consoles.
- **Grid Structure:** A 12-column fluid structure with 24px desktop gutters (`1.5rem`), transitioning to 16px (`1rem`) on tablets. 
- **Adaptive Breakpoints:**
  - **Desktop Large (≥ 1440px):** 12 columns. Dual-pane inspection allowed (Cohort List + Adverse Signal Inspector + AI Discrepancy Stream).
  - **Desktop Standard (1024px – 1439px):** 12 columns. Collapsible side docks; secondary metrics stack into sliding panels.
  - **Tablet (768px – 1023px):** 8 columns. Sidebar collapses to icon rail; inspection panels shift to modal extrusions.
  - **Mobile (< 768px):** 4 columns. Grid reflows to single-axis vertical stacking; table records collapse into discrete tactile signal cards.

### Spacing Discipline
Spacing adheres to a strict 4px/8px internal rhythm. Dense data grids leverage `space-xs` (4px) and `space-sm` (8px) interior cell padding to maintain optimal screen-space efficiency, while `space-lg` (20px) and `space-xl` (32px) delineate macro-functional groupings and inspection modules.

## Elevation & Depth

Visual hierarchy is constructed through light modeling rather than artificial borders or saturated planes. The simulated lighting origin is strictly fixed at **top-left (135° angle)** across all views.

### The Neumorphic Physics
Every surface manipulation operates via two simultaneous, soft-focus cast vectors:
1. **Highlight vector (Top-Left):** Reflects high ambient light (`#FFFFFF`) with 70% to 90% opacity, generating a crisp, clean bevel.
2. **Ground vector (Bottom-Right):** Distributes a cool slate-blue dispersion (`#CBD5E1` / `#94A3B8`) at 45% to 60% opacity with extended blur radii to eliminate hard edge silhouettes.

### Elevation Levels
- **Level 0 (Recessed Wells / Input Beds):**
  Applied to text inputs, search terminals, slider channels, and sunken ledger headers.
  - `box-shadow: inset 2px 2px 5px #D1D9E2, inset -2px -2px 5px #FFFFFF`
- **Level 1 (Flat Structural Baselines):**
  Baseline surface aligning seamlessly with canvas `#EEF3F8`. Elements exhibit zero physical lift until engaged or focused.
- **Level 2 (Extruded Cards & Module Surfaces):**
  Standard elevation for analytical containers, pharmacovigilance safety matrices, and workflow modules.
  - `box-shadow: 4px 4px 10px #D3DDE8, -4px -4px 10px #FFFFFF`
- **Level 3 (Tactile Interactive Controls / Floating Tools):**
  Primary action buttons, active filters, dropdown menus, and floating analytical inspectors.
  - `box-shadow: 6px 6px 14px #CBD5E1, -6px -6px 14px #FFFFFF`
- **Level 4 (Pressed / Engaged State):**
  When an extruded element (Level 2 or 3) is clicked, its shadow coordinates invert instantaneously into Level 0 inset shadows, giving unmistakable tactile confirmation of system actuation.

Strict guardrails apply: borders are strictly disallowed except when low-opacity semantic borders (`rgba(225, 29, 72, 0.25)` or `rgba(5, 150, 105, 0.25)`) are necessary to demarcate safety threshold violations.

## Shapes

The geometric framework applies controlled roundedness to soften visual tension while sustaining the severe alignment required by statistical data.

### Corner Radii
- **Level 2 Standard (`0.5rem` / `8px`):** Checkboxes, radio plates, input fields, badges, and inline data-chip containers.
- **Level 2 Large / `rounded-lg` (`1rem` / `16px`):** Data grouping cards, metric summary modules, and regulatory compliance blocks.
- **Level 2 Extra Large / `rounded-xl` (`1.5rem` / `24px`):** Primary analytical canvases, high-level dashboards, modal inspection sheets, and global system viewport containers.

Pill shapes (`rounded-full`) are strictly reserved for low-profile semantic state tags and micro triage dots; they are forbidden on primary action buttons or structural analytical containers.

## Components

### Buttons & Trigger Controls
- **Tactile Standard Button:** Cast in canvas slate `#EEF3F8` with extruded Level 2 dual-shadows. Typography in `#0F172A` (Hanken Grotesk Semi-Bold). Hover transitions smoothly to Level 3. Active/pressed state snaps directly to an inset well (Level 0) with a 1px downward visual translate.
- **Primary Clinical Blue Button:** Extruded soft-gradient (`#2563EB` to `#1D4ED8`) featuring dual-directional tinted shadows: top-left highlight `#60A5FA` (35% opacity), bottom-right shadow `#1E40AF` (50% opacity). Text in pure white `#FFFFFF`.
- **Destructive/Critical Action Trigger:** Tinted slate base with subtle Rose accent (`#E11D48`). Active click triggers an inset warning well.

### Input Fields & Data Filters
- **Recessed Input Beds:** Text inputs, code filters, and parameter adjusters sit permanently embedded within the layout using Level 0 inset shadows on surface `#E9F0F6`. No perimeter borders in resting state.
- **Focus State:** The inset shadow depth sharpens, and an ultra-fine clinical blue rim glow (`0 0 0 1.5px #2563EB`) illuminates the inner edge without introducing hard box-model displacement.
- **Embedded Telemetry Prepend:** Monospaced prefix indicators (e.g., `CAS#`, `NDC:`, `CIOMS:`) rendered in `#64748B` with a subtle extruded boundary dividing label from entry area.

### Chips & Semantic Status Flags
- **Signal Triage Chips:** Softly elevated (Level 1 to 2) with a 6px monospaced semantic status node:
  - *Critical Severity:* `#E11D48` dot, light rose-slate background (`#FDE8EC`), text `#9F1239`.
  - *Investigational Warning:* `#D97706` dot, light amber-slate background (`#FEF3C7`), text `#92400E`.
  - *Controlled / Cleared:* `#059669` dot, light emerald-slate background (`#D1FAE5`), text `#065F46`.
- **Interactive Multi-Select Chips:** Shift between Level 2 (unselected, flat-raised) and Level 0 (selected, sunken-well with primary blue text).

### Checkboxes & Segmented Radios
- **Checkboxes:** 18×18px square modules with 4px corner radii. Unchecked: recessed Level 0 well. Checked: extrudes to Level 2 in primary blue `#1D4ED8`, displaying a sharp white vector checkmark.
- **Segmented Tab Radios:** Housed within a shared recessed horizontal track. The active tab physically extrudes out of the track with Level 2 elevation and crisp typographic weight, while inactive tabs remain planar.

### Data Tables & Analytics Cards
- **Regulatory Ledger Grid:** Table wrappers feature extruded Level 2 contours with 16px corner radii. Header rows sit recessed into Level 0 wells to anchor tabular columns. Data rows are flat, separated by soft 1px tone shifts (`#E2E8F0`). On row hover, the row elevates softly (subtle Level 1 extrusion) to facilitate line tracking across 15+ metrics.
- **Metric Indicator Cards:** Standalone Level 2 extruded panels with an integrated, recessed sparkline or micro-histogram channel at the bottom perimeter.

### Safety Signal Threshold Gauges
- Specialized analytical control composed of a deeply recessed track (Level 0) with a raised tactile slider thumb (Level 3) that translates horizontally to modulate signal sensitivity parameters ($p$-value cutoffs, PRR, ROR scores). Numerical metrics hover above the thumb in a mono-spaced badge.