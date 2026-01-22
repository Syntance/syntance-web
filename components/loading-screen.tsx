'use client'

export function LoadingAnimation() {
  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-loading-bar" />
      </div>
      
      {/* Center spinner - small, non-blocking */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998]">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 480 480" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin-slow opacity-60"
        >
          <path 
            d="M276.682 61.0002L331.42 61.0002C333.2 61.0002 334.093 63.1527 332.835 64.4131L135.229 262.375C135.229 262.375 127.784 269.833 135.229 277.291C142.674 284.75 150.119 277.291 150.119 277.291L276.682 150.5C276.682 150.5 343.687 83.3751 403.246 143.042C462.805 202.708 396.173 269.833 396.173 269.833L276.682 389.166C246.903 419.604 202.233 418.999 202.233 418.999H147.496C145.715 418.999 144.822 416.847 146.081 415.586L343.687 217.625C343.687 217.625 351.132 210.166 343.687 202.708C336.242 195.25 328.797 202.708 328.797 202.708L202.233 329.499C202.233 329.499 135.229 396.624 75.6696 336.958C16.1102 277.291 83.1145 210.166 83.1145 210.166L202.233 90.8334C231.641 60.6273 276.682 61.0002 276.682 61.0002Z" 
            fill="url(#loading-gradient)"
          />
          <defs>
            <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  )
}

export default LoadingAnimation
