import React, { useState } from 'react';

// Interfaces para tipado riguroso
interface MetricData {
  tasaConversion: number; // TC (%)
  tasaResolucionPI: number; // TRPI (%)
  tiempoAsignacion: number; // TAT (Minutos)
  totalSolicitudes: number;
  ticketsPendientes: number;
  ticketsProgreso: number;
  ticketsResueltos: number;
}

export default function KpiDashboard() {
  // 1. ESTADOS DE FILTRADO (Flujo Básico Paso 3)
  const [startDate, setStartDate] = useState<string>('2026-06-01');
  const [endDate, setEndDate] = useState<string>('2026-06-30');
  const [isNoDataPeriod, setIsNoDataPeriod] = useState<boolean>(false);
  const [exportDropdown, setExportDropdown] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'loading' | ''; text: string }>({ type: '', text: '' });
  

  // Datos simulados iniciales (Consolidado del mes en curso - Paso 2)
  const [metrics, setMetrics] = useState<MetricData>({
    tasaConversion: 74.5,
    tasaResolucionPI: 88.2,
    tiempoAsignacion: 14.5,
    totalSolicitudes: 142,
    ticketsPendientes: 12,
    ticketsProgreso: 28,
    ticketsResueltos: 94,
  });

  // 2. LOGICA DE FILTRADO Y FLUJO ALTERNO A1 (Paso 4 y Alterno A1)
  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage({ type: 'loading', text: 'Ejecutando funciones de agregación en PostgreSQL en tiempo real...' });

    setTimeout(() => {
      // Simulación del Flujo Alterno A1: si el rango termina antes del inicio o es del futuro remoto
      if (new Date(startDate) > new Date(endDate) || startDate === '2026-07-01') {
        setIsNoDataPeriod(true);
        setMetrics({
          tasaConversion: 0,
          tasaResolucionPI: 0,
          tiempoAsignacion: 0,
          totalSolicitudes: 0,
          ticketsPendientes: 0,
          ticketsProgreso: 0,
          ticketsResueltos: 0,
        });
        setActionMessage({ type: '', text: '' });
      } else {
        // Carga de datos normales actualizados
        setIsNoDataPeriod(false);
        setMetrics({
          tasaConversion: 81.3,
          tasaResolucionPI: 91.0,
          tiempoAsignacion: 11.2,
          totalSolicitudes: 198,
          ticketsPendientes: 8,
          ticketsProgreso: 34,
          ticketsResueltos: 156,
        });
        setActionMessage({ type: 'success', text: 'Métricas recalculadas con éxito para el periodo seleccionado.' });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      }
    }, 1000);
  };

  // 3. EXPORTACIÓN DE REPORTES DOCUMENTALES (Paso 6 y 7)
  const handleExport = (format: 'PDF' | 'Excel') => {
    setExportDropdown(false);
    setActionMessage({ type: 'loading', text: `Compilando logs históricos y estructurando reporte en formato ${format}...` });

    setTimeout(() => {
      setActionMessage({ 
        type: 'success', 
        text: `¡Descarga exitosa! El archivo PACHANET_KPI_${startDate}_to_${endDate}.${format.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'} ha sido guardado en tu dispositivo local.` 
      });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 4000);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ENCABEZADO Y ACCIONES PRINCIPALES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Tablero Analítico Corporativo</h2>
          <p className="text-sm text-gray-400 mt-1">Monitoreo de Calidad de Servicio y Auditoría Operacional (WISP / Administrador).</p>
        </div>

        {/* BOTÓN EXPORTAR DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setExportDropdown(!exportDropdown)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/10"
          >
            📥 Exportar Reporte
            <span className="text-[10px]">▼</span>
          </button>
          
          {exportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-850 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 hover:text-white font-medium transition-colors">
                📊 Documento Excel (.xlsx)
              </button>
              <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 hover:text-white font-medium transition-colors border-t border-gray-800">
                📄 Informe de Auditoría PDF (.pdf)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BANNER DE NOTIFICACIONES / CARGA DE DATOS */}
      {actionMessage.type === 'loading' && (
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/80 text-blue-300 rounded-xl text-xs font-semibold animate-pulse flex items-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
          {actionMessage.text}
        </div>
      )}
      {actionMessage.type === 'success' && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold">
          ✅ {actionMessage.text}
        </div>
      )}

      {/* FORMULARIO SUPERIOR DE FILTROS CALENDÁRICOS */}
      <form onSubmit={handleApplyFilter} className="bg-gray-950 border border-gray-850 p-4 rounded-2xl flex flex-wrap items-end gap-4 shadow-inner">
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fecha Inicial</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fecha Final</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium w-full"
          />
        </div>
        <button 
          type="submit" 
          className="bg-gray-800 hover:bg-gray-750 text-gray-200 border border-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors w-full sm:w-auto"
        >
          🔍 Aplicar Rango
        </button>
      </form>

      {/* BANNER FLUJO ALTERNO A1: INEXISTENCIA DE REGISTROS */}
      {isNoDataPeriod && (
        <div className="p-5 bg-amber-950/30 border border-amber-800/60 text-amber-400 rounded-2xl text-sm font-medium flex flex-col gap-1 shadow-md">
          <span className="font-black text-base flex items-center gap-1.5">⚠️ Alerta del Repositorio</span>
          No existen registros para el periodo seleccionado. Los gráficos e indicadores se congelarán en valores base.
        </div>
      )}

      {/* SECCIÓN PRINCIPAL: TARJETAS DE MÉTRICAS CUANTITATIVAS (KPI CAPÍTULO 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Tasa de Conversión (TC) */}
        <div className="bg-gray-850 border border-gray-800 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-gray-700">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-950/50 px-2 py-1 rounded-md">Métrica: TC</span>
            <span className="text-gray-500 text-lg">📈</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">{metrics.tasaConversion}%</h3>
            <p className="text-xs font-bold text-gray-200 mt-1">Tasa de Conversión</p>
            <p className="text-[11px] text-gray-400 mt-1">Contratos efectivos / Solicitudes ingresadas.</p>
          </div>
        </div>

        {/* KPI 2: Tasa de Resolución en Primera Intervención (TRPI) */}
        <div className="bg-gray-850 border border-gray-800 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-gray-700">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/50 px-2 py-1 rounded-md">Métrica: TRPI</span>
            <span className="text-gray-500 text-lg">🛠️</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">{metrics.tasaResolucionPI}%</h3>
            <p className="text-xs font-bold text-gray-200 mt-1">Resolución en 1° Intervención</p>
            <p className="text-[11px] text-gray-400 mt-1">Averías resueltas sin re-apertura técnica.</p>
          </div>
        </div>

        {/* KPI 3: Tiempo de Asignación de Tickets (TAT) */}
        <div className="bg-gray-850 border border-gray-800 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-gray-700">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-950/50 px-2 py-1 rounded-md">Métrica: TAT</span>
            <span className="text-gray-500 text-lg">⏳</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">{metrics.tiempoAsignacion} min</h3>
            <p className="text-xs font-bold text-gray-200 mt-1">Tiempo de Asignación</p>
            <p className="text-[11px] text-gray-400 mt-1">Lapso promedio de derivación a cuadrilla técnica.</p>
          </div>
        </div>

      </div>

      {/* DASHBOARDS VISUALES E INDICADORES OPERACIONALES (Prototipos P-11 y P-15) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO DE BARRAS DINÁMICAS POR ESTADO DE TICKETS */}
        <div className="bg-gray-850 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Volumen y Distribución Operativa de Tickets</h4>
            <p className="text-xs text-gray-400 mt-0.5">Desglose analítico de averías según estados de flujo.</p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Tickets Pendientes */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendientes de Validación</span>
                <span className="text-white font-bold">{metrics.ticketsPendientes}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${metrics.totalSolicitudes ? (metrics.ticketsPendientes / metrics.totalSolicitudes) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Tickets en Progreso */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> En Proceso Técnico</span>
                <span className="text-white font-bold">{metrics.ticketsProgreso}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${metrics.totalSolicitudes ? (metrics.ticketsProgreso / metrics.totalSolicitudes) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Tickets Resueltos */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resueltos / Cerrados</span>
                <span className="text-white font-bold">{metrics.ticketsResueltos}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${metrics.totalSolicitudes ? (metrics.ticketsResueltos / metrics.totalSolicitudes) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICAS COMPLEMENTARIAS / RESUMEN INTEGRADO */}
        <div className="bg-gray-850 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Consolidación de Auditoría de Red</h4>
            <p className="text-xs text-gray-400 mt-0.5">Logs de control procesados en infraestructura local.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto pt-4 lg:pt-0">
            <div className="bg-gray-900 p-4 border border-gray-800 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Operaciones</span>
              <span className="text-2xl font-black text-white block mt-1">{metrics.totalSolicitudes}</span>
            </div>
            <div className="bg-gray-900 p-4 border border-gray-800 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Eficiencia Global</span>
              <span className="text-2xl font-black text-blue-400 block mt-1">{metrics.totalSolicitudes ? '94.2%' : '0%'}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 text-center italic mt-2">
            Base de datos PostgreSQL vinculada • Sincronización activa
          </p>
        </div>

      </div>
    </div>
  );
}