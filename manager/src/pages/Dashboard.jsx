import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // <--- IMPORTANTE: Agregado Outlet
import apiClient from '../services/apiClient';
import * as Icons from 'lucide-react';
import { 
  LogOut, 
  Menu, 
  User, 
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué ruta estamos y marcarla activa
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: 'Usuario', role: '0', roleName: '...' });
  const [menuItems, setMenuItems] = useState([]); // Estado para el menú dinámico

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) navigate('/login');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadMenu(parsedUser.role); // Cargamos menú pasando el rol
    }
  }, [navigate]);

  // Función para cargar menú desde BD
  const loadMenu = async (userRole) => {
    try {
      const { data } = await apiClient.get('/manager/menu');
      
      // --- TU LÓGICA DE PERMISOS "130" ---
      // Filtramos los items que contengan el número de rol en su string de permisos
      const allowedItems = data.filter(item => {
        const permisosStr = String(item.permisos);
        const roleStr = String(userRole);
        return permisosStr.includes(roleStr);
      });

      setMenuItems(allowedItems);
    } catch (error) {
      console.error("Error cargando menú", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('savedUser'); // Opcional, depende de si quieres borrar el "recuérdame"
    navigate('/login');
  };

  // Helper para convertir string "Monitor" -> Componente <Monitor />
  const getIconComponent = (iconName) => {
    const Icon = Icons[iconName];
    // Si el icono no existe, mostramos un signo de interrogación por defecto
    return Icon ? <Icon size={20} /> : <Icons.HelpCircle size={20} />;
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-20 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">DS</div>
            {sidebarOpen && <span className="font-bold text-lg tracking-tight text-white">Manager</span>}
          </div>
        </div>

        {/* --- MENÚ DINÁMICO --- */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(item.ruta)} // Navegación
              className={`
                flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 group
                ${location.pathname === item.ruta 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                } 
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              {/* Icono Dinámico con efecto hover */}
              <div className={location.pathname === item.ruta ? '' : 'group-hover:scale-110 transition-transform'}>
                 {getIconComponent(item.icono)}
              </div>

              {sidebarOpen && (
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-medium text-sm">{item.nombre}</span>
                  {location.pathname === item.ruta && <ChevronRight size={14} className="opacity-50" />}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-700/50">
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group ${!sidebarOpen && 'justify-center'}`}>
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* --- RESTO DEL DASHBOARD (Header y Main) --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 z-10">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            
            {/* Info de Usuario */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block leading-tight">
                 <p className="text-sm font-semibold text-white">{user.name}</p>
                 <p className="text-xs text-blue-400">
				  {user.roleName || `Rol: ${user.role}`}
				</p>
              </div>
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shadow-inner">
                <User size={18} className="text-slate-300"/>
              </div>
            </div>
        </header>

        {/* --- CAMBIO PRINCIPAL: OUTLET --- */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900 relative">
           {/* Aquí se cargarán las páginas hijas (Pantallas, Eventos, etc.) definidas en App.jsx */}
           <Outlet /> 
        </main>
      </div>
    </div>
  );
}