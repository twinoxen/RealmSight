# RealmSight — TODO (Web v2.0)

## Workflow

1. Pick the **next unchecked task** from the top of the list
2. Complete it fully
3. Mark it `- [x]` with a short note on what was done
4. Commit + push to a feature branch, open a PR
5. Stop — next session picks up the next task

> One task per PR. No batching.

---

## Phase 1 — Foundation (Months 1–3)

- [x] **Project scaffold** — Vite + React + TypeScript, pnpm, path aliases, ESLint, PWA plugin, capability detection, Zustand store, HUD shell — Vite + React + TypeScript project, pnpm workspace, ESLint/Prettier config, path aliases, GitHub Actions CI (lint + typecheck on PR)
- [ ] **Three.js scene pipeline** — Bootstrap Three.js scene: WebGL renderer, camera, scene graph, render loop, resize handling, basic orbit controls for desktop preview
- [ ] **WebXR AR session** — Detect WebXR immersive-ar support; start/stop XR session on Android Chrome; integrate XRReferenceSpace, hit-test, plane detection; fall through to fallback if unsupported
- [ ] **iOS camera fallback** — getUserMedia rear camera feed; canvas compositing to overlay Three.js scene on camera frame; OpenCV.js homography surface estimation
- [ ] **OpenCV.js Web Worker** — Load OpenCV WASM in a dedicated Web Worker; implement adaptive thresholding + contour extraction pipeline; postMessage result to main thread
- [ ] **TF.js glyph classifier — 8 core glyphs** — Train MobileNet-derived CNN on House, Castle, Bridge, Road, River, Tree, Mountain, Temple; export to TF.js format; wire into Web Worker inference pipeline; target ≥85% confidence
- [ ] **Static model placement** — Load a placeholder .glb via Three.js GLTFLoader (Draco + KTX2); place at recognized glyph world position; scale from bounding box; confirm on Android WebXR and iOS fallback
- [ ] **PWA shell + Service Worker** — Web app manifest, Service Worker with stale-while-revalidate caching, offline-first after first load; cache budget: ~8MB total
- [ ] **Platform feature detection** — Capability matrix at startup: WebXR support, WebGL2, camera access, device memory; quality tier (Full/Lite) auto-set; stored in Zustand

---

## Phase 2 — Full Library & Beta (Months 4–6)

- [ ] **Glyph classifier v2 — full 16 glyphs** — Add Camp, Dock, Ruins, Tower, Farm, Mine, Gate + 1 spare; retrain and re-export; re-validate 85% threshold
- [ ] **3D model set — 16 glyphs** — Low-poly glTF models for all 16 glyph types; Draco mesh compression + KTX2 textures; LOD0 + LOD1; total core pack ≤ 800KB
- [ ] **Tier 1 animations** — Ambient loops via Three.js AnimationMixer: chimney smoke (particle system), water flow (shader), flag wave (bone), tree sway; embedded in .glb
- [ ] **Build animation** — Short place-in animation (blocks assembling / ground rise) on model first placement
- [ ] **IndexedDB scene save/load** — Dexie.js schema for Scene; save placed models on demand; restore on app reopen; auto-save every 10s
- [ ] **Glyph reference panel** — React slide-up sheet showing all 16 glyphs in responsive grid; drawing tips on tap; renders above WebGL canvas
- [ ] **iOS surface stabilization** — Transform stabilization for homography-estimated surface plane; reduce model drift on fast device movement
- [ ] **Public beta URL** — Deploy to Cloudflare Pages or Vercel; share URL for beta testers

---

## Phase 3 — Interactivity & Multiplayer (Months 7–9)

- [ ] **Tier 2 animations** — Interactive triggers via Three.js Raycaster: tap castle → raise drawbridge, tap dock → launch boat, tap gate → open
- [ ] **WebRTC multiplayer** — Cloudflare Durable Object signaling server; WebRTC peer connections; CRDT scene state sync; peers see same models in real-time
- [ ] **QR code session sharing** — Generate session QR code in-app; scanning joins the same WebRTC room
- [ ] **Expansion pack CDN** — Cloudflare R2 asset hosting; manifest JSON with version hashes; Service Worker caches downloaded packs; in-app model library browser
- [ ] **Performance optimization pass** — Profile on Pixel 7 + iPhone 13; hit all spec targets (30FPS/20 models, <350ms recognition, <150MB heap, <10% battery/30min)

---

## Phase 4 — Launch (Months 10–12)

- [ ] **Tier 3 scene events** — Day/night cycle (directional light + sky shader), weather overlay (particle rain/fog), fire spread between buildings
- [ ] **Custom glyph training** — Transfer learning in TF.js; user provides 20 hand-drawn samples; model fine-tunes locally; bind custom glyph to any library model
- [ ] **Community marketplace** — Artist glTF pack uploads; Stripe Connect payments; CDN delivery; no platform tax
- [ ] **Public launch** — Domain, production Cloudflare deployment, monitoring (Sentry + Cloudflare Analytics)

---

## Backlog / Future

- [ ] Embeddable `<iframe>` widget for blogs and wikis
- [ ] NPC tokens — draggable character models with WebSocket-synced positions
- [ ] Fog of War — GM mode with CRDT-synced region reveals
- [ ] AI map generation — LLM API generates glyph layout JSON from natural language description
- [ ] Desktop companion — GM manages scene on laptop, players view on phones via WebRTC
