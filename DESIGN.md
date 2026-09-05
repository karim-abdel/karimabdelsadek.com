# Shared site design

## Direction

Personal, pencilled, unhurried. A small researcher's page, not a landing-page template.
Visitors are reading on a laptop in a bright office or on a phone between meetings;
use soft sage with dark green ink and moss-green links. The color strategy is restrained.
Restore the preferred narrow structure; distinguish it through type and tone.

## Typography and color

- Klee One 400/600 for all pages, including the homepage and generated blog articles.
- Normal capitalization. Body 17px / 1.65, section h2 22px, h3 19px, page titles 28px.
- Homepage name is 24px, a modest increase from 21px, followed by smaller 14px profile links beneath it. No greeting heading.
- Selected palette: Soft sage. Background `oklch(94.7830% 0.014709 132.475)` (#EAF0E6).
- Ink: `oklch(32.8316% 0.020662 147.866)` (#2E382F); muted text: `oklch(48.3993% 0.032691 146.632)`.
- Moss-green links: `oklch(46.0598% 0.064864 154.774)` (#396348); rules: `oklch(86.8626% 0.025267 137.813)`.
- Surfaces: `oklch(92.6862% 0.021728 130.021)`; selection: `oklch(89.4241% 0.036515 135.034)`.
- Body, link, and muted-text contrast on the page: 10.51:1, 5.93:1, and 5.46:1 respectively.
- Previous backgrounds: Mist & petrol (#EFF4F6), white, and near-white sage. These remain comparison history, not the current palette.

## Layout and shared elements

- 560px single column, 120px left margin and 56px top margin on desktop.
- At 800px and below, use 24px side margins and 36px top margin.
- Shared plain navigation: Home and Publications only. No separate brand masthead. The blog and CV remain available without top-nav links.
- `.page-heading`: stacked small portrait, name, and profile links on Home; title and optional date on other pages. The side-by-side name/links experiment was not preferred.
- The sole profile-links row contains Email, Google Scholar, Twitter, and CV, below the name and above the biography. Keep it left-aligned with an 18px top margin and natural wrapping on narrow screens. No duplicated profile links below the prose, on the publications page, or in footers.
- `.content-section`: headings above prose and plain lists, separated by space rather than rules.
- `.content-column`: blog content has no side offset or extra columns.
- No contact footer; the homepage profile row is the single place for those links.
- Portrait uses `images/profile-no-drink.png` at 160px, increased from 135px. Preserve the existing top-aligned square crop ending around the elbow/mid-arm, CSS grayscale, and background blending. No frame or circle. The previous image is kept separately as a backup.
- Publications remain plain research records, no cards. Metadata and resource links are indented 18px beneath each title, with 32px between records and 36px between year groups. Year headings are a quieter 17px; titles remain 19px.
- The homepage Selected papers heading includes a 16px, regular-weight "(all papers)" link beside the 22px heading. No News section or secondary publications link below the two-item shortlist.
- Each selected paper has a 17px linked title followed by a 15px author list and conference on separate lines. Authors and conference share an 18px indent relative to the title. Retain list bullets, use 22px between papers, and match author names/order to the full publications page.
- All five publications contain titles, authors, venues, and resource links only. TL;DR and Abstract sections and their JavaScript controls were removed at Karim's request. Omit OpenReview links and the equal-contribution footer note, but retain the author asterisks specified in PRODUCT.md.
- Karim's name in each publication author list is 600-weight dark ink against the muted 400-weight coauthors.
- The undergraduate-research page includes a plain "← Back to home" link beneath its content, using the existing back-link treatment.

The source of truth for tokens is `style.css`. Blog markup lives in
`blog/templates/page.html` and `scripts/build-blog.mjs`; rebuild after changing either.
