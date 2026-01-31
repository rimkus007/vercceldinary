'use client';

export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Page de Test</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600">
          Cette page de test fonctionne correctement. Si vous voyez ce message, 
          le layout admin et la navigation fonctionnent.
        </p>
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          ✅ Layout Admin OK
        </div>
        <div className="mt-2 p-4 bg-blue-100 text-blue-800 rounded">
          ℹ️ Navigation OK
        </div>
        <div className="mt-2 p-4 bg-yellow-100 text-yellow-800 rounded">
          ⚠️ Si le dashboard principal ne fonctionne pas, le problème vient des composants complexes
        </div>
      </div>
    </div>
  );
}
