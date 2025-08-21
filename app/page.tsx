import CreateGameForm from '../components/CreateGameForm';
import GameLobby from '../components/GameLobby';

export default function Home() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Diloti Lobby</h1>
      <CreateGameForm />
      <GameLobby />
    </main>
  );
}
