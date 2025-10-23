"use client";

import VantaBackground from "@/components/vanta-background";
import NavbarNew from "@/components/navbar-new";
import WhySyntance from "@/components/sections/why-syntance";
import GradientText from "@/components/GradientText";
import ManifestText from "@/components/ManifestText";
import { Wind, Globe, Twitter, Linkedin, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy load ciężkich komponentów z wyłączonym SSR
const InteractiveFluidBox = dynamic(() => import("@/components/interactive-fluid-box"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full border border-gray-800 rounded-2xl flex items-center justify-center bg-black/20">
      <p className="text-gray-400">Ładowanie animacji...</p>
    </div>
  ),
});

const TiltCard = dynamic(() => import("@/components/tilt-card"), {
  ssr: false,
  loading: () => <div className="opacity-50" />,
});

export default function Page() {
  const [showFirstText, setShowFirstText] = useState(false);
  const [showSecondText, setShowSecondText] = useState(false);
  const [showThirdText, setShowThirdText] = useState(false);
  const manifestRef = useRef<HTMLElement>(null);
  const hasTriggeredAnimation = useRef(false);
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    hp: '' // honeypot field
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMessage('');

    // Client-side validation
    if (formData.name.length < 2) {
      setFormStatus('error');
      setErrorMessage('Imię i nazwisko musi mieć co najmniej 2 znaki.');
      return;
    }

    if (formData.message.length < 10) {
      setFormStatus('error');
      setErrorMessage('Wiadomość musi mieć co najmniej 10 znaków.');
      return;
    }

    if (formData.message.length > 2000) {
      setFormStatus('error');
      setErrorMessage('Wiadomość może mieć maksymalnie 2000 znaków.');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', message: '', hp: '' });
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
        if (response.status === 429) {
          setErrorMessage('Zbyt wiele prób. Spróbuj ponownie za chwilę.');
        } else {
          setErrorMessage(data.error || 'Wystąpił błąd podczas wysyłania wiadomości.');
        }
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage('Wystąpił błąd podczas wysyłania wiadomości. Sprawdź połączenie internetowe.');
    }
  };

  useEffect(() => {
    if (!manifestRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredAnimation.current) {
            hasTriggeredAnimation.current = true;
            setShowFirstText(true);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '50px' // Załaduj animację wcześniej dla lepszego UX
      }
    );

    observer.observe(manifestRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleFirstComplete = () => {
    setTimeout(() => setShowSecondText(true), 200);
  };

  const handleSecondComplete = () => {
    setTimeout(() => setShowThirdText(true), 200);
  };

  const handleThirdComplete = () => {
    // Animacja zakończona - nic specjalnego nie robimy
  };

  return (
    <div className="min-h-screen">
      <VantaBackground />

      <NavbarNew />

      {/* Hero Section */}
      <section id="hero" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text">
            Technologia która{" "}
            <GradientText
              colors={["#a855f7", "#c4b5fd", "#3b82f6", "#c4b5fd", "#a855f7"]}
              animationSpeed={4}
              className="font-medium"
            >
              zachwyca
            </GradientText>
            ,<br />
            nie przytłacza.
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider text-gray-300 mb-12">
            Piękno. Inteligencja. Płynność.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                const element = document.getElementById('manifest');
                if (element) {
                  const navbarHeight = 100;
                  const elementRect = element.getBoundingClientRect();
                  const elementTop = elementRect.top + window.scrollY;
                  const viewportHeight = window.innerHeight;
                  const elementHeight = elementRect.height;
                  const offset = (viewportHeight - elementHeight) / 2;
                  const scrollToPosition = elementTop - Math.max(offset, navbarHeight);
                  
                  window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                  });
                }
              }}
              className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box cursor-pointer"
            >
              Rozpocznij
            </button>
            
            <Link 
              href="/studio"
              className="group relative px-8 py-3 rounded-full font-medium tracking-wider transition-all cursor-pointer overflow-hidden"
            >
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-[2px] rounded-full bg-black/80 backdrop-blur-sm"></div>
              
              {/* Text */}
              <span className="relative text-white group-hover:text-purple-100 transition-colors">
                Studio
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Manifest Section */}
      <section 
        ref={manifestRef as any}
        id="manifest" 
        className="relative z-10 px-6 lg:px-12 min-h-screen flex items-center justify-center"
      >
        <div className="w-full">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="min-h-[4rem]">
              {showFirstText && (
                <ManifestText
                  text="Tworzymy technologię, która inspiruje i uspokaja."
                  gradientWords={["technologię"]}
                  typingSpeed={35}
                  onComplete={handleFirstComplete}
                  className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text"
                />
              )}
            </div>
            <div className="min-h-[4rem]">
              {showSecondText && (
                <ManifestText
                  text="Działamy w tle, zapewniając czyste i piękne doświadczenia."
                  gradientWords={["doświadczenia"]}
                  typingSpeed={35}
                  onComplete={handleSecondComplete}
                  className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text"
                />
              )}
            </div>
            <div className="min-h-[4rem]">
              {showThirdText && (
                <ManifestText
                  text="Innowacyjność, która nie krzyczy."
                  gradientWords={["Innowacyjność"]}
                  typingSpeed={35}
                  onComplete={handleThirdComplete}
                  className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section - Interactive Light */}
      <section className="relative z-10 pt-96 pb-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block mb-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 blur-2xl opacity-30 animate-pulse"></div>
            <h2 className="relative text-3xl md:text-5xl font-light tracking-widest glow-text">
              Zobacz spokój w akcji
            </h2>
          </div>
          <p className="text-lg font-light tracking-wide text-gray-300 max-w-2xl mx-auto mb-12">
            Porusz myszką, i poczuj Flow
          </p>
          <InteractiveFluidBox />
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="relative z-10 pt-64 pb-32 px-6 lg:px-12 overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-light tracking-wider text-center mb-16 glow-text">
          Nasze Systemy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Product 1 */}
          <TiltCard>
            <div className="product-card rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mb-6">
                <Wind className="text-blue-300" size={32} />
              </div>
              <h3 className="text-xl font-medium tracking-wider mb-3">OZE Asystent</h3>
              <p className="text-gray-300 font-light tracking-wide mb-6">
                Inteligentny system do automatyzacji i optymalizacji procesów w branży OZE.
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6"></div>
              <button className="text-sm font-medium tracking-wider text-blue-300 hover:text-blue-200 transition-colors">
                Odkryj więcej →
              </button>
            </div>
          </TiltCard>

          {/* Product 2 */}
          <TiltCard>
            <Link href="/studio" className="block product-card rounded-xl p-8 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-teal-500 bg-opacity-20 flex items-center justify-center mb-6">
                <Globe className="text-teal-300" size={32} />
              </div>
              <h3 className="text-xl font-medium tracking-wider mb-3">Syntance Studio</h3>
              <p className="text-gray-300 font-light tracking-wide mb-6">
                Projektujemy strony i sklepy, które zachwycają harmonią, lekkością i emocją.
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6"></div>
              <span className="text-sm font-medium tracking-wider text-teal-300 hover:text-teal-200 transition-colors">
                Odkryj więcej →
              </span>
            </Link>
          </TiltCard>
        </div>
      </section>

      {/* Why Syntance Section */}
      <WhySyntance />

      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-8 text-center glow-text">
            Porozmawiajmy
          </h2>
          <p className="text-xl text-gray-300 font-light tracking-wide text-center mb-16">
            Gotowi do stworzenia czegoś wyjątkowego?
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Email</h3>
                <a href="mailto:kontakt@syntance.com" className="text-gray-300 hover:text-white transition-colors text-lg">
                  kontakt@syntance.com
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Telefon</h3>
                <a href="tel:+48662519544" className="text-gray-300 hover:text-white transition-colors text-lg">
                  +48 662 519 544
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Social Media</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X - Śledź nas na Twitter">
                    <Twitter size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn - Połącz się z nami na LinkedIn">
                    <Linkedin size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub - Zobacz nasze projekty na GitHub">
                    <Github size={24} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="hp"
                  value={formData.hp}
                  onChange={handleFormChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Imię i nazwisko"
                    required
                    disabled={formStatus === 'loading'}
                    className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Email"
                    required
                    disabled={formStatus === 'loading'}
                    className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Wiadomość (min. 10 znaków)"
                    rows={5}
                    required
                    disabled={formStatus === 'loading'}
                    className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none disabled:opacity-50"
                  ></textarea>
                  <div className="text-sm text-gray-500 mt-1 text-right">
                    {formData.message.length} / 2000 znaków
                    {formData.message.length > 0 && formData.message.length < 10 && (
                      <span className="text-red-400 ml-2">(min. 10)</span>
                    )}
                  </div>
                </div>
                
                {formStatus === 'success' && (
                  <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-300 text-center">
                    Wiadomość została wysłana pomyślnie! 🎉
                  </div>
                )}
                
                {formStatus === 'error' && (
                  <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-center">
                    {errorMessage || 'Wystąpił błąd podczas wysyłania wiadomości.'}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full px-8 py-4 bg-white text-gray-900 rounded-lg font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-medium tracking-widest glow-text mb-6 md:mb-0">
              Syntance
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-500">
              © Syntance Technologies — Inteligentne rozwiązania dla nowoczesnych marek.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
