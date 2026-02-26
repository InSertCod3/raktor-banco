'use client';

import { useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

type HandleSide = 'left' | 'right' | 'both';

function WarningBadge({
  message,
  className,
  tooltipId,
}: {
  message: string;
  className: string;
  tooltipId: string;
}) {
  return (
    <div
      className={[
        'absolute z-30 inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-[10px] text-amber-700 shadow-sm',
        className,
      ].join(' ')}
      data-tooltip-id={tooltipId}
      data-tooltip-content={message}
      aria-label={message}
    >
      <FontAwesomeIcon icon={faTriangleExclamation} />
    </div>
  );
}

export default function ConnectionHandleWarning({
  message,
  side = 'right',
}: {
  message?: string | null;
  side?: HandleSide;
}) {
  if (!message) return null;
  const tooltipId = useId().replace(/:/g, '');
  const tooltipClassName =
    'z-30 max-w-[260px] rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium leading-relaxed text-slate-100 shadow-xl backdrop-blur';

  if (side === 'both') {
    return (
      <>
        <WarningBadge
          message={message}
          className="left-0 top-1/2 -translate-x-1/2 -translate-y-[150%]"
          tooltipId={tooltipId}
        />
        <WarningBadge
          message={message}
          className="right-0 top-1/2 translate-x-1/2 -translate-y-[150%]"
          tooltipId={tooltipId}
        />
        <Tooltip id={tooltipId} place="top" className={tooltipClassName} opacity={1} delayShow={120} />
      </>
    );
  }

  return (
    <>
      <WarningBadge
        message={message}
        tooltipId={tooltipId}
        className={
          side === 'left'
            ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-[150%]'
            : 'right-0 top-1/2 translate-x-1/2 -translate-y-[150%]'
        }
      />
      <Tooltip id={tooltipId} place="top" className={tooltipClassName} opacity={1} delayShow={120} />
    </>
  );
}
