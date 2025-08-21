'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

interface GameInfo {
  id: string;
  name: string;
  players: any[];
  maxPlayers: number;
}

export default function GameLobby() {
  const [games, setGames] = useState<GameInfo[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'games'), where('status', '==', 'open'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setGames(data as any);
    });
    return () => unsub();
  }, []);
  return (
    <div className="flex flex-col gap-2">
      {games.map((g) => (
        <div key={g.id} className="bg-white text-black p-2 rounded flex justify-between">
          <div>
            {g.name} ({g.players.length}/{g.maxPlayers})
          </div>
          <Link href={`/game/${g.id}`} className="text-blue-500">
            Join
          </Link>
        </div>
      ))}
    </div>
  );
}
