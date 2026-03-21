# RealmSight

**Web-Native Tabletop AR Map Companion**  
_Draw maps. See worlds. No app store required._

RealmSight is a browser-based AR app that transforms hand-drawn maps on any surface into living 3D environments — in real-time, directly in the browser. Share a URL, point your camera, draw a glyph, watch a castle appear.

## Tech Stack

| Layer | Technology |
|---|---|
| AR Runtime | WebXR Device API (Android Chrome) + camera fallback (iOS Safari) |
| 3D Rendering | Three.js r170+ |
| Computer Vision | OpenCV.js (WASM) in Web Worker |
| ML Inference | TensorFlow.js (WebGL + WASM backends) |
| UI | React + Zustand |
| Offline / PWA | Service Worker + Cache API |
| State Persistence | IndexedDB (Dexie.js) |
| Multiplayer | WebRTC + WebSocket (CRDT state sync) |
| Backend | Cloudflare Workers + R2 |
| Build | Vite + TypeScript |
| Deploy | GitHub Actions → CDN |

## Platform Support

| Platform | Mode | Capability |
|---|---|---|
| Android Chrome | WebXR AR | Full 6DOF, native plane detection, world anchors |
| iOS Safari | Camera fallback | OpenCV.js homography, surface-anchored models, ~80% of experience |
| Desktop Chrome/Firefox | Preview | Scene management, model library, no camera AR |

## Project Structure

```
src/
  ar/           # WebXR session management, hit-testing, plane detection
  vision/       # OpenCV.js pipeline (Web Worker), TF.js glyph classifier
  scene/        # Three.js scene graph, model loader, LOD, AnimationMixer
  ui/           # React components: HUD, glyph reference, scene manager
  multiplayer/  # WebRTC peer connections, WebSocket signaling, CRDT sync
  store/        # Zustand global state
  db/           # Dexie.js IndexedDB schema and queries
  pwa/          # Service Worker, cache strategy, manifest
  platform/     # Feature detection, capability matrix, quality tiers
public/
  models/       # Core glTF model library (16 glyphs, Draco + KTX2)
  icons/        # PWA icons
Docs/           # Product specs, glyph reference
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Docs

- [Product Spec v2.0](Docs/RealmSight-Product-Spec-v2.0.md)

## License

Private — All rights reserved.
