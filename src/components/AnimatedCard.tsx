//src/components/AnimatedCard.tsx

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function AnimatedCard({ children, index }: { children: ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, // This creates the "waterfall" staggered effect
        ease: [0.25, 0.25, 0, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}