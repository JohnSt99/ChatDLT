'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Card, legalCaptures, LegalMove } from '../../../lib/diloti';
import Hand from '../../../components/Hand';
import CardView from '../../../components/Card';

export default function GamePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const sp = useSearchParams();
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(
    sp?.get('player') || null
  );
  const [userName, setUserName] = useState('');
  const [game, setGame] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState<LegalMove[]>([]);

  useEffect(() => {
    const ref = doc(db, 'games', id);
    const unsub = onSnapshot(ref, (snap) => {
      setGame({ id: snap.id, ...(snap.data() as any) });
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (game && playerId && selected !== null) {
      const card = game.hands[playerId][selected];
      setMoves(legalCaptures(card, game.table));
    } else {
      setMoves([]);
    }
  }, [game, playerId, selected]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/joinGame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: id, userName }),
    });
    const data = await res.json();
    router.replace(`/game/${id}?player=${data.playerId}`);
    setPlayerId(data.playerId);
  };

  const play = async (capture?: number[]) => {
    if (!playerId || selected === null || !game) return;
    const card: Card = game.hands[playerId][selected];
    await fetch('/api/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: id, playerId, card, capture }),
    });
    setSelected(null);
  };

  if (!game) return <div className="p-4">Loading...</div>;

  if (!playerId) {
    return (
      <form
        onSubmit={join}
        className="p-4 flex flex-col gap-2 bg-white text-black rounded"
      >
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name"
          required
        />
        <button type="submit" className="bg-green-500 p-2 text-white rounded">
          Join Game
        </button>
      </form>
    );
  }

  const hand: Card[] = game.hands[playerId] || [];
  const table: Card[] = game.table || [];
  const turnPlayer = game.players[game.turn];
  const isMyTurn = turnPlayer?.id === playerId;

  useEffect(() => {
    if (!isMyTurn) {
      setSelected(null);
    }
  }, [isMyTurn]);

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl">Table: {game.name}</div>
      <div>
        {isMyTurn ? 'Your turn' : `Waiting for ${turnPlayer?.name}'s turn`}
      </div>
      <div className="flex flex-wrap">
        {table.map((c: Card, i: number) => (
          <CardView key={i} card={c} variant="table" />
        ))}
      </div>
      <Hand
        hand={hand}
        selected={selected ?? undefined}
        onSelect={setSelected}
        disabled={!isMyTurn}
      />
      {isMyTurn && selected !== null && (
        <div className="bg-white text-black p-2 rounded">
          <div className="font-bold">Legal moves</div>
          {moves.map((m, i) => (
            <button
              key={i}
              onClick={() => play(m.indices)}
              className="block w-full text-left underline"
            >
              Capture {m.cards.map((c) => c.rank).join('+')}
            </button>
          ))}
          <button onClick={() => play()} className="block w-full text-left">
            Discard
          </button>
        </div>
      )}
    </div>
  );
}
