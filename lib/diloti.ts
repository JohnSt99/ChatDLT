export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export interface Card {
  suit: Suit;
  rank: number; // 1-13 where 1=Ace
}

export function createDeck(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function deal(deck: Card[], count: number): Card[] {
  return deck.splice(0, count);
}

interface Combo<T> {
  items: T[];
  indices: number[];
}

function combinations<T>(arr: T[]): Combo<T>[] {
  const result: Combo<T>[] = [];
  const n = arr.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    const combo: T[] = [];
    const indices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        combo.push(arr[i]);
        indices.push(i);
      }
    }
    result.push({ items: combo, indices });
  }
  return result;
}

export interface LegalMove {
  cards: Card[];
  indices: number[];
}

export function legalCaptures(card: Card, table: Card[]): LegalMove[] {
  const result: LegalMove[] = [];
  for (const combo of combinations(table)) {
    const sameRank =
      combo.items.length === 1 && combo.items[0].rank === card.rank;
    const sum = combo.items.reduce((s, c) => s + c.rank, 0);
    if (sameRank || sum === card.rank) {
      result.push({ cards: combo.items, indices: combo.indices });
    }
  }
  return result;
}
