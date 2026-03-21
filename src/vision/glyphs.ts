/**
 * The 8 core glyphs shipping in v1.0.
 * Each maps to a drawable symbol and a 3D model.
 */
export const GLYPH_LABELS = [
  'house',
  'castle',
  'bridge',
  'road',
  'river',
  'tree',
  'mountain',
  'temple',
] as const

export type GlyphLabel = typeof GLYPH_LABELS[number]

export const GLYPH_META: Record<GlyphLabel, { emoji: string; displayName: string; description: string }> = {
  house:    { emoji: '🏠', displayName: 'House / Cottage',  description: 'Peaked roof outline' },
  castle:   { emoji: '🏰', displayName: 'Castle / Fortress', description: 'Crenellated tower silhouette' },
  bridge:   { emoji: '🌉', displayName: 'Bridge',            description: 'Arch bridge side-view' },
  road:     { emoji: '═', displayName: 'Road / Path',       description: 'Parallel lines' },
  river:    { emoji: '〰', displayName: 'River / Stream',   description: 'Wavy line' },
  tree:     { emoji: '🌲', displayName: 'Tree / Forest',    description: 'Conifer triangle' },
  mountain: { emoji: '⛰', displayName: 'Mountain / Hill',  description: 'Triangle peak' },
  temple:   { emoji: '⛪', displayName: 'Temple / Church',  description: 'Cross-topped rectangle' },
}

export const NUM_CLASSES = GLYPH_LABELS.length
export const INPUT_SIZE = 64 // CNN input: 64x64 grayscale
export const CONFIDENCE_THRESHOLD = 0.85
