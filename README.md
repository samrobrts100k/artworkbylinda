# Painter Landing Page

A single-file, self-editable landing page for a painter to share via a QR code at galleries — built as a "link in bio" style page: her name, a photo, recent paintings, and social links, with no pricing or checkout.

## How it works

Everything lives in `index.html` — no build step, no dependencies. The page:

- Renders a **Studio Scroll** style layout: name, tagline, and social buttons up top next to a featured photo, then a horizontally-scrolling gallery of paintings below.
- Uses the featured photo (blurred and softened) as the page background by default, with an option to turn that off.
- Lets the artist pick from a curated palette of colors for her name, tagline, and painting captions.
- Gives Instagram and Facebook links their real brand colors automatically, based on the link's label.
- Includes a password-protected **edit mode** (small lock icon, bottom-right) where she can add/reorder/remove paintings, change her photo, update links, change text colors, and change her password — all without touching code.

### Saving changes

The page is designed to run as a published [Claude Artifact](https://claude.ai) with the `artifact` capability enabled. When she hits "Save changes" in edit mode, the page calls `claude.artifact.publish()` to rebuild and republish itself as a new version — the whole document (styles, logic, and her data) is regenerated from the in-page state and pushed live. This only works when the page is opened as a live Claude Artifact; opening the raw HTML file elsewhere shows a "saving isn't available here" message and the page falls back to being view-only.

### Data model

Everything the artist can edit is stored as one JSON object embedded in a `<script id="site-data" type="application/json">` tag: name, tagline, photo, paintings (image + caption), social links, text colors, background toggle, and a SHA-256 password hash (never the plaintext password).

## Default password

The seed data ships with the password `openstudio` — change it immediately from edit mode (there's a "Change password" control) once the page is live for a real user.

## Local development

Just open `index.html` in a browser. Editing works locally too (the password gate and all UI function without the Artifact capability); only the final "Save changes" step requires being hosted as a live Claude Artifact.
