import { useEffect, useRef } from 'react';

/**
 * A div with a non-passive wheel listener, so the canvas can zoom with the
 * mouse wheel (preventDefault) without scrolling the page.
 */
export function WheelDiv({ onWheelNP, ...rest }) {
  const ref = useRef(null);
  const handler = useRef(onWheelNP);
  handler.current = onWheelNP;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fn = (e) => handler.current && handler.current(e);
    el.addEventListener('wheel', fn, { passive: false });
    return () => el.removeEventListener('wheel', fn);
  }, []);
  return <div ref={ref} {...rest} />;
}
