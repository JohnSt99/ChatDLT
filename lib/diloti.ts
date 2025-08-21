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
  groups: Card[][];
}

interface CardWithIndex {
  card: Card;
  index: number;
}

function partitionGroups(cards: CardWithIndex[], target: number): CardWithIndex[][][] {
  const result: CardWithIndex[][][] = [];
  const helper = (remaining: CardWithIndex[], current: CardWithIndex[][]) => {
    if (remaining.length === 0) {
      if (current.length > 0) result.push(current);
      return;
    }
    for (const combo of combinations(remaining)) {
      const sum = combo.items.reduce((s, ci) => s + ci.card.rank, 0);
      if (sum === target) {
        const rest = remaining.filter((_, i) => !combo.indices.includes(i));
        helper(rest, [...current, combo.items]);
      }
    }
  };
  helper(cards, []);
  return result;
}

function cardKey(card: Card): string {
  if (card.rank === 2 && card.suit === 'clubs') return '2c';
  if (card.rank === 10 && card.suit === 'diamonds') return '10d';
  return `${card.rank}`;
}

function keyFromGroups(groups: Card[][]): string {
  const groupStrings = groups
    .map((g) => g.map(cardKey).sort().join('+'))
    .sort();
  return groupStrings.join('|');
}

export function legalCaptures(card: Card, table: Card[]): LegalMove[] {
  const result: LegalMove[] = [];
  const isFace = card.rank > 10;
  const seen = new Set<string>();
  const tableWithIdx = table.map((c, i) => ({ card: c, index: i }));
  for (const combo of combinations(tableWithIdx)) {
    const cardsWI = combo.items as CardWithIndex[];
    const cards = cardsWI.map((ci) => ci.card);
    const indices = cardsWI.map((ci) => ci.index);
    const sameRank = cards.length === 1 && cards[0].rank === card.rank;
    if (isFace) {
      if (sameRank) {
        const groups = [[cards[0]]];
        const key = keyFromGroups(groups);
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ cards, indices, groups });
        }
      }
    } else {
      if (sameRank) {
        const groups = [[cards[0]]];
        const key = keyFromGroups(groups);
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ cards, indices, groups });
        }
      } else {
        const partitions = partitionGroups(cardsWI, card.rank);
        for (const part of partitions) {
          const groups = part.map((g) => g.map((ci) => ci.card));
          const idxs = part.flat().map((ci) => ci.index);
          const key = keyFromGroups(groups);
          if (!seen.has(key)) {
            seen.add(key);
            result.push({ cards: groups.flat(), indices: idxs, groups });
          }
        }
      }
    }
  }
  return result;
}
