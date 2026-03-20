# RealmSight — TODO

## Workflow

1. Pick the **next unchecked task** from the top of the list
2. Complete it fully
3. Mark it `- [x]` with a short note on what was done
4. Commit + push to a feature branch
5. Open a PR
6. Stop — next session picks up the next task

> One task per PR. No batching. This keeps review clean and history readable.

---

## Phase 1 — Foundation (Months 1–3)

- [ ] **Unity project init** — Create Unity project targeting URP, configure AR Foundation package, add ARKit XR Plugin (iOS) and ARCore XR Plugin (Android), commit baseline ProjectSettings
- [ ] **AR session scaffold** — Basic AR camera scene: plane detection enabled, session origin, AR plane visualizer, builds and runs on both platforms (or simulator)
- [ ] **IPlatformAdapter interface** — Define `IPlatformAdapter` C# interface (haptics, camera permissions, share sheet, depth API stub), create `IOSPlatformAdapter` and `AndroidPlatformAdapter` stubs
- [ ] **OpenCV integration** — Add OpenCVForUnity (or equivalent), verify cross-platform build, write a smoke test that processes a static image and returns contours
- [ ] **ONNX / Barracuda pipeline** — Add Unity Barracuda package, wire up a placeholder ONNX model, verify inference runs on device (iOS + Android)
- [ ] **Glyph training data — 8 core glyphs** — Collect/generate training images for: House, Castle, Bridge, Road, River, Tree, Mountain, Temple. At least 200 samples per glyph.
- [ ] **Glyph classifier v1** — Train ONNX model on 8 core glyphs, export to `.onnx`, integrate into Barracuda pipeline, target ≥85% confidence threshold
- [ ] **Static model placement** — Place a hardcoded 3D primitive at a recognized glyph's world position; confirm correct AR-plane projection and scale-from-bounding-box logic
- [ ] **Basic UI shell** — AR camera HUD: glyph reference button (bottom-left), settings gear (top-right), capture button (bottom-center)
- [ ] **CI/CD setup** — GitHub Actions: build pipeline for iOS (xcode) and Android (gradle), run unit tests on push to main and PRs

---

## Phase 2 — Full Library & Beta (Months 4–6)

- [ ] **Glyph training data — remaining 8 glyphs** — Camp, Dock, Ruins, Tower, Farm, Mine, Gate + 1 spare. 200+ samples each.
- [ ] **Glyph classifier v2** — Retrain on full 16-glyph set, re-validate 85% threshold, update ONNX bundle
- [ ] **3D model set — 16 glyphs** — Low-poly glTF models (500–2000 tri, 256x256 atlas, LOD0 + LOD1) for all 16 glyph types
- [ ] **Tier 1 animations** — Ambient loops: chimney smoke, water flow, flag wave, torch flicker, tree sway. Embedded in .glb.
- [ ] **Build animation** — Short "blocks assembling" or "ground rising" animation that plays when a model is first placed
- [ ] **Scene save/load** — Serialize placed models to JSON (Scene schema from spec), persist locally, restore on app reopen
- [ ] **Glyph reference panel** — Slide-up panel showing all 16 glyphs in a grid with labels and drawing tips; tappable for detail view
- [ ] **Android device fragmentation — lite mode** — Detect low-tier hardware at startup via `SystemInfo`; apply lite profile: LOD1 only, 15 model cap, half-res scanning, simplified particles
- [ ] **Dual-platform beta** — Publish to TestFlight (iOS) and Firebase App Distribution (Android); onboarding checklist for beta testers

---

## Phase 3 — Interactivity & Multiplayer (Months 7–9)

- [ ] **Tier 2 animations** — Interactive triggers: tap castle → raise drawbridge, tap dock → launch boat, tap gate → open. Event-driven animation state machine.
- [ ] **Expansion pack system** — Asset bundle structure (manifest.json + LODs + thumbnail + glyph_samples), Addressables remote group, download/cache/version management
- [ ] **Multiplayer scene sharing** — Firebase Firestore sync: multiple devices view same physical surface, see synchronized 3D scene in real-time
- [ ] **Performance profiling pass** — Profile on reference devices (iPhone 13, Pixel 7); hit all targets from spec (30FPS/20 models, <300ms recognition, <400MB RAM, 90min battery)

---

## Phase 4 — Launch (Months 10–12)

- [ ] **Tier 3 scene events** — Day/night cycle, weather overlay (rain, fog), fire spreading between buildings
- [ ] **Custom glyph training** — Let users define their own glyphs and bind to any library model; on-device fine-tuning or cloud-assisted training
- [ ] **Community marketplace** — Artist model packs (fantasy, sci-fi, horror); download, bind to glyphs, in-app purchase flow
- [ ] **App Store submission** — Metadata, screenshots, privacy policy, review prep, TestFlight → production
- [ ] **Google Play submission** — Android App Bundle, Play Store listing, Firebase App Distribution → production, size compliance (<100MB)
- [ ] **Simultaneous public launch** — Coordinate App Store + Google Play release

---

## Backlog / Future

- [ ] NPC tokens — Character models that can be placed and dragged on the AR surface as digital miniatures
- [ ] Fog of War — GM mode where areas are obscured until revealed
- [ ] AI map generation — Natural language → suggested glyph layout
- [ ] Physical cheat sheet — Printable PDF of all glyphs
