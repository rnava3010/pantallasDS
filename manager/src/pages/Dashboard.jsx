import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  CalendarDays, 
  LogOut, 
  Menu, 
  User, 
  Bell, 
  Search,
  ChevronRight
} from 'lucide-react';

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
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 
          transition-all duration-300 z-20 flex flex-col
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              DS
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight text-white">Manager</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} text="Inicio" active={true} open={sidebarOpen} />
          <SidebarItem icon={<Monitor size={20}/>} text="Pantallas" open={sidebarOpen} />
          <SidebarItem icon={<CalendarDays size={20}/>} text="Eventos" open={sidebarOpen} />
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button 
            onClick={handleLogout} 
            className={`
              flex items-center gap-3 w-full p-3 rounded-lg 
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 
              transition-all duration-200 group
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 z-10">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Barra de búsqueda decorativa */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-400 focus-within:border-blue-500/50 transition-colors w-64">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none w-full placeholder-slate-500 text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-700 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block leading-tight">
                 <p className="text-sm font-semibold text-white">{user.name}</p>
                 <p className="text-xs text-blue-400">{user.role}</p>
              </div>
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shadow-inner">
                <User size={18} className="text-slate-300"/>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900 relative">
          
          {/* Fondo decorativo sutil (opcional) */}
          <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-0">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido al Panel</h1>
                <p className="text-slate-400 text-sm mt-1">Resumen general del sistema de señalización</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                + Nuevo Evento
              </button>
            </div>

            {/* WIDGETS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Widget 1 */}
               <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-32 hover:border-blue-500/30 transition-all group cursor-pointer">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pantallas Activas</p>
                      <h3 className="text-2xl font-bold text-white mt-1">12 / 15</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Monitor size={20} />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                   Sistema Online
                 </div>
               </div>

               {/* Widget 2 */}
               <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-32 hover:border-purple-500/30 transition-all group cursor-pointer">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Eventos Hoy</p>
                      <h3 className="text-2xl font-bold text-white mt-1">8</h3>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <CalendarDays size={20} />
                    </div>
                 </div>
                 <p className="text-xs text-slate-500">Próximo: Boda Salón Maya (14:00)</p>
               </div>

               {/* Widget 3 */}
               <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-32 hover:border-emerald-500/30 transition-all group cursor-pointer">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Estado Servidor</p>
                      <h3 className="text-2xl font-bold text-emerald-400 mt-1">98%</h3>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <LayoutDashboard size={20} />
                    </div>
                 </div>
                 <p className="text-xs text-slate-500">Carga del CPU estable</p>
               </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente de Item de Menú mejorado
function SidebarItem({ icon, text, active, open }) {
  return (
    <div 
      className={`
        flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200
        ${active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
        } 
        ${!open && 'justify-center'}
      `}
    >
      {icon}
      {open && (
        <div className="flex-1 flex justify-between items-center">
          <span className="font-medium text-sm">{text}</span>
          {active && <ChevronRight size={14} className="opacity-50" />}
        </div>
      )}
    </div>
  );
}