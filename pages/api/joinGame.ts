import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { deal, Card } from '../../lib/diloti';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { gameId, userName } = req.body;
  const gameRef = doc(db, 'games', gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) {
    res.status(404).end();
    return;
  }
  const game = snap.data() as any;
  const seat = game.players.length;
  if (seat >= game.maxPlayers) {
    res.status(400).json({ error: 'Game full' });
    return;
  }
  const playerId = `p${seat + 1}`;
  const hand: Card[] = deal(game.deck, 6);
  game.players.push({ id: playerId, name: userName });
  game.hands[playerId] = hand;
  game.captures[playerId] = [];
  let status = game.status;
  if (game.players.length === game.maxPlayers) {
    status = 'playing';
  }
  await updateDoc(gameRef, {
    players: game.players,
    hands: game.hands,
    deck: game.deck,
    captures: game.captures,
    status,
  });
  res.status(200).json({ playerId });
}
