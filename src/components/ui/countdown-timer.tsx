'use client';

import { useState, useEffect } from 'react';
import { calculateTimeLeft } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: string;
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <span className="text-sm font-medium text-gray-500">마감됨</span>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      <span className="text-red-600 font-semibold">
        D-{timeLeft.days}
      </span>
      <span className="text-gray-700">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
