import { useState, useEffect, useRef, useCallback } from 'react';

interface LongPressOptions {
  threshold?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

export const useLongPress = (
  callback: () => void,
  options: LongPressOptions = {}
) => {
  const { threshold = 500, onStart, onFinish, onCancel } = options;
  
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startPress = useCallback(() => {
    setIsPressed(true);
    if (onStart) onStart();
    
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsLongPress(true);
        callback();
      }
    }, threshold);
  }, [callback, threshold, onStart]);

  const endPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isPressed && !isLongPress) {
      if (onCancel) onCancel();
    } else if (isLongPress && onFinish) {
      onFinish();
    }

    setIsPressed(false);
    setIsLongPress(false);
  }, [isPressed, isLongPress, onCancel, onFinish]);

  const onMouseDown = useCallback(() => startPress(), [startPress]);
  const onMouseUp = useCallback(() => endPress(), [endPress]);
  const onMouseLeave = useCallback(() => endPress(), [endPress]);

  const onTouchStart = useCallback(() => startPress(), [startPress]);
  const onTouchEnd = useCallback(() => endPress(), [endPress]);
  const onTouchCancel = useCallback(() => endPress(), [endPress]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPressed(false);
    setIsLongPress(false);
  }, []);

  return {
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    isPressed,
    isLongPress,
    reset,
  };
};