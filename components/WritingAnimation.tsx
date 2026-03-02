// components/WritingAnimation.tsx
import { useEffect, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  text: string;
  style?: TextStyle;
  className?: string;
  charDelayMs?: number;
  onComplete?: () => void;
}

export function WritingAnimation({
  text,
  style,
  className,
  charDelayMs = 80,
  onComplete,
}: Props) {
  const [displayed, setDisplayed] = useState('');
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    mountedRef.current = true;
    setDisplayed('');
    let index = 0;

    const tick = () => {
      if (!mountedRef.current) return;
      if (index < text.length) {
        index += 1;
        setDisplayed(text.slice(0, index));
        timeoutRef.current = setTimeout(tick, charDelayMs);
      } else {
        onCompleteRef.current?.();
      }
    };

    timeoutRef.current = setTimeout(tick, charDelayMs);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, charDelayMs]);

  const isTyping = displayed.length < text.length;

  return (
    <Text style={style} className={className}>
      {displayed}
      {isTyping ? (
        <Text style={[style, { opacity: 0.4 }]}>{'|'}</Text>
      ) : null}
    </Text>
  );
}
