'use client';

import { motion } from 'framer-motion';

export const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0A] z-50">
      <div className="relative">
        <motion.div
          className="w-24 h-24 rounded-full border-t-4 border-b-4 border-blue-500"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            FT
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-10 text-white/80 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Loading your portfolio...
      </motion.div>
    </div>
  );
};
