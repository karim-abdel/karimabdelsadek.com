# Product

## Register

brand

## Users

Researchers, prospective collaborators, and students looking up Karim Abdel Sadek, his research, publications, and contact information. Visitors should be able to read comfortably on a laptop in a bright office or on a phone between meetings.

## Product Purpose

A personal academic website for Karim, a CS PhD student at UC Berkeley. Help readers understand his research interests, find papers and accompanying resources, and get in touch.

## Brand Personality

Personal, clear, approachable. Keep the author's first-person voice and let the research speak for itself.

## References

- https://benjaminfspector.com/: a simple, personal page with a narrow reading column and straightforward links.
- https://nsaphra.net/: an approachable academic profile with clear research information.
- User's September 2026 direction: a redesign inspired by these sites, possibly blue, with Google Sans; iterate together from a working first pass.
- Earlier direction: the wide centered grid was rejected in favor of a simple stacked structure, including the small unframed portrait above the name and plain paper lists. Keep Home instead of Index. The user prefers a cooler font with the personality of the earlier handwritten font, and a light green or white tone. The current pass uses Klee One throughout, a near-white sage background, dark green links, and the same small navigation and reading structure on every page. No side rail, large name masthead, circular portrait, or section divider lines.
- Post-publication feedback: the 560px column anchored near the top-left leaves excessive empty space on wide screens. Center the shared column and widen it modestly to 680px, with balanced automatic side margins on every page. Keep the text left-aligned and preserve the stacked portrait, name, links, and content rather than returning to the rejected sidebar/grid layout.
- Selected palette: Soft sage, chosen by the user after comparing green previews. Apply it throughout the site while preserving Klee One and the narrow structure. Earlier blue, cream, and white options are no longer the active direction.
- Portrait: keep the no-drink edited portrait, its appearance and elbow/mid-arm crop, and its enlarged 160px size.
- Latest structure: the top navigation contains only Home and Publications on every page. Karim preferred the earlier stacked heading, with the name slightly larger: portrait, a 24px name, then left-aligned Email, Google Scholar, Twitter, and CV links below it. Keep the links at the smaller 14px size from the side-by-side experiment, but do not return to the 30px name or right alignment. No "hi" greeting, repeated profile/contact links, or footers elsewhere. Keep the blog authoring system and CV file available; removing them from the top navigation does not delete them.
- Homepage copy: keep the original first paragraph exactly. Follow it with Karim's revised research paragraph, then the BSc-first background paragraph, then the contact paragraph. The research paragraph replaces the old standalone Research section, without duplicate copy. Correct obvious spelling and capitalization only in the revised background text.
- The contact paragraph links "read this" to `undergraduate-research.html`. Karim chose a new page that we will write together. It currently has an honest in-progress placeholder and is marked noindex; do not invent application requirements, commitments, or research opportunities. Remove noindex when the guidance is ready.
- Homepage ends with Selected papers and a smaller inline "(all papers)" link to Publications. No News section or separate all-publications link below the list. Show only the minimax-regret and caching/MTS papers in the shortlist; keep the learning-preferences paper on the full publications page.
- Selected-paper entries show the title first, then the full author list and conference on separate lines, with authors and conference equally indented. Preserve the same paper links, author order, and conference names as the publications page.
- Paper titles open the canonical `https://arxiv.org/abs/<id>` page on both Home and Publications. The separate "Paper" resource links beneath publication titles open the corresponding `https://arxiv.org/pdf/<id>` directly. Keep Bocconi University and UC Berkeley as plain text in the biography; retain the people, lab, fellowship, and email links.
- Publication entries show only title, authors, venue, and resource links. Karim asked to remove both TL;DR and Abstract, including their expandable controls and content. Use bold, dark ink for Karim's name in every author list; indent authors, venue, and resources consistently below each paper title. No OpenReview links or equal-contribution footer note. The undergraduate-research page has an explicit left-arrow "Back to home" link.
- Equal-contribution asterisks remain on the author names specified by Karim: Karim and Matthew Farrugia-Roberts for minimax regret; Karim, Mark Bedaywi, and Rhys Gould for learning preferences; Jort Vincenti, Karim, Joan Velja, and Matteo Nulli for dynamic vocabulary pruning. Match these markers on the homepage shortlist; leave the other papers unstarred.
- Preserve requested features: edited portrait without the Berlin background, Google Scholar link (author search until a profile URL is supplied), sober publications including the 2026 paper "Learning the Preferences of a Learning Agent", and Markdown-based blog posts with a shared template and generated index.

## Anti-references

The wide centered/sidebar-grid draft, an exact copy of the reference website's font and cream, inconsistent page themes, decorative gradients, floating shapes, glass navigation, boxed publication cards, exaggerated headings, and a corporate marketing tone. A hand-drawn font is welcome; keep normal capitalization for readable academic titles and prose.

## Design Principles

1. Make this feel like a person's page, with direct prose and a recognizable portrait.
2. Let typography and spacing organize the page.
3. Make papers, research interests, and contact details easy to find.
4. Keep existing academic facts, publication metadata, and resource links accurate.
5. Keep implementation simple and future iterations easy to review.

## Accessibility & Inclusion

Use semantic headings, visible keyboard focus, readable text contrast, a skip link, and layouts that work on narrow screens. These are implementation defaults, not independently confirmed user requirements.
