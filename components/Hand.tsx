'use client';
import CardView from './Card';
import { Card } from '../lib/diloti';

export default function Hand({
  hand,
  onSelect,
  selected,
}: {
  hand: Card[];
  onSelect: (i: number) => void;
  selected?: number;
}) {
  return (
    <div className="flex">
      {hand.map((c, i) => (
        <CardView
          key={i}
          card={c}
          selected={selected === i}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
