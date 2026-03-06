import type { Node } from '@xyflow/react';
import type { Platform } from './MindMapContext';

export type MessagingLengthOption = 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest';

export type ContentVersion = {
  version: number;
  content: string;
  contentByPlatform: Partial<Record<Platform, string>>;
  createdAt: string;
  source: 'generate' | 'chat' | 'refine' | 'manual' | 'original';
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type BaseOutputNodeData = {
  label?: string;
  type?: string;
  platform?: Platform;
  content?: string;
  contentByPlatform?: Partial<Record<Platform, string>>;
  messagingLengthByPlatform?: Partial<Record<Platform, MessagingLengthOption | 'medium' | 'long'>>;
  versionHistory?: ContentVersion[];
  currentVersion?: number;
  chatHistory?: ChatMessage[];
};

export type BaseOutputNode = Node<BaseOutputNodeData, string>;
export type SentenceChangeKind = 'suggestion' | 'custom' | 'deleted';
export type OutputNodeGenerationMode = 'SOCIAL_POST' | 'LINKEDIN_DM_LEAD';
export type OutputNodeAccent = 'primary' | 'indigo';

export type ContentNodeFeatureConfig = {
  nodeLabel: string;
  generationMode: OutputNodeGenerationMode;
  accent?: OutputNodeAccent;
  lockPlatform?: Platform;
  settingsScope?: string;
  getPlatformLabel?: (platform: Platform) => string;
  getContextLabel?: (platform: Platform) => string;
  getGenerateActionLabel?: (platform: Platform) => string;
  enableChat?: boolean;
  enableRefine?: boolean;
  enableSocialOptions?: boolean;
  enableMessagingLength?: boolean;
};
