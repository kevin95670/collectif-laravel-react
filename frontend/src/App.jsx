export default function App() {
  return (
    <div className="min-h-screen bg-mist p-10">
      <h1 className="text-5xl font-medium">
        Trouve du monde pour <span className="text-brand">jouer</span>
      </h1>

      <div className="mt-8 max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <h2 className="text-3xl font-medium">
          Foot <span className="text-brand">à 5</span>
        </h2>
        <p className="mt-2 text-lg">Samedi 20h · Lyon 7e</p>
        <span className="mt-4 inline-block rounded-lg bg-butter px-3 py-2 text-sm font-bold">
          Plus que 2 places
        </span>
        <div className="mt-6">
          <button className="rounded-full bg-brand px-8 py-3 text-lg font-bold text-white">
            Rejoindre
          </button>
        </div>
      </div>
    </div>
  )
}