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
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sortuj słowa według długości (najdłuższe pierwsze) aby unikać konfliktów
    const sortedWords = [...gradientWords].sort((a, b) => b.length - a.length);

    sortedWords.forEach((word) => {
      const regex = new RegExp(`(${word})`, 'gi');
      const matches = Array.from(displayedText.matchAll(regex));

      matches.forEach((match) => {
        if (match.index !== undefined && match.index >= lastIndex) {
          // Dodaj tekst przed słowem
          if (match.index > lastIndex) {
            parts.push(displayedText.substring(lastIndex, match.index));
          }

          // Dodaj słowo z gradientem
          parts.push(
            <GradientText
              key={`gradient-${match.index}`}
              colors={["#a855f7", "#3b82f6", "#a855f7", "#3b82f6"]}
              animationSpeed={4}
              className="inline-block"
            >
              {match[0]}
            </GradientText>
          );

          lastIndex = match.index + match[0].length;
        }
      });
    });

    // Dodaj pozostały tekst
    if (lastIndex < displayedText.length) {
      parts.push(displayedText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : displayedText;
  };

  return (
    <p className={className}>
      {renderTextWithGradient()}
    </p>
  );
}

