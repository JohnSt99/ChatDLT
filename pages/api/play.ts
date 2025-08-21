import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, deal, createDeck, shuffle } from "../../lib/diloti";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { gameId, playerId, card, capture } = req.body;
  const gameRef = doc(db, 'games', gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) {
    res.status(404).end();
    return;
  }
  const game = snap.data() as any;
  const seat = game.players.findIndex((p: any) => p.id === playerId);
  if (seat === -1) {
    res.status(400).json({ error: 'Unknown player' });
    return;
  }
  if (seat !== game.turn) {
    res.status(400).json({ error: 'Not your turn' });
    return;
  }
  const hand: Card[] = game.hands[playerId];
  const cardIndex = hand.findIndex((c) => c.rank === card.rank && c.suit === card.suit);
  if (cardIndex === -1) {
    res.status(400).json({ error: 'Card not in hand' });
    return;
  }
  hand.splice(cardIndex, 1);
  let table: Card[] = game.table;
  if (capture) {
    // capture is array of table indices
    const captured: Card[] = [];
    capture.sort((a: number, b: number) => b - a);
    for (const idx of capture) {
      captured.push(table.splice(idx, 1)[0]);
    }
    game.captures[playerId] = (game.captures[playerId] || []).concat(captured, [card]);
  } else {
    table.push(card);
  }
  const turn = (game.turn + 1) % game.players.length;

  const allEmpty = game.players.every((p: any) => game.hands[p.id].length === 0);
  let message: string | null = null;
  if (allEmpty) {
    if (game.deck.length >= game.players.length * 6) {
      for (const p of game.players) {
        game.hands[p.id] = deal(game.deck, 6);
      }
    } else {
      message = 'Deck exhausted. Starting new game.';
      let deck = shuffle(createDeck());
      table = deal(deck, 4);
      const newHands: Record<string, Card[]> = {};
      for (const p of game.players) {
        newHands[p.id] = deal(deck, 6);
      }
      game.deck = deck;
      game.table = table;
      game.hands = newHands;
      game.captures = {};
      for (const p of game.players) {
        game.captures[p.id] = [];
      }
    }
  }

  await updateDoc(gameRef, {
    hands: game.hands,
    table,
    captures: game.captures,
    turn,
    deck: game.deck,
    message,
  });
  res.status(200).json({ ok: true });
}
