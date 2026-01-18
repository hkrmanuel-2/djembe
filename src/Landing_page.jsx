import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const Landing_page = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    
    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => 
            setScrollY(window.scrollY);
            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }   , []);

    useEffect(() => {
        if (scrollY > 100) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }   
    }, [scrollY]);
    
    return (
        <div style = {styles.Landing_page}>
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
                
                .nav-link:hover {
                color: #D97746 !important;
                }
                
                .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 0 #0d1829, 0 8px 20px rgba(26, 43, 74, 0.3) !important;
                }
                
                .btn-secondary:hover {
                background-color: #1A2B4A !important;
                color: white !important;
                border-color: #1A2B4A !important;
                }
                
                .feature-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(26, 43, 74, 0.12) !important;
                }
                
                .step-card:hover {
                transform: translateY(-4px);
                }
                
                .audience-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 16px 48px rgba(26, 43, 74, 0.1) !important;
                }
                
                .footer-link:hover {
                color: #D97746 !important;
                }
                
                .cta-primary:hover {
                transform: translateY(-2px) scale(1.02);
                }
                
                .cta-secondary:hover {
                background-color: rgba(255,255,255,0.1) !important;
                border-color: rgba(255,255,255,0.5) !important;
                }
                
                .help-btn:hover {
                transform: scale(1.1);
                }
            `}</style>

            <nav style={{
                ...styles.nav,
                boxShadow: scrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
            }}>
                <div style={styles.navContent}>
                    <div style={styles.logo}>
                        <div style= {styles.logoIcon}>🪘</div>
                        <span style={styles.logoText}>Djembe</span>
                    </div>
                    <div style={styles.navLinks}>
                        <a href="#teachers" className="nav-link" style={styles.navLink}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>
                            For Teachers
                            </a>
                            <button style={styles.loginButton} onClick={() => navigate('/login')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '8px'}}>
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            Login
                            </button>
                        </div>
                        </div>
                    </nav>

            <section style={styles.hero}>
            <div style={styles.heroContent}>
                <div style = {{...styles.badge, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease-in-out'}}>
                    <span style={styles.badgeIcon}>✨</span>
                    No installation required — Start creating music instantly!
                </div>

                <h1 style={{...styles.heroTitle, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.5s ease-in-out'}}>
                    Create. Collaborate. <span style={styles.highlight}>Inspire.</span>
                </h1>

                <p style={{...styles.heroSubtitle, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.5s ease-in-out 0.1s'}}>
                    Djembe is the ultimate online music creation platform designed for educators and students. Unleash your creativity through African instruments in this magical world with our intuitive tools and collaborative features.
                </p>
                
                <div style={{...styles.heroButtons, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.5s ease-in-out 0.2s'}}>

                    <button className= "primary_btn" style={styles.primaryButton} onClick={() => navigate('/signup')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Get Started
                    </button>
                </div>

                <div style= {{
                    ...styles.tags, opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.5s ease-in-out 0.3s'
                }}>
                    <span style={styles.tag}>
                        <span style= {{...styles.tagDot, backgroundColor: '#4A9B9B'}}></span>
                        Ages 8-12
                        </span>
                        <span style={styles.tag}>
                        <span style= {{...styles.tagDot, backgroundColor: '#D97746'}}></span>
                        Ghanaian Rhythms 
                        </span>
                        <span style={styles.tag}>
                        <span style= {{...styles.tagDot, backgroundColor: '#E6B84D'}}></span>
                        AI-assisted Composition
                        </span>
                        </div>
                </div>

            <div style={{
                ...styles.circleOrange,
                animation: 'pulse 4s ease-in-out infinite',
                }}></div>
                <div style={{
                ...styles.circleGreen,
                animation: 'pulse 5s ease-in-out infinite 0.5s',
                }}></div>
            </section>

            <section style = {styles.imageSection}>
                <div style={styles.imageContainer}>
                    <div style ={styles.imagePlaceholder}>
                        <div style = {styles.imageContent}>
                            <span style = {{fontSize: '80px', marginBottom: '20px'}}>🪘</span>
                            <span style= {{fontSize: '24px', color: '#1A2B4A', fontWeight: '600'}}>Interactive 3d Experience</span>
                            <span style= {{fontSize: '16px', color: '#4A4A4A', marginTop: '10px'}}>Dive into an immersive environment where you can create, learn, and collaborate with others.</span>
                        </div>
                    </div>
                <div style = {styles.imageOverlay}>
                    <div style = {styles.overlayIcon}>▶</div>
                    <div>
                        <div style= {styles.overlayTitle}>Interactive 3D Experience</div>
                        <div style= {styles.overlaySubtitle}>Click to embark on your musical journey</div>
                    </div>
                    </div>
                </div>
            </section>
                
            <section style= {styles.howItWorksSection}>
                <h2 style={styles.sectionTitle}>How It Works</h2>
                <p style = {styles.sectionSubtitle}>For simple steps to musical discovery</p>

                <div style= {styles.stepGrid}>
                    {[
                    { num: '01', icon: '✨', iconBg: '#FADCD9', title: 'Enter a musical world', desc: 'Step into a vibrant 3D space filled with African instruments' },
                    { num: '02', icon: '🪘', iconBg: '#D1FAE5', title: 'Tap and play instruments', desc: 'Touch, click, and explore djembes, shekeres, and more' },
                    { num: '03', icon: '🪄', iconBg: '#FEF3C7', title: 'Create music with AI', desc: 'Let AI help you build rhythmic loops and patterns' },
                    { num: '04', icon: '🎵', iconBg: '#E0E7FF', title: 'Learn rhythm through play', desc: 'Discover Ghanaian music traditions while having fun' },
                ].map((step, i) => (
                    <div key={i} className="step-card" style={styles.stepCard}>
                    <span style={styles.stepNumber}>{step.num}</span>
                    <div style={{...styles.stepIcon, backgroundColor: step.iconBg}}>
                        <span style={{fontSize: '28px'}}>{step.icon}</span>
                    </div>
                    <h3 style={styles.stepTitle}>{step.title}</h3>
                    <p style={styles.stepDescription}>{step.desc}</p>
                    </div>
                ))}
                </div>
            </section>

            <section style= {styles.whyDjembeSection}>
                <h2 style={styles.sectionTitle}>Why Djembe?</h2>
                <p style = {styles.sectionSubtitle}>Empowering music education through innovation</p>

                <div style= {styles.featureGrid}>
                    {[
                        { icon: '📦', gradient: 'linear-gradient(135deg, #E6B84D 0%, #4A9B9B 100%)', title: '3D Interactive Learning', desc: 'Experience music in a fully immersive 3D environment that brings instruments to life' },
                        { icon: '🌍', gradient: 'linear-gradient(135deg, #E6B84D 0%, #D97746 100%)', title: 'African/Ghanaian Instruments', desc: 'Connect with authentic cultural sounds through djembes, shekeres, and traditional rhythms' },
                        { icon: '✨', gradient: 'linear-gradient(135deg, #4A9B9B 0%, #1A2B4A 100%)', title: 'AI-Assisted Creativity', desc: 'Smart tools help children compose and explore musical patterns with confidence' },
                        { icon: '⚡', gradient: 'linear-gradient(135deg, #1A2B4A 0%, #4A9B9B 100%)', title: 'Browser-Based Access', desc: 'No downloads or setup required. Just open your browser and start playing instantly' },
                    ].map((feature, i) => (
                        <div key={i} className="feature-card" style={styles.featureCard}>
                        <div style={{...styles.featureIcon, background: feature.gradient}}>
                            <span style={{fontSize: '24px'}}>{feature.icon}</span>
                        </div>
                        <h3 style={styles.featureTitle}>{feature.title}</h3>
                        <p style={styles.featureDescription}>{feature.desc}</p>
                        </div>
                    ))}

                    <div className= "feature-card" style={styles.featureCard}>
                        <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)'}}>
                            <span style={{fontSize: '24px'}}>🎓</span>
                        </div>
                        <h3 style={styles.featureTitle}>Educator-Focused Tools</h3>
                        <p style={styles.featureDescription}>Built-in features for teachers to track progress, assign activities, and foster collaboration</p>
                    </div>
                </div>
            </section>

            <section style= {styles.whoItsForSection} id="teachers">
                <h2 style={styles.sectionTitle}>Who Is Djembe For?</h2>
                <p style = {styles.sectionSubtitle}>Designed with educators and students in mind</p>

                <div style= {styles.audienceGrid}>
                    {[
                        { emoji: '🎨', smallIcon: '❤️', smallBg: '#FADCD9', title: 'Kids', desc: 'Learn rhythm and creativity through immersive play experiences' },
                        { emoji: '👩‍🏫', smallIcon: '📖', smallBg: '#D1FAE5', title: 'Teachers', desc: 'Engage students with interactive, curriculum-aligned music lessons' },
                        { emoji: '🏫', smallIcon: '🏛️', smallBg: '#FEF3C7', title: 'Schools', desc: 'Accessible, scalable music education for entire classrooms' },
                    ].map((audience, i) => (
                        <div key={i} className="audience-card" style={styles.audienceCard}>
                        <div style={styles.audienceIcons}>
                            <span style={styles.audienceEmoji}>{audience.emoji}</span>
                            <div style={{...styles.audienceIconSmall, backgroundColor: audience.smallBg}}>
                            {audience.smallIcon}
                            </div>
                        </div>
                        <h3 style={styles.audienceTitle}>{audience.title}</h3>
                        <p style={styles.audienceDescription}>{audience.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section style = {styles.infoBanner}>
                <div style = {styles.infoPill}>
                    <span style={{...styles.infoPillIcon, backgroundColor: '#D97746'}}>8+</span>
                    <span style={{...styles.infoPillIcon, backgroundColor: '#4A9B9B'}}>✓</span>
                    <span style={{...styles.infoPillIcon, backgroundColor: '#4A9B9B'}}>🌍</span>
                    <span style={styles.infoPillText}>Perfect for ages 8-12 • Ghana-focused • Classroom-ready</span>
                </div>
            </section>

            <section style= {styles.ctaSection}>
                <div style={styles.ctaCircleLeft}></div>
                <div style={styles.ctaCircleRight}></div>
                <div style={styles.ctaCircleBottom}></div>

                <h2 style={styles.ctaTitle}>Ready to discover the <span style={styles.ctaHighlight}>rhythm</span> within?</h2>
                <p style={styles.ctaSubtitle}>Start playing today. No downloads, no setup—just open your browser and let the music begin.</p>

                <div style={styles.ctaButtons}>
                    <button className="cta-primary" style={styles.ctaPrimaryButton} onClick={() => navigate('/signup')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '12px'}}>
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Start Playing Now
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft: '12px'}}>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </button>
                    <button className="cta-secondary" style={styles.ctaSecondaryButton} onClick={() => navigate('/login')}>Login</button>
                </div>
            </section>

            <div style = {styles.emojiBar}>
                <span style={{...styles.footerEmoji, animation: 'float 3s ease-in-out infinite'}}>🪘</span>
                <span style={{...styles.footerEmoji, animation: 'float 4s ease-in-out infinite 0.5s'}}>🎵</span>
                <span style={{...styles.footerEmoji, animation: 'float 3.5s ease-in-out infinite 0.4s'}}>✨</span>
                <span style={{...styles.footerEmoji, animation: 'float 4.5s ease-in-out infinite 0.7s'}}>🎶</span>
                <span style={{...styles.footerEmoji, animation: 'float 3s ease-in-out infinite 0.4s'}}>🎨</span>
            </div>

            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerBrand}>
                        <div style={styles.footerLogo}>
                            <div style= {styles.logoIcon}>🪘</div>
                            <span style={styles.logoText}>Djembe</span>
                        </div>
                        <p style={styles.footerDesc}>Bringing the joy of African music education to life through immersive technology.</p>
                        <p style= {styles.madeWith}>Made with <span style={{color: '#D97746'}}>❤️</span> in Ghana</p>
                        </div>

                    <div style={styles.footerLinks}>
                        <div style={styles.footerColumn}>
                            <h4 style={styles.footerColumnTitle}>Product</h4>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>How it Works</a>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>Features</a>
                        </div>

                        <div style={styles.footerColumn}>
                            <h4 style={styles.footerColumnTitle}>Resources</h4>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>Teachers</a>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>Schools</a>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>Support</a>
                            <a href="#teachers" className="footer-link" style={styles.footerLink}>Contact Us</a>
                        </div>
                    </div>
                </div>

                <div style={styles.footerBottom}>
                    &copy; 2024 Djembe. All rights reserved.
                    <div style={styles.legalLinks}>
                        <a href="#" className="footer-link" style={styles.footerLink}>Privacy Policy</a>
                        <a href="#" className="footer-link" style={styles.footerLink}>Terms of Service</a>
                    </div>
                </div>
            </footer>

            <button className="help-btn" style={styles.helpButton} title="Get Help">
                ?
            </button>
        </div>
    );
};

const styles = {
  Landing_page: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#F5F1E8',
    color: '#1A2B4A',
    minHeight: '100vh',
    overflowX: 'hidden',
  },
  
  // Navigation
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid rgba(26, 43, 74, 0.08)',
    padding: '12px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'box-shadow 0.3s ease',
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#1A2B4A',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A2B4A',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  navLink: {
    color: '#1A2B4A',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    transition: 'color 0.2s ease',
  },
  loginButton: {
    backgroundColor: '#1A2B4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },

  // Hero Section
  hero: {
    position: 'relative',
    padding: '140px 32px 80px',
    maxWidth: '1280px',
    margin: '0 auto',
    overflow: 'visible',
  },
  heroContent: {
    maxWidth: '720px',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(26, 43, 74, 0.1)',
    borderRadius: '50px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(26, 43, 74, 0.06)',
  },
  badgeIcon: {
    color: '#D97746',
    fontSize: '16px',
  },
  heroTitle: {
    fontSize: 'clamp(42px, 6vw, 68px)',
    fontWeight: '700',
    lineHeight: '1.08',
    marginBottom: '24px',
    letterSpacing: '-1.5px',
  },
  heroHighlight: {
    color: '#D97746',
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: '19px',
    lineHeight: '1.65',
    color: '#5A6B7D',
    marginBottom: '40px',
    maxWidth: '600px',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '48px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#1A2B4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50px',
    padding: '18px 32px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 0 #0d1829',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#1A2B4A',
    border: '2px solid rgba(26, 43, 74, 0.2)',
    borderRadius: '50px',
    padding: '16px 32px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tags: {
    display: 'flex',
    gap: '28px',
    flexWrap: 'wrap',
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#5A6B7D',
    fontWeight: '500',
  },
  tagDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  circleOrange: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(217, 119, 70, 0.25) 0%, rgba(217, 119, 70, 0) 70%)',
    right: '15%',
    top: '15%',
    zIndex: 0,
  },
  circleGreen: {
    position: 'absolute',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74, 155, 155, 0.2) 0%, rgba(74, 155, 155, 0) 70%)',
    right: '5%',
    bottom: '20%',
    zIndex: 0,
  },

  // Image Section
  imageSection: {
    padding: '0 32px 80px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(26, 43, 74, 0.12)',
  },
  imagePlaceholder: {
    width: '100%',
    height: '480px',
    background: 'linear-gradient(135deg, #E8E4DB 0%, #D4CFC4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  overlayIcon: {
    width: '52px',
    height: '52px',
    backgroundColor: '#F5F1E8',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
  },
  overlayTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A2B4A',
  },
  overlaySubtitle: {
    fontSize: '14px',
    color: '#5A6B7D',
    marginTop: '2px',
  },

  // How It Works
  howItWorks: {
    padding: '100px 32px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '44px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '16px',
    color: '#1A2B4A',
    letterSpacing: '-1px',
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: '#5A6B7D',
    textAlign: 'center',
    marginBottom: '64px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  stepCard: {
    backgroundColor: '#F0EDE4',
    borderRadius: '24px',
    padding: '40px 28px',
    position: 'relative',
    transition: 'transform 0.3s ease',
  },
  stepNumber: {
    fontSize: '72px',
    fontWeight: '800',
    color: 'rgba(26, 43, 74, 0.06)',
    position: 'absolute',
    top: '16px',
    left: '28px',
    lineHeight: '1',
  },
  stepIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    marginTop: '32px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1A2B4A',
  },
  stepDescription: {
    fontSize: '15px',
    color: '#5A6B7D',
    lineHeight: '1.6',
  },

  // Why Djembe
  whyDjembe: {
    padding: '100px 32px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(26, 43, 74, 0.04)',
    transition: 'all 0.3s ease',
  },
  featureCardWide: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(26, 43, 74, 0.04)',
    gridColumn: 'span 2',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    color: '#FFFFFF',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1A2B4A',
  },
  featureDescription: {
    fontSize: '15px',
    color: '#5A6B7D',
    lineHeight: '1.6',
  },

  // Who It's For
  whoItsFor: {
    padding: '100px 32px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  audienceCard: {
    backgroundColor: '#F0EDE4',
    borderRadius: '24px',
    padding: '48px 32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  audienceIcons: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  audienceEmoji: {
    fontSize: '64px',
  },
  audienceIconSmall: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  audienceTitle: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1A2B4A',
  },
  audienceDescription: {
    fontSize: '15px',
    color: '#5A6B7D',
    lineHeight: '1.6',
  },

  // Info Banner
  infoBanner: {
    padding: '48px 32px',
    display: 'flex',
    justifyContent: 'center',
  },
  infoPill: {
    backgroundColor: '#1A2B4A',
    borderRadius: '60px',
    padding: '18px 36px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  infoPillIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoPillText: {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '500',
    marginLeft: '8px',
  },

  // CTA Section
  cta: {
    backgroundColor: '#1A2B4A',
    padding: '120px 32px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaCircleLeft: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74, 155, 155, 0.15) 0%, transparent 70%)',
    left: '-150px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  ctaCircleRight: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(217, 119, 70, 0.12) 0%, transparent 70%)',
    right: '-100px',
    top: '-50px',
  },
  ctaCircleBottom: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74, 155, 155, 0.1) 0%, transparent 70%)',
    right: '20%',
    bottom: '-100px',
  },
  ctaTitle: {
    fontSize: 'clamp(32px, 5vw, 52px)',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '24px',
    letterSpacing: '-1px',
    position: 'relative',
    zIndex: 1,
  },
  ctaHighlight: {
    color: '#D97746',
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '48px',
    maxWidth: '560px',
    margin: '0 auto 48px',
    position: 'relative',
    zIndex: 1,
    lineHeight: '1.6',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1,
  },
  ctaPrimaryButton: {
    backgroundColor: '#FFFFFF',
    color: '#1A2B4A',
    border: 'none',
    borderRadius: '50px',
    padding: '18px 36px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  ctaSecondaryButton: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    border: '2px solid rgba(255,255,255,0.25)',
    borderRadius: '50px',
    padding: '16px 40px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Emoji Bar
  emojiBar: {
    backgroundColor: '#1A2B4A',
    padding: '48px 32px',
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
  },
  footerEmoji: {
    fontSize: '36px',
  },

  // Footer
  footer: {
    backgroundColor: '#F5F1E8',
    padding: '72px 32px 32px',
  },
  footerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '80px',
    marginBottom: '56px',
  },
  footerBrand: {
    maxWidth: '420px',
  },
  footerDescription: {
    fontSize: '15px',
    color: '#5A6B7D',
    lineHeight: '1.7',
    margin: '24px 0',
  },
  madeWith: {
    fontSize: '14px',
    color: '#5A6B7D',
  },
  footerLinks: {
    display: 'flex',
    gap: '100px',
    justifyContent: 'flex-end',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  footerColumnTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1A2B4A',
    marginBottom: '8px',
  },
  footerLink: {
    fontSize: '15px',
    color: '#5A6B7D',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    maxWidth: '1280px',
    margin: '0 auto',
    paddingTop: '24px',
    borderTop: '1px solid rgba(26, 43, 74, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  copyright: {
    fontSize: '14px',
    color: '#5A6B7D',
  },
  legalLinks: {
    display: 'flex',
    gap: '36px',
  },
  legalLink: {
    fontSize: '14px',
    color: '#5A6B7D',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },

  // Help Button
  helpButton: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#1A2B4A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '22px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(26, 43, 74, 0.35)',
    zIndex: 1000,
    transition: 'transform 0.2s ease',
  },
};

export default Landing_page;
