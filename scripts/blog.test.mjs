import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, access, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildBlog, siteRoot } from './build-blog.mjs';
import { newPost } from './new-post.mjs';
import { buildSite } from './build-site.mjs';

async function fixture(t) {
    const root = await mkdtemp(path.join(os.tmpdir(), 'karim-blog-test-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    await mkdir(path.join(root, 'blog/posts'), { recursive: true });
    await mkdir(path.join(root, 'blog/templates'), { recursive: true });
    for (const filename of ['page.html', 'post.md']) {
        await copyFile(path.join(siteRoot, 'blog/templates', filename), path.join(root, 'blog/templates', filename));
    }
    return root;
}

function post({ title = 'A post', date = '2026-09-04', description = 'A short summary.', draft = false, body = 'A paragraph.' } = {}) {
    return `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\ndescription: ${JSON.stringify(description)}\ndraft: ${draft}\n---\n\n${body}\n`;
}

function assertMinimalNavigation(html) {
    const navigation = html.match(/<nav class="site-nav" aria-label="Main navigation">([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(navigation, 'main navigation is present');
    const links = [...navigation.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
        .map(([, href, label]) => ({ href: href.replace(/^\.\.\/\.\.\//, ''), label }));
    assert.deepEqual(links, [
        { href: 'index.html', label: 'Home' },
        { href: 'publications.html', label: 'Publications' }
    ]);
    assert.doesNotMatch(html, /<footer\b|class="footer-links"/);
    assert.match(html, /href="(?:\.\.\/\.\.\/)?style\.css\?v=19"/);
}

test('empty blogs and drafts produce no invented public posts', async t => {
    const root = await fixture(t);
    assert.deepEqual(await buildBlog(root), { published: 0, drafts: 0 });
    await writeFile(path.join(root, 'blog/posts/private-draft.md'), post({ title: 'Private draft', draft: true }));
    assert.deepEqual(await buildBlog(root), { published: 0, drafts: 1 });
    const index = await readFile(path.join(root, 'blog.html'), 'utf8');
    assert.match(index, /No posts yet\./);
    assert.doesNotMatch(index, /Private draft/);
    assert.match(index, /href="index\.html"/);
    assertMinimalNavigation(index);
    assert.doesNotMatch(index, /aria-current=/);
    assert.match(index, /<div class="content-column">\s*<p class="empty-state">No posts yet\.<\/p>\s*<\/div>/);
    await assert.rejects(access(path.join(root, 'blog/private-draft/index.html')), { code: 'ENOENT' });
});

test('posts sort newest first, escape metadata, and preserve rich Markdown and relative links', async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, 'blog/posts/older.md'), post({ title: 'Older', date: '2025-12-31' }));
    await writeFile(path.join(root, 'blog/posts/newer.md'), post({
        title: 'Newer <&> "Title"', description: 'A "quote" & <summary>',
        body: '## Section\n\n[Publications](../../publications.html)\n\n![A figure](../../images/blog/figure.png)\n\n> A quotation.\n\n```python\nif a < b:\n    print("hello")\n```\n\n| Item | Value |\n| --- | --- |\n| One | Two |'
    }));
    await buildBlog(root);
    const index = await readFile(path.join(root, 'blog.html'), 'utf8');
    assert.ok(index.indexOf('blog/newer/index.html') < index.indexOf('blog/older/index.html'));
    assert.match(index, /Newer &lt;&amp;&gt; &quot;Title&quot;/);
    assert.match(index, /A &quot;quote&quot; &amp; &lt;summary&gt;/);
    const html = await readFile(path.join(root, 'blog/newer/index.html'), 'utf8');
    assert.match(html, /href="\.\.\/\.\.\/style\.css\?v=19"/);
    assert.match(html, /href="\.\.\/\.\.\/blog\.html">All posts<\/a>/);
    assert.doesNotMatch(html, /aria-current=/);
    assert.match(html, /href="\.\.\/\.\.\/publications\.html"/);
    assert.match(html, /src="\.\.\/\.\.\/images\/blog\/figure\.png"/);
    assert.match(html, /<blockquote>\n<p>A quotation\.<\/p>/);
    assert.match(html, /<pre><code class="language-python">if a &lt; b:/);
    assert.match(html, /<table>/);
    assert.match(html, /<h2>Section<\/h2>/);
    assert.doesNotMatch(html, /\{\{(?:title|description|root|content|blogCurrent)\}\}/);
});

test('blog index and articles share minimal navigation, no repeated footer links, and simple stacked headings', async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, 'blog/posts/layout.md'), post({ title: 'Layout check' }));
    await buildBlog(root);
    const index = await readFile(path.join(root, 'blog.html'), 'utf8');
    const article = await readFile(path.join(root, 'blog/layout/index.html'), 'utf8');
    for (const html of [index, article]) {
        assert.match(html, /family=Klee\+One:wght@400;600/);
        assert.doesNotMatch(html, /family=(?:Delius|Google\+Sans)/);
        const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
        assert.ok(header, 'site header is present');
        assert.doesNotMatch(header, /class="site-name"/);
        assertMinimalNavigation(html);
        assert.match(html, /<header class="page-heading">\s*<h1>/);
        assert.doesNotMatch(html, /class="heading-(?:aside|main)"/);
        assert.doesNotMatch(html, /href="(?:mailto:|https:\/\/twitter\.com\/|https:\/\/scholar\.google\.com\/|(?:\.\.\/\.\.\/)?KarimAbdelSadek_CV\.pdf)/);
    }
    const headerPattern = /<header class="site-header">[\s\S]*?<\/header>/;
    assert.equal(article.match(headerPattern)[0].replaceAll('../../', ''), index.match(headerPattern)[0]);
    assert.match(index, /<h1>Blog<\/h1>\s*<\/header>\s*<div class="content-column">\s*<ul class="post-list">/);
    assert.match(article, /<article class="blog-post">\s*<header class="page-heading">/);
    assert.match(article, /<h1>Layout check<\/h1>\s*<p class="post-date"><time datetime="2026-09-04">September 4, 2026<\/time><\/p>\s*<\/header>\s*<div class="content-column">\s*<div class="post-body">\s*<p>A paragraph\.<\/p>\s*<\/div>\s*<p class="back-link"><a href="\.\.\/\.\.\/blog\.html">All posts<\/a><\/p>\s*<\/div>\s*<\/article>/);
});

test('Home stacks its name above unique profile links; Home and Publications use the shared minimal shell', async () => {
    const home = await readFile(path.join(siteRoot, 'index.html'), 'utf8');
    const publications = await readFile(path.join(siteRoot, 'publications.html'), 'utf8');
    for (const html of [home, publications]) assertMinimalNavigation(html);
    const heading = home.match(/<header class="page-heading home-heading">([\s\S]*?)<\/header>/)?.[1];
    assert.ok(heading, 'homepage heading is present');
    assert.match(heading, /<h1>Karim Abdel Sadek<\/h1>\s*<nav class="contact-links" aria-label="Profile links">/);
    assert.doesNotMatch(heading, /class="identity-row"/);
    assert.equal([...heading.matchAll(/<h1\b/g)].length, 1, 'homepage name is not duplicated');
    assert.doesNotMatch(home, /<h[1-6][^>]*>\s*hi\s*<\/h[1-6]>/i);
    const profileLinks = [
        ['mailto:karimabdel@berkeley.edu', 'Email'],
        ['https://scholar.google.com/citations?view_op=search_authors&amp;mauthors=Karim+Abdel+Sadek&amp;hl=en', 'Google Scholar'],
        ['https://twitter.com/Karim_abdelll', 'Twitter'],
        ['KarimAbdelSadek_CV.pdf', 'CV']
    ];
    const anchors = [...heading.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [href, label]);
    assert.deepEqual(anchors, profileLinks);
    for (const [href] of profileLinks) {
        assert.equal(home.split(`href="${href}"`).length - 1, 1, `${href} appears once on Home`);
        assert.ok(!publications.includes(`href="${href}"`), `${href} is not repeated on Publications`);
    }
    assert.match(home, /href="index\.html" aria-current="page"/);
    assert.match(publications, /href="publications\.html" aria-current="page"/);
});

test('the shared shell is wider and centered on desktop and mobile', async () => {
    const stylesheet = await readFile(path.join(siteRoot, 'style.css'), 'utf8');
    const shell = stylesheet.match(/\.site-shell\s*\{([^}]*)\}/)?.[1];
    assert.ok(shell, 'shared shell rule is present');
    assert.match(shell, /(?:^|;)\s*width:\s*680px\s*;/);
    assert.match(shell, /(?:^|;)\s*max-width:\s*calc\(100%\s*-\s*48px\)\s*;/);
    assert.match(shell, /(?:^|;)\s*margin:\s*64px\s+auto\s+88px\s*;/);
    const mobileShell = stylesheet.match(/@media\s*\(max-width:\s*800px\)\s*\{\s*\.site-shell\s*\{([^}]*)\}/)?.[1];
    assert.ok(mobileShell, 'mobile shell adjustment is present');
    assert.match(mobileShell, /(?:^|;)\s*margin:\s*36px\s+auto\s+64px\s*;/);
    for (const [, rule] of stylesheet.matchAll(/\.site-shell\s*\{([^}]*)\}/g)) {
        assert.doesNotMatch(rule, /(?:^|;)\s*margin-(?:left|right):/);
        assert.doesNotMatch(rule, /(?:^|;)\s*margin:\s*(?:56px\s+0\s+88px\s+120px|36px\s+24px\s+64px)\s*;/);
    }
});

test('Home presents introduction, research, background, and contact without duplicate biography sections', async () => {
    const home = await readFile(path.join(siteRoot, 'index.html'), 'utf8');
    const about = home.match(/<section class="content-section about"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(about, 'homepage biography is present');
    const paragraphs = [...about.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, content]) => content);
    assert.equal(paragraphs.length, 4, 'biography has the four requested paragraphs');
    assert.match(paragraphs[0], /^I am a second-year CS PhD student/);
    assert.match(paragraphs[0], /at UC Berkeley\./);
    assert.match(paragraphs[1], /^I am broadly interested in/);
    assert.deepEqual([...paragraphs[1].matchAll(/<strong>([^<]+)<\/strong>/g)].map(([, interest]) => interest), [
        'Reinforcement Learning', 'Cooperative AI', 'AI Safety'
    ]);
    assert.match(paragraphs[1], /I aspire for my work to be a mix of theory and practice/);
    const background = paragraphs[2].replace(/<[^>]+>/g, '');
    assert.match(background, /^I completed my BSc in Mathematics and Computer Science at Bocconi University/);
    assert.ok(background.indexOf('BSc') < background.indexOf('MSc'), 'background starts with BSc before MSc');
    for (const name of ['Marek Eliáš', 'Georgia Tech', 'David Krueger', 'Michael Dennis', 'Micah Carroll']) {
        assert.ok(background.includes(name), `${name} is retained in the background`);
    }
    assert.match(paragraphs[2], /at Bocconi University, where/);
    const biographyLinks = [...about.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
        .map(([, label]) => label.replace(/<[^>]+>/g, '').trim());
    for (const label of biographyLinks) {
        assert.doesNotMatch(label, /\b(?:UC Berkeley|Bocconi University)\b/, 'university names are plain text, not links');
    }
    assert.match(paragraphs[0], /<a href="https:\/\/people\.eecs\.berkeley\.edu\/~russell\/">Stuart Russell<\/a>/);
    assert.match(paragraphs[0], /<a href="https:\/\/humancompatible\.ai\/">CHAI<\/a>/);
    assert.match(paragraphs[0], /<a href="https:\/\/bair\.berkeley\.edu\/">BAIR<\/a>/);
    assert.match(paragraphs[3], /^Please reach out/);
    assert.match(paragraphs[3], /karimabdel at berkeley dot edu/);
    assert.match(paragraphs[3], /<a href="undergraduate-research\.html"[^>]*>read this<\/a>/);
    assert.equal([...home.matchAll(/I am broadly interested in/g)].length, 1);
    assert.equal(paragraphs.filter(paragraph => /^I completed my (?:BSc|MSc)/.test(paragraph)).length, 1);
    assert.equal([...home.matchAll(/I completed my BSc/g)].length, 1);
    assert.equal([...home.matchAll(/I completed my MSc/g)].length, 1);
    assert.equal([...home.matchAll(/id="research"/g)].length, 1, 'existing research fragment remains available');
    assert.doesNotMatch(home, /id="research-heading"|Recently, I have been mostly excited|Before starting my PhD, I spent time/);
});

test('Home keeps two papers with titles followed by grouped authors and venues, an inline all-papers link, and no News section', async () => {
    const home = await readFile(path.join(siteRoot, 'index.html'), 'utf8');
    const publications = await readFile(path.join(siteRoot, 'publications.html'), 'utf8');
    const selected = home.match(/<section id="publications"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(selected, 'selected papers section is present');
    const heading = selected.match(/<h2 id="publications-heading">([\s\S]*?)<\/h2>/)?.[1];
    assert.ok(heading, 'selected papers heading is present');
    assert.match(heading, /^Selected papers\s+<a\b[^>]*>\(all papers\)<\/a>$/);
    const allPapersLink = heading.match(/<a\b[^>]*>\(all papers\)<\/a>/)?.[0];
    assert.match(allPapersLink, /class="all-papers-link"/);
    assert.match(allPapersLink, /href="publications\.html"/);
    const list = selected.match(/<ul class="paper-list">([\s\S]*?)<\/ul>/)?.[1];
    assert.ok(list, 'selected papers list is present');
    assert.equal([...list.matchAll(/<li\b/g)].length, 2);
    assert.match(list, /Mitigating Goal Misgeneralization via Minimax Regret/);
    assert.match(list, /Algorithms for Caching and MTS with reduced number of predictions/);
    const records = [...publications.matchAll(/<article class="publication"[^>]*>([\s\S]*?)<\/article>/g)]
        .map(([, content]) => ({
            title: content.match(/<h3><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/),
            authors: content.match(/<p class="authors">([\s\S]*?)<\/p>/)?.[1],
            venue: content.match(/<p class="venue">([\s\S]*?)<\/p>/)?.[1]
        }));
    const normalizeWhitespace = value => value.replace(/\s+/g, ' ').trim();
    const entries = [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, content]) => content);
    assert.equal(entries.length, 2, 'both selected papers retain complete list items');
    for (const entry of entries) {
        const metadata = entry.match(/^\s*<h3 class="paper-title">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h3>\s*<div class="paper-meta">\s*<p class="paper-authors">([\s\S]*?)<\/p>\s*<p class="paper-venue">([\s\S]*?)<\/p>\s*<\/div>\s*$/);
        assert.ok(metadata, 'each title precedes one metadata group containing authors then conference');
        const [, href, title, authors, venue] = metadata;
        assert.match(href, /^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{5}$/, 'selected paper title opens its canonical arXiv abstract page');
        const record = records.find(publication => publication.title?.[1] === href);
        assert.ok(record, `${title} links to the same paper as its Publications record`);
        assert.equal(title, record.title[2], 'selected paper retains its full title');
        assert.ok(record.authors && record.venue, 'matching Publications record retains authors and venue');
        assert.equal(normalizeWhitespace(authors), normalizeWhitespace(record.authors), `${title} retains the full author list and emphasis`);
        assert.match(authors, /<strong>Karim Abdel Sadek\*?<\/strong>/);
        assert.equal(normalizeWhitespace(venue), normalizeWhitespace(record.venue), `${title} retains its conference without added parentheses`);
        assert.doesNotMatch(venue, /[()]/);
    }
    assert.doesNotMatch(selected, /Learning the Preferences of a Learning Agent|2605\.09217/);
    assert.doesNotMatch(home, /class="more-papers"|id="news"|id="news-heading"|class="news-list"/);
});

test('Publications retain five compact paper records and correct contribution stars, without summaries, abstracts, or review links', async () => {
    const publications = await readFile(path.join(siteRoot, 'publications.html'), 'utf8');
    const papers = [...publications.matchAll(/<article class="publication"[^>]*>([\s\S]*?)<\/article>/g)]
        .map(([, content]) => content);
    assert.equal(papers.length, 5);
    const starredAuthorsByPaper = new Map([
        ['https://arxiv.org/abs/2605.09217', ['Karim Abdel Sadek*', 'Mark Bedaywi*', 'Rhys Gould*']],
        ['https://arxiv.org/abs/2507.03068', ['Karim Abdel Sadek*', 'Matthew Farrugia-Roberts*']],
        ['https://arxiv.org/abs/2410.18952', ['Jort Vincenti*', 'Karim Abdel Sadek*', 'Joan Velja*', 'Matteo Nulli*']],
        ['https://arxiv.org/abs/2404.06280', []],
        ['https://arxiv.org/abs/2411.07200', []]
    ]);
    const expectedRecords = [
        {
            title: 'Learning the Preferences of a Learning Agent',
            authors: 'Karim Abdel Sadek*, Mark Bedaywi*, Rhys Gould*, Stuart Russell',
            venue: 'MALGAI Workshop, ICLR 2026',
            resources: [['https://arxiv.org/pdf/2605.09217', 'Paper']]
        },
        {
            title: 'Mitigating Goal Misgeneralization via Minimax Regret',
            authors: 'Karim Abdel Sadek*, Matthew Farrugia-Roberts*, Usman Anwar, Hannah Erlebach, Christian Schroeder de Witt, David Krueger, Michael Dennis',
            venue: 'RLC 2025',
            resources: [
                ['https://arxiv.org/pdf/2507.03068', 'Paper'],
                ['https://github.com/matomatical/jaxgmg', 'Code'],
                ['https://docs.google.com/presentation/d/1FX3MnfKo9PInWab5yIrKakMpAdfev7MFkOWsAXgtcEs/edit?usp=sharing', 'Slides'],
                ['https://docs.google.com/presentation/d/16ODI2b3xTaSZ-wTpGtuupLXRx29wrEIp0utGAZFtQ5Q/edit?usp=sharing', 'Poster']
            ]
        },
        {
            title: 'Dynamic Vocabulary Pruning in Early-Exit LLMs',
            authors: 'Jort Vincenti*, Karim Abdel Sadek*, Joan Velja*, Matteo Nulli*, Metod Jazbec',
            venue: 'ENLSP Workshop, NeurIPS 2024',
            resources: [
                ['https://arxiv.org/pdf/2410.18952', 'Paper'],
                ['https://github.com/MatteoNulli/Vocabulary_pruning/tree/main', 'Code']
            ]
        },
        {
            title: 'Algorithms for Caching and MTS with reduced number of predictions',
            authors: 'Karim Abdel Sadek, Marek Eliáš',
            venue: 'ICLR 2024',
            resources: [['https://arxiv.org/pdf/2404.06280', 'Paper']]
        },
        {
            title: "'Explaining RL Decisions with Trajectories': A Reproducibility Study",
            authors: 'Karim Abdel Sadek, Matteo Nulli, Joan Velja, Jort Vincenti',
            venue: 'TMLR 2024',
            resources: [
                ['https://arxiv.org/pdf/2411.07200', 'Paper'],
                ['https://github.com/karim-abdel/Explaining-RL-Decisions-with-Trajectories', 'Code']
            ]
        }
    ];
    const actualRecords = papers.map(paper => ({
        title: paper.match(/<h3><a\b[^>]*>([^<]+)<\/a><\/h3>/)?.[1],
        authors: paper.match(/<p class="authors">([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, '').trim(),
        venue: paper.match(/<p class="venue">([\s\S]*?)<\/p>/)?.[1].trim(),
        resources: [...(paper.match(/<div class="pub-links">([\s\S]*?)<\/div>/)?.[1] ?? '').matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
            .map(([, href, label]) => [href, label])
    }));
    assert.deepEqual(actualRecords, expectedRecords, 'all titles, full author lists, venues, and resource links are preserved in order');
    for (const [index, paper] of papers.entries()) {
        assert.match(paper, /^\s*<h3>[\s\S]*?<\/h3>\s*<p class="authors">[\s\S]*?<\/p>\s*<p class="venue">[\s\S]*?<\/p>\s*<div class="pub-links">[\s\S]*?<\/div>\s*$/, 'each record contains only title, authors, venue, and resource links');
        const authors = paper.match(/<p class="authors">([\s\S]*?)<\/p>/)?.[1];
        assert.ok(authors, 'author list is retained');
        assert.match(authors, /<strong>Karim Abdel Sadek\*?<\/strong>/);
        const href = paper.match(/<h3><a href="([^"]+)"/)?.[1];
        assert.match(href, /^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{5}$/, 'publication title opens its canonical arXiv abstract page');
        const paperResource = actualRecords[index].resources.find(([, label]) => label === 'Paper');
        assert.match(paperResource[0], /^https:\/\/arxiv\.org\/pdf\/\d{4}\.\d{5}$/, 'Paper resource opens the canonical arXiv PDF');
        assert.equal(new URL(href).pathname.split('/').at(-1), new URL(paperResource[0]).pathname.split('/').at(-1), 'title and PDF resource point to the same unchanged arXiv paper ID');
        assert.ok(starredAuthorsByPaper.has(href), 'paper has a known contribution-marker group');
        const expectedStarredAuthors = starredAuthorsByPaper.get(href);
        const starredAuthors = authors.replace(/<[^>]+>/g, '').split(',').map(name => name.trim()).filter(name => name.endsWith('*'));
        assert.deepEqual(starredAuthors, expectedStarredAuthors, `${href} marks exactly its equal-contribution authors`);
        assert.equal([...authors.matchAll(/\*/g)].length, expectedStarredAuthors.length, 'contribution markers appear only once per starred author');
    }
    assert.doesNotMatch(publications, /TL;?DR|abstract|disclosure|<details\b|<summary\b|<script\b/i);
    assert.match(papers[0], /Learning the Preferences of a Learning Agent/);
    assert.match(papers[0], /href="https:\/\/arxiv\.org\/abs\/2605\.09217"/);
    assert.doesNotMatch(publications, /<a\b[^>]*href="https?:\/\/(?:www\.)?openreview\.net\//i);
    assert.doesNotMatch(publications, /Equal contribution|class="[^"]*publication-note/);
});

test('undergraduate research link opens a matching page with an honest unpublished-content placeholder', async () => {
    const home = await readFile(path.join(siteRoot, 'index.html'), 'utf8');
    const page = await readFile(path.join(siteRoot, 'undergraduate-research.html'), 'utf8');
    assert.match(home, /href="undergraduate-research\.html"[^>]*>read this<\/a>/);
    assertMinimalNavigation(page);
    assert.match(page, /family=Klee\+One:wght@400;600/);
    assert.match(page, /<h1>Undergraduate research<\/h1>/);
    assert.equal([...page.matchAll(/<h1\b/g)].length, 1);
    assert.match(page, /<meta name="robots" content="noindex"/);
    assert.match(page, /<p>soon I promise<\/p>/);
    assert.doesNotMatch(page, /aria-current=/);
    assert.match(page, /<a class="skip-link" href="#main">/);
    assert.match(page, /<main id="main">/);
    assert.match(page, /class="back-link"/);
    assert.match(page, /<a\b[^>]*href="index\.html"[^>]*>\s*<span aria-hidden="true">(?:←|&larr;|&#8592;)<\/span>\s*Back to home\s*<\/a>/);
});

test('changing a published post to a draft removes only its generated HTML', async t => {
    const root = await fixture(t);
    const source = path.join(root, 'blog/posts/my-post.md');
    await writeFile(source, post());
    await buildBlog(root);
    const html = path.join(root, 'blog/my-post/index.html');
    await access(html);
    await writeFile(path.join(root, 'blog/my-post/keep.txt'), 'Keep an author-owned asset.');
    await writeFile(source, post({ draft: true }));
    await buildBlog(root);
    await assert.rejects(access(html), { code: 'ENOENT' });
    assert.equal(await readFile(path.join(root, 'blog/my-post/keep.txt'), 'utf8'), 'Keep an author-owned asset.');
    assert.match(await readFile(path.join(root, 'blog.html'), 'utf8'), /No posts yet\./);
});

test('invalid metadata fails before existing published output changes', async t => {
    const root = await fixture(t);
    const source = path.join(root, 'blog/posts/my-post.md');
    await writeFile(source, post());
    await buildBlog(root);
    const before = await readFile(path.join(root, 'blog.html'), 'utf8');
    await writeFile(source, post({ date: '2026-02-30' }));
    await assert.rejects(buildBlog(root), /not a valid calendar date/);
    assert.equal(await readFile(path.join(root, 'blog.html'), 'utf8'), before);
    await writeFile(source, post().replace('draft: false', 'draft: "false"'));
    await assert.rejects(buildBlog(root), /set draft to true or false/);
});

test('build refuses to overwrite hand-written pages', async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, 'blog/posts/my-post.md'), post());
    await writeFile(path.join(root, 'blog.html'), '<h1>A hand-written page</h1>');
    await assert.rejects(buildBlog(root), /Refusing to replace a hand-written file/);
    assert.equal(await readFile(path.join(root, 'blog.html'), 'utf8'), '<h1>A hand-written page</h1>');
});

test('new post command creates an editable dated draft and never overwrites an existing source', async t => {
    const root = await fixture(t);
    const filename = await newPost('Learning: "A & B"', root, new Date(2026, 8, 4, 12));
    assert.equal(path.basename(filename), 'learning-a-b.md');
    const source = await readFile(filename, 'utf8');
    assert.match(source, /date: 2026-09-04/);
    assert.match(source, /draft: true/);
    assert.deepEqual(await buildBlog(root), { published: 0, drafts: 1 });
    await assert.rejects(newPost('Learning: "A & B"', root), /A post already exists/);
    assert.equal(await readFile(filename, 'utf8'), source);
    await assert.rejects(newPost('Templates', root), /non-reserved filename/);
});

test('publish directory includes only public site files and removes unpublished generated posts', async t => {
    const root = await fixture(t);
    for (const filename of ['index.html', 'publications.html', 'undergraduate-research.html', 'style.css', 'KarimAbdelSadek_CV.pdf']) {
        await writeFile(path.join(root, filename), 'Site fixture.');
    }
    await mkdir(path.join(root, 'images'));
    await writeFile(path.join(root, 'images/portrait.jpg'), 'Image fixture.');
    await writeFile(path.join(root, 'blog/posts/published.md'), post());
    await writeFile(path.join(root, 'blog/posts/private.md'), post({ draft: true }));
    await buildSite(root);
    const destination = path.join(root, 'dist');
    await access(path.join(destination, 'blog/published/index.html'));
    await access(path.join(destination, 'images/portrait.jpg'));
    assert.equal(await readFile(path.join(destination, 'undergraduate-research.html'), 'utf8'), 'Site fixture.');
    await assert.rejects(access(path.join(destination, 'publications.js')), { code: 'ENOENT' });
    await assert.rejects(access(path.join(destination, 'blog/posts')), { code: 'ENOENT' });
    await assert.rejects(access(path.join(destination, 'blog/templates')), { code: 'ENOENT' });
    await assert.rejects(access(path.join(destination, 'blog/private/index.html')), { code: 'ENOENT' });
    await writeFile(path.join(root, 'blog/posts/published.md'), post({ draft: true }));
    await buildSite(root);
    await assert.rejects(access(path.join(destination, 'blog/published/index.html')), { code: 'ENOENT' });
    assert.match(await readFile(path.join(destination, 'blog.html'), 'utf8'), /No posts yet\./);
});

test('publish safely retires only the managed publications script and preserves unrelated files', async t => {
    const root = await fixture(t);
    for (const filename of ['index.html', 'publications.html', 'undergraduate-research.html', 'style.css', 'KarimAbdelSadek_CV.pdf']) {
        await writeFile(path.join(root, filename), 'Site fixture.');
    }
    await mkdir(path.join(root, 'images'));
    await buildSite(root);
    const destination = path.join(root, 'dist');
    const manifestPath = path.join(destination, '.site-build-manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const retiredScript = path.join(destination, 'publications.js');
    const unrelatedFile = path.join(destination, 'notes.txt');
    await writeFile(retiredScript, 'Previously managed disclosure script.');
    await writeFile(unrelatedFile, 'Unrelated file to preserve.');
    await writeFile(path.join(root, 'publications.js'), 'Unpublished source fixture.');
    manifest.files.push('publications.js');

    // The retired-file exception must not permit traversal to the source root.
    await writeFile(manifestPath, JSON.stringify({ ...manifest, files: [...manifest.files, '../publications.js'] }));
    await assert.rejects(buildSite(root), /invalid build manifest/);
    assert.equal(await readFile(retiredScript, 'utf8'), 'Previously managed disclosure script.');
    assert.equal(await readFile(path.join(root, 'publications.js'), 'utf8'), 'Unpublished source fixture.');

    await writeFile(manifestPath, JSON.stringify(manifest));
    await buildSite(root);
    await assert.rejects(access(retiredScript), { code: 'ENOENT' });
    assert.equal(await readFile(unrelatedFile, 'utf8'), 'Unrelated file to preserve.');
    assert.equal(await readFile(path.join(root, 'publications.js'), 'utf8'), 'Unpublished source fixture.');
    const updatedManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.ok(!updatedManifest.files.includes('publications.js'), 'retired script is no longer published or tracked');
});
