'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGameForm() {
  const [tableName, setTableName] = useState('');
  const [userName, setUserName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [targetScore, setTargetScore] = useState(100);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/createGame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, userName, maxPlayers, targetScore }),
    });
    const data = await res.json();
    router.push(`/game/${data.gameId}?player=${data.playerId}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 p-2 bg-white text-black rounded">
      <input
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        placeholder="Table name"
        required
      />
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Your name"
        required
      />
      <div>
        <label>
          <input
            type="radio"
            name="maxPlayers"
            value={2}
            checked={maxPlayers === 2}
            onChange={() => setMaxPlayers(2)}
          />
          {' '}2 players
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="maxPlayers"
            value={4}
            checked={maxPlayers === 4}
            onChange={() => setMaxPlayers(4)}
          />
          {' '}4 players
        </label>
      </div>
      <input
        type="number"
        value={targetScore}
        onChange={(e) => setTargetScore(parseInt(e.target.value))}
        placeholder="Target score"
        required
      />
      <button type="submit" className="bg-green-500 p-2 rounded text-white">
        Create Game
      </button>
    </form>
  );
}
