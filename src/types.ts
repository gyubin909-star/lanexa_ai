export interface FloraModel {
  id: string;
  name: string;
  creator: string;
  description: string;
  badge?: string;
  speed: string;
  styles: string[];
}

export interface FloraStatus {
  configured: boolean;
  valid: boolean;
  keyMask?: string | null;
  workspacesCount?: number;
  workspaces?: Array<{ id: string; name: string }>;
  defaultWorkspace?: string | null;
  message?: string;
  provider: string;
}

export interface GenerationHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  stylePreset: string;
  engine: string;
  timestamp: number;
  seed?: number | null;
  chargedCost?: number;
}

export interface StylePreset {
  id: string;
  name: string;
  promptSuffix: string;
  iconName: string;
  description: string;
}
