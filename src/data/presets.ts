import { StylePreset, GenerationHistoryItem, SamplePrompt } from '../types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'photoreal',
    name: 'Fotorealistik 8K',
    promptSuffix: 'photorealistic, Hasselblad 80mm lens, ultra high definition, fine natural skin texture, studio rim lighting, 8k',
    iconName: 'Camera',
    description: 'Pencahayaan presisi studio dengan detail tekstur alami dan kedalaman ruang autentik',
  },
  {
    id: 'cinematic',
    name: 'Sinematik Film 35mm',
    promptSuffix: 'cinematic still, 35mm film photography, anamorphic lens flare, moody color grading, volumetric smoke, Kodak Portra 400',
    iconName: 'Film',
    description: 'Gradasi warna film analog dengan atmosfer naratif dramatis',
  },
  {
    id: 'anime',
    name: 'Anime Makoto Shinkai',
    promptSuffix: 'Makoto Shinkai style anime artwork, breathtaking sky with volumetric clouds, radiant sunlight, vivid colors, highly detailed illustration',
    iconName: 'Sparkles',
    description: 'Estetika langit bercahaya, warna jernih dan detail anime beresolusi tinggi',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    promptSuffix: 'cyberpunk aesthetic, rainy night street, glowing holographic signage, wet reflections, dark neon atmosphere, high tech gritty details',
    iconName: 'Zap',
    description: 'Lampu neon holografis di malam hujan kota futuristik',
  },
  {
    id: 'fantasy',
    name: 'Epic Fantasy',
    promptSuffix: 'epic fantasy digital painting, mythical overgrown flora, floating sanctuary, majestic golden hour sunlight, detailed artstation masterpiece',
    iconName: 'Compass',
    description: 'Dunia imajinasi magis dengan pemandangan megah dan flora misterius',
  },
  {
    id: 'minimal_product',
    name: 'Minimalis Mewah',
    promptSuffix: 'minimalist luxury commercial product photography, soft diffused travertine surface lighting, clean crystalline textures, elegant editorial composition',
    iconName: 'Gem',
    description: 'Komposisi bersih untuk katalog produk premium dan desain estetik',
  },
];

export const SAMPLE_PROMPTS: SamplePrompt[] = [];

export const INITIAL_SHOWCASE: GenerationHistoryItem[] = [];
