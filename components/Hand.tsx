'use client';
import CardView from './Card';
import { Card } from '../lib/diloti';

export default function Hand({
  hand,
  onSelect,
  selected,
  disabled,
}: {
  hand: Card[];
  onSelect: (i: number) => void;
  selected?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto">
      {hand.map((c, i) => (
        <CardView
          key={i}
          card={c}
          selected={selected === i}
          onClick={() => onSelect(i)}
          variant="hand"
          disabled={disabled}
        />
      ))}
    </div>
  );
}
