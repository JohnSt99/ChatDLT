import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { createDeck, shuffle, deal, Card } from '../../lib/diloti';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { tableName, userName, maxPlayers, targetScore } = req.body;
  const deck = shuffle(createDeck());
  const table: Card[] = deal(deck, 4);
  const hand: Card[] = deal(deck, 6);
  const playerId = 'p1';
  const gameRef = doc(collection(db, 'games'));
  const game = {
    name: tableName,
    targetScore,
    maxPlayers,
    status: 'open',
    deck,
    table,
    players: [{ id: playerId, name: userName }],
    hands: { [playerId]: hand },
    turn: 0,
    captures: { [playerId]: [] as Card[] },
  };
  await setDoc(gameRef, game);
  res.status(200).json({ gameId: gameRef.id, playerId });
}
