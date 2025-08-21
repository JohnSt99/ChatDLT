'use client';
import React from 'react';
import { Card } from '../lib/diloti';

const suitSymbols: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const rankSymbols: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export default function CardView({
  card,
  onClick,
  selected,
}: {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
}) {
  const label = rankSymbols[card.rank] || card.rank.toString();
  return (
    <div
      onClick={onClick}
      className={`w-12 h-16 border rounded flex items-center justify-center bg-white text-black m-1 ${
        selected ? 'ring-4 ring-yellow-400' : ''
      }`}
    >
      {label}
      {suitSymbols[card.suit]}
    </div>
  );
}
