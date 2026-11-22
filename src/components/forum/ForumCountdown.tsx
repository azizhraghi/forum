'use client';

import { useEffect, useState } from 'react';
import { forum } from '@/content/forum';

const dateFormatter = new Intl.DateTimeFormat('fr-TN', {
  timeZone: 'Africa/Tunis',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  numberingSystem: 'latn',
});

function daysUntilForum() {
  const parts = dateFormatter.formatToParts(new Date());
  const get = (name: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === name)?.value);
  const today = Date.UTC(get('year'), get('month') - 1, get('day'));
  return (Date.parse(forum.date) - today) / 86_400_000;
}

export function ForumCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setDays(daysUntilForum());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="ef-countdown">
      <span>{days !== null && days < 0 ? 'Édition' : 'Compte à rebours'}</span>
      <strong>
        {days === null || days < 0 ? '2026' : days === 0 ? 'Aujourd’hui' : `J−${days}`}
      </strong>
    </div>
  );
}
