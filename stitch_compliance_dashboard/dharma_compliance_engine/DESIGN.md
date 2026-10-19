# Design System Document: The Sovereign Ledger

## 1. Overview & Creative North Star

### Creative North Star: "The Architectural Editorial"
The Governance, Risk, and Compliance (GRC) landscape for Indian SMEs is often defined by cluttered, legacy government portals. This design system breaks that cycle by positioning itself as a "Digital Curator." We move away from the "data-dump" aesthetic toward a high-end editorial experience. 

The goal is to provide **Architectural Clarity**: using intentional white space, sophisticated tonal layering, and authoritative typography to make complex regulatory filings feel like reading a premium financial journal. We replace rigid, 1px-bordered grids with an asymmetric, fluid layout that guides the user’s eye through hierarchy rather than fences.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our palette centers on "Corporate Trust"—utilizing deep `primary` (#455f88) and `secondary` (#546073) blues against a sophisticated neutral base of `surface` (#f7fafc).

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** 
Structural boundaries must be defined through background color shifts. To separate a sidebar from a main content area, use `surface-container-low` (#eff4f7) against a `surface` (#f7fafc) background. This creates a "soft-edge" UI that feels organic and high-end rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to denote importance:
- **Level 0 (Base):** `surface` (#f7fafc) for the main application background.
- **Level 1 (Sectioning):** `surface-container-low` (#eff4f7) for large sidebar or navigation regions.
- **Level 2 (Interaction):** `surface-container` (#e7eff3) for secondary content cards.
- **Level 3 (Focus):** `surface-container-highest` (#d7e5eb) for active modal headers or intense focus areas.

### The "Glass & Gradient" Rule
To elevate the "SaaS" feel above government legacy systems, use Glassmorphism for floating elements (e.g., sticky headers).
- **Glass Effect:** Apply `surface` at 80% opacity with a `backdrop-blur` of 12px.
- **Signature Texture:** Primary CTAs should not be flat. Use a subtle linear gradient from `primary` (#455f88) to `primary_dim` (#39537c) at a 135-degree angle to provide "visual soul."

---

## 3. Typography

The system utilizes a dual-font strategy to balance "Authority" with "Utility."

*   **Display & Headlines (Manrope):** Chosen for its modern, geometric structure. Large scales like `display-lg` (3.5rem) should be used with `primary` color to anchor dashboard overviews.
*   **Body & Labels (Inter):** The workhorse for data-heavy GRC tables. Inter’s high x-height ensures readability at `body-sm` (0.75rem) for complex Indian regulatory fine print.

**Editorial Tip:** Use `headline-sm` (1.5rem) for section titles but pair it with a `label-md` (0.75rem) in `primary` all-caps for a "pre-header" to create a professional, categorized look.

---

## 4. Elevation & Depth

### The Layering Principle
Avoid "Drop Shadows" for standard cards. Instead, achieve lift by placing a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#eff4f7) background. This creates a "Paper-on-Stone" effect that is much cleaner for data-heavy GRC environments.

### Ambient Shadows
If an element must float (e.g., a critical "File Return" action button), use an **Ambient Shadow**:
- **Color:** `on_surface` (#283439) at 6% opacity.
- **Blur:** 24px.
- **Spread:** -4px.
This mimics natural light rather than digital "glow."

### The "Ghost Border" Fallback
Where accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` (#a7b4ba) at **15% opacity**. It should be barely perceptible, serving as a suggestion of a boundary rather than a hard stop.

---

## 5. Components

### Buttons
*   **Primary:** Gradient-filled (`primary` to `primary_dim`), `rounded-md` (0.375rem). Text in `on_primary`.
*   **Secondary:** No background, `outline-variant` (15% opacity ghost border).
*   **Tertiary:** Text-only in `primary_fixed_variant`, used for low-priority actions like "Save as Draft."

### Data Tables (The Core GRC Element)
*   **No Dividers:** Forbid horizontal lines. Use a `2.5` (0.5rem) spacing between rows and a subtle `surface-container-low` background on `:hover`.
*   **Headers:** Use `label-md` in `on_surface_variant`, all-caps, with a `0.1rem` letter spacing.

### Status Indicators (Chips)
*   **Success:** `surface-container` background with `on_primary_container` text and a 4px green dot.
*   **Critical/Danger:** `error_container` (#fe8983) at 20% opacity with `error` (#9f403d) text.
*   **Format:** Always use `rounded-full` for status chips to contrast against the `md` roundedness of the rest of the UI.

### Input Fields
*   **Active State:** Avoid thick borders. Use a `surface-container-lowest` background with a subtle 2px `primary` underline or a light `primary` halo (4% opacity).
*   **Labels:** Always floating or top-aligned using `label-md`. Never placeholder-only.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `20` (4.5rem) and `24` (5.5rem) spacing values to create "breathing room" between major regulatory sections.
*   **Do** lean into asymmetry. For example, a dashboard might have a wide 2/3 column for "Active Audits" and a narrow 1/3 column for "Compliance Calendar."
*   **Do** use `surface_dim` (#ccdde4) for inactive tabs to create a physical sense of "receding" into the background.

### Don't
*   **Don't** use 100% black text. Always use `on_surface` (#283439) to maintain a premium, softened contrast.
*   **Don't** use standard "Material" shadows. They feel too generic for a bespoke Indian SME portal.
*   **Don't** use vertical dividers between navigation items. Use `spacing-6` (1.3rem) to let the whitespace do the work.
*   **Don't** use "Warning Yellow." Use the refined `tertiary` (#615b77) tones for neutral states and reserved amber for true warnings.