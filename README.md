# RealmSight

**Cross-Platform Tabletop AR Map Companion**  
_Draw maps. See worlds._

RealmSight is a mobile AR application for iOS and Android that transforms hand-drawn maps on any surface — paper, whiteboard, or tabletop — into living 3D environments in real-time.

## Overview

Players draw simple glyphs (symbols) representing structures like houses, castles, bridges, and rivers, then point their device camera at the surface. The app recognizes each glyph and overlays an animated 3D model at that position, turning a sketch into an immersive miniature world.

## Core Features

- **Zero Setup** — Works on any flat surface with hand-drawn symbols
- **Instant Feedback** — Real-time glyph recognition converts drawings to 3D models
- **Living Maps** — Ambient animations (smoke, water flow, torch flicker) bring scenes to life
- **Cross-Platform** — Simultaneous iOS and Android support from day one
- **Expandable Library** — Growing catalog of 3D assets mapped to learnable glyphs

## Tech Stack

| Layer | Technology |
|---|---|
| AR Runtime | Unity AR Foundation (ARKit / ARCore) |
| Vision Pipeline | OpenCV + Unity Barracuda (ONNX) |
| 3D Renderer | Unity URP |
| Backend | Firebase (Auth, Firestore, Storage, Crashlytics) |
| Asset Delivery | Unity Addressables |

## Platform Support

| | iOS | Android |
|---|---|---|
| Minimum OS | iOS 16+ | Android 10+ (API 29) |
| AR Runtime | ARKit 6+ | ARCore 1.38+ |
| Reference Device | iPhone 13 | Pixel 7 / Galaxy S22 |

## Project Structure

```
Assets/
  Scripts/        # C# game logic
  AR/             # AR Foundation setup, plane detection
  Vision/         # Glyph recognition pipeline
  Models/         # 3D model assets (glTF/glb)
  UI/             # HUD, glyph reference panel, scene manager
  Platform/       # IPlatformAdapter implementations (iOS/Android)
Packages/         # Unity package dependencies
ProjectSettings/  # Unity project settings
Docs/             # Design specs, glyph reference
```

## Docs

- [Product Spec v1.1](Docs/RealmSight-Product-Spec-v1.1.md)

## Contributing

Feature branch + PR workflow. Branch from `main`, open a PR, never push directly to `main`.

## License

Private — All rights reserved.
