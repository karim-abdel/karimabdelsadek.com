# Portrait edit

## Current drink-removal edit

Created with the built-in image-generation/editing tool from `images/profile-cutout.png`.
The cup and liquid were removed, with the hand behind the cup reconstructed locally.
The edit retains the existing pose, expression, clothing, grayscale treatment, and
cream background. It is a generative edit, not a pixel-identical masking operation.
Both earlier images remain untouched.

The website displays the new asset at 160px instead of 135px and retains the same
top-aligned square crop, ending around the elbow/mid-arm.

### Final drink-removal prompt

Use case: precise-object-edit.
Edit target: the supplied current grayscale portrait of Karim on a light cream background, not the original Berlin photograph.
Primary request: remove only the clear plastic cup and all liquid below the raised foreground hand, in the small lower-left area of the subject. Replace the removed cup with the same existing background; preserve the visible fingers/hand behind it, filling only any tiny newly exposed hand area naturally so it is an empty hand. Do not remove, move, resize, or change the raised foreground hand or sleeve.
Critical invariants: keep the exact current face, smile, eyes, nose, teeth, skin texture, earring, curls and individual flyaway hairs, hoodie shape, sleeve folds, printed clothing marks, body silhouette, lighting, grayscale tones, cream background, image dimensions, crop, and subject scale. Outside the cup and tiny immediate overlap area, leave the image unchanged. This is local object removal, not a new rendering or beautification of the person.
Avoid: any drink, cup, glass, bottle, replacement prop, new gestures, extra fingers, changed facial features, altered clothing, added scenery, checkerboard, transparency pattern, or changed framing.

## Asset history

Current website asset: `images/profile-no-drink.png`.

Previous portrait: `images/profile-cutout.png` (kept unchanged as a backup).

Original photograph: `images/Profile_Pic_Berlin.jpg` (kept unchanged).

Created with the built-in image-generation/editing tool. The wall and scenery
were removed. The first export had a baked-in checkerboard, so a second edit
replaced it with cream and made the person grayscale. The final PNG is opaque,
not transparent. The website's CSS blends the light background into the page.

## Earlier background edit prompt

Edit target: this already-extracted photograph of Karim. This is a surgical background correction for a website asset. Remove every white/gray checkerboard pixel and replace the entire background with a single completely flat cream color sRGB #f0e5d5 (RGB 240,229,213). No transparency pattern, no checks, no texture, no gradient, no shadow, no new scenery. Convert ONLY the person into natural grayscale; preserve the cream background in color. Keep the EXACT same face, identity, curls, smile, skin texture, earring, clothing, body silhouette, pose, hands, and drink. Do not regenerate or beautify the person. Keep the existing crop and proportions. All background pixels including corners must be the same cream #f0e5d5. This must blend seamlessly with a flat cream webpage.
