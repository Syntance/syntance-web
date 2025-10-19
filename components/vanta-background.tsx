"use client";

export default function VantaBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      {/* Very subtle animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black opacity-70 animate-gradient-slow"></div>
      
      {/* Minimal noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>
    </div>
  );
}

