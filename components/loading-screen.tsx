'use client'

import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05030C]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl opacity-30">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          />
        </div>
        
        {/* Animated Sygnet */}
        <motion.svg 
          width="96" 
          height="96" 
          viewBox="0 0 480 480" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <motion.path 
            d="M276.682 61.0002L331.42 61.0002C333.2 61.0002 334.093 63.1527 332.835 64.4131L135.229 262.375C135.229 262.375 127.784 269.833 135.229 277.291C142.674 284.75 150.119 277.291 150.119 277.291L276.682 150.5C276.682 150.5 343.687 83.3751 403.246 143.042C462.805 202.708 396.173 269.833 396.173 269.833L276.682 389.166C246.903 419.604 202.233 418.999 202.233 418.999H147.496C145.715 418.999 144.822 416.847 146.081 415.586L343.687 217.625C343.687 217.625 351.132 210.166 343.687 202.708C336.242 195.25 328.797 202.708 328.797 202.708L202.233 329.499C202.233 329.499 135.229 396.624 75.6696 336.958C16.1102 277.291 83.1145 210.166 83.1145 210.166L202.233 90.8334C231.641 60.6273 276.682 61.0002 276.682 61.0002Z" 
            fill="url(#gradient)"
            stroke="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </motion.svg>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
