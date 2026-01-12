"use client";

import { useState, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import NavbarStudio from "@/components/navbar-studio";
import { Twitter, Linkedin, Github } from "lucide-react";

// Import sections - bez lazy loadingu dla hero, żeby uniknąć flashowania kontaktu
import HeroStudio from "@/components/sections/hero-studio";
const AnatomyStudio = dynamic(() => import("@/components/sections/anatomy-studio"), { ssr: true });
const ValuesStudio = dynamic(() => import("@/components/sections/values-studio"), { ssr: true });
const TechComparison = dynamic(() => import("@/components/sections/tech-comparison"), { ssr: true });
const PortfolioStudio = dynamic(() => import("@/components/sections/portfolio-studio"), { ssr: true });
const ProcessStudio = dynamic(() => import("@/components/sections/process-studio"), { ssr: true });
const PricingStudioNew = dynamic(() => import("@/components/sections/pricing-studio-new"), { ssr: true });

export default function StudioPage() {
  // Stan do ukrycia strony na starcie - zapobiega flashowi kontaktu
  const [isPageReady, setIsPageReady] = useState(false);

  // Zablokuj przywracanie scrolla i ustaw start na górze przy pierwszym wejściu/odświeżeniu.
  // Używamy useLayoutEffect, żeby scroll wykonał się PRZED renderem wizualnym (synchronicznie).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    setIsPageReady(true);
  }, []);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    hp: '' // honeypot field
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check consent first
    if (!consentChecked) {
      setFormStatus('error');
      setErrorMessage('Musisz wyrazić zgodę na przetwarzanie danych osobowych.');
      return;
    }
    
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
        setConsentChecked(false);
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

  return (
    <div className={`min-h-screen transition-opacity duration-200 ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
      <NavbarStudio />
      
      <HeroStudio />
      <AnatomyStudio />
      <ValuesStudio />
      <TechComparison />
      <PortfolioStudio />
      <ProcessStudio />
      <PricingStudioNew />
      
      {/* Contact Section - Same as syntance.com */}
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
                
                <button
                  type="submit"
                  disabled={formStatus === 'loading' || !consentChecked}
                  className="w-full px-8 py-4 bg-white text-gray-900 rounded-lg font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
                
                {/* Checkbox zgody */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-studio"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-700 bg-white bg-opacity-5 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                    required
                  />
                  <label htmlFor="consent-studio" className="text-sm text-gray-300 leading-relaxed">
                    Oświadczam, że zapoznałem się z <a href="/polityka-prywatnosci" className="text-gray-400 hover:text-gray-300 underline">Polityką Prywatności</a> i wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu zwrotnego przez Syntance P.S.A.
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                </div>
                
                {/* Klauzula informacyjna RODO */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    Administratorem Twoich danych osobowych jest <strong>Syntance P.S.A.</strong>, z siedzibą w Czerniec 72, 33-390 Łącko, e-mail:{" "}
                    <a href="mailto:biuro@syntance.com" className="text-gray-400 hover:text-gray-300 underline">
                      biuro@syntance.com
                    </a>
                    .
                  </p>
                  <p>
                    Dane podane w formularzu będą przetwarzane wyłącznie w celu udzielenia odpowiedzi na Twoje zapytanie lub przedstawienia oferty, na podstawie art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora).
                  </p>
                  <p>
                    Twoje dane nie będą udostępniane innym podmiotom, z wyjątkiem podmiotów świadczących usługi hostingowe i techniczne na rzecz administratora.
                  </p>
                  <p>
                    Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wniesienia sprzeciwu.
                  </p>
                  <p>
                    Więcej informacji znajdziesz w <a href="/polityka-prywatnosci" className="text-gray-400 hover:text-gray-300 underline font-medium">Polityce Prywatności</a> na naszej stronie.
                  </p>
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
              </form>
            </div>
          </div>
          
          {/* Brand connection */}
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400 font-light tracking-wide mb-4">
              Syntance Studio jest częścią marki Syntance — technologii, która zachwyca, nie przytłacza.
            </p>
            <a href="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors font-medium">
              Poznaj Syntance →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <svg width="400" height="60" viewBox="180 100 1100 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Syntance Studio - AI-powered web development" role="img">
                <path d="M478.974 310.744C468.39 310.744 459.047 308.849 450.946 305.06C442.845 301.271 436.507 295.848 431.934 288.792C427.361 281.736 425.074 273.243 425.074 263.312V257.824H450.554V263.312C450.554 271.544 453.102 277.751 458.198 281.932C463.294 285.983 470.219 288.008 478.974 288.008C487.859 288.008 494.458 286.244 498.77 282.716C503.213 279.188 505.434 274.68 505.434 269.192C505.434 265.403 504.323 262.332 502.102 259.98C500.011 257.628 496.875 255.733 492.694 254.296C488.643 252.728 483.678 251.291 477.798 249.984L473.29 249.004C463.882 246.913 455.781 244.3 448.986 241.164C442.322 237.897 437.161 233.651 433.502 228.424C429.974 223.197 428.21 216.403 428.21 208.04C428.21 199.677 430.17 192.556 434.09 186.676C438.141 180.665 443.759 176.092 450.946 172.956C458.263 169.689 466.822 168.056 476.622 168.056C486.422 168.056 495.111 169.755 502.69 173.152C510.399 176.419 516.41 181.384 520.722 188.048C525.165 194.581 527.386 202.813 527.386 212.744V218.624H501.906V212.744C501.906 207.517 500.861 203.336 498.77 200.2C496.81 196.933 493.935 194.581 490.146 193.144C486.357 191.576 481.849 190.792 476.622 190.792C468.782 190.792 462.967 192.295 459.178 195.3C455.519 198.175 453.69 202.16 453.69 207.256C453.69 210.653 454.539 213.528 456.238 215.88C458.067 218.232 460.746 220.192 464.274 221.76C467.802 223.328 472.31 224.7 477.798 225.876L482.306 226.856C492.106 228.947 500.599 231.625 507.786 234.892C515.103 238.159 520.787 242.471 524.838 247.828C528.889 253.185 530.914 260.045 530.914 268.408C530.914 276.771 528.758 284.153 524.446 290.556C520.265 296.828 514.254 301.793 506.414 305.452C498.705 308.98 489.558 310.744 478.974 310.744ZM561.577 347.2V325.64H614.497C618.156 325.64 619.985 323.68 619.985 319.76V295.26H616.457C615.412 297.481 613.779 299.703 611.557 301.924C609.336 304.145 606.331 305.975 602.541 307.412C598.752 308.849 593.917 309.568 588.037 309.568C580.459 309.568 573.795 307.869 568.045 304.472C562.427 300.944 558.049 296.109 554.913 289.968C551.777 283.827 550.209 276.771 550.209 268.8V210.784H574.905V266.84C574.905 274.157 576.669 279.645 580.197 283.304C583.856 286.963 589.017 288.792 595.681 288.792C603.26 288.792 609.14 286.309 613.321 281.344C617.503 276.248 619.593 269.192 619.593 260.176V210.784H644.289V325.248C644.289 331.912 642.329 337.204 638.409 341.124C634.489 345.175 629.263 347.2 622.729 347.2H561.577ZM671.771 308V210.784H696.075V223.524H699.603C701.171 220.127 704.111 216.925 708.423 213.92C712.735 210.784 719.268 209.216 728.023 209.216C735.601 209.216 742.2 210.98 747.819 214.508C753.568 217.905 758.011 222.675 761.147 228.816C764.283 234.827 765.851 241.883 765.851 249.984V308H741.155V251.944C741.155 244.627 739.325 239.139 735.667 235.48C732.139 231.821 727.043 229.992 720.379 229.992C712.8 229.992 706.92 232.54 702.739 237.636C698.557 242.601 696.467 249.592 696.467 258.608V308H671.771ZM827.108 308C820.706 308 815.479 306.04 811.428 302.12C807.508 298.069 805.548 292.712 805.548 286.048V231.168H781.244V210.784H805.548V180.6H830.244V210.784H856.9V231.168H830.244V281.736C830.244 285.656 832.074 287.616 835.732 287.616H854.548V308H827.108ZM909.439 310.744C902.514 310.744 896.307 309.568 890.819 307.216C885.331 304.733 880.954 301.205 877.687 296.632C874.551 291.928 872.983 286.244 872.983 279.58C872.983 272.916 874.551 267.363 877.687 262.92C880.954 258.347 885.396 254.949 891.015 252.728C896.764 250.376 903.298 249.2 910.615 249.2H937.271V243.712C937.271 239.139 935.834 235.415 932.959 232.54C930.084 229.535 925.511 228.032 919.239 228.032C913.098 228.032 908.524 229.469 905.519 232.344C902.514 235.088 900.554 238.681 899.639 243.124L876.903 235.48C878.471 230.515 880.954 226.007 884.351 221.956C887.879 217.775 892.518 214.443 898.267 211.96C904.147 209.347 911.268 208.04 919.631 208.04C932.436 208.04 942.563 211.241 950.011 217.644C957.459 224.047 961.183 233.324 961.183 245.476V281.736C961.183 285.656 963.012 287.616 966.671 287.616H974.511V308H958.047C953.212 308 949.227 306.824 946.091 304.472C942.955 302.12 941.387 298.984 941.387 295.064V294.868H937.663C937.14 296.436 935.964 298.527 934.135 301.14C932.306 303.623 929.431 305.844 925.511 307.804C921.591 309.764 916.234 310.744 909.439 310.744ZM913.751 290.752C920.676 290.752 926.295 288.857 930.607 285.068C935.05 281.148 937.271 275.987 937.271 269.584V267.624H912.379C907.806 267.624 904.212 268.604 901.599 270.564C898.986 272.524 897.679 275.268 897.679 278.796C897.679 282.324 899.051 285.199 901.795 287.42C904.539 289.641 908.524 290.752 913.751 290.752ZM992.568 308V210.784H1016.87V223.524H1020.4C1021.97 220.127 1024.91 216.925 1029.22 213.92C1033.53 210.784 1040.06 209.216 1048.82 209.216C1056.4 209.216 1063 210.98 1068.62 214.508C1074.36 217.905 1078.81 222.675 1081.94 228.816C1085.08 234.827 1086.65 241.883 1086.65 249.984V308H1061.95V251.944C1061.95 244.627 1060.12 239.139 1056.46 235.48C1052.94 231.821 1047.84 229.992 1041.18 229.992C1033.6 229.992 1027.72 232.54 1023.54 237.636C1019.35 242.601 1017.26 249.592 1017.26 258.608V308H992.568ZM1159.01 310.744C1149.61 310.744 1141.05 308.784 1133.34 304.864C1125.76 300.944 1119.75 295.26 1115.31 287.812C1110.86 280.364 1108.64 271.348 1108.64 260.764V258.02C1108.64 247.436 1110.86 238.42 1115.31 230.972C1119.75 223.524 1125.76 217.84 1133.34 213.92C1141.05 210 1149.61 208.04 1159.01 208.04C1168.29 208.04 1176.26 209.673 1182.93 212.94C1189.59 216.207 1194.95 220.715 1199 226.464C1203.18 232.083 1205.92 238.485 1207.23 245.672L1183.32 250.768C1182.79 246.848 1181.62 243.32 1179.79 240.184C1177.96 237.048 1175.35 234.565 1171.95 232.736C1168.68 230.907 1164.57 229.992 1159.6 229.992C1154.64 229.992 1150.13 231.103 1146.08 233.324C1142.16 235.415 1139.02 238.616 1136.67 242.928C1134.45 247.109 1133.34 252.271 1133.34 258.412V260.372C1133.34 266.513 1134.45 271.74 1136.67 276.052C1139.02 280.233 1142.16 283.435 1146.08 285.656C1150.13 287.747 1154.64 288.792 1159.6 288.792C1167.05 288.792 1172.67 286.897 1176.46 283.108C1180.38 279.188 1182.86 274.092 1183.91 267.82L1207.82 273.504C1206.12 280.429 1203.18 286.767 1199 292.516C1194.95 298.135 1189.59 302.577 1182.93 305.844C1176.26 309.111 1168.29 310.744 1159.01 310.744ZM1272.48 310.744C1262.82 310.744 1254.26 308.719 1246.81 304.668C1239.49 300.487 1233.74 294.672 1229.56 287.224C1225.51 279.645 1223.48 270.76 1223.48 260.568V258.216C1223.48 248.024 1225.51 239.204 1229.56 231.756C1233.61 224.177 1239.3 218.363 1246.61 214.312C1253.93 210.131 1262.42 208.04 1272.09 208.04C1281.63 208.04 1289.93 210.196 1296.98 214.508C1304.04 218.689 1309.53 224.569 1313.45 232.148C1317.37 239.596 1319.33 248.285 1319.33 258.216V266.644H1248.57C1248.83 273.308 1251.32 278.731 1256.02 282.912C1260.72 287.093 1266.47 289.184 1273.27 289.184C1280.19 289.184 1285.29 287.681 1288.56 284.676C1291.82 281.671 1294.31 278.339 1296 274.68L1316.19 285.264C1314.36 288.661 1311.68 292.385 1308.16 296.436C1304.76 300.356 1300.19 303.753 1294.44 306.628C1288.69 309.372 1281.37 310.744 1272.48 310.744ZM1248.77 248.22H1294.24C1293.72 242.601 1291.43 238.093 1287.38 234.696C1283.46 231.299 1278.3 229.6 1271.9 229.6C1265.23 229.6 1259.94 231.299 1256.02 234.696C1252.1 238.093 1249.68 242.601 1248.77 248.22Z" fill="white"/>
                <path d="M271.453 120L306.596 120C308.378 120 309.27 122.154 308.011 123.414L176.525 255C176.525 255 171.529 260 176.525 265C181.521 270 186.517 265 186.517 265L271.453 180C271.453 180 316.418 135 356.388 175C396.358 215 351.642 260 351.642 260L271.453 339.999C251.468 360.405 221.491 359.999 221.491 359.999H186.347C184.566 359.999 183.673 357.846 184.932 356.586L316.418 225C316.418 225 321.415 220 316.418 215C311.422 210 306.426 215 306.426 215L221.491 300C221.491 300 176.525 344.999 136.555 305C96.5859 265 141.552 220 141.552 220L221.491 140C241.226 119.75 271.453 120 271.453 120Z" fill="white"/>
              </svg>
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
              © Syntance Studio — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

