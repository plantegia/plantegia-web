# Tool Page SEO Requirements

Guidelines for creating tool pages that are both useful and SEO-effective.

---

## Core Principle

**Tool-first, content-second.** The tool must be genuinely useful. Content exists to support the tool, not the other way around.

---

## URL Structure

```
/tools/{keyword-slug}
```

Examples:
- `/tools/dli-calculator`
- `/tools/vpd-chart`
- `/tools/ppfd-guide`

Rules:
- Use primary keyword in URL
- Lowercase, hyphen-separated
- Keep short (2-3 words max)

---

## Title Tag (50-60 characters)

Format:
```
{Primary Keyword} — Free {Benefit} | Plantegia
```

Examples:
- `DLI Calculator — Free Daily Light Integral Tool | Plantegia`
- `VPD Calculator — Optimize Your Grow Room Climate | Plantegia`
- `PPFD Chart — LED Grow Light Distance Guide | Plantegia`

Rules:
- Primary keyword first
- Include "Free" (high CTR trigger)
- Brand at the end

---

## Meta Description (150-160 characters)

Format:
```
{What it does} + {for whom} + {free/no signup}
```

Examples:
- `Calculate your grow room's Daily Light Integral instantly. Free DLI calculator for cannabis and indoor plants. No signup required.`
- `Find the optimal VPD for each growth stage. Free vapor pressure deficit calculator with recommendations. Works on mobile.`

Rules:
- Start with action verb (Calculate, Find, Plan)
- Mention target audience
- Include trust signals (free, no signup, instant)

---

## Page Structure

### Above the Fold

```
┌─────────────────────────────────────┐
│ H1: Primary Keyword                 │
│ Subtitle: One-line benefit          │
├─────────────────────────────────────┤
│ [THE TOOL - interactive, usable]    │
│                                     │
│ Inputs → Result + Recommendation    │
└─────────────────────────────────────┘
```

The tool MUST be visible without scrolling on desktop.

### Content Sections (below the fold)

| Section | Purpose | Word Count |
|---------|---------|------------|
| **What is {X}?** | Definition, context | 100-150 |
| **Reference Table** | Values by stage (seedling/veg/flower) | N/A |
| **How to Use** | Step-by-step if needed | 50-100 |
| **Tips / Common Mistakes** | Practical advice | 100-150 |
| **FAQ** | Long-tail keywords, featured snippets | 100-150 |
| **CTA** | Soft link to Plantegia | 30-50 |

Total target: **400-600 words** (enough for SEO, not bloated)

---

## UI Components & Interactivity

### No "Calculate" Buttons

All calculations must happen **in real-time** as user changes inputs. Never require a button click to see results.

Bad:
```
[Input] [Input] [Calculate Button] → Results
```

Good:
```
[Results update instantly]
[Input] [Input] ← user adjusts, results change live
```

### Input Types

**Use TickSlider (range slider with ticks) when:**
- Value is a bounded number (e.g., weeks: 1-12)
- There's a small, finite set of meaningful values
- User benefits from seeing the range visually
- Quick adjustment is more important than precise entry

**Use number input when:**
- Value range is very large or unbounded
- Precision matters (e.g., exact PPFD value)
- User likely knows the exact number they want

**Use dropdown/select when:**
- Options are categorical, not numeric
- Less than 6-8 options
- Options have specific meanings (e.g., light schedule: 18/6, 12/12)

### Layout: Results First

Put results **above** the controls. User sees the answer immediately, then adjusts inputs below.

```
┌─────────────────────────────────┐
│ [RESULTS - big, prominent]      │
├─────────────────────────────────┤
│ [Controls/Sliders]              │
│ [Controls/Sliders]              │
├─────────────────────────────────┤
│ [CTA to Plantegia]              │
└─────────────────────────────────┘
```

### Reusable Components

Use shared components from `src/components/ui/`:
- `TickSlider.tsx` — slider with tick marks and value display
- More to be added as needed

---

## H1 Rules

- One H1 per page
- Must contain primary keyword
- Keep concise (5-8 words)

Good:
- `DLI Calculator for Indoor Growing`
- `VPD Calculator & Chart`

