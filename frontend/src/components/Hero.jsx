import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Star, Users, Award } from 'lucide-react';

const STATS = [
  { value: '15+', label: 'Years Experience', icon: Award },
  { value: '50K+', label: 'Happy Farmers', icon: Users },
  { value: '28+', label: 'States Covered', icon: Star },
];

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo('.hero-title',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.3'
      )
      .fromTo('.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
        '-=0.4'
      )
      .fromTo('.hero-stat',
        { opacity: 0, scale: 0.85, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
        '-=0.3'
      )
      .fromTo('.hero-image',
        { opacity: 0, x: 40, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power2.out' },
        '-=1.2'
      );

      // Float animations
      gsap.to('.float-slow', {
        y: -14, duration: 3.5, repeat: -1, yoyo: true, ease: 'power1.inOut',
      });
      gsap.to('.float-fast', {
        y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: 'power1.inOut', delay: 0.8,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1C1917 0%, #3d2616 48%, #292524 100%)',
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glow blobs */}
        <div className="float-slow absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-secondary-500/12 blur-[120px]" />
        <div className="float-fast absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-secondary-600/10 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(28,25,23,0.88)_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[78vh]">

          {/* ── Left ── */}
          <div className="text-white">
            {/* Eyebrow */}
            <div className="hero-eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-500/30 bg-secondary-500/12 px-4 py-2 text-sm font-semibold text-secondary-200 backdrop-blur-sm opacity-0">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-400" />
              🌾 India's Trusted Machinery Partner
            </div>

            {/* Headline */}
            <div className="hero-title opacity-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.06] tracking-tight mb-6">
                Powering{' '}
                <span
                  className="font-extrabold"
                  style={{
                    background: 'linear-gradient(90deg, #EADBC8, #B87444, #EADBC8)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 4s ease infinite',
                  }}
                >
                  Kisan
                </span>{' '}
                Productivity
                <span className="block mt-1">with Advanced</span>
                <span className="mt-1 block text-secondary-300">Goldy Mart</span>
              </h1>
            </div>

            <p className="hero-subtitle mb-9 max-w-xl text-lg leading-relaxed text-primary-100/80 sm:text-xl opacity-0">
              Empowering India's farmers with cutting-edge agricultural machinery.
              From rice mills to food processing equipment — we deliver excellence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-14">
              <button className="hero-cta group flex items-center gap-2 rounded-2xl bg-primary-50 px-8 py-4 text-base font-bold text-primary-950 shadow-xl transition-all hover:scale-105 hover:bg-primary-100 shadow-black/25 opacity-0">
                Explore Products
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="hero-cta opacity-0 group flex items-center gap-2 bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:border-white/35">
                <Play size={18} className="fill-white" />
                Watch Video
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="hero-stat opacity-0 text-center rounded-2xl border border-white/10 bg-white/6 backdrop-blur-sm py-4 px-3 hover:bg-white/10 transition-colors"
                >
                  <div
                    className="text-2xl sm:text-3xl font-black mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #B87444, #925C36)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {value}
                  </div>
                  <div className="text-xs font-medium text-primary-300/70">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Image ── */}
          <div className="hero-image opacity-0 relative hidden lg:block">
            <div className="relative">
              {/* Main image */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/15 to-transparent z-10 pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=700&fit=crop"
                  alt="Agricultural Machinery"
                  className="w-full object-cover rounded-3xl"
                  style={{ height: '520px' }}
                />
              </div>

              {/* Floating card 1 */}
              <div className="float-slow absolute -left-12 top-1/4 z-20 bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-2xl backdrop-blur-md border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-xl">🚜</div>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-white text-sm">100+ Products</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Premium Quality</div>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="float-fast absolute -right-8 bottom-1/3 z-20 bg-white/95 dark:bg-stone-900/95 rounded-2xl p-4 shadow-2xl backdrop-blur-md border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-white text-sm">4.9 Rating</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">50K+ reviews</div>
                  </div>
                </div>
              </div>

              {/* Glow ring behind image */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-500/20 via-transparent to-amber-500/10 blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-5 h-9 rounded-full border-2 border-white/25 flex justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-white/60 rounded-full animate-bounce" />
        </div>
        <span className="text-white/30 text-[10px] uppercase tracking-widest">Scroll</span>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 dark:from-dark to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
