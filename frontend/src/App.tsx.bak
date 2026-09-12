import React, { useState, useEffect } from 'react';
import { authApi, planesApi, solicitudesApi, ticketsApi, kpiApi, archivoABase64 } from './api';
import MapaCalor from './components/plans/support/MapaCalor';
import MapaPlan from './components/plans/support/MapaPlan';

interface Plan {
  id: string;
  wisp: string;
  nombre: string;
  tipo: 'Fibra' | 'Antena' | 'Híbrido';
  mensualidad: number;
  velocidad: number;
  soporte: string;
  cobertura: string;
  detalles: string[];
  logoUrl: string;
  estadoActivo?: boolean;
  latitud?: number;
  longitud?: number;
}

interface TicketApi {
  id: string;
  categoria_falla: string;
  descripcion: string;
  estado_ticket: 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Escalado';
  fecha_creacion: string;
  diagnostico_tecnico?: string;
  acciones_realizadas?: string;
  evidencia_url?: string;
  cliente_correo?: string;
  cliente_nombre?: string;
  calificacion?: number;
  comentario_encuesta?: string;
  evidencia_resolucion_url?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<string>('comparar');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [buscarCobertura, setBuscarCobertura] = useState<string>('');
  const [filtroPresupuesto, setFiltroPresupuesto] = useState<string>('TODOS');

