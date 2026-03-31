const WaveSeparator = ({ color = '#ffffff', bgColor = 'transparent', flip = false, className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: bgColor }}>
      <svg
        className={`w-full h-auto ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 80C1248 70 1344 50 1392 40L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const WaveSeparator2 = ({ color = '#ffffff', bgColor = 'transparent', flip = false, className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: bgColor }}>
      <svg
        className={`w-full h-auto ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const WaveSeparator3 = ({ color = '#ffffff', bgColor = 'transparent', flip = false, className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: bgColor }}>
      <svg
        className={`w-full h-auto ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 64L40 69.3C80 75 160 85 240 90.7C320 96 400 96 480 85.3C560 75 640 53 720 48C800 43 880 53 960 69.3C1040 85 1120 107 1200 101.3C1280 96 1360 64 1400 48L1440 32V150H1400C1360 150 1280 150 1200 150C1120 150 1040 150 960 150C880 150 800 150 720 150C640 150 560 150 480 150C400 150 320 150 240 150C160 150 80 150 40 150H0V64Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const CurvedSeparator = ({ topColor = '#1a5f2a', bottomColor = '#ffffff', className = '' }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <svg
        className="w-full h-auto"
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <ellipse cx="720" cy="80" rx="900" ry="80" fill={bottomColor} />
      </svg>
    </div>
  );
};

export { WaveSeparator, WaveSeparator2, WaveSeparator3, CurvedSeparator };
export default WaveSeparator;
