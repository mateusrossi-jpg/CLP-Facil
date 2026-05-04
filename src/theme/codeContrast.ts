export const codeContrast = {
  background: '#020817',
  backgroundAlt: '#0B1220',
  text: '#F8FAFC',
  mutedText: '#CBD5E1',
  border: '#22D3EE',
  successText: '#22C55E',
  warningText: '#FBBF24',
  errorText: '#F87171',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

export function codeContrastMeetsReadableThreshold(): boolean {
  return contrastRatio(codeContrast.text, codeContrast.background) >= 7 &&
    contrastRatio(codeContrast.text, codeContrast.backgroundAlt) >= 7;
}
