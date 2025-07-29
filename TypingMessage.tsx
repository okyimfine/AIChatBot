import { useState, useEffect } from 'react';

interface TypingMessageProps {
  content: string;
  onComplete?: () => void;
  speed?: number;
}

export function TypingMessage({ content, onComplete, speed = 50 }: TypingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, speed, onComplete]);

  return (
    <div className="message-content leading-relaxed text-sm">
      {displayedContent}
      {currentIndex < content.length && (
        <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-300 ml-1 animate-pulse" />
      )}
    </div>
  );
}