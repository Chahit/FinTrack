'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface TradingViewWidgetProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  timezone?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewWidget({
  symbol,
  width = '100%',
  height = '500',
  interval = '1D',
  timezone = 'Etc/UTC'
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          container_id: containerRef.current.id,
          symbol: symbol,
          interval: interval,
          timezone: timezone,
          theme: theme === 'dark' ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1a1a1a' : '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          width: width,
          height: height,
          hide_side_toolbar: false,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650'
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol, theme, width, height, interval, timezone]);

  return (
    <div className="tradingview-widget-container">
      <div
        id={`tradingview_${symbol.toLowerCase()}`}
        ref={containerRef}
        style={{ width: width, height: height }}
      />
    </div>
  );
}