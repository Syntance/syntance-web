'use client';

import { useState, useEffect } from 'react';
import GradientText from './GradientText';

interface ManifestTextProps {
  text: string;
  gradientWords: string[];
  typingSpeed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function ManifestText({
  text,
  gradientWords,
  typingSpeed = 35,
  onComplete,
  className = ''
}: ManifestTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      const timeout = setTimeout(onComplete, 200);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed, onComplete]);

  // Funkcja do renderowania tekstu z gradientem
  const renderTextWithGradient = () => {
    if (!displayedText) return null;

    const processedText = displayedText;
    
    // Sprawdź każde słowo z gradientem
    for (const word of gradientWords) {
      const wordLower = word.toLowerCase();
      const textLower = processedText.toLowerCase();
      const wordIndex = textLower.indexOf(wordLower);
      
      if (wordIndex !== -1) {
        // Znaleziono pełne słowo
        const beforeMatch = processedText.substring(0, wordIndex);
        const matchedWord = processedText.substring(wordIndex, wordIndex + word.length);
        const afterMatch = processedText.substring(wordIndex + word.length);
        
        return (
          <>
            {beforeMatch && <span>{beforeMatch}</span>}
            <GradientText
              colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
              animationSpeed={4}
            >
              {matchedWord}
            </GradientText>
            {afterMatch && <span>{afterMatch}</span>}
          </>
        );
      }
      
      // Sprawdź częściowe dopasowanie (min. 2 znaki)
      for (let len = Math.max(2, word.length); len >= 2; len--) {
        const partialWord = wordLower.substring(0, len);
        const partialIndex = textLower.lastIndexOf(partialWord);
        
        // Sprawdź czy częściowe słowo jest na końcu tekstu
        if (partialIndex !== -1 && partialIndex + len === processedText.length) {
          const beforeMatch = processedText.substring(0, partialIndex);
          const matchedPart = processedText.substring(partialIndex);
          
          return (
            <>
              {beforeMatch && <span>{beforeMatch}</span>}
              <GradientText
                colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
                animationSpeed={4}
              >
                {matchedPart}
              </GradientText>
            </>
          );
        }
      }
    }
    
    // Jeśli nie znaleziono dopasowania, zwróć zwykły tekst
    return <span>{displayedText}</span>;
  };

  return (
    <p className={className}>
      {renderTextWithGradient()}
    </p>
  );
}

