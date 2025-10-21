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

    const parts: React.ReactNode[] = [];
    let processedText = displayedText;
    
    // Dla każdego słowa z gradientem
    gradientWords.forEach((word, wordIndex) => {
      const regex = new RegExp(`(${word})`, 'i');
      const match = processedText.match(regex);
      
      if (match && match.index !== undefined) {
        const beforeMatch = processedText.substring(0, match.index);
        const matchedWord = match[0];
        const afterMatch = processedText.substring(match.index + matchedWord.length);
        
        // Dodaj część przed dopasowaniem
        if (beforeMatch) {
          parts.push(<span key={`before-${wordIndex}`}>{beforeMatch}</span>);
        }
        
        // Dodaj słowo z gradientem
        parts.push(
          <GradientText
            key={`gradient-${wordIndex}`}
            colors={["#a855f7", "#c4b5fd", "#e0f2fe", "#3b82f6", "#c4b5fd", "#a855f7"]}
            animationSpeed={4}
          >
            {matchedWord}
          </GradientText>
        );
        
        // Kontynuuj z pozostałą częścią tekstu
        processedText = afterMatch;
      }
    });
    
    // Dodaj pozostały tekst
    if (processedText) {
      parts.push(<span key="remaining">{processedText}</span>);
    }

    return parts.length > 0 ? parts : displayedText;
  };

  return (
    <p className={className}>
      {renderTextWithGradient()}
    </p>
  );
}

