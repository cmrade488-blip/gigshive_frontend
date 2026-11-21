# GigsHive Image Pack

Original SVG illustrations in the brand style. They are free to use, scale without losing quality, and match the colour tokens in `../tokens/`. The design shows where each one goes: every `<img>` in `design/public-site/source/` carries a `data-slot` attribute with the ID in the first column. The same table is on the **Image placement map** board of the design canvas.

![All images](../../design/public-site/previews/image-map.png)

| Slot | File | Size | Where it goes |
|---|---|---|---|
| IMG-HERO-01 | `illustrations/hero-collage.svg` | 640 x 560 | Home hero (right, on the dark band); sign-in and join card; phone home hero |
| IMG-CAT-01 to 08 | `categories/design`, `web`, `writing`, `marketing`, `video`, `data`, `admin`, `tutoring` `.svg` | 320 x 200 | Home "Browse by category" tiles; phone category grid |
| IMG-STEP-01 | `steps/post-a-job.svg` | 360 x 240 | Home step 1; How it works, client column |
| IMG-STEP-02 | `steps/fund.svg` | 360 x 240 | Home step 2 and the amber "Payment held" card; How it works payment band |
| IMG-STEP-03 | `steps/get-paid.svg` | 360 x 240 | Home step 3 and call-to-action band; How it works, worker column |
| IMG-AVT-01 to 08 | `avatars/avatar-01` to `avatar-08.svg` | 160 x 160, round | Client avatars on job cards, client card on job details, worker cards on Home, worker profile header. Default for anyone without an uploaded photo |
| IMG-PF-01 to 06 | `portfolio/mobile-app`, `dashboard`, `website`, `branding`, `packaging`, `poster` `.svg` | 480 x 320 | Worker profile portfolio grid (sample look; real profiles show the worker's own uploads) |
| IMG-EMPTY-01 | `empty/no-results.svg` | 360 x 240 | Find work with no matching jobs |
| IMG-EMPTY-02 | `empty/nothing-yet.svg` | 360 x 240 | Any empty list in signed-in screens (no proposals, no jobs, no contracts) |
| PAT-HEX-01 | `patterns/hex-pattern.svg` | 104 x 120 tile | Texture on every dark band, at about 7 percent opacity, `background-size: 104px 120px` |

## Rules

- Use the file at its slot. If a page needs a new image, add a row here and in the design first.
- Always give meaningful images an `alt` text. Decorative ones use `alt=""`.
- In Next.js use `next/image` with the SVG imported as a static file, or plain `<img>` for these small files.
- Avatars are only defaults. A user's own uploaded photo always wins.

## Real photography (optional, later)

We could not download stock photos when building this pack, so these are illustrations. If the owner wants photos on the hero or categories, take them from Unsplash or Pexels (check each licence) or from a commissioned shoot, export at the sizes above, and save them under the same slot names, for example `illustrations/hero-photo.jpg`. Suggested searches:

- Hero: Nigerian freelancers on laptops, designer at a desk, co-working space in Lagos
- Design: graphic designer sketching, colour swatches
- Web and software: developer coding on a laptop
- Writing: writer with notebook
- Marketing: social media planning
- Video and audio: video editor timeline, camera on tripod
- Data: analyst reviewing charts
- Admin support: virtual assistant with headset
- Tutoring: tutor teaching online

Use only images of people who gave permission, and prefer subjects that reflect GigsHive's Nigerian users.
