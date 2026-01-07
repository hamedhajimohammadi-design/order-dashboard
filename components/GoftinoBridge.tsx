'use client';

import { useEffect, useRef } from 'react';

export default function GoftinoBridge() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Inject Goftino Script
    const i = "699148628gevb83yy3n7m0o1574c60d08dd367351c3b2cacb49b9d260ee7a20d";
    const d = document;
    if (!d.getElementById('goftino-script')) {
        const g = d.createElement("script");
        g.id = 'goftino-script';
        const s = "https://www.goftino.com/widget/" + i;
        
        // Removed localStorage logic to prevent potential persist.js crash from corrupt data
        // const l = localStorage.getItem("goftino_" + i); 
        
        g.async = true;
        // g.src = l ? s + "?o=" + l : s;
        g.src = s; // Force clean load
        
        d.getElementsByTagName("head")[0].appendChild(g);
        console.log('[GoftinoBridge] Script injected (Simple Mode).');
    }
    
    // Client-side logic removed to avoid conflict with Server Webhook
    // The server handles logic at /api/webhooks/support
  }, []);

  return null;
}
