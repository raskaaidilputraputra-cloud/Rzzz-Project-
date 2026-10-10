export type EnhanceMode = 'auto' | 'wink' | 'hd' | 'upscale';
export type QualityTarget = '1080p' | '2k' | '4k';

export interface EnhanceResult {
  id: string;
  originalUrl: string;
  resultUrl: string;
  apiUsed: string;
  qualityTarget: QualityTarget;
  modeUsed: EnhanceMode;
  processingTimeSeconds: number;
  timestamp: string;
  title?: string;
  fileSize?: string;
  attempts?: Array<{ api: string; success: boolean; message?: string }>;
}

export interface VideoMetadata {
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  type: string;
}

export interface KeyframeResult {
  id: string;
  timestampFormatted: string;
  timestampSeconds: number;
  originalFrameUrl: string;
  enhancedFrameUrl: string;
  apiUsed: string;
  createdAt: string;
}

export interface VideoEnhanceResult {
  id: string;
  originalVideoUrl: string;
  resultVideoUrl: string;
  qualityTarget: QualityTarget;
  processingTimeSeconds: number;
  timestamp: string;
  title?: string;
  fileSize?: string;
}

export interface ApiStatusInfo {
  name: string;
  endpoint: string;
  status: number;
  ok: boolean;
  latencyMs?: number;
  error?: string;
  contentType?: string;
}
