import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Vite + React + Tailwind</h1>
      <button
        onClick={() => setCount((count) => count + 1)}
        className="px-4 py-2 bg-red-600 rounded hover:bg-blue-700 transition"
      >
        Count is {count}
      </button>
    </div>
  );
}

export default App;
