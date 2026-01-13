// manager/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Monitor, CalendarDays, LogOut, Menu, User } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: 'Usuario', role: 'Admin' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 z-10 flex flex-col border-r`}>
        <div className="h-16 flex items-center justify-center border-b">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">DS</div>
          {sidebarOpen && <span className="ml-2 font-bold text-blue-900">Manager</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20}/>} text="Inicio" active={true} open={sidebarOpen} />
          <SidebarItem icon={<Monitor size={20}/>} text="Pantallas" open={sidebarOpen} />
          <SidebarItem icon={<CalendarDays size={20}/>} text="Eventos" open={sidebarOpen} />
        </nav>

        <div className="p-3 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors justify-center">
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Salir</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
             <span className="text-sm font-semibold text-gray-700">{user.name}</span>
             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User size={16}/></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido al Panel</h1>
            {/* Aquí irán tus widgets (Terminales activas, Eventos de hoy, etc) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border h-32 flex items-center justify-center text-gray-400">Widget 1</div>
               <div className="bg-white p-6 rounded-xl shadow-sm border h-32 flex items-center justify-center text-gray-400">Widget 2</div>
               <div className="bg-white p-6 rounded-xl shadow-sm border h-32 flex items-center justify-center text-gray-400">Widget 3</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, active, open }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} ${!open && 'justify-center'}`}>
      {icon}
      {open && <span className="font-medium">{text}</span>}
    </div>
  );
}