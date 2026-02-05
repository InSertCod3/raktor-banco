import React, { useContext } from "react";
import { NodeProps } from "@xyflow/react";
import { MindMapContext } from "./MindMapContext";

interface SocialNodeProps extends NodeProps {
  data: {
    label: string;
    type: "social" | "idea";
    content?: string;
    children?: any[];
  };
}

const SocialNode = ({ data, id, isSelected }: SocialNodeProps) => {
  const { addChildNode } = useContext(MindMapContext);

  const handleCreateIdea = () => {
    addChildNode(id);
  };

  return (
    <div className="w-80 h-96 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
      <div className="p-4">
        <h3 className="text-blue-800 font-semibold">{data.label}</h3>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-blue-700">
          {data.content || "Social content goes here..."}
        </p>

        <div className="flex justify-between items-center">
          <button
            className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-3 py-1 text-sm hover:bg-blue-50"
            onClick={handleCreateIdea}
          >
            <span className="inline-block w-4 h-4 mr-2">+</span>
            Create Idea
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialNode;

// Add this CSS to your global styles or tailwind config
// .social-node {
//   background-color: #f0f7ff;
//   border: 2px solid #3b82f6;
// }
//
// .idea-node {
//   background-color: #fff7ed;
//   border: 2px solid #f59e0b;
// }
