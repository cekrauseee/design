---
name: save-as-pdf
description: "Export designs as print-ready PDF. Trigger: 'export to PDF', 'print version', 'save as PDF', 'downloadable document'."
---

# save-as-pdf

### Print stylesheet

Add a `@media print` block to the document's CSS:

```css
@media print {
  @page {
    size: 1920px 1080px landscape;  /* or A4, Letter, etc. */
    margin: 0;
  }

  body {
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;  /* preserves background colors */
  }

  .no-print { display: none !important; }

  /* One slide / page per page */
  section, .slide, .page {
    page-break-after: always;
    break-after: page;
  }

  /* Avoid ugly mid-element breaks */
  h1, h2, h3, figure, blockquote, table {
    break-inside: avoid;
  }
}
```

### Page sizes

| Content | `@page size` |
|---|---|
| Deck 16:9 | `1920px 1080px landscape` |
| Deck 4:3 | `1024px 768px landscape` |
| US Letter document | `Letter` |
| A4 document | `A4` |
| Wireframe canvas | `1440px 900px landscape` |
| Tabloid | `Tabloid landscape` |

### Export process

1. Open the file in Chrome (best print fidelity).
2. `Cmd+P` (Mac) or `Ctrl+P` (Windows).
3. **Destination:** Save as PDF.
4. **Margins:** None.
5. **Background graphics:** ON (otherwise backgrounds disappear).
6. **Scale:** 100% (Default).
7. Preview each page — should be exactly one slide / page each.

### For decks specifically

The `deck-stage.js` starter already implements print-to-PDF: one slide
per page, no chrome (slide counter, controls hidden). If a slide breaks
across pages, check:

- `page-break-after: always` is applied to `<section>` children
- No `overflow: hidden` is clipping content
- `@page size` matches the slide dimensions
- No element has explicit positioning beyond the slide bounds

### Type sizes for print

- Body: **12pt minimum**, 14pt for comfortable reading
- Headings: scale up generously
- Captions / footnotes: 9pt minimum, 10pt better

Don't squeeze 14px screen body text onto print and expect it to work
— always check the printed preview.

### Anti-patterns

- Exporting with nav chrome visible (always hide `.no-print` elements)
- Browser default margins (always zero or intentional)
- Text too small to read in print
- Pure `#000` ink on `#fff` paper — feels harsh; use tinted neutrals
