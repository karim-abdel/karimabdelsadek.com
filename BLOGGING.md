# Writing blog posts

Write one Markdown file per post. The build produces ordinary HTML pages and
updates the blog index automatically, newest first. Visitors need no JavaScript.
Blog is intentionally absent from the top navigation; the index remains available
at `blog.html`, and published posts can still be shared by their direct URLs.

## First-time setup

Install Node.js 20 or newer, then run this from the website folder:

```sh
npm ci
```

## Create and publish a post

```sh
npm run new:post -- "My first post"
```

Open `blog/posts/my-first-post.md`. It contains a draft starter with examples of
headings, links, quotations, and code blocks. Replace its content and edit the
metadata at the top:

```yaml
---
title: "My first post"
date: 2026-09-04
description: "A brief summary to show on the blog index."
draft: false
---
```

Then build the website:

```sh
npm run build
```

This updates the local blog pages and creates a **publish-ready `dist/` folder**
containing the website, published posts, and assets. Markdown sources, templates,
scripts, and draft posts are excluded. The example above appears at
`dist/blog/my-first-post/index.html`. To preview the publish-ready site:

```sh
python3 -m http.server 8000 --directory dist
```

Visit <http://localhost:8000/blog.html>. Publish the **contents of `dist/`** to your
static host. For a host that runs builds, use `npm ci && npm run build` as the build
command and `dist` as the output directory. Hosting doesn't need a running Node.js
server. Keep `dist/` managed by the build; put new assets in the source directories.

This repository is connected to Vercel. The checked-in `vercel.json` configures
the install, build, and `dist` output automatically. Commit and push your changes
to `master` to update the live site, then check that the Vercel deployment succeeds.

`npm run build:blog` is a faster option when you only want to update `blog.html` and
the generated post pages beside the original site files. Run `npm run build`
before publishing to refresh `dist/` as well.

## Files you edit

| File | Purpose |
| --- | --- |
| `blog/posts/<slug>.md` | One post, with title, date, description, draft flag, and Markdown body. |
| `blog/templates/post.md` | Starter copied by `new:post`. |
| `blog/templates/page.html` | Shared page shell, Home/Publications navigation, and fonts for all blog pages. |
| `style.css` | Site styles; article content uses `.post-body`. |
| `images/blog/` or `blog/assets/` | Optional post images and supporting files, copied to `dist/`. |

`blog.html` and `blog/<slug>/index.html` are generated. Edit their source files
instead, then rebuild. The filename determines the URL, so keep it unchanged once
you share a post. Use lowercase words separated by hyphens. `posts`, `templates`,
and `assets` are reserved names.

## Drafts and revisions

- `draft: true` excludes a post from the generated index and creates no HTML page.
- `draft: false` publishes it on the next build. The date determines sorting; it
  does not schedule publication.
- To revise a post, edit its Markdown and rebuild.
- To unpublish one, set `draft: true` or remove its Markdown and rebuild. The build
  removes its old generated HTML; include that deletion when deploying.
- Publish `dist/` so Markdown sources and drafts stay out of the hosted website.
  A public source repository can still expose draft Markdown committed to it.

The build checks required metadata and calendar dates before changing pages. It
also refuses to overwrite hand-written HTML files.

## Markdown, images, and links

Start section headings at `##`; the template adds the post title as `h1`.
GitHub-style Markdown supports lists, links, images, tables, quotations, and fenced
code blocks. Inline HTML is supported for your own trusted content.

Links and image paths are relative to the **published post URL**, which is two
directories below the website root:

```md
[My publications](../../publications.html)
[Another post](../another-post/index.html)
![Explain what this figure shows](../../images/blog/my-figure.png)
```

Put figures in `images/blog/` (create the folder as needed). External links work
normally. Rebuild after changing the shared template to update every blog page.

## Check the authoring tools

```sh
npm test
```

The checks build temporary posts to verify Markdown rendering, ordering, draft
exclusion, unpublishing, metadata validation, and links without adding example
posts to the public site.
