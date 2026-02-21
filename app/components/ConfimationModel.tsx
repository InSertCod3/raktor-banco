'use client';

import React, { useState, useEffect } from 'react';

interface ConfimationModelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  phraseEnforce?: boolean;
  isLoading?: boolean;
  variant?: 'delete' | 'confirm';
  description?: string;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
}

export default function ConfimationModel({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  phraseEnforce = false,
  isLoading = false,
  variant = 'delete',
  description,
  confirmLabel,
  confirmLoadingLabel,
}: ConfimationModelProps) {
  const [inputValue, setInputValue] = useState('');
  const requiredPhrase = itemName.substring(0, 5);
  const isConfirmDisabled = phraseEnforce && inputValue !== requiredPhrase;
  const resolvedDescription =
    description ??
    (variant === 'delete'
      ? 'Are you sure you want to delete'
      : 'Are you sure you want to apply changes to');
  const resolvedSuffix = variant === 'delete' ? 'This action cannot be undone.' : '';
  const resolvedConfirmLabel = confirmLabel ?? (variant === 'delete' ? 'Delete' : 'Confirm');
  const resolvedConfirmLoadingLabel = confirmLoadingLabel ?? (variant === 'delete' ? 'Deleting...' : 'Applying...');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stroke bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-dark">{title}</h3>
        <p className="mt-3 text-body-color">
          {resolvedDescription} <span className="font-semibold text-dark">"{itemName}"</span>
          {resolvedSuffix ? <>. {resolvedSuffix}</> : null}
        </p>

        {phraseEnforce && (
          <div className="mt-5">
            <label htmlFor="confirmPhrase" className="block text-sm font-medium text-dark mb-2">
              To confirm, type <span className="font-mono font-bold text-primary">"{requiredPhrase}"</span> below:
            </label>
            <input
              id="confirmPhrase"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Type "${requiredPhrase}"`}
              className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 text-dark outline-none focus:border-primary transition"
              autoComplete="off"
            />
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-body-color hover:bg-gray-2 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled || isLoading}
            className={[
              'rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed',
              variant === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-dark',
            ].join(' ')}
          >
            {isLoading ? resolvedConfirmLoadingLabel : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


