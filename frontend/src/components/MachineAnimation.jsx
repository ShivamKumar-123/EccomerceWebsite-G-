import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MachineAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Rotate gears
      gsap.to('.gear-1', {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center center'
      });
      
      gsap.to('.gear-2', {
        rotation: -360,
        duration: 6,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center center'
      });
      
      gsap.to('.gear-3', {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center center'
      });

      // Piston animation
      gsap.to('.piston', {
        y: 20,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Conveyor belt items
      gsap.to('.conveyor-item', {
        x: 300,
        duration: 4,
        repeat: -1,
        ease: 'none',
        stagger: 1
      });

      // Steam/smoke effect
      gsap.to('.steam', {
        y: -50,
        opacity: 0,
        duration: 2,
        repeat: -1,
        stagger: 0.3,
        ease: 'power1.out'
      });

      // Pulse effect on machine body
      gsap.to('.machine-pulse', {
        scale: 1.02,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Machine SVG */}
      <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
        <defs>
          {/* Gradients */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#718096" />
            <stop offset="100%" stopColor="#4a5568" />
          </linearGradient>
          
          <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Shadow Filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
          </filter>
        </defs>

        {/* Machine Base */}
        <g className="machine-pulse" filter="url(#shadow)">
          {/* Main Body */}
          <rect x="200" y="200" width="400" height="200" rx="10" fill="url(#metalGradient)" />
          <rect x="210" y="210" width="380" height="180" rx="8" fill="#2d3748" />
          
          {/* Control Panel */}
          <rect x="230" y="230" width="150" height="140" rx="5" fill="#1a202c" stroke="#10b981" strokeWidth="2" />
          
          {/* Display Screen */}
          <rect x="245" y="245" width="120" height="60" rx="3" fill="#0d1117" />
          <rect x="250" y="250" width="110" height="50" rx="2" fill="#10b981" opacity="0.2" />
          
          {/* Screen Lines */}
          <line x1="255" y1="260" x2="355" y2="260" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <line x1="255" y1="275" x2="330" y2="275" stroke="#10b981" strokeWidth="2" opacity="0.6" />
          <line x1="255" y1="290" x2="345" y2="290" stroke="#10b981" strokeWidth="2" opacity="0.4" />
          
          {/* Buttons */}
          <circle cx="260" cy="330" r="12" fill="#ef4444" filter="url(#glow)" />
          <circle cx="300" cy="330" r="12" fill="#10b981" filter="url(#glow)" />
          <circle cx="340" cy="330" r="12" fill="#3b82f6" filter="url(#glow)" />
          
          {/* Output Chute */}
          <path d="M 400 300 L 450 300 L 480 350 L 520 350 L 520 400 L 400 400 Z" fill="url(#metalGradient)" />
          <path d="M 410 310 L 445 310 L 470 350 L 510 350 L 510 390 L 410 390 Z" fill="#2d3748" />
        </g>

        {/* Large Gear 1 */}
        <g className="gear-1" filter="url(#shadow)">
          <circle cx="650" cy="150" r="60" fill="none" stroke="url(#metalGradient)" strokeWidth="15" />
          <circle cx="650" cy="150" r="20" fill="url(#greenGlow)" />
          {[...Array(8)].map((_, i) => (
            <rect
              key={i}
              x="645"
              y="80"
              width="10"
              height="25"
              fill="url(#metalGradient)"
              transform={`rotate(${i * 45} 650 150)`}
            />
          ))}
        </g>

        {/* Medium Gear 2 */}
        <g className="gear-2" filter="url(#shadow)">
          <circle cx="580" cy="220" r="40" fill="none" stroke="url(#metalGradient)" strokeWidth="12" />
          <circle cx="580" cy="220" r="12" fill="url(#goldGradient)" />
          {[...Array(6)].map((_, i) => (
            <rect
              key={i}
              x="576"
              y="172"
              width="8"
              height="18"
              fill="url(#metalGradient)"
              transform={`rotate(${i * 60} 580 220)`}
            />
          ))}
        </g>

        {/* Small Gear 3 */}
        <g className="gear-3" filter="url(#shadow)">
          <circle cx="700" cy="250" r="30" fill="none" stroke="url(#metalGradient)" strokeWidth="10" />
          <circle cx="700" cy="250" r="10" fill="url(#greenGlow)" />
          {[...Array(6)].map((_, i) => (
            <rect
              key={i}
              x="697"
              y="215"
              width="6"
              height="12"
              fill="url(#metalGradient)"
              transform={`rotate(${i * 60} 700 250)`}
            />
          ))}
        </g>

        {/* Piston Assembly */}
        <g filter="url(#shadow)">
          <rect x="100" y="150" width="80" height="150" rx="5" fill="url(#metalGradient)" />
          <rect x="110" y="160" width="60" height="130" rx="3" fill="#2d3748" />
          <rect className="piston" x="120" y="180" width="40" height="60" rx="2" fill="url(#greenGlow)" />
          <rect x="130" y="250" width="20" height="40" fill="url(#metalGradient)" />
        </g>

        {/* Conveyor Belt */}
        <g>
          <rect x="50" y="420" width="700" height="30" rx="15" fill="#1a202c" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="435" x2="750" y2="435" stroke="#4a5568" strokeWidth="1" strokeDasharray="10 5" />
          
          {/* Conveyor Items */}
          <rect className="conveyor-item" x="-50" y="400" width="40" height="30" rx="3" fill="url(#goldGradient)" />
          <rect className="conveyor-item" x="-150" y="400" width="40" height="30" rx="3" fill="url(#greenGlow)" />
          <rect className="conveyor-item" x="-250" y="400" width="40" height="30" rx="3" fill="url(#goldGradient)" />
        </g>

        {/* Steam/Smoke Effects */}
        <g>
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              className="steam"
              cx={150 + i * 15}
              cy="140"
              r={5 + i * 2}
              fill="white"
              opacity="0.3"
            />
          ))}
        </g>

        {/* Pipes */}
        <g stroke="url(#metalGradient)" strokeWidth="8" fill="none">
          <path d="M 180 200 Q 180 150 220 150" />
          <path d="M 600 300 Q 650 300 650 350 Q 650 400 700 400" />
          <path d="M 100 300 Q 50 300 50 350 Q 50 420 100 420" />
        </g>

        {/* Pipe Joints */}
        <circle cx="180" cy="200" r="8" fill="url(#metalGradient)" />
        <circle cx="220" cy="150" r="8" fill="url(#metalGradient)" />
        <circle cx="600" cy="300" r="8" fill="url(#metalGradient)" />
        <circle cx="700" cy="400" r="8" fill="url(#metalGradient)" />

        {/* Energy Lines */}
        <g stroke="url(#greenGlow)" strokeWidth="2" opacity="0.6">
          <path d="M 370 250 L 400 250" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M 370 270 L 400 270" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M 370 290 L 400 290" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>

      {/* Glowing Orbs */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Text Overlay */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white">
        <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Advanced Machinery
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Precision Engineering at Work</p>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs sm:text-sm font-medium">Online</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-yellow-400 text-sm font-medium">Processing</span>
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default MachineAnimation;