  const [registroForm, setRegistroForm] = useState({ email: '', password: '', nombre: '', tipoDocumento: 'DNI', documento: '', celular: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [solicitudForm, setSolicitudForm] = useState({ manzana: '', lote: '', sector: '', referencia: '', horario: 'Mañana' });
  const [loginError, setLoginError] = useState('');

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [planMapaVisible, setPlanMapaVisible] = useState<Plan | null>(null);

  const [olvideForm, setOlvideForm] = useState({ correo: '' });
  const [resetForm, setResetForm] = useState({ codigo: '', nuevaPassword: '', confirmar: '' });
  const [correoParaReset, setCorreoParaReset] = useState('');
  const [olvideMensaje, setOlvideMensaje] = useState('');

  const [evidenciaResPreview, setEvidenciaResPreview] = useState('');
  const [evidenciaResBase64, setEvidenciaResBase64] = useState('');

  const handleSeleccionarEvidenciaResolucion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await archivoABase64(file);
    setEvidenciaResPreview(base64);
    setEvidenciaResBase64(base64);
  };

  useEffect(() => {
    const usuario = authApi.usuarioActual();
    if (usuario) {
      setUserRole(usuario.rol);
      setUserEmail(usuario.correo);
    }
  }, []);

  const cargarPlanes = async () => {
    setCargandoPlanes(true);
    try {
      const data = await planesApi.listar();
      const planesMapeados: Plan[] = data.map((p: any) => ({
        id: p.id,
        wisp: p.wisp,
        nombre: p.nombre_plan,
        tipo: p.tipo_tecnologia,
        mensualidad: Number(p.precio_mensual),
        velocidad: p.velocidad_mbps,
        soporte: p.soporte || '',
        cobertura: p.zona_cobertura,
        detalles: [],
        logoUrl: p.imagen_url || '/logos/win.png',
        estadoActivo: p.estado_activo,
        latitud: p.latitud ? Number(p.latitud) : undefined,
        longitud: p.longitud ? Number(p.longitud) : undefined,
      }));
      setPlanes(planesMapeados);
    } catch (err) {
      console.error('Error al cargar planes:', err);
    } finally {
      setCargandoPlanes(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  useEffect(() => {
    if (currentView === 'mis_planes' && userRole === 'Proveedor') {
      cargarMisPlanes();
    }
    if (currentView === 'incidencias' && userRole === 'Cliente') {
      cargarMisTickets();
    }
    if (currentView === 'gestion' && userRole === 'Soporte') {
      cargarBandeja();
    }
    if (currentView === 'kpi' && (userRole === 'Administrador' || userRole === 'Proveedor')) {
      cargarKpi();
    }
  }, [currentView, userRole]);

  const [nuevoPlanForm, setNuevoPlanForm] = useState({
    wisp: '', nombre: '', tipo: 'Fibra', mensualidad: '', velocidad: '', soporte: '', cobertura: '', latitud: '', longitud: ''
  });
  const [imagenPlanPreview, setImagenPlanPreview] = useState<string>('');
  const [imagenPlanBase64, setImagenPlanBase64] = useState<string>('');

  const [misPlanes, setMisPlanes] = useState<Plan[]>([]);
  const [cargandoMisPlanes, setCargandoMisPlanes] = useState(false);
  const [planEditando, setPlanEditando] = useState<Plan | null>(null);
  const [editarImagenPreview, setEditarImagenPreview] = useState<string>('');
  const [editarImagenBase64, setEditarImagenBase64] = useState<string>('');

  const cargarMisPlanes = async () => {
    setCargandoMisPlanes(true);
    try {
      const data = await planesApi.misPlanes();
      const mapeados: Plan[] = data.map((p: any) => ({
        id: p.id,
        wisp: '',
        nombre: p.nombre_plan,
        tipo: p.tipo_tecnologia,
        mensualidad: Number(p.precio_mensual),
        velocidad: p.velocidad_mbps,
        soporte: p.soporte || '',
        cobertura: p.zona_cobertura,
        detalles: [],
        logoUrl: p.imagen_url || '/logos/win.png',
        estadoActivo: p.estado_activo,
        latitud: p.latitud ? Number(p.latitud) : undefined,
        longitud: p.longitud ? Number(p.longitud) : undefined,
      }));
      setMisPlanes(mapeados);
    } catch (err) {
      console.error('Error al cargar mis planes:', err);
    } finally {
      setCargandoMisPlanes(false);
    }
  };

  const handleSeleccionarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await archivoABase64(file);
    setImagenPlanPreview(base64);
    setImagenPlanBase64(base64);
  };

  const handleSeleccionarImagenEditar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await archivoABase64(file);
    setEditarImagenPreview(base64);
    setEditarImagenBase64(base64);
  };

  const handleSuspenderActivarPlan = async (plan: Plan) => {
    try {
      await planesApi.cambiarEstado(plan.id, !plan.estadoActivo);
      await cargarMisPlanes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el estado del plan.');
    }
  };

  const handleEliminarPlan = async (plan: Plan) => {
    if (!confirm(`¿Está seguro de eliminar el plan "${plan.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await planesApi.eliminar(plan.id);
      await cargarMisPlanes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar el plan.');
    }
  };

  const handleGuardarEdicionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planEditando) return;
    try {
      await planesApi.editar(planEditando.id, {
        nombrePlan: planEditando.nombre,
        tipoTecnologia: planEditando.tipo,
        velocidadMbps: planEditando.velocidad,
        precioMensual: planEditando.mensualidad,
        zonaCobertura: planEditando.cobertura,
        soporte: planEditando.soporte,
        imagenUrl: editarImagenBase64 || undefined,
        latitud: planEditando.latitud,
        longitud: planEditando.longitud,
      });
      alert('Plan actualizado correctamente.');
      setPlanEditando(null);
      setEditarImagenPreview('');
      setEditarImagenBase64('');
      await cargarMisPlanes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo editar el plan.');
    }
  };

  const [misTickets, setMisTickets] = useState<TicketApi[]>([]);
  const [cargandoMisTickets, setCargandoMisTickets] = useState(false);
  const [nuevoTicket, setNuevoTicket] = useState({ tipo: 'Sin señal / Pérdida de Enlace', detalle: '' });
  const [enviandoTicket, setEnviandoTicket] = useState(false);
  const [evidenciaPreview, setEvidenciaPreview] = useState<string>('');
  const [evidenciaBase64, setEvidenciaBase64] = useState<string>('');

  // Encuesta de satisfacción (plus de CU-08/CU-10)
  const [encuestaTicket, setEncuestaTicket] = useState<TicketApi | null>(null);
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState(0);
  const [comentarioEncuesta, setComentarioEncuesta] = useState('');
  const [enviandoEncuesta, setEnviandoEncuesta] = useState(false);

  const handleSeleccionarEvidencia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await archivoABase64(file);
    setEvidenciaPreview(base64);
    setEvidenciaBase64(base64);
  };

  const [bandejaTickets, setBandejaTickets] = useState<TicketApi[]>([]);
  const [cargandoBandeja, setCargandoBandeja] = useState(false);
  const [ticketAtendiendo, setTicketAtendiendo] = useState<TicketApi | null>(null);
  const [formAtencion, setFormAtencion] = useState({ diagnosticoTecnico: '', accionesRealizadas: '', requiereVisita: false });

  const cargarMisTickets = async () => {
    setCargandoMisTickets(true);
    try {
      const data = await ticketsApi.misTickets();
      setMisTickets(data);
    } catch (err) {
      console.error('Error al cargar tickets del cliente:', err);
    } finally {
      setCargandoMisTickets(false);
    }
  };

  const cargarBandeja = async () => {
    setCargandoBandeja(true);
    try {
      const data = await ticketsApi.bandeja();
      setBandejaTickets(data);
    } catch (err) {
      console.error('Error al cargar la bandeja de soporte:', err);
    } finally {
      setCargandoBandeja(false);
    }
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTicket.detalle.trim()) return;
    setEnviandoTicket(true);
    try {
      await ticketsApi.crear({
        categoriaFalla: nuevoTicket.tipo,
        descripcion: nuevoTicket.detalle,
        evidenciaUrl: evidenciaBase64 || undefined,
      });
      setNuevoTicket({ tipo: 'Sin señal / Pérdida de Enlace', detalle: '' });
      setEvidenciaPreview('');
      setEvidenciaBase64('');
      alert('Su reporte técnico ha sido registrado y enviado a la central de soporte.');
      await cargarMisTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo registrar el reporte. Verifique su conexión con el servidor.');
    } finally {
      setEnviandoTicket(false);
    }
  };

  const handleIniciarAtencion = async (ticket: TicketApi) => {
    try {
      await ticketsApi.iniciarAtencion(ticket.id);
      await cargarBandeja();
      setTicketAtendiendo({ ...ticket, estado_ticket: 'En Proceso' });
      setFormAtencion({ diagnosticoTecnico: '', accionesRealizadas: '', requiereVisita: false });
      setEvidenciaResPreview('');
      setEvidenciaResBase64('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo iniciar la atención del ticket.');
    }
  };

  // Encuesta: enviar calificación (1-5 estrellas + comentario opcional)
  const handleEnviarEncuesta = async () => {
    if (!encuestaTicket || estrellasSeleccionadas === 0) return;
    setEnviandoEncuesta(true);
    try {
      await ticketsApi.enviarEncuesta(encuestaTicket.id, {
        calificacion: estrellasSeleccionadas,
        comentario: comentarioEncuesta || undefined,
      });
      setEncuestaTicket(null);
      setEstrellasSeleccionadas(0);
      setComentarioEncuesta('');
      await cargarMisTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo enviar la encuesta.');
    } finally {
      setEnviandoEncuesta(false);
    }
  };

  const handleFinalizarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketAtendiendo) return;
    if (!formAtencion.diagnosticoTecnico.trim() || !formAtencion.accionesRealizadas.trim()) {
      alert('Complete los campos requeridos: Diagnóstico técnico y Acciones realizadas.');
      return;
    }
    try {
      await ticketsApi.finalizar(ticketAtendiendo.id, {
        diagnosticoTecnico: formAtencion.diagnosticoTecnico,
        accionesRealizadas: formAtencion.accionesRealizadas,
        requiereVisita: formAtencion.requiereVisita,
        evidenciaResolucionUrl: evidenciaResBase64 || undefined,
      });
      alert(formAtencion.requiereVisita
        ? 'Ticket derivado a visita técnica presencial. Estado actualizado a ESCALADO.'
        : 'Ticket marcado como RESUELTO con éxito. Notificación enviada al cliente.');
      setTicketAtendiendo(null);
      setEvidenciaResPreview('');
      setEvidenciaResBase64('');
      await cargarBandeja();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo finalizar el ticket.');
    }
  };

  const hoy = new Date().toISOString().slice(0, 10);
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [kpiDesde, setKpiDesde] = useState(primerDiaMes);
  const [kpiHasta, setKpiHasta] = useState(hoy);
  const [kpiData, setKpiData] = useState<any>(null);
  const [cargandoKpi, setCargandoKpi] = useState(false);
  const [errorKpi, setErrorKpi] = useState('');

  const cargarKpi = async () => {
    setCargandoKpi(true);
    setErrorKpi('');
    try {
      const data = await kpiApi.obtener(kpiDesde, kpiHasta);
      setKpiData(data);
    } catch (err) {
      setErrorKpi(err instanceof Error ? err.message : 'No se pudieron cargar los indicadores.');
      setKpiData(null);
    } finally {
      setCargandoKpi(false);
    }
  };

  const handleAplicarFiltroKpi = (e: React.FormEvent) => {
    e.preventDefault();
    cargarKpi();
  };

  const handleRegistroCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.registrar({
        nombre: registroForm.nombre,
        tipoDocumento: registroForm.tipoDocumento,
        numeroDocumento: registroForm.documento,
        celular: registroForm.celular,
        correo: registroForm.email,
        password: registroForm.password,
      });
      alert(`¡Registro completado con éxito! Inicie sesión.`);
      setRegistroForm({ email: '', password: '', nombre: '', tipoDocumento: 'DNI', documento: '', celular: '' });
      setCurrentView('login');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo completar el registro.');
    }
  };

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await authApi.solicitarCodigoReset(olvideForm.correo);
    setCorreoParaReset(olvideForm.correo);
    setOlvideMensaje('Si el correo existe, se envió un código de 6 dígitos. Revisa tu bandeja (y spam).');
    setCurrentView('restablecer_clave');
  } catch (err) {
    alert(err instanceof Error ? err.message : 'No se pudo procesar la solicitud.');
  }
};

  const handleRestablecerClave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (resetForm.nuevaPassword !== resetForm.confirmar) {
    alert('Las contraseñas no coinciden.');
    return;
  }
  try {
    await authApi.restablecerClave(correoParaReset, resetForm.codigo, resetForm.nuevaPassword);
    alert('Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.');
    setResetForm({ codigo: '', nuevaPassword: '', confirmar: '' });
    setOlvideForm({ correo: '' });
    setCurrentView('login');
  } catch (err) {
    alert(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
  }
};


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usuario = await authApi.login(loginForm.email, loginForm.password);
      setUserRole(usuario.rol);
      setUserEmail(usuario.correo);
      setLoginError('');
      setLoginForm({ email: '', password: '' });

      if (usuario.rol === 'Administrador') setCurrentView('kpi');
      else if (usuario.rol === 'Proveedor') setCurrentView('agregar_plan');
      else if (usuario.rol === 'Soporte') setCurrentView('gestion');
      else setCurrentView(selectedPlan ? 'solicitud' : 'comparar');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Usuario o contraseña incorrectos.');
    }
  };


  const handleEnviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await solicitudesApi.crear({
        planId: selectedPlan.id,
        sector: solicitudForm.sector,
        manzana: solicitudForm.manzana,
        lote: solicitudForm.lote,
        referencia: solicitudForm.referencia,
        horarioPreferido: solicitudForm.horario,
      });
      alert(`Solicitud del plan ${selectedPlan.nombre} enviada correctamente. Un asesor se pondrá en contacto pronto.`);
      setSolicitudForm({ manzana: '', lote: '', sector: '', referencia: '', horario: 'Mañana' });
      setSelectedPlan(null);
      setCurrentView('comparar');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo enviar la solicitud. Intente nuevamente.');
    }
  };

  const handleCrearPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await planesApi.crear({
        nombrePlan: nuevoPlanForm.nombre,
        tipoTecnologia: nuevoPlanForm.tipo,
        velocidadMbps: Number(nuevoPlanForm.velocidad),
        precioMensual: Number(nuevoPlanForm.mensualidad),
        zonaCobertura: nuevoPlanForm.cobertura,
        soporte: nuevoPlanForm.soporte,
        imagenUrl: imagenPlanBase64 || undefined,
        latitud: nuevoPlanForm.latitud ? Number(nuevoPlanForm.latitud) : undefined,
        longitud: nuevoPlanForm.longitud ? Number(nuevoPlanForm.longitud) : undefined,
      });
      alert(`¡Plan ${nuevoPlanForm.nombre} agregado exitosamente al catálogo general!`);
      setNuevoPlanForm({ wisp: '', nombre: '', tipo: 'Fibra', mensualidad: '', velocidad: '', soporte: '', cobertura: '', latitud: '', longitud: '' });
      setImagenPlanPreview('');
      setImagenPlanBase64('');
      await cargarPlanes();
      setCurrentView('mis_planes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo guardar el plan. Verifique que su cuenta tenga una ficha de proveedor asociada.');
    }
  };

  const planesFiltrados = planes.filter(p => {
    const cumpleTipo = filtroTipo === 'TODOS' || p.tipo.toUpperCase() === filtroTipo.toUpperCase();
    const cumpleBusqueda = p.cobertura.toLowerCase().includes(buscarCobertura.toLowerCase()) || p.wisp.toLowerCase().includes(buscarCobertura.toLowerCase());
    let cumplePresupuesto = true;
    if (filtroPresupuesto === 'BAJO') cumplePresupuesto = p.mensualidad <= 60;
    if (filtroPresupuesto === 'MEDIO') cumplePresupuesto = p.mensualidad > 60 && p.mensualidad <= 85;
    if (filtroPresupuesto === 'ALTO') cumplePresupuesto = p.mensualidad > 85;
    return cumpleTipo && cumpleBusqueda && cumplePresupuesto;
  });

  const badgeEstado = (estado: string) => {
    if (estado === 'Resuelto') return 'bg-emerald-950 text-emerald-400 border-emerald-900';
    if (estado === 'En Proceso') return 'bg-amber-950 text-amber-400 border-amber-900';
    if (estado === 'Escalado') return 'bg-purple-950 text-purple-400 border-purple-900';
    return 'bg-red-950 text-red-400 border-red-900';
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shadow-lg">
            <img src="/logos/logo-pachanet.png" alt="WISP Pachacútec" className="w-full h-full object-contain" /> 
           </div>         
          <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white">WISP_NET</span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">PACHACÚTEC V1.4</span>
            </div>
          </div>

          <nav className="space-y-1">
            {(userRole === null || userRole === 'Cliente') && (
              <>
                <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Portal Clientes</p>
                <button onClick={() => setCurrentView('comparar')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${currentView === 'comparar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  📊 Matriz de Planes
                </button>
                {userRole === null && (
                  <button onClick={() => setCurrentView('registro')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${currentView === 'registro' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                    👤 Crear Cuenta (Cliente)
                  </button>
                )}
                <button onClick={() => setCurrentView(userRole ? 'solicitud' : 'login')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${currentView === 'solicitud' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  📡 Solicitar Conexión
                </button>
                {userRole === 'Cliente' && (
                  <button onClick={() => setCurrentView('incidencias')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${currentView === 'incidencias' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                    🛠️ Soporte Técnico {misTickets.filter(t => t.estado_ticket !== 'Resuelto').length > 0 && "•"}
                  </button>
                )}
              </>
            )}

            {userRole === 'Proveedor' && (
              <>
                <p className="px-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 mt-4">Módulo Comercial</p>
                <button onClick={() => setCurrentView('mis_planes')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg ${currentView === 'mis_planes' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  📋 Mis Planes
                </button>
                <button onClick={() => setCurrentView('agregar_plan')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg ${currentView === 'agregar_plan' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  ➕ Agregar Plan Nuevo
                </button>
                <button onClick={() => setCurrentView('kpi')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg ${currentView === 'kpi' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  📈 Indicadores KPI
                </button>
                <button onClick={() => setCurrentView('mapa')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg ${currentView === 'mapa' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                 🗺️ Mapa de Calor
                </button>
              </>
            )}

            {userRole === 'Soporte' && (
              <>
                <p className="px-3 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 mt-4">Módulo Técnico</p>
                <button onClick={() => setCurrentView('gestion')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg ${currentView === 'gestion' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                  🛠️ Bandeja Incidencias {bandejaTickets.filter(t => t.estado_ticket === 'Pendiente').length > 0 && "•"}
                </button>
              </>
            )}

           {userRole === 'Administrador' && (
           <>
          <button onClick={() => setCurrentView('kpi')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg ${currentView === 'kpi' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            📈 Indicadores KPI
          </button>
          <button onClick={() => setCurrentView('mapa')} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg ${currentView === 'mapa' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            🗺️ Mapa de Calor
          </button>
           </>
           )}

            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-4 mb-2">Autenticación</p>
            {userRole === null ? (
              <button onClick={() => setCurrentView('login')} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-emerald-400 hover:bg-gray-800">
                 Iniciar Sesión 
              </button>
            ) : (
              <button onClick={() => { authApi.logout(); setUserRole(null); setUserEmail(null); setCurrentView('comparar'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-red-400 hover:bg-red-950/20">
                🚪 Salir ({userRole})
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 text-[10px] font-mono text-gray-500 text-center bg-gray-950">
          Sesión: {userEmail || 'Invitado'}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">

        {currentView === 'comparar' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 p-5 border border-gray-800 rounded-xl">
              <div>
                <h1 className="text-xl font-bold text-white uppercase">Catálogo de Cobertura de Internet</h1>
                <p className="text-xs text-gray-400">Compara las velocidades y tecnologías en Ventanilla y Pachacútec.</p>
              </div>
              <input type="text" placeholder="Buscar zona o WISP..." value={buscarCobertura} onChange={e => setBuscarCobertura(e.target.value)} className="bg-gray-950 border border-gray-700 text-xs rounded-xl p-2.5 w-full md:w-64 focus:outline-none text-white" />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 w-full max-w-xs">
                {['TODOS', 'FIBRA', 'ANTENA'].map(t => (
                  <button key={t} onClick={() => setFiltroTipo(t)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase ${filtroTipo === t ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Rango Mensualidad:</span>
                <select value={filtroPresupuesto} onChange={e => setFiltroPresupuesto(e.target.value)} className="bg-gray-950 text-xs border border-gray-700 rounded-lg p-1 text-white focus:outline-none">
                  <option value="TODOS">Todos los precios</option>
                  <option value="BAJO">Económico (Hasta S/.60)</option>
                  <option value="MEDIO">Estándar (S/.61 - S/.85)</option>
                  <option value="ALTO">Premium (Más de S/.85)</option>
                </select>
              </div>
            </div>

            {cargandoPlanes && (
              <div className="text-center text-xs text-gray-400 py-10">⏳ Cargando catálogo de planes desde la base de datos...</div>
            )}
            {!cargandoPlanes && planesFiltrados.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-10 bg-gray-900 border border-gray-800 rounded-xl">
                No hay planes registrados que coincidan con tu búsqueda. Si eres Proveedor, agrega uno desde "Agregar Plan Nuevo".
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!cargandoPlanes && planesFiltrados.map(plan => (
                <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all shadow-md">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center overflow-hidden p-1">
                          <img src={plan.logoUrl} alt={plan.wisp} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-blue-950 text-blue-400 border border-blue-900">{plan.wisp}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">{plan.tipo}</span>
                    </div>

                    <h3 className="text-base font-black text-white mt-2 leading-snug">{plan.nombre}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">📍 Cobertura: {plan.cobertura}</p>

                    <div className="my-4 p-3 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-baseline">
                      <span className="text-lg font-black text-blue-400">S/. {plan.mensualidad}.00</span>
                      <span className="text-xs font-bold text-gray-300">{plan.velocidad} Mbps</span>
                    </div>
                  </div>

                  {plan.latitud && plan.longitud && (
                    <button
                      onClick={() => setPlanMapaVisible(plan)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-2 rounded-xl text-xs uppercase transition-all cursor-pointer mb-2"
                    >
                      📍 Ver ubicación de cobertura
                    </button>
                  )}
                  <button onClick={() => {
                    setSelectedPlan(plan);
                    if (userRole === 'Cliente') { setCurrentView('solicitud'); }
                    else { alert("⚠️ INICIE SESIÓN:\nDebe loguearse como Cliente para tramitar la instalación."); setCurrentView('login'); }
                  }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition-all cursor-pointer">
                    Solicitar Instalación
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'registro' && (
          <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold uppercase text-white">Alta de Cuenta de Abonado</h2>
            <form onSubmit={handleRegistroCliente} className="space-y-3 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                <input type="text" required value={registroForm.nombre} onChange={e => setRegistroForm({...registroForm, nombre: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo Doc.</label>
                  <select value={registroForm.tipoDocumento} onChange={e => setRegistroForm({...registroForm, tipoDocumento: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    <option value="DNI">DNI</option>
                    <option value="DNI Extranjero">DNI Extranjero</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Número de Identidad</label>
                  <input type="text" required value={registroForm.documento} onChange={e => setRegistroForm({...registroForm, documento: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Celular</label>
                <input type="text" required value={registroForm.celular} onChange={e => setRegistroForm({...registroForm, celular: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                <input type="email" required value={registroForm.email} onChange={e => setRegistroForm({...registroForm, email: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contraseña</label>
                <input type="password" required value={registroForm.password} onChange={e => setRegistroForm({...registroForm, password: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer mt-2">Crear mi Perfil</button>
            </form>
          </div>
        )}

        {currentView === 'login' && (
          <div className="max-w-sm mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl mt-12">
            <h2 className="text-base font-bold uppercase text-center text-white">Identificación de Usuario</h2>
            <p className="text-[11px] text-gray-400 text-center mb-4">Ingresa tus credenciales preestablecidas</p>
            {loginError && <div className="mb-4 bg-red-950 border border-red-900 text-red-400 p-3 rounded-xl text-xs font-semibold text-center">⚠️ {loginError}</div>}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contraseña</label>
                <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Acceder al Panel</button>

              <button type="button" onClick={() => setCurrentView('olvide_clave')} className="w-full text-center text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-1">
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </div>
        )}

        {currentView === 'olvide_clave' && (
  <div className="max-w-sm mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl mt-12">
    <h2 className="text-base font-bold uppercase text-center text-white">Recuperar Contraseña</h2>
    <p className="text-[11px] text-gray-400 text-center mb-4">Ingresa tu correo y te enviaremos un código de verificación.</p>
    <form onSubmit={handleSolicitarCodigo} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
        <input type="email" required value={olvideForm.correo} onChange={e => setOlvideForm({ correo: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Enviar Código</button>
      <button type="button" onClick={() => setCurrentView('login')} className="w-full text-center text-[11px] text-gray-500 hover:text-gray-300">Volver a Iniciar Sesión</button>
    </form>
  </div>
)}

{currentView === 'restablecer_clave' && (
  <div className="max-w-sm mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl mt-12">
    <h2 className="text-base font-bold uppercase text-center text-white">Ingresar Código</h2>
    {olvideMensaje && <p className="text-[11px] text-emerald-400 text-center mb-4">{olvideMensaje}</p>}
    <form onSubmit={handleRestablecerClave} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Código de 6 dígitos</label>
        <input type="text" required maxLength={6} value={resetForm.codigo} onChange={e => setResetForm({...resetForm, codigo: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white text-center tracking-widest focus:outline-none" />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nueva Contraseña</label>
        <input type="password" required value={resetForm.nuevaPassword} onChange={e => setResetForm({...resetForm, nuevaPassword: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Confirmar Contraseña</label>
        <input type="password" required value={resetForm.confirmar} onChange={e => setResetForm({...resetForm, confirmar: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Restablecer Contraseña</button>
    </form>
  </div>
)}

        {currentView === 'solicitud' && userRole === 'Cliente' && (
  <div className="max-w-xl mx-auto space-y-4">
    {selectedPlan && (
      <div className="bg-gray-900 border border-blue-900/50 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center overflow-hidden p-1 shrink-0">
          <img src={selectedPlan.logoUrl} alt={selectedPlan.wisp} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Plan Seleccionado</p>
          <h3 className="text-sm font-black text-white">{selectedPlan.nombre}</h3>
          <p className="text-[11px] text-gray-400">{selectedPlan.wisp} · {selectedPlan.tipo} · {selectedPlan.velocidad} Mbps</p>
        </div>
        <span className="text-lg font-black text-blue-400">S/. {selectedPlan.mensualidad}.00</span>
      </div>
    )}

    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-base font-bold uppercase text-white mb-1">Datos de Instalación</h2>
      <p className="text-[11px] text-gray-400 mb-5">Completa la dirección exacta para coordinar la visita técnica.</p>
      <form onSubmit={handleEnviarSolicitud} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sector</label>
            <input type="text" required placeholder="Ej: E3" value={solicitudForm.sector} onChange={e => setSolicitudForm({...solicitudForm, sector: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Manzana</label>
            <input type="text" required placeholder="Mz B" value={solicitudForm.manzana} onChange={e => setSolicitudForm({...solicitudForm, manzana: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lote</label>
            <input type="text" required placeholder="Lt 23" value={solicitudForm.lote} onChange={e => setSolicitudForm({...solicitudForm, lote: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-600" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Referencias de Domicilio</label>
          <textarea required placeholder="Ej: Casa de dos pisos, fachada celeste, al costado de la bodega San Martín..." value={solicitudForm.referencia} onChange={e => setSolicitudForm({...solicitudForm, referencia: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white h-24 resize-none focus:outline-none focus:border-blue-600" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Horario Preferido de Visita</label>
          <div className="grid grid-cols-3 gap-2">
            {['Mañana', 'Tarde', 'Noche'].map(h => (
              <button
                type="button"
                key={h}
                onClick={() => setSolicitudForm({...solicitudForm, horario: h})}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase border transition-colors ${
                  solicitudForm.horario === h
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-950 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3.5 rounded-xl transition-colors">
          Enviar a Revisión de Despacho
           </button>
         </form>
       </div>
     </div>
    )}

        {currentView === 'incidencias' && userRole === 'Cliente' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold uppercase text-white mb-1">Reportar Avería de Conectividad</h3>
              <form onSubmit={handleCrearTicket} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de Evento Técnico</label>
                  <select value={nuevoTicket.tipo} onChange={e => setNuevoTicket({...nuevoTicket, tipo: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    <option value="Sin señal / Pérdida de Enlace">Sin Señal / Pérdida de Enlace Completo</option>
                    <option value="Lentitud / Micro-cortes">Lentitud intermitente o Micro-cortes de Ping</option>
                    <option value="Falla de Equipamiento">Problema Físico con el Router/Antena PoE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Detalle Narrativo de la Falla</label>
                  <textarea required value={nuevoTicket.detalle} onChange={e => setNuevoTicket({...nuevoTicket, detalle: e.target.value})} placeholder="Describe los síntomas del problema aquí..." className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white h-20 resize-none focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Evidencia fotográfica (opcional)</label>
                  <input type="file" accept="image/*" onChange={handleSeleccionarEvidencia} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold" />
                  {evidenciaPreview && (
                    <img src={evidenciaPreview} alt="Vista previa de evidencia" onClick={() => setLightboxUrl(evidenciaPreview)} className="mt-2 h-24 object-contain bg-gray-950 border border-gray-800 rounded-lg p-1 cursor-zoom-in" />
                  )}
                </div>
                <button type="submit" disabled={enviandoTicket} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase p-3 rounded-xl cursor-pointer">
                  {enviandoTicket ? 'Enviando...' : 'Emitir Alerta a Soporte'}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold uppercase text-white mb-3">Historial de Tickets y Estado</h3>
              {cargandoMisTickets && (
                <div className="text-center text-xs text-gray-400 py-6">⏳ Cargando su historial de tickets...</div>
              )}
              {!cargandoMisTickets && misTickets.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-6">Aún no ha reportado incidencias.</div>
              )}
              <div className="space-y-4">
                {misTickets.map(t => (
                  <div key={t.id} className="bg-gray-950 p-4 border border-gray-800 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">TK-{String(t.id).slice(0, 8)}</span>
                        <h4 className="text-xs font-bold text-white mt-1.5">{t.categoria_falla}</h4>
                        <p className="text-[11px] text-gray-400 mt-1"><b>Tu reporte:</b> {t.descripcion}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${badgeEstado(t.estado_ticket)}`}>
                        {t.estado_ticket}
                      </span>
                    </div>
                    {t.evidencia_url && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">📷 Tu evidencia</p>
                        <img src={t.evidencia_url} alt="Evidencia adjunta" onClick={() => setLightboxUrl(t.evidencia_url!)} className="h-24 object-contain bg-gray-900 border border-gray-800 rounded-lg p-1 cursor-zoom-in" />
                      </div>
                    )}
                    {t.diagnostico_tecnico && (
                      <div className="bg-blue-950/40 border border-blue-900/60 rounded-lg p-3 mt-2">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1">
                          👷 Respuesta Oficial de Soporte Técnico:
                        </p>
                        <p className="text-[11px] text-gray-300 mt-1 font-sans leading-relaxed">
                          {t.diagnostico_tecnico}{t.acciones_realizadas ? ` — ${t.acciones_realizadas}` : ''}
                        </p>
                      </div>
                    )}
                    {t.evidencia_resolucion_url && (
                      <div className="mt-2">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">📷 Evidencia del técnico</p>
                        <img src={t.evidencia_resolucion_url} alt="Evidencia de la solución" onClick={() => setLightboxUrl(t.evidencia_resolucion_url!)} className="h-24 object-contain bg-gray-900 border border-gray-800 rounded-lg p-1 cursor-zoom-in" />
                      </div>
                    )}

                    {t.estado_ticket === 'Resuelto' && (
                      t.calificacion ? (
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold mt-1">
                          {'⭐'.repeat(t.calificacion)}{'☆'.repeat(5 - t.calificacion)}
                          <span className="text-gray-500 font-normal ml-1">— gracias por tu calificación</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEncuestaTicket(t); setEstrellasSeleccionadas(0); setComentarioEncuesta(''); }}
                          className="text-[10px] font-bold uppercase text-amber-400 border border-amber-800/40 bg-amber-950/30 hover:bg-amber-900/40 px-3 py-1.5 rounded-lg mt-1"
                        >
                          ⭐ Calificar atención recibida
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'gestion' && userRole === 'Soporte' && (
          <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold uppercase text-white">Central de Soporte WISP — Bandeja de Casos</h2>
                <p className="text-xs text-gray-400">Tickets reportados por los abonados, asignados automáticamente (TAT ≤ 5 min).</p>
              </div>
              <button onClick={cargarBandeja} className="text-[10px] font-bold uppercase text-gray-400 hover:text-white border border-gray-800 rounded-lg px-3 py-1.5">🔄 Refrescar</button>
            </div>

            {cargandoBandeja && (
              <div className="text-center text-xs text-gray-400 py-10">⏳ Cargando bandeja de incidencias...</div>
            )}
            {!cargandoBandeja && bandejaTickets.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-10">No hay tickets asignados en este momento.</div>
            )}

            <div className="space-y-4">
              {bandejaTickets.map(t => (
                <div key={t.id} className="bg-gray-950 p-5 border border-gray-800 rounded-xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">TK-{String(t.id).slice(0, 8)}</span>
                      <span className="text-[11px] text-gray-500 font-semibold">{new Date(t.fecha_creacion).toLocaleDateString('es-PE')}</span>
                      <span className={`text-[9px] px-2 py-0.5 uppercase font-black rounded border ${badgeEstado(t.estado_ticket)}`}>{t.estado_ticket}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-200">Abonado: <span className="text-blue-400 font-normal">{t.cliente_nombre || t.cliente_correo}</span></p>
                    <p className="text-xs font-bold text-white uppercase">{t.categoria_falla}</p>
                    <div className="bg-gray-900 p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-400 font-mono mt-1">
                      🗣️ <b>Mensaje Cliente:</b> {t.descripcion}
                    </div>
                    {t.evidencia_url && (
                      <img src={t.evidencia_url} alt="Evidencia enviada por el cliente" onClick={() => setLightboxUrl(t.evidencia_url!)} className="h-28 object-contain bg-gray-900 border border-gray-800 rounded-lg p-1 mt-1 cursor-zoom-in" />
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    {t.estado_ticket === 'Pendiente' && (
                      <button onClick={() => handleIniciarAtencion(t)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-3 py-2 rounded-lg transition-all cursor-pointer text-center">
                        ▶ Iniciar Atención
                      </button>
                    )}
                    {t.estado_ticket === 'En Proceso' && (
                      <button onClick={() => { setTicketAtendiendo(t); setFormAtencion({ diagnosticoTecnico: '', accionesRealizadas: '', requiereVisita: false }); setEvidenciaResPreview(''); setEvidenciaResBase64(''); }} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase px-3 py-2 rounded-lg transition-all cursor-pointer text-center">
                        📝 Registrar Diagnóstico
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {ticketAtendiendo && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6">
                  <h3 className="text-sm font-bold uppercase text-white mb-4">Atender TK-{String(ticketAtendiendo.id).slice(0, 8)}</h3>
                  <form onSubmit={handleFinalizarTicket} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Diagnóstico Técnico</label>
                      <textarea required value={formAtencion.diagnosticoTecnico} onChange={e => setFormAtencion({...formAtencion, diagnosticoTecnico: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white h-16 resize-none focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Acciones Realizadas</label>
                      <textarea required value={formAtencion.accionesRealizadas} onChange={e => setFormAtencion({...formAtencion, accionesRealizadas: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white h-16 resize-none focus:outline-none" />
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                      <input type="checkbox" checked={formAtencion.requiereVisita} onChange={e => setFormAtencion({...formAtencion, requiereVisita: e.target.checked})} />
                      A1: La falla requiere visita técnica de campo (Escalar)
                    </label>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Evidencia de la solución (opcional)</label>
                      <input type="file" accept="image/*" onChange={handleSeleccionarEvidenciaResolucion}
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold" />
                      {evidenciaResPreview && (
                        <img src={evidenciaResPreview} onClick={() => setLightboxUrl(evidenciaResPreview)}
                          className="mt-2 h-20 object-contain bg-gray-950 border border-gray-800 rounded-lg p-1 cursor-zoom-in" />
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className={`flex-1 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer ${formAtencion.requiereVisita ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        {formAtencion.requiereVisita ? 'Escalar a Visita Técnica' : 'Cerrar Ticket (Resuelto)'}
                      </button>
                      <button type="button" onClick={() => { setTicketAtendiendo(null); setEvidenciaResPreview(''); setEvidenciaResBase64(''); }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'mis_planes' && userRole === 'Proveedor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <h2 className="text-base font-bold uppercase text-white">Mis Planes Registrados</h2>
              <p className="text-xs text-gray-400">Administre, edite, suspenda o elimine sus planes comerciales actuales.</p>
            </div>

            {cargandoMisPlanes && (
              <div className="text-center text-xs text-gray-400 py-10">⏳ Cargando sus planes...</div>
            )}
            {!cargandoMisPlanes && misPlanes.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-10 bg-gray-900 border border-gray-800 rounded-xl">
                Aún no ha registrado planes. Use "Agregar Plan Nuevo" para crear el primero.
              </div>
            )}

            <div className="space-y-3">
              {misPlanes.map(plan => (
                <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center overflow-hidden p-1 shrink-0">
                    <img src={plan.logoUrl} alt={plan.nombre} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{plan.nombre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${plan.estadoActivo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-red-950 text-red-400 border border-red-800/40'}`}>
                        {plan.estadoActivo ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{plan.tipo} · {plan.velocidad} Mbps · S/. {plan.mensualidad.toFixed(2)}/mes · 📍 {plan.cobertura}</p>
                  </div>

                  <div className="flex flex-row gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => { setPlanEditando(plan); setEditarImagenPreview(plan.logoUrl); setEditarImagenBase64(''); }}
                      className="flex-1 bg-blue-950/40 text-blue-400 border border-blue-800/40 hover:bg-blue-900/50 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleSuspenderActivarPlan(plan)}
                      className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors border ${plan.estadoActivo ? 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/50' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50'}`}
                    >
                      {plan.estadoActivo ? '⏸ Suspender' : '▶ Activar'}
                    </button>
                    <button
                      onClick={() => handleEliminarPlan(plan)}
                      className="flex-1 bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/50 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {planEditando && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6">
                  <h3 className="text-sm font-bold uppercase text-white mb-4">Editar Plan: {planEditando.nombre}</h3>
                  <form onSubmit={handleGuardarEdicionPlan} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Plan</label>
                      <input type="text" required value={planEditando.nombre} onChange={e => setPlanEditando({...planEditando, nombre: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo</label>
                        <select value={planEditando.tipo} onChange={e => setPlanEditando({...planEditando, tipo: e.target.value as Plan['tipo']})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                          <option value="Fibra">Fibra</option>
                          <option value="Antena">Antena</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mensualidad (S/.)</label>
                        <input type="number" required value={planEditando.mensualidad} onChange={e => setPlanEditando({...planEditando, mensualidad: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Velocidad (Mbps)</label>
                        <input type="number" required value={planEditando.velocidad} onChange={e => setPlanEditando({...planEditando, velocidad: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Soporte</label>
                        <input type="text" value={planEditando.soporte} onChange={e => setPlanEditando({...planEditando, soporte: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cobertura</label>
                        <input type="text" required value={planEditando.cobertura} onChange={e => setPlanEditando({...planEditando, cobertura: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Latitud (opcional)</label>
                        <input type="text" placeholder="Ej: -11.8756" value={planEditando.latitud ?? ''} onChange={e => setPlanEditando({...planEditando, latitud: e.target.value ? Number(e.target.value) : undefined})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Longitud (opcional)</label>
                        <input type="text" placeholder="Ej: -77.1256" value={planEditando.longitud ?? ''} onChange={e => setPlanEditando({...planEditando, longitud: e.target.value ? Number(e.target.value) : undefined})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Imagen / Logo (opcional, deja igual si no cambia)</label>
                      <input type="file" accept="image/*" onChange={handleSeleccionarImagenEditar} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold" />
                      {editarImagenPreview && (
                        <img src={editarImagenPreview} alt="Vista previa" className="mt-2 h-16 w-16 object-contain bg-gray-950 border border-gray-800 rounded-lg p-1" />
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Guardar Cambios</button>
                      <button type="button" onClick={() => { setPlanEditando(null); setEditarImagenPreview(''); setEditarImagenBase64(''); }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs uppercase font-bold p-3 rounded-xl cursor-pointer">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'agregar_plan' && userRole === 'Proveedor' && (
          <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold uppercase text-white mb-4">Agregar Plan Nuevo al Catálogo</h2>
            <form onSubmit={handleCrearPlan} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Plan</label>
                <input type="text" required value={nuevoPlanForm.nombre} onChange={e => setNuevoPlanForm({...nuevoPlanForm, nombre: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo</label>
                  <select value={nuevoPlanForm.tipo} onChange={e => setNuevoPlanForm({...nuevoPlanForm, tipo: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none">
                    <option value="Fibra">Fibra</option>
                    <option value="Antena">Antena</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mensualidad (S/.)</label>
                  <input type="number" required value={nuevoPlanForm.mensualidad} onChange={e => setNuevoPlanForm({...nuevoPlanForm, mensualidad: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Velocidad (Mbps)</label>
                  <input type="number" required value={nuevoPlanForm.velocidad} onChange={e => setNuevoPlanForm({...nuevoPlanForm, velocidad: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Soporte</label>
                  <input type="text" required value={nuevoPlanForm.soporte} onChange={e => setNuevoPlanForm({...nuevoPlanForm, soporte: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cobertura</label>
                  <input type="text" required value={nuevoPlanForm.cobertura} onChange={e => setNuevoPlanForm({...nuevoPlanForm, cobertura: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Latitud (opcional)</label>
                  <input type="text" placeholder="Ej: -11.8756" value={nuevoPlanForm.latitud} onChange={e => setNuevoPlanForm({...nuevoPlanForm, latitud: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Longitud (opcional)</label>
                  <input type="text" placeholder="Ej: -77.1256" value={nuevoPlanForm.longitud} onChange={e => setNuevoPlanForm({...nuevoPlanForm, longitud: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 -mt-1">Tip: abre Google Maps, clic derecho sobre el punto de cobertura y copia las coordenadas.</p>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Imagen / Logo del Plan</label>
                <input type="file" accept="image/*" onChange={handleSeleccionarImagen} className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold" />
                {imagenPlanPreview && (
                  <img src={imagenPlanPreview} alt="Vista previa" className="mt-2 h-16 w-16 object-contain bg-gray-950 border border-gray-800 rounded-lg p-1" />
                )}
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer mt-2">Guardar Plan</button>
            </form>
          </div>
        )}

        {currentView === 'kpi' && (userRole === 'Administrador' || userRole === 'Proveedor') && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <h2 className="text-base font-bold uppercase text-white">Indicadores de Gestión Operativa (KPI)</h2>
              <p className="text-xs text-gray-400">Monitoreo analítico del estado de conectividad y satisfacción del cliente.</p>
            </div>

            <form onSubmit={handleAplicarFiltroKpi} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap items-end gap-4">
              <button
                   type="button"
                    onClick={async () => {
                 try {
                   await kpiApi.exportarExcel(kpiDesde, kpiHasta);
                     } catch (err) {
                  alert(err instanceof Error ? err.message : 'No se pudo exportar el reporte.');
                  }
                     }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
>
                Exportar Excel
                  </button>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Desde</label>
                <input type="date" value={kpiDesde} onChange={e => setKpiDesde(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hasta</label>
                <input type="date" value={kpiHasta} onChange={e => setKpiHasta(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs">🔍 Aplicar Rango</button>
            </form>

            {cargandoKpi && (
              <div className="text-center text-xs text-gray-400 py-10">⏳ Calculando indicadores desde la base de datos...</div>
            )}
            {errorKpi && (
              <div className="p-4 bg-red-950/40 border border-red-900 text-red-400 rounded-xl text-xs font-semibold">⚠️ {errorKpi}</div>
            )}

            {!cargandoKpi && kpiData && (
              <>
                {kpiData.sinRegistros && (
                  <div className="p-4 bg-amber-950/30 border border-amber-800/60 text-amber-400 rounded-xl text-xs font-medium">
                    ⚠️ No existen registros para el periodo seleccionado.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/50 px-2 py-1 rounded-md">TRPI</span>
                    <h3 className="text-3xl font-black text-white mt-3">{kpiData.tasaResolucionPI}%</h3>
                    <p className="text-xs font-bold text-gray-200 mt-1">Resolución en 1° Intervención</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-950/50 px-2 py-1 rounded-md">TAT</span>
                    <h3 className="text-3xl font-black text-white mt-3">{kpiData.tiempoAsignacionMinutos} min</h3>
                    <p className="text-xs font-bold text-gray-200 mt-1">Tiempo de Asignación</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-950/50 px-2 py-1 rounded-md">Solicitudes</span>
                    <h3 className="text-3xl font-black text-white mt-3">{kpiData.totalSolicitudes}</h3>
                    <p className="text-xs font-bold text-gray-200 mt-1">Solicitudes de Instalación</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white">Distribución de Tickets</h4>
                    {[
                      { label: 'Pendientes', valor: kpiData.ticketsPendientes, color: 'bg-red-500' },
                      { label: 'En Proceso', valor: kpiData.ticketsProgreso, color: 'bg-amber-500' },
                      { label: 'Resueltos', valor: kpiData.ticketsResueltos, color: 'bg-emerald-500' },
                      { label: 'Escalados (visita técnica)', valor: kpiData.ticketsEscalados, color: 'bg-purple-500' },
                    ].map(item => {
                      const total = kpiData.ticketsPendientes + kpiData.ticketsProgreso + kpiData.ticketsResueltos + kpiData.ticketsEscalados;
                      const pct = total > 0 ? (item.valor / total) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-white font-bold">{item.valor}</span>
                          </div>
                          <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden">
                            <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Satisfacción del Cliente</h4>
                      <span className="text-[10px] text-gray-500">{kpiData.satisfaccion.totalEncuestas} encuestas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-amber-400">{kpiData.satisfaccion.promedio || '—'}</span>
                      <div>
                        <div className="text-amber-400 text-sm">
                          {kpiData.satisfaccion.promedio > 0 ? '⭐'.repeat(Math.round(kpiData.satisfaccion.promedio)) + '☆'.repeat(5 - Math.round(kpiData.satisfaccion.promedio)) : '☆☆☆☆☆'}
                        </div>
                        <p className="text-[10px] text-gray-500">Promedio sobre 5 estrellas</p>
                      </div>
                    </div>
                    {[5, 4, 3, 2, 1].map(n => {
                      const cantidad = kpiData.satisfaccion.distribucion[n] || 0;
                      const total = kpiData.satisfaccion.totalEncuestas;
                      const pct = total > 0 ? (cantidad / total) * 100 : 0;
                      return (
                        <div key={n} className="flex items-center gap-2 text-[10px]">
                          <span className="w-6 text-gray-400">{n}★</span>
                          <div className="flex-1 bg-gray-950 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-6 text-right text-gray-500">{cantidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Comentarios de Clientes</h4>
                  {kpiData.satisfaccion.comentarios.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-6">No hay comentarios registrados en este periodo.</p>
                  )}
                  <div className="space-y-3">
                    {kpiData.satisfaccion.comentarios.map((c: any, i: number) => (
                      <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{c.cliente_nombre}</span>
                          <span className="text-amber-400 text-xs">{'⭐'.repeat(c.calificacion)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 italic">"{c.comentario}"</p>
                        <p className="text-[9px] text-gray-600 mt-1">{new Date(c.fecha).toLocaleDateString('es-PE')} · TK-{String(c.codigo_hash || '').slice(0, 8)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {currentView === 'mapa' && (userRole === 'Administrador' || userRole === 'Proveedor') && (
          <MapaCalor />
        )}
      </main>

      {encuestaTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-sm font-bold uppercase text-white mb-1">¿Cómo fue la atención?</h3>
            <p className="text-[11px] text-gray-400 mb-4">TK-{String(encuestaTicket.id).slice(0, 8)} · Tu opinión nos ayuda a mejorar el servicio.</p>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEstrellasSeleccionadas(n)}
                  className={`text-3xl transition-transform hover:scale-110 ${n <= estrellasSeleccionadas ? 'text-amber-400' : 'text-gray-700'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comentarioEncuesta}
              onChange={e => setComentarioEncuesta(e.target.value)}
              placeholder="Comentario opcional..."
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white h-16 resize-none focus:outline-none mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={handleEnviarEncuesta}
                disabled={estrellasSeleccionadas === 0 || enviandoEncuesta}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs uppercase font-bold p-3 rounded-xl cursor-pointer"
              >
                {enviandoEncuesta ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                type="button"
                onClick={() => setEncuestaTicket(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs uppercase font-bold p-3 rounded-xl cursor-pointer"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}

      {planMapaVisible && planMapaVisible.latitud && planMapaVisible.longitud && (
        <MapaPlan
          latitud={planMapaVisible.latitud}
          longitud={planMapaVisible.longitud}
          nombrePlan={planMapaVisible.nombre}
          onCerrar={() => setPlanMapaVisible(null)}
        />
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[60] cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Imagen ampliada"
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 text-white text-2xl font-bold bg-gray-900/70 hover:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}