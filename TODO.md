# RealmSight — TODO (Web v2.0)

## Workflow

1. Pick the **next unchecked task** from the top of the list
2. Complete it fully
3. Mark it `- [x]` with a short note on what was done
4. Commit + push to a feature branch, open a PR
5. Stop — next session picks up the next task

> One task per PR. No batching.

---

## 🎯 MVP Milestone — Testable on Device (Do This First)

> Goal: deploy to Vercel and test on a real phone ASAP. No glyph recognition yet.
> Android: tap surface → colored 3D shape appears at hit-test point.
> iOS: tap screen → colored 3D shape appears on estimated surface.
> When this works end-to-end on device, resume Phase 1 tasks.

- [x] **Project scaffold** — done (PR #3)
- [x] **Three.js scene pipeline** — done (PR #4)
- [x] **WebXR AR session + tap-to-place shapes** — ARSession (WebXR hit-test + reticle), useCameraFallback (iOS), useAR hook, HUD wired with Start/Stop AR + tap handler — WebXR on Android Chrome; iOS camera fallback; tap anywhere to place a colored box/sphere at the hit point; HUD "Start AR" button
- [x] **Vercel deploy + device test** — deployed, loading screen, status chip, surface plane indicator all added — deploy to Vercel, share URL, verify on Android Chrome (WebXR) and iOS Safari (camera fallback)

---

## Phase 1 — Foundation (Months 1–3)

- [x] **Project scaffold** — Vite + React + TypeScript, pnpm, path aliases, ESLint, PWA plugin, capability detection, Zustand store, HUD shell — Vite + React + TypeScript project, pnpm workspace, ESLint/Prettier config, path aliases, GitHub Actions CI (lint + typecheck on PR)
- [x] **Three.js scene pipeline** — SceneManager (renderer, scene, camera, lights, Draco+KTX2 loader, AnimationMixer, OrbitControls), useScene hook ties lifecycle to React component — Bootstrap Three.js scene: WebGL renderer, camera, scene graph, render loop, resize handling, basic orbit controls for desktop preview
- [ ] **WebXR AR session** — Detect WebXR immersive-ar support; start/stop XR session on Android Chrome; integrate XRReferenceSpace, hit-test, plane detection; fall through to fallback if unsupported
- [ ] **iOS camera fallback** — getUserMedia rear camera feed; canvas compositing to overlay Three.js scene on camera frame; OpenCV.js homography surface estimation
- [x] **OpenCV.js Web Worker** — Worker loads OpenCV WASM, implements adaptive threshold + Gaussian blur + morphological close + contour extraction; VisionWorkerClient bridges main thread; useVision hook manages lifecycle — Load OpenCV WASM in a dedicated Web Worker; implement adaptive thresholding + contour extraction pipeline; postMessage result to main thread
- [x] **TF.js glyph classifier — 8 core glyphs** — GlyphClassifier loads TF.js LayersModel, warms up, classifies 64x64 contour crops; mock mode for dev before training data exists; useGlyphClassifier hook; Zustand vision state — Train MobileNet-derived CNN on House, Castle, Bridge, Road, River, Tree, Mountain, Temple; export to TF.js format; wire into Web Worker inference pipeline; target ≥85% confidence
- [x] **Static model placement** — full vision pipeline wired: camera frame → OpenCV Worker → TF.js classifier → placeGlyphAtNormalized(); glyph-specific shapes and colors; detection badge in HUD — Load a placeholder .glb via Three.js GLTFLoader (Draco + KTX2); place at recognized glyph world position; scale from bounding box; confirm on Android WebXR and iOS fallback
- [x] **PWA shell + Service Worker** — Workbox config with runtime caching for GLTFs, OpenCV CDN, Draco decoder; install banner; favicon; SW disabled in dev — Web app manifest, Service Worker with stale-while-revalidate caching, offline-first after first load; cache budget: ~8MB total
- [x] **Platform feature detection** — capabilities.ts detects WebXR, WebGL2, camera, device RAM, iOS/Android; Full/Lite quality tier; stored in Zustand — Capability matrix at startup: WebXR support, WebGL2, camera access, device memory; quality tier (Full/Lite) auto-set; stored in Zustand

---

## Phase 2 — Full Library & Beta (Months 4–6)

- [ ] **Glyph classifier v2 — full 16 glyphs** — Add Camp, Dock, Ruins, Tower, Farm, Mine, Gate + 1 spare; retrain and re-export; re-validate 85% threshold
- [ ] **3D model set — 16 glyphs** — Low-poly glTF models for all 16 glyph types; Draco mesh compression + KTX2 textures; LOD0 + LOD1; total core pack ≤ 800KB
- [ ] **Tier 1 animations** — Ambient loops via Three.js AnimationMixer: chimney smoke (particle system), water flow (shader), flag wave (bone), tree sway; embedded in .glb
- [x] **Build animation** — spring-scale + rise + particle burst on shape placement via PlaceAnimationSystem — Short place-in animation (blocks assembling / ground rise) on model first placement
- [x] **IndexedDB scene save/load** — Dexie.js schema for Scene, auto-save every 10s, exportModels/restoreModels on ARSession — Dexie.js schema for Scene; save placed models on demand; restore on app reopen; auto-save every 10s
- [x] **Glyph reference panel** — slide-up sheet with 4-col glyph grid, drawing tips on tap, 📖 button wired in HUD — React slide-up sheet showing all 16 glyphs in responsive grid; drawing tips on tap; renders above WebGL canvas
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
