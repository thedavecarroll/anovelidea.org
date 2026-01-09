---
title: Accessibility and Standards
date: 2026-01-08
layout: page
---

### Commitment to Quality

This site is validated before every deployment to ensure it meets web standards and accessibility guidelines.

### Validation Checks

The following automated checks run before code is committed:

#### HTML Validation

- **Tool:** [html-validate](https://html-validate.org/)
- **Standard:** HTML5 with recommended rules
- **Scope:** All generated HTML pages

#### CSS Validation

- **Tool:** [Stylelint](https://stylelint.io/)
- **Standard:** Standard SCSS rules
- **Scope:** All stylesheets

#### Accessibility (Static)

- **Tool:** [html-validate a11y preset](https://html-validate.org/rules/presets.html#html-validate-a11y)
- **Standards:** WCAG 2.1 Level A and AA (subset)
- **Checks include:**
  - Images have alt text
  - Form elements have labels
  - Headings are properly structured
  - Links have accessible names
  - ARIA attributes are valid

#### Accessibility (Dynamic)

- **Tool:** [axe-core](https://github.com/dequelabs/axe-core) via Playwright
- **Standards:** WCAG 2.0, 2.1, and 2.2 Level A and AA
- **Scope:** All pages tested on every commit
- **Includes:** Target size checks (2.5.8)

### What This Means

Every page you visit has passed automated validation for:

- Valid, well-formed HTML
- Standards-compliant CSS
- Basic accessibility requirements

### Limitations

Automated testing catches many issues but cannot replace human judgment. If you encounter any accessibility barriers on this site, please let me know.
