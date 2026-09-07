# Painter Landing Page

A self-editable landing page for a painter to share via a QR code at galleries — built as a "link in bio" style page: her name, a photo, recent paintings, and social links, with no pricing or checkout.

## How it works

- `index.html` — the static page. Loads `data.json` on page load and renders from it. No build step, no framework.
- `data.json` — everything the artist can edit: name, tagline, photo, paintings, social links, text colors, background toggle, and a SHA-256 password hash (never the plaintext password).
- `api/save.js` — a Vercel serverless function. When the artist hits "Save changes" in edit mode, the page sends the updated data here. The function checks the password hash against what's currently stored, then writes the new `data.json` straight to this GitHub repo using a token. Pushing to `main` triggers Vercel to redeploy automatically, so the change goes live for everyone within about a minute.

Edit mode itself (the lock icon, adding/reordering paintings, changing colors, etc.) works entirely client-side and needs no server — only the final "Save changes" step talks to `/api/save`.

## Deploying this (one-time setup)

1. **Create a GitHub token** the save function can use to write to this repo:
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
   - Repository access: only this repository
   - Permissions: Contents → Read and write
   - Copy the generated token — you won't see it again.
2. **Import this repo into Vercel**: vercel.com → Add New → Project → import `painter-landing-page` from GitHub → Deploy. No build settings needed.
3. **Add environment variables** in the Vercel project (Settings → Environment Variables):
   - `GITHUB_TOKEN` — the token from step 1
   - `GITHUB_REPO` — `owner/repo-name` (e.g. `samrobrts100k/artworkbylinda`)
   - `GITHUB_BRANCH` — `main` (optional, defaults to `main`)
   Redeploy after adding these so the function picks them up.

## Default password

The seed data ships with the password `openstudio` — change it immediately from edit mode (there's a "Change password" control) once real content is in place.

## Privacy note

Once real photos and content are saved, they live in `data.json` in this GitHub repo. If the repo is public, that content is publicly visible in the repo's history too — consider making the repo private (Vercel can still deploy from a private repo).

## Local development

Serve the folder with any static file server (opening `index.html` directly via `file://` won't work, since it needs to `fetch()` `data.json`). The "Save changes" button needs `/api/save` to be running, which requires Vercel's dev server (`vercel dev`) or a deployed environment with the environment variables set.
