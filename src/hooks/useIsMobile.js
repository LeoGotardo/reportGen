import { useState, useEffect } from "react";

export function useIsMobile(bp = 860) {
  const [mob, setMob] = useState(() => window.innerWidth <= bp);
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return mob;
}