Bad:
- `The Ultimate Free DLI Calculator Tool for Cannabis Growers` (too long)
- `Calculator` (too generic)

---

## H2 Sections (3-4 per page)

Use H2 for main sections, include secondary keywords:

```
## What is DLI? (Daily Light Integral Explained)
## Recommended DLI by Growth Stage
## How to Increase Your DLI
## Frequently Asked Questions
```

---

## Reference Tables

Every tool should have a reference table with recommended values:

```markdown
| Stage | Recommended Range | Notes |
|-------|-------------------|-------|
| Seedling | 12-18 mol/m²/day | Lower end for delicate seedlings |
| Vegetative | 18-30 mol/m²/day | Higher = faster growth |
| Flowering | 30-45 mol/m²/day | Max light for best yields |
```

Tables are:
- Easy to scan
- Good for featured snippets
- Provide real value

---

## FAQ Section

Include 2-4 questions targeting long-tail keywords:

```markdown
### What DLI do I need for flowering cannabis?
Flowering cannabis performs best at 30-45 mol/m²/day...

### How do I calculate DLI from PPFD?
DLI = PPFD × hours × 0.0036...

### Is higher DLI always better?
No. Exceeding 45-50 mol/m²/day can cause light stress...
```

Format as actual questions (good for voice search and featured snippets).

---

## Schema Markup

Every tool page must have:

### WebApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "DLI Calculator",
  "description": "Calculate Daily Light Integral for your grow room",
  "applicationCategory": "Utility",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### FAQPage Schema (if FAQ section exists)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
```

---

## Internal Linking

Each tool page should link to:
- 1-2 other related tools
- Main Plantegia app (soft CTA)
- Related guide (only if it exists and adds value)

Example for DLI Calculator:
- Link to PPFD Guide (related concept)
- Link to VPD Calculator (same audience)
- Link to Plantegia app

---

## CTA Section

Soft, not pushy:

```markdown
## Plan Your Entire Grow

DLI is just one piece of the puzzle. **Plantegia** helps you plan
plant rotations, track schedules, and visualize your entire grow
operation.

[Try Plantegia Free →]
```

Rules:
- Acknowledge the tool's value first
- Connect to broader problem Plantegia solves
- One clear CTA button/link

---

## What NOT to Do

### No filler content
Bad: "In today's world of indoor growing, many cultivators are looking for ways to optimize their setup. One important factor to consider is..."

Good: "DLI (Daily Light Integral) measures total light your plants receive in 24 hours."

### No keyword stuffing
Bad: "This free DLI calculator is the best DLI calculator for calculating DLI..."

Good: Natural language with keywords in headings and first paragraph.

### No duplicate content
Each tool page must have unique content. Don't copy-paste explanations between pages.

### No walls of text
Use:
- Short paragraphs (2-3 sentences)
- Bullet points
- Tables
- Bold for key terms

### No false promises
Don't claim the tool does things it doesn't. Be accurate about limitations.

---

## Checklist Before Publishing

- [ ] URL contains primary keyword
- [ ] Title tag: 50-60 chars, keyword first
- [ ] Meta description: 150-160 chars, action-oriented
- [ ] H1: Contains primary keyword, one per page
- [ ] Tool is above the fold
- [ ] Reference table with stage recommendations
- [ ] 400+ words of useful content
- [ ] 3-4 H2 sections with secondary keywords
- [ ] FAQ section (2-4 questions)
- [ ] Internal links to 2-3 other pages
- [ ] Schema markup (WebApplication + FAQ)
- [ ] Soft CTA to Plantegia
- [ ] Mobile responsive
- [ ] Page loads fast (<3s)

---

## Tool Ideas & Keywords

| Tool | Primary Keyword | Secondary Keywords |
|------|-----------------|-------------------|
| DLI Calculator | dli calculator | daily light integral, dli cannabis, mol/m²/day |
| VPD Calculator | vpd calculator | vapor pressure deficit, vpd chart cannabis |
| PPFD Guide | ppfd chart | led distance calculator, grow light height |
| Harvest Calculator | harvest date calculator | when to harvest, flowering time |
| Tent Size Calculator | grow tent size calculator | plants per tent, tent capacity |

---

*Version: 1.0*
*Created: January 2025*
