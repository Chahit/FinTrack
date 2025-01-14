'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedTooltip = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 px-4 py-2 text-sm text-white bg-black rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2"
          >
            {content}
            <div className="absolute w-2 h-2 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
