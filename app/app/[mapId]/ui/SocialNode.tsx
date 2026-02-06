import React, { useContext, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MindMapContext } from "./MindMapContext";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface SocialNodeProps extends NodeProps {
  data: {
    label: string;
    type: "social" | "idea";
    content?: string;
    children?: any[];
  };
}

const SocialNode = ({ data, id, selected }: SocialNodeProps) => {
  const { addChildNode, deleteNode } = useContext(MindMapContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCreateIdea = () => {
    addChildNode(id);
  };

  const handleDelete = () => {
    deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={[
        "w-80 h-96 p-4 bg-blue-50 border-2 rounded-lg",
        selected ? "border-blue-400 ring-2 ring-blue-300/30" : "border-blue-200",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-primary" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-primary" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-blue-800 font-semibold">{data.label}</h3>
          <button
            type="button"
            className="nodrag rounded-md bg-red-5 px-2 py-1 text-[11px] text-white hover:bg-red-6"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Social Node"
        itemName={data?.label || "Social Node"}
        phraseEnforce={false}
      />
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
