# Shared site design

## Direction

Personal, pencilled, unhurried. A small researcher's page, not a landing-page template.
Visitors are reading on a laptop in a bright office or on a phone between meetings;
use soft sage with dark green ink and moss-green links. The color strategy is restrained.
Keep a compact single-column structure, with the portrait beside the name and a centered reading column, so most of Home fits on a laptop screen without scrolling.

## Typography and color

- Klee One 400/600 for all pages, including the homepage and generated blog articles.
- Normal capitalization. Body 16px / 1.6, 12px between paragraphs, section h2 20px, h3 17px, page titles 28px. Denser type (October 2026, after Karim pointed to dharakyu.com) so a page reads in one go.
- Homepage name is 24px, a modest increase from 21px, followed by smaller 14px profile links beneath it. No greeting heading.
- Selected palette: Soft sage. Background `oklch(94.7830% 0.014709 132.475)` (#EAF0E6).
- Ink: `oklch(32.8316% 0.020662 147.866)` (#2E382F); muted text: `oklch(48.3993% 0.032691 146.632)`.
- Moss-green links: `oklch(46.0598% 0.064864 154.774)` (#396348); rules: `oklch(86.8626% 0.025267 137.813)`.
- Surfaces: `oklch(92.6862% 0.021728 130.021)`; selection: `oklch(89.4241% 0.036515 135.034)`.
- Body, link, and muted-text contrast on the page: 10.51:1, 5.93:1, and 5.46:1 respectively.
- Previous backgrounds: Mist & petrol (#EFF4F6), white, and near-white sage. These remain comparison history, not the current palette.

## Layout and shared elements

- 720px single column, horizontally centered with automatic side margins, a 32px top margin, and 20px below the navigation on desktop. Text remains left-aligned.
- At 800px and below, keep automatic side margins and use a 28px top margin. The column shrinks to preserve at least 24px on either side.
- Shared plain navigation: Home and Publications only. No separate brand masthead. The blog and CV remain available without top-nav links.
- `.page-heading`: on Home, the portrait sits left of a `.home-name` group (28px name, profile links beneath), vertically centered with a 16px gap (12px on phones); title and optional date on other pages.
- The sole profile-links row contains Email, Google Scholar, Twitter, and CV, below the name and above the biography. Keep it left-aligned with a 10px top margin and natural wrapping on narrow screens. No duplicated profile links below the prose, on the publications page, or in footers.
- `.content-section`: headings above prose and plain lists, separated by space rather than rules.
- `.content-column`: blog content has no side offset or extra columns.
- No contact footer; the homepage profile row is the single place for those links.
- Portrait uses `images/profile-square.jpg`, a 256px tighter square crop of `images/profile-no-drink.png` (head and shoulders, raised hand kept), shown at 128px beside the name (96px at 480px and below). Keep CSS grayscale and background blending. No frame or circle. The previous image is kept separately as a backup.
- Publications remain plain research records, no cards. Metadata and resource links are indented 18px beneath each title, with 24px between records and 30px between year groups. Year headings are a quieter 16px; titles 17px; authors, venue, and links 14px.
- The homepage Selected papers heading includes a 15px, regular-weight "(all papers)" link beside the 20px heading. No News section or secondary publications link below the three-item shortlist.
- Each selected paper has a 16px, 600-weight title in dark ink (linked, accent color and underline on hover, like Publications) followed by a 14px author list and conference on separate lines. Authors and conference share an 18px indent relative to the title. Retain list bullets, use 14px between papers, and match author names/order to the full publications page.
- All six publications contain titles, authors, venues, and resource links only. TL;DR and Abstract sections and their JavaScript controls were removed at Karim's request. Omit OpenReview links and the equal-contribution footer note, but retain the author asterisks specified in PRODUCT.md.
- Karim's name in each publication author list is 600-weight dark ink against the muted 400-weight coauthors.
- The undergraduate-research page includes a plain "← Back to home" link beneath its content, using the existing back-link treatment.

The source of truth for tokens is `style.css`. Blog markup lives in
`blog/templates/page.html` and `scripts/build-blog.mjs`; rebuild after changing either.
