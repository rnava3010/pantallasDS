import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  CalendarDays, 
  LogOut, 
  Bell, 
  Settings, 
  Menu,
  User
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: 'Admin', role: 'Administrador' });

  // Simulación de datos que vendrían de tu API (basado en tu SQL)
  const stats = [
    { title: 'Terminales Activas', value: '3', icon: <Monitor className="w-6 h-6 text-blue-600" />, change: '+1 conectada' },
    { title: 'Eventos Hoy', value: '2', icon: <CalendarDays className="w-6 h-6 text-purple-600" />, change: 'Boda y TV' },
    { title: 'Tipo de Cambio', value: '$17.50', icon: <span className="text-xl font-bold text-green-600">$</span>, change: 'USD / MXN' },
  ];

  const recentEvents = [
    { id: 2, name: 'Boda García & López', area: 'Salón Maya', status: 'ACTIVO', time: '09:00 - 23:59' },
    { id: 3, name: 'Transmisión My Little Pony', area: 'TV Jessy', status: 'ACTIVO', time: '09:00 - 23:59' },
  ];

  useEffect(() => {
    // Aquí verificaríamos el token real
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    
    // Aquí harías: const data = await api.get('/dashboard-stats');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 z-10 flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">D</div>
            {sidebarOpen && <span>DigitalSign</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20}/>} text="Dashboard" active={true} open={sidebarOpen} />
          <SidebarItem icon={<Monitor size={20}/>} text="Pantallas" open={sidebarOpen} />
          <SidebarItem icon={<CalendarDays size={20}/>} text="Eventos" open={sidebarOpen} />
          <SidebarItem icon={<Settings size={20}/>} text="Configuración" open={sidebarOpen} />
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* WELCOME */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
              <p className="text-gray-500">Bienvenido al panel de control de Digital Signage.</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                    <p className="text-xs text-green-600 mt-2 font-medium">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* MAIN SECTIONS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* TABLE: Upcoming Events */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Eventos Activos</h2>
                  <button className="text-sm text-blue-600 hover:underline">Ver todo</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Evento</th>
                        <th className="px-5 py-3">Área / Pantalla</th>
                        <th className="px-5 py-3">Horario</th>
                        <th className="px-5 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-gray-800">{evt.name}</td>
                          <td className="px-5 py-4">{evt.area}</td>
                          <td className="px-5 py-4">{evt.time}</td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              {evt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* WIDGET: Server Status / Weather Cache */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-800 mb-4">Estado del Sistema</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Servidor API</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Base de Datos</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold">CONECTADO</span>
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                    Última sincro clima: 2026-01-12 14:05:00
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente auxiliar para items del menú
function SidebarItem({ icon, text, active = false, open }) {
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
      ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}
      ${!open && 'justify-center'}
    `}>
      {icon}
      {open && <span className={`font-medium ${active ? 'font-semibold' : ''}`}>{text}</span>}
    </div>
  );
}