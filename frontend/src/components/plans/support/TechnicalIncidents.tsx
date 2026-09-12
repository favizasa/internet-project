import React, { useState } from 'react';

// Declaración formal de propiedades para solucionar el error de TypeScript en Vite
interface TechnicalIncidentsProps {
  listaTickets?: any[];
  onActualizarEstado?: (id: string, nuevoEstado: string) => void;
}

export default function TechnicalIncidents({ listaTickets, onActualizarEstado }: TechnicalIncidentsProps) {
  // 1. Simulación de la base de datos PostgreSQL para el caso de uso
  const [ticket, setTicket] = useState({
    id: '#H4SH92',
    client: 'Alexis Niquen',
    address: 'Ventanilla, Callao - Mz S Lt 23 San Pedro',
    category: 'CORTES INTERMITENTES',
    description: 'Problemas con mi internet hace 2 horas no vuelve - Zona Centro',
    status: 'PENDIENTE', // Estados: PENDIENTE -> EN ATENCIÓN -> RESUELTO / ESCALADO
    timeElapsed: 'Hace un momento'
  });

  // 2. Estados de los formularios técnicos e interactivos
  const [diagnostic, setDiagnostic] = useState('');
  const [actions, setActions] = useState('');
  const [resolutionType, setResolutionType] = useState('Cerrar ticket');
  
  // 3. Estados de feedback visual
  const [isProcessing, setIsProcessing] = useState(false);
  const [logMessage, setLogMessage] = useState('');

  // ACCIÓN 1: Iniciar Atención (Paso 3 del Flujo Básico)
  const handleStartAttention = () => {
    const nuevoEstado = 'EN ATENCIÓN';
    setTicket(prev => ({ ...prev, status: nuevoEstado }));
    setLogMessage('⏳ Cambiando estado: El ticket pasó a "EN ATENCIÓN" en la base de datos.');
    
    // Si la función opcional viene de App.tsx, sincroniza el estado global
    if (onActualizarEstado) {
      onActualizarEstado(ticket.id, nuevoEstado);
    }
  };

  // ACCIÓN 2: Guardar y Finalizar / Flujo Alterno (Pasos 4, 5, 6 y A1)
  const handleFinalizeTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setLogMessage('⚡ Calculando métricas KPI y registrando logs técnicos en el sistema...');

    setTimeout(() => {
      setIsProcessing(false);
      let finalStatus = 'RESUELTO';

      if (resolutionType === 'Requiere visita técnica de campo') {
        // Flujo Alterno A1
        finalStatus = 'ESCALADO';
        setTicket(prev => ({ ...prev, status: finalStatus }));
        setLogMessage('⚠️ Flujo Alterno A1 Activo: Se requiere visita de campo presencial en Ventanilla. Ruta del operario programada.');
      } else {
        // Flujo Básico Exitoso
        setTicket(prev => ({ ...prev, status: finalStatus }));
        setLogMessage('✅ ¡Ticket finalizado con éxito! Log guardado. Se despachó una notificación automática por WhatsApp al cliente (CU-13).');
      }

      // Sincroniza con el gestor global si está disponible
      if (onActualizarEstado) {
        onActualizarEstado(ticket.id, finalStatus);
      }
    }, 1200);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-200">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Módulo de Incidencias Técnicas</h2>
        <p className="text-xs text-gray-400 mt-1">
          Bandeja Técnica de Gestión Móvil — <span className="text-blue-400 font-semibold">Rol: Técnico de Soporte</span>
        </p>
      </div>

      {/* COMPONENTE: CABECERA DINÁMICA DE ESTADO */}
      <div className="bg-slate-900/60 border border-gray-800 rounded-xl p-4 mb-6 flex justify-between items-center shadow-md">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Estado de Red / Incidencia Activa</p>
          <p className="text-xs text-gray-300 mt-1">
            El ticket <span className="font-mono text-blue-400 font-bold">{ticket.id}</span> está actualmente en:{' '}
            <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] tracking-wide ${
              ticket.status === 'PENDIENTE' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
              ticket.status === 'EN ATENCIÓN' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
              ticket.status === 'RESUELTO' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
              'bg-purple-500/10 border border-purple-500/30 text-purple-400'
            }`}>
              {ticket.status}
            </span>
          </p>
        </div>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full tracking-wider uppercase border ${
          ticket.status === 'ESCALADO' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-gray-700 text-gray-400'
        }`}>
          {ticket.status === 'ESCALADO' ? 'En Campo' : ticket.status}
        </span>
      </div>

      {/* FEEDBACK O LOGS DEL SISTEMA */}
      {logMessage && (
        <div className={`p-3 mb-6 rounded-lg text-xs font-medium border transition-all ${
          ticket.status === 'RESUELTO' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' :
          ticket.status === 'ESCALADO' ? 'bg-purple-950/40 border-purple-800/60 text-purple-400' :
          'bg-blue-950/40 border-blue-800/60 text-blue-400'
        }`}>
          {logMessage}
        </div>
      )}

      {/* CUERPO DEL CASO DE USO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: FICHA TÉCNICA DEL INCIDENTE */}
        <div className="md:col-span-1 bg-slate-900/40 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">
            Detalles de la Avería
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-500 font-semibold block">Categoría de Falla:</span>
              <span className="text-white font-bold text-sm tracking-wide">{ticket.category}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block">Cliente / Afectado:</span>
              <span className="text-gray-300 font-medium">{ticket.client}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block">Dirección del Enlace:</span>
              <span className="text-gray-300 font-medium">{ticket.address}</span>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <span className="text-gray-500 font-semibold block mb-1">Evidencia / Reporte Inicial:</span>
              <p className="text-gray-400 italic bg-slate-950/50 p-2.5 rounded border border-gray-800/60 leading-relaxed">
                "{ticket.description}"
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO Y ACCIONES DEL TÉCNICO */}
        <div className="md:col-span-2 bg-slate-900/40 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2 mb-4">
              Formulario de Soporte y Diagnóstico
            </h3>

            {/* BOTÓN DETONADOR PARA INICIAR ATENCIÓN */}
            {ticket.status === 'PENDIENTE' ? (
              <div className="bg-slate-950/60 border border-dashed border-gray-800 rounded-xl p-6 text-center space-y-3">
                <p className="text-xs text-gray-400">
                  Para poder registrar el diagnóstico, primero debes dar inicio formal a la intervención técnica.
                </p>
                <button
                  type="button"
                  onClick={handleStartAttention}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95"
                >
                  ⚙️ Iniciar Atención (Cambiar a "En Proceso")
                </button>
              </div>
            ) : (
              /* FORMULARIO INTERACTIVO AL ESTAR EN PROCESO */
              <form onSubmit={handleFinalizeTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Diagnóstico Técnico</label>
                    <input
                      type="text"
                      placeholder="Ej. Desalineación o pérdida de potencia en nodo inalámbrico"
                      value={diagnostic}
                      onChange={(e) => setDiagnostic(e.target.value)}
                      disabled={ticket.status === 'RESUELTO' || ticket.status === 'ESCALADO' || isProcessing}
                      className="w-full bg-slate-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Acciones Realizadas</label>
                    <input
                      type="text"
                      placeholder="Ej. Reconfiguración de frecuencias y reinicio POE"
                      value={actions}
                      onChange={(e) => setActions(e.target.value)}
                      disabled={ticket.status === 'RESUELTO' || ticket.status === 'ESCALADO' || isProcessing}
                      className="w-full bg-slate-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Estado Resolutivo del Ticket</label>
                  <select
                    value={resolutionType}
                    onChange={(e) => setResolutionType(e.target.value)}
                    disabled={ticket.status === 'RESUELTO' || ticket.status === 'ESCALADO' || isProcessing}
                    className="w-full bg-slate-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40 font-medium"
                  >
                    <option value="Cerrar ticket">Cerrar ticket (Problema resuelto en primera línea con éxito)</option>
                    <option value="Requiere visita técnica de campo">Requiere visita técnica de campo (Flujo A1 - Daño en antena PoE)</option>
                  </select>
                </div>

                {/* BOTÓN FINALIZAR */}
                {ticket.status === 'EN ATENCIÓN' && (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-lg text-xs transition-all tracking-wide disabled:opacity-50 mt-4 shadow-lg shadow-emerald-950/20"
                  >
                    {isProcessing ? 'Procesando Logs y Métricas...' : 'Guardar y Finalizar'}
                  </button>
                )}
              </form>
            )}

            {/* ESTADO FINAL COMPLETO */}
            {(ticket.status === 'RESUELTO' || ticket.status === 'ESCALADO') && (
              <div className="mt-4 bg-slate-950/40 p-4 border border-gray-800/80 rounded-lg text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Este ticket se encuentra cerrado para modificaciones en base de datos PostgreSQL.
                </p>
                <button 
                  onClick={() => {
                    setTicket({ id: '#H4SH92', client: 'Alexis Niquen', address: 'Ventanilla, Callao - Mz S Lt 23 San Pedro', category: 'CORTES INTERMITENTES', description: 'Problemas con mi internet hace 2 horas no vuelve - Zona Centro', status: 'PENDIENTE', timeElapsed: 'Hace un momento' });
                    setDiagnostic(''); setActions(''); setLogMessage('');
                    if (onActualizarEstado) onActualizarEstado('#H4SH92', 'PENDIENTE');
                  }}
                  className="mt-2 text-[10px] text-blue-400 hover:underline font-bold"
                >
                  🔄 Resetear flujo para volver a probar
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}