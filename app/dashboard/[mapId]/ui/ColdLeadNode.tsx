'use client';

import type { Node, NodeProps } from '@xyflow/react';
import SocialNode from './SocialNode';

type ColdLeadNodeData = {
  label?: string;
  type: 'coldlead';
  platform?: 'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM';
  content?: string;
  contentByPlatform?: Partial<Record<'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM', string>>;
  messagingLengthByPlatform?: Partial<Record<'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM', 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest' | 'medium' | 'long'>>;
};

type ColdLeadNodeType = Node<ColdLeadNodeData, 'coldlead'>;

export default function ColdLeadNode(props: NodeProps<ColdLeadNodeType>) {
  return <SocialNode {...(props as unknown as NodeProps<Node<any, 'coldlead'>>)} variant="coldlead" />;
}
