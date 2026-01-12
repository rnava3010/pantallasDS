import { LayoutDashboard, Settings, Monitor, CheckCircle } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle size={64} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Manager Vivo!</h1>
        <p className="text-gray-600 mb-6">El sistema de Digital Signage está listo para ser administrado.</p>
        
        <div className="grid grid-cols-3 gap-4 border-t pt-6">
          <div className="flex flex-col items-center text-blue-500">
            <Monitor size={24} />
            <span className="text-xs mt-1 text-gray-500">Pantallas</span>
          </div>
          <div className="flex flex-col items-center text-purple-500">
            <LayoutDashboard size={24} />
            <span className="text-xs mt-1 text-gray-500">Contenido</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Settings size={24} />
            <span className="text-xs mt-1 text-gray-500">Ajustes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;