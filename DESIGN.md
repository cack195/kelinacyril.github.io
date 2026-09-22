---
name: Synaptic Editorial
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#4a4455'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#005952'
  on-tertiary: '#ffffff'
  tertiary-container: '#07736b'
  on-tertiary-container: '#9ff5ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#9cf2e8'
  tertiary-fixed-dim: '#80d5cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-xl:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-xl:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system embodies an editorial, high-precision academic aesthetic crafted for deep scientific inquiry, neuroimaging data, and complex neurobiology literature. Merging the restrained elegance of classic scientific monographs with the crisp ergonomics of contemporary lab software, the interface evokes focus, intellectual calm, and immaculate clarity.

The visual style is **Minimalist Editorial** anchored by expansive whitespace, fine-gauge structural lines, and distinct typographic hierarchy. Interfaces breathe generously, eliminating cognitive fatigue during prolonged analysis. Visual noise is rigorously suppressed: functional interactions are highlighted with calculated, electric synaptic accents, while analytical structures remain pristine, serene, and grounded.

## Colors
The palette prioritizes clarity, structural contrast, and purposeful optical hierarchy:

- **Primary (`#7c3aed` - Synaptic Violet):** Reserved for primary interactive states, key active navigational anchors, focal hypotheses, and high-level analytical markers.
- **Secondary (`#0284c7` - Axon Cyan/Teal):** Drives comparative metrics, quantitative data visualizations, secondary active states, and cross-reference links.
- **Tertiary (`#0f766e` - Deep Neuro Teal):** Serves corroborative research indicators, peer-reviewed validations, and tertiary state indicators.
- **Neutrals & Canvas:** 
  - Base backgrounds: Pure laboratory white (`#ffffff`) transitioning into clinical porcelain (`#f8fafc`) and subtle slate washes (`#f1f5f9`) for contextual grounding.
  - Body and Structural Text: Slate-charcoal (`#0f172a`) for maximum editorial legibility at display and headline scales, softened to deep graphite (`#334155`) for running body and dense methodologies, and muted slate (`#64748b`) for metadata, figure captions, and citations.
  - Hairline Rule System: Fine structural separators rely on low-contrast slate tints (`#e2e8f0` and `#cbd5e1`), ensuring strict division without visual mass.

## Typography
Typography is structured around a dual-discipline pairing: **Newsreader** delivers authoritative, literary cadence suited for academic titles, journal preprints, abstracts, and long-form scientific discourse; **Inter** provides neutral, optical clarity across UI workflows, dense tables, controls, and parameter panels; **JetBrains Mono** supplies uncompromised precision for gene sequences, coordinates, timestamps, specimen IDs, and numerical telemetry.

- Display and large headlines leverage gentle negative letter-spacing for editorial presence.
- Long-form prose (`body-xl`, `body-lg`) maintains generous line heights (1.5x–1.6x) to preserve reading velocity across multi-column layouts.
- Monospaced labels use explicit letter-spacing and uppercase formatting when deployed in structural badges or figure tags.

## Layout & Spacing
The layout follows a fluid-hybrid architecture balanced across a 12-column grid system for large-scale displays, compressing to an 8-column layout on tablet views and a 4-column layout on mobile viewports.

- **Desktop (≥ 1280px):** `margin-lg` (3.5rem) margin buffers with `gutter-lg` (2rem) separations. Primary editorial content columns are capped at 720px for optimal reading line length, complemented by persistent right-hand contextual metadata columns.
- **Tablet (768px - 1279px):** `margin` (2rem) with `gutter` (1.5rem). Secondary inspect panels collapse into bottom-anchored or drawer-based surfaces.
- **Mobile (< 768px):** `margin-sm` (1rem) with `gutter-sm` (1rem). Data densities compress into stacked vertical sequences.
- Spacing rhythm maintains an 8px modular baseline, employing `space-xs` and `space-sm` inside compact interactive components, and `space-xl` to enforce clear editorial demarcation between disparate research sections without relying on heavy horizontal dividers.

## Elevation & Depth
This design system avoids dense dropshadows, synthetic skeuomorphism, and muddy blurs. Depth is conveyed strictly through **tonal layering and low-contrast hairline boundaries**:

- **Layer 0 (Canvas):** Base parchment-white (`#f8fafc`) or stark pure white (`#ffffff`).
- **Layer 1 (Card/Container Surfaces):** Pure white surfaces (`#ffffff`) delineated by sharp 1px borders in `#e2e8f0`.
- **Layer 2 (Floating Inspections & Dropdowns):** `#ffffff` framed by a 1px border in `#cbd5e1`, paired with a high-diffusion, weightless ambient shadow (`0 8px 30px -4px rgba(15, 23, 42, 0.04)`).
- **Layer 3 (Modals & Focus Overlays):** Layered above an ultra-light backdrop veil (`rgba(15, 23, 42, 0.2)` with a 4px blur), bounded by a 1px border in `#94a3b8` and supported by `0 20px 48px -8px rgba(15, 23, 42, 0.08)`.

## Shapes
Geometry is crisp, structured, and disciplined, utilizing level `1` (Soft) roundedness. 
- Core components (buttons, input fields, badges, cards) feature subtle `0.25rem` (4px) corner radii, echoing the precision of lab glassware and technical instrumentation.
- Larger spatial cards, analytical viewports, and modals utilize `0.5rem` (8px).
- Complete circularity is restricted exclusively to user avatars, step progress markers, or state indicator pips.

## Components

### Buttons
- **Primary:** Solid slate-black (`#0f172a`) background, pure white text (`#ffffff`), 0.25rem border-radius. In high-emphasis workflows, a Synaptic Violet (`#7c3aed`) variant is utilized. Hover initiates a smooth shift to `#1e293b` (or `#6d28d9`).
- **Secondary/Outline:** 1px border in `#cbd5e1`, transparent background, `#0f172a` text. Hover shifts background to `#f1f5f9` and border to `#94a3b8`.
- **Ghost:** Borderless, neutral text, subtle background reveal on hover (`#f8fafc`).
- Padding: 0.5rem 1rem for standard buttons; typography set in `body-sm` (Inter SemiBold).

### Input Fields & Controls
- **Inputs & Dropdowns:** 1px border in `#cbd5e1`, background `#ffffff`, text `#0f172a`, placeholder text `#94a3b8`. Focus transitions border to `#7c3aed` with a 2px outer ambient ring in `rgba(124, 58, 237, 0.15)`. No default browser outlines.
- **Checkboxes & Radios:** Minimalist 16px square/circle with a 1px border in `#94a3b8`. Checked state fills with `#7c3aed`, presenting a crisp white check or center pip.

### Chips & Metadata Tags
- Rendered in `label-sm` or `label-md` using `JetBrains Mono`. Background is set to clinical neutral (`#f1f5f9`), accompanied by a 1px border in `#e2e8f0` and text in `#334155`.
- Active or filter-selected chips utilize `#f5f3ff` background, `#7c3aed` border, and `#6d28d9` text.

### Cards & Analytical Panels
- Flat pure-white (`#ffffff`) background bordered with 1px `#e2e8f0`. Padding relies on generous `space-lg` (1.5rem) to ensure research data, methodology text, and micro-charts do not crowd the container edges.

### Lists & Data Tables
- Strict tabular alignments. Headers rendered in `label-md` uppercase, tracked, in `#64748b` over a `#f8fafc` background bar. 
- Rows demarcated by 1px bottom rules in `#f1f5f9`, highlighting to `#f8fafc` on hover.

### Scientific Figure Callouts & Footnotes
- Structural left border: 2px solid `#7c3aed` or `#0284c7`.
- Background tint: `#fafafa`.
- Footnotes and attribution metadata set in `body-sm` with highlighted citation indices in `JetBrains Mono`.