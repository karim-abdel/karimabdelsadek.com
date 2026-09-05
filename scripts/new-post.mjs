import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isValidSlug, siteRoot } from './build-blog.mjs';

export async function newPost(title, root = siteRoot, now = new Date()) {
    if (!title?.trim()) throw new Error('Usage: npm run new:post -- "Your post title"');
    const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90).replace(/-$/, '');
    if (!isValidSlug(slug)) throw new Error('Choose a title that produces a non-reserved filename using Latin letters or numbers.');
    // Use the author's local calendar date, rather than UTC's potentially different day.
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const template = await readFile(path.join(root, 'blog/templates/post.md'), 'utf8');
    const content = template.replace(/\{\{(title|date)\}\}/g, (_, field) => {
        return field === 'title' ? JSON.stringify(title.trim()) : date;
    });
    const filename = path.join(root, 'blog/posts', `${slug}.md`);
    await mkdir(path.dirname(filename), { recursive: true });
    try {
        await writeFile(filename, content, { flag: 'wx' });
    } catch (error) {
        if (error.code === 'EEXIST') throw new Error(`A post already exists at blog/posts/${slug}.md. Choose another title or edit that file.`);
        throw error;
    }
    return filename;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    try {
        const filename = await newPost(process.argv.slice(2).join(' '));
        console.log(`Created ${path.relative(siteRoot, filename)} as a draft.`);
        console.log('Edit the Markdown, set draft: false when ready, then run npm run build.');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
