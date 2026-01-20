import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloudShader from "@/components/ui/cloud-shader";

const Landing_page = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(scrollY <= 100);
  }, [scrollY]);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: '#1A2B4A', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        .nav-link:hover { color: #E6B84D !important; }
        .feature-card:hover { transform: translateY(-4px); }
        .step-card:hover { transform: translateY(-4px); }
        .audience-card:hover { transform: translateY(-6px); }
        .footer-link:hover { color: #E6B84D !important; }
        .cta-primary:hover { transform: translateY(-2px) scale(1.02); }
        .help-btn:hover { transform: scale(1.1); }
      `}</style>

      {/* CloudShader Background */}
      <div className="fixed inset-0 z-0">
        <CloudShader speed={0.15} octaves={5} scale={3} className="w-full h-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Floating Doodles */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-12 text-4xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-40 right-20 text-3xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-40 left-1/4 text-5xl opacity-10" style={{ animation: 'float 3.5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute top-1/3 right-10 text-4xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
        <div className="absolute bottom-32 right-1/3 text-3xl opacity-20" style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}>🪘</div>
      </div>

      {/* Navigation - Matching NavBarDark style */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md py-2 px-3 rounded-full border border-white/10">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>🪘</div>
            <span className="text-lg font-bold text-white">Djembe</span>
          </div>

          <div className="w-px h-6 bg-white/20" />

          {/* Nav Links */}
          <a
            href="#teachers"
            className="nav-link px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span className="hidden md:inline">For Teachers</span>
          </a>

          <div className="w-px h-6 bg-white/20" />

          {/* Auth Buttons */}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-5 py-2 rounded-full text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-8 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border mb-8 transition-all duration-500"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <span style={{ color: '#E6B84D' }}>✨</span>
            <span className="text-white/90 text-sm font-medium">No installation required — Start creating music instantly!</span>
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6 transition-all duration-500"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            Create. Collaborate. <span style={{ color: '#D97746' }}>Inspire.</span>
          </h1>

          <p
            className="text-xl leading-relaxed mb-10 max-w-2xl transition-all duration-500"
            style={{
              color: 'rgba(255,255,255,0.7)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            Djembe is the ultimate online music creation platform designed for educators and students. Unleash your creativity through African instruments in this magical world.
          </p>

          <div
            className="flex gap-4 mb-12 transition-all duration-500"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            <button
              onClick={() => navigate('/signup')}
              className="cta-primary px-8 py-4 rounded-full font-semibold text-white flex items-center gap-3 transition-all"
              style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)', boxShadow: '0 4px 20px rgba(217, 119, 70, 0.4)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Get Started
            </button>
          </div>

          <div className="flex gap-8 flex-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#4A9B9B' }}></span>
              Ages 8-12
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D97746' }}></span>
              Ghanaian Rhythms
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E6B84D' }}></span>
              AI-assisted Composition
            </span>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute w-80 h-80 rounded-full right-[10%] top-[20%] -z-10" style={{ background: 'radial-gradient(circle, rgba(217, 119, 70, 0.2) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute w-60 h-60 rounded-full right-[5%] bottom-[10%] -z-10" style={{ background: 'radial-gradient(circle, rgba(74, 155, 155, 0.15) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite 0.5s' }} />
      </section>

      {/* Image Section */}
      <section className="relative z-10 px-8 pb-20 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden backdrop-blur-md border" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="h-96 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.1) 0%, rgba(74, 155, 155, 0.1) 100%)' }}>
            <div className="text-center">
              <span className="text-7xl block mb-4">🪘</span>
              <span className="text-2xl font-semibold text-white">Interactive 3D Experience</span>
              <p className="text-white/60 mt-2">Dive into an immersive environment where you can create, learn, and collaborate</p>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>▶</div>
            <div>
              <div className="font-semibold text-white">Interactive 3D Experience</div>
              <div className="text-sm text-white/60">Click to embark on your musical journey</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">How It Works</h2>
        <p className="text-white/60 text-center text-lg mb-16">Four simple steps to musical discovery</p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { num: '01', icon: '✨', title: 'Enter a musical world', desc: 'Step into a vibrant 3D space filled with African instruments', color: '#D97746' },
            { num: '02', icon: '🪘', title: 'Tap and play instruments', desc: 'Touch, click, and explore djembes, shekeres, and more', color: '#4A9B9B' },
            { num: '03', icon: '🪄', title: 'Create music with AI', desc: 'Let AI help you build rhythmic loops and patterns', color: '#E6B84D' },
            { num: '04', icon: '🎵', title: 'Learn rhythm through play', desc: 'Discover Ghanaian music traditions while having fun', color: '#4A9B9B' },
          ].map((step, i) => (
            <div
              key={i}
              className="step-card relative rounded-2xl backdrop-blur-md p-8 border transition-all duration-300"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <span className="absolute top-4 left-6 text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.05)' }}>{step.num}</span>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 mt-8" style={{ backgroundColor: `${step.color}20` }}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Djembe Section */}
      <section className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">Why Djembe?</h2>
        <p className="text-white/60 text-center text-lg mb-16">Empowering music education through innovation</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📦', gradient: 'linear-gradient(135deg, #E6B84D 0%, #4A9B9B 100%)', title: '3D Interactive Learning', desc: 'Experience music in a fully immersive 3D environment that brings instruments to life' },
            { icon: '🌍', gradient: 'linear-gradient(135deg, #E6B84D 0%, #D97746 100%)', title: 'African/Ghanaian Instruments', desc: 'Connect with authentic cultural sounds through djembes, shekeres, and traditional rhythms' },
            { icon: '✨', gradient: 'linear-gradient(135deg, #4A9B9B 0%, #1A2B4A 100%)', title: 'AI-Assisted Creativity', desc: 'Smart tools help children compose and explore musical patterns with confidence' },
            { icon: '⚡', gradient: 'linear-gradient(135deg, #1A2B4A 0%, #4A9B9B 100%)', title: 'Browser-Based Access', desc: 'No downloads or setup required. Just open your browser and start playing instantly' },
            { icon: '🎓', gradient: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)', title: 'Educator-Focused Tools', desc: 'Built-in features for teachers to track progress, assign activities, and foster collaboration' },
          ].map((feature, i) => (
            <div
              key={i}
              className="feature-card rounded-2xl backdrop-blur-md p-8 border transition-all duration-300"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: feature.gradient }}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="teachers" className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">Who Is Djembe For?</h2>
        <p className="text-white/60 text-center text-lg mb-16">Designed with educators and students in mind</p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { emoji: '🎨', icon: '❤️', title: 'Kids', desc: 'Learn rhythm and creativity through immersive play experiences', color: '#D97746' },
            { emoji: '👩‍🏫', icon: '📖', title: 'Teachers', desc: 'Engage students with interactive, curriculum-aligned music lessons', color: '#4A9B9B' },
            { emoji: '🏫', icon: '🏛️', title: 'Schools', desc: 'Accessible, scalable music education for entire classrooms', color: '#E6B84D' },
          ].map((audience, i) => (
            <div
              key={i}
              className="audience-card rounded-2xl backdrop-blur-md p-10 border text-center transition-all duration-300"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <span className="text-6xl block mb-4">{audience.emoji}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-4" style={{ backgroundColor: `${audience.color}30` }}>
                {audience.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{audience.title}</h3>
              <p className="text-white/60 leading-relaxed">{audience.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <section className="relative z-10 py-12 px-8 flex justify-center">
        <div className="flex items-center gap-4 px-8 py-4 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.2) 0%, rgba(74, 155, 155, 0.2) 100%)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#D97746' }}>8+</span>
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: '#4A9B9B' }}>✓</span>
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: '#4A9B9B' }}>🌍</span>
          <span className="text-white/90 font-medium ml-2">Perfect for ages 8-12 • Ghana-focused • Classroom-ready</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to discover the <span style={{ color: '#D97746' }}>rhythm</span> within?
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            Start playing today. No downloads, no setup—just open your browser and let the music begin.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="cta-primary px-10 py-4 rounded-full font-semibold text-white flex items-center gap-3 transition-all"
              style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)', boxShadow: '0 4px 20px rgba(217, 119, 70, 0.4)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Playing Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 rounded-full font-semibold text-white border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Emoji Bar */}
      <div className="relative z-10 py-12 flex justify-center gap-12 border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <span className="text-4xl" style={{ animation: 'float 3s ease-in-out infinite' }}>🪘</span>
        <span className="text-4xl" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}>🎵</span>
        <span className="text-4xl" style={{ animation: 'float 3.5s ease-in-out infinite 0.4s' }}>✨</span>
        <span className="text-4xl" style={{ animation: 'float 4.5s ease-in-out infinite 0.7s' }}>🎶</span>
        <span className="text-4xl" style={{ animation: 'float 3s ease-in-out infinite 0.4s' }}>🎨</span>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 mb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>🪘</div>
              <span className="text-2xl font-bold text-white">Djembe</span>
            </div>
            <p className="text-white/60 leading-relaxed mb-4">Bringing the joy of African music education to life through immersive technology.</p>
            <p className="text-white/50 text-sm">Made with <span style={{ color: '#D97746' }}>❤️</span> in Ghana</p>
          </div>

          <div className="flex gap-20 justify-end">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="footer-link text-white/60 transition-colors">How it Works</a>
                <a href="#" className="footer-link text-white/60 transition-colors">Features</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <div className="flex flex-col gap-3">
                <a href="#teachers" className="footer-link text-white/60 transition-colors">Teachers</a>
                <a href="#" className="footer-link text-white/60 transition-colors">Schools</a>
                <a href="#" className="footer-link text-white/60 transition-colors">Support</a>
                <a href="#" className="footer-link text-white/60 transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="text-white/50 text-sm">© 2024 Djembe. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="footer-link text-white/50 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="footer-link text-white/50 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Help Button */}
      <button
        className="help-btn fixed bottom-7 right-7 w-14 h-14 rounded-full text-white text-2xl font-bold z-50 transition-transform"
        style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)', boxShadow: '0 4px 20px rgba(217, 119, 70, 0.4)' }}
        title="Get Help"
      >
        ?
      </button>
    </div>
  );
};

export default Landing_page;
