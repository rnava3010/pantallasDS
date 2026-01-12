import { Monitor, Image as ImageIcon, Settings, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">Bienvenido al Administrador de Digital Signage</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Pantallas Activas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pantallas</p>
            <p className="text-xl font-bold">12</p>
          </div>
        </div>

        {/* Card: Contenido */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Multimedia</p>
            <p className="text-xl font-bold">45</p>
          </div>
        </div>
      </div>
    </div>
  );
}