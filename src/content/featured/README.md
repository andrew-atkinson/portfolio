# Featured works (homepage carousel)

`featured.json` is a single array — each object is one slide in the
homepage carousel, shown in array order. This README is ignored (only
`.json`/`.yaml` files are loaded as collection entries).

## Common fields

- `title` — used for alt text / accessible labels
- `link.collection` — `"projects" | "series" | "panoramas"`
- `link.slug` — the slug of the page this slide should link to

## Type: image

```json
{
  "type": "image",
  "title": "Esja, no. 3",
  "image": "esja-3",
  "link": { "collection": "series", "slug": "grimsey" }
}
```

`image` is the id of an entry in `src/content/images/`.

## Type: video (Bunny Stream)

```json
{
  "type": "video",
  "title": "Krafla field recording",
  "videoId": "BUNNY_VIDEO_GUID",
  "libraryId": "BUNNY_LIBRARY_ID",
  "link": { "collection": "series", "slug": "krafla" }
}
```

`libraryId` is optional if `PUBLIC_BUNNY_LIBRARY_ID` is set in `.env`
(see `.env.example`). `poster` (optional) is an id from
`src/content/images/` used while the video loads.

## Type: p5 sketch

```json
{
  "type": "p5",
  "title": "Particle field",
  "sketch": "/src/sketches/particleField.ts",
  "link": { "collection": "projects", "slug": "ultima-thule" }
}
```

`sketch` is a path to a module under `src/sketches/` exporting a default
function `(p: p5) => void` written in p5 instance mode (see
`src/sketches/example.ts`).
