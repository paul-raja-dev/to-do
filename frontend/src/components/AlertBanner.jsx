import { useEffect, useRef, useState } from 'react';

// Global toast/banner for operational success or API error messaging
export default function AlertBanner({ message, type = 'error', onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const prevMessage = useRef(message);

  // Reset dismissed flag whenever the message changes (new notification)
  useEffect(() => {
    if (message !== prevMessage.current) {
      prevMessage.current = message;
      setDismissed(false);
    }
  }, [message]);

  // Auto-dismiss after 4 s
  useEffect(() => {
    if (!message || dismissed) return;
    const t = setTimeout(() => {
      setDismissed(true);
      if (onDismiss) onDismiss();
    }, 4000);
    return () => clearTimeout(t);
  }, [message, dismissed, onDismiss]);

  if (!message || dismissed) return null;

  const isError = type === 'error';

  return (
    <div
      className={`flex items-center justify-between gap-4 border px-5 py-3 text-xs font-mono uppercase tracking-widest mt-4
        ${isError ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
    >
      <span>
        <span className="font-black mr-2">{isError ? '// ERR' : '// OK'}</span>
        {message}
      </span>
      <button
        onClick={() => { setDismissed(true); if (onDismiss) onDismiss(); }}
        className="font-black text-xs opacity-60 hover:opacity-100 cursor-pointer"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
