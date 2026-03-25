'use client'
import { useState, useEffect } from 'react';
import { Countdown } from '../components/Countdown';

interface CountdownClientProps {
  endDate: string;
  startDateText?: string;
}

export function CountdownClient({ endDate, startDateText }: CountdownClientProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const end = new Date(endDate).getTime();

    const tick = () => {
      const distance = end - Date.now();
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <Countdown
      startDateText={startDateText}
      days={timeLeft.days}
      hours={timeLeft.hours}
      minutes={timeLeft.minutes}
      seconds={timeLeft.seconds}
    />
  );
}
