'use client';

import React from 'react';

type NodeAddPanelAction = {
  label: string;
  description: string;
  onClick: () => void;
  className: string;
};

type NodeAddPanelProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  actions: NodeAddPanelAction[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function NodeAddPanel({
  visible,
  title,
  subtitle,
  actions,
  onMouseEnter,
  onMouseLeave,
}: NodeAddPanelProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute left-[calc(100.5%)] top-1/2 z-20 -translate-y-1/2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-[248px] rounded-2xl border border-stone-200/90 bg-white p-3 shadow-[0_14px_34px_rgba(17,24,39,0.14)] backdrop-blur">
        <div className="mb-2.5 px-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-body-color">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={action.className}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={action.onClick}
            >
              {action.label}
              <div className="mt-0.5 text-[11px] font-medium opacity-90">{action.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
