type LoadingModalProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
};

export default function LoadingModal({
  isOpen,
  title = 'Loading',
  description = 'Please wait while we prepare your workspace.',
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stroke bg-white/95 p-6 shadow-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <div>
            <div className="text-base font-semibold text-dark">{title}</div>
            <p className="mt-1 text-sm text-body-color">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
