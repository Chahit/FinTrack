'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com",
        "width": "100%",
        "height": "800px",
        "save_image": true,
        "calendar": true,
        "hide_side_toolbar": false,
        "withdateranges": true,
        "details": true,
        "hotlist": true,
        "calendar": true,
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650",
        "studies": [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies",
          "MACD@tv-basicstudies"
        ]
      }`;

    const container = document.getElementById('tradingview-widget');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      const container = document.getElementById('tradingview-widget');
      if (container) {
        const scriptElement = container.querySelector('script');
        if (scriptElement) {
          container.removeChild(scriptElement);
        }
      }
    };
  }, []);

  return (
    <div id="tradingview-widget" className="tradingview-widget-container w-full" style={{ height: '800px' }}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
} 