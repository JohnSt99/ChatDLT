'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Card, legalCaptures, LegalMove } from '../../../lib/diloti';
import Hand from '../../../components/Hand';
import CardView from '../../../components/Card';

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

const isSpecial = (c: Card) =>
  (c.rank === 2 && c.suit === 'clubs') ||
  (c.rank === 10 && c.suit === 'diamonds');

function cardNode(c: Card): JSX.Element {
  const base = rankSymbols[c.rank] || c.rank.toString();
  const isRed = c.suit === 'hearts' || c.suit === 'diamonds';
  const color = isRed ? 'text-red-600' : 'text-black';
  if (isSpecial(c)) {
    return (
      <span className={color}>
        {base}
        {suitSymbols[c.suit]}
      </span>
    );
  }
  return <span className={color}>{base}</span>;
}

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

  const hand: Card[] = playerId ? game?.hands?.[playerId] || [] : [];
  const table: Card[] = game?.table || [];
  const turnPlayer = game?.players?.[game?.turn];
  const isMyTurn = turnPlayer?.id === playerId;

  useEffect(() => {
    if (!isMyTurn) {
      setSelected(null);
    }
  }, [isMyTurn]);

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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-4 overflow-auto">
        <div className="text-xl mb-2">Table: {game.name}</div>
        <div className="mb-2">
          {isMyTurn ? 'Your turn' : `Waiting for ${turnPlayer?.name}'s turn`}
        </div>
        {game.message && <div className="mb-2">{game.message}</div>}
        <div className="flex flex-wrap justify-center">
          {table.map((c: Card, i: number) => (
            <CardView key={i} card={c} variant="table" />
          ))}
        </div>
      </div>
      <div className="p-4 border-t">
        <Hand
          hand={hand}
          selected={selected ?? undefined}
          onSelect={setSelected}
          disabled={!isMyTurn}
        />
        {isMyTurn && selected !== null && (
          <div className="bg-white text-black p-2 rounded mt-2">
            <div className="font-bold">Legal moves</div>
            {moves.map((m, i) => {
              const handCard = hand[selected];
              const multiGroup = m.groups.length > 1;
              const prefix =
                handCard.rank <= 10 && multiGroup ? (
                  <span
                    className={
                      handCard.suit === 'hearts' || handCard.suit === 'diamonds'
                        ? 'text-red-600'
                        : 'text-black'
                    }
                  >
                    {rankSymbols[handCard.rank] || handCard.rank}s:{' '}
                  </span>
                ) : null;
              const groups = m.groups.map((g, gi) => {
                const showParens = g.length > 1 || multiGroup;
                return (
                  <span key={gi}>
                    {showParens && '('}
                    {g.map((c, ci) => (
                      <span key={ci}>
                        {cardNode(c)}
                        {ci < g.length - 1 && <span>+</span>}
                      </span>
                    ))}
                    {showParens && ')'}
                    {gi < m.groups.length - 1 && <span>+</span>}
                  </span>
                );
              });
              return (
                <button
                  key={i}
                  onClick={() => play(m.indices)}
                  className="block w-full text-left underline"
                >
                  Capture {prefix}
                  {groups}
                </button>
              );
            })}
            <button onClick={() => play()} className="block w-full text-left">
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
