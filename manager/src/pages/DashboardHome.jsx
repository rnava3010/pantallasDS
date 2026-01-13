import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { 
  Building2, 
  MapPin, 
  CloudSun, 
  CalendarDays, 
  Monitor, 
  Megaphone,
  Activity,
  Clock
} from 'lucide-react';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/manager/dashboard/summary');
        setData(response.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-white">Cargando resumen...</div>;
  if (!data) return <div className="p-10 text-white">No hay datos disponibles</div>;

  // Helpers para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', { 
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Helper para iconos según tipo de pantalla
  const getTypeColor = (tipo) => {
    switch(tipo) {
      case 'SALON': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DIRECTORIO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'TARIFAS': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Resumen General</h1>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. TARJETA SUCURSAL */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Tu Sucursal</p>
              <h2 className="text-2xl font-bold text-white mb-2">{data.sucursal.nombre}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={16} />
                <span>{data.sucursal.direccion || 'Sin dirección registrada'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Building2 size={24} />
            </div>
          </div>

          {/* Widget Clima (Si existe en caché) */}
          {data.sucursal.json_clima && (
            <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center gap-4">
              <CloudSun size={32} className="text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.sucursal.json_clima.tempC}°C</p>
                <p className="text-xs text-slate-400">{data.sucursal.ciudad_clima}</p>
              </div>
            </div>
          )}
        </div>

        {/* 2. TARJETA PRÓXIMO EVENTO */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-lg relative lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="text-orange-400" size={20} />
              Próximo Evento
            </h3>
            {data.proximoEvento && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-medium">
                Confirmado
              </span>
            )}
          </div>

          {data.proximoEvento ? (
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Fecha Grande */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-center min-w-[120px]">
                <p className="text-orange-500 font-bold text-xl capitalize">
                  {new Date(data.proximoEvento.fecha_inicio).toLocaleDateString('es-MX', { month: 'short', day: 'numeric'})}
                </p>
                <p className="text-white text-2xl font-bold">
                  {new Date(data.proximoEvento.fecha_inicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>

              {/* Detalles */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="text-2xl font-bold text-white">{data.proximoEvento.nombre_evento}</h4>
                <div className="flex flex-col sm:flex-row gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>Salón: <strong className="text-slate-200">{data.proximoEvento.nombre_area}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <span>Cliente: {data.proximoEvento.cliente_nombre}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
              No hay eventos próximos agendados
            </div>
          )}
        </div>
      </div>

      {/* GRID SECUNDARIO (STATS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 3. RESUMEN DE PANTALLAS */}
        <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Inventario de Pantallas</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.terminales.map((term, index) => (
              <div key={index} className={`p-4 rounded-xl border ${getTypeColor(term.tipo_pantalla)} flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}>
                <span className="text-3xl font-bold mb-1">{term.total}</span>
                <span className="text-xs font-semibold tracking-wider">{term.tipo_pantalla}</span>
              </div>
            ))}
            {data.terminales.length === 0 && <p className="text-slate-500 text-sm col-span-4">No hay pantallas registradas.</p>}
          </div>
        </div>

        {/* 4. AVISOS ACTIVOS */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
              <Megaphone size={32} />
           </div>
           <h3 className="text-4xl font-bold text-white mb-1">{data.totalAvisos}</h3>
           <p className="text-slate-400 font-medium">Avisos activos en cintillo</p>
           <button className="mt-4 text-xs text-blue-400 hover:text-blue-300 hover:underline">Gestionar Avisos</button>
        </div>

      </div>
    </div>
  );
}