import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
});

/** Live IST clock string, ticking once per second. Content, not animation. */
export function useIstClock(): string {
  const [now, setNow] = useState('');

  useEffect(() => {
    const tick = () => setNow(formatter.format(new Date()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  return now;
}
