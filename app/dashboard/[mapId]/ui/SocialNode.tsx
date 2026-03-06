'use client';

import type { Node, NodeProps } from '@xyflow/react';
import ContentNode from './ContentNode';
import type { BaseOutputNodeData } from './contentNodeTypes';
import { platformLabel } from './contentNodeUtils';

type SocialNodeData = BaseOutputNodeData & {
  type: 'social';
};

type SocialNodeType = Node<SocialNodeData, 'social'>;

export default function SocialNode(props: NodeProps<SocialNodeType>) {
  return (
    <ContentNode
      {...(props as unknown as NodeProps<Node<any, 'social'>>)}
      nodeLabel="Social Draft"
      generationMode="SOCIAL_POST"
      accent="primary"
      settingsScope="social"
      getPlatformLabel={platformLabel}
      getContextLabel={platformLabel}
      getGenerateActionLabel={(platform) => `Generate ${platformLabel(platform)}`}
      enableChat
      enableRefine
      enableSocialOptions
      enableMessagingLength
    />
  );
}
