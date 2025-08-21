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
  variant = 'table',
  disabled,
}: {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  variant?: 'table' | 'hand';
  disabled?: boolean;
}) {
  const label = rankSymbols[card.rank] || card.rank.toString();
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const base =
    'w-12 h-16 border rounded flex flex-col items-center justify-center m-1';
  const variantClass =
    variant === 'hand' ? 'bg-white shadow-md' : 'bg-gray-100';
  const colorClass = isRed ? 'text-red-600' : 'text-black';
  const interactivity = disabled
    ? 'opacity-50 pointer-events-none'
    : 'cursor-pointer';
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`${base} ${variantClass} ${colorClass} ${
        selected ? 'ring-4 ring-yellow-400' : ''
      } ${interactivity}`}
    >
      <span>{label}</span>
      <span>{suitSymbols[card.suit]}</span>
    </div>
  );
}
