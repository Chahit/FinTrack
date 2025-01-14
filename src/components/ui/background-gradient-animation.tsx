'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export const BackgroundGradientAnimation = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform rotate-45 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 transform -rotate-45 blur-3xl" />
          </motion.div>
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};
