import { useEffect } from 'react';

// Full-screen image viewer. Arrow keys / on-screen arrows browse,
// Escape or a click on the backdrop closes.
//   images:  [{ src, alt? }]
//   index:   the open image's index, or null when closed
//   onChange(newIndex) / onClose()
export default function Lightbox({ images, index, onChange, onClose }) {
  const open = index !== null;
  const count = images.length;
  const go = (step) => onChange((((index + step) % count) + count) % count);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const current = open ? images[index] : null;

  return (
    <div
      className={`pg-lightbox${open ? ' visible' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <button className="pg-lightbox-close" onClick={onClose}>close ✕</button>
      <button className="pg-lightbox-arrow pg-lightbox-prev" onClick={() => go(-1)} aria-label="Previous image">‹</button>
      <button className="pg-lightbox-arrow pg-lightbox-next" onClick={() => go(1)} aria-label="Next image">›</button>
      {current && <img src={current.src} alt={current.alt || ''} />}
      <span className="pg-lightbox-count">{open ? `${index + 1} / ${count}` : ''}</span>
      <span className="pg-lightbox-hint">use ← → to browse</span>
    </div>
  );
}
