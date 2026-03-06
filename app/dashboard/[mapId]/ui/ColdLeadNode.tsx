'use client';

import type { Node, NodeProps } from '@xyflow/react';
import ContentNode from './ContentNode';
import type { BaseOutputNodeData } from './contentNodeTypes';

type ColdLeadNodeData = BaseOutputNodeData & {
  type: 'coldlead';
};

type ColdLeadNodeType = Node<ColdLeadNodeData, 'coldlead'>;

export default function ColdLeadNode(props: NodeProps<ColdLeadNodeType>) {
  return (
    <ContentNode
      {...(props as unknown as NodeProps<Node<any, 'coldlead'>>)}
      nodeLabel="Prospect Outreach"
      generationMode="LINKEDIN_DM_LEAD"
      accent="indigo"
      settingsScope="coldlead"
      lockPlatform="LINKEDIN"
      getContextLabel={() => 'LinkedIn Outreach'}
      getGenerateActionLabel={() => 'Generate Prospect Outreach'}
      enableChat
      enableRefine
      enableSocialOptions={false}
      enableMessagingLength
    />
  );
}
