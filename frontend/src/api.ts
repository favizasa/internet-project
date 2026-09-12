// src/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  return sessionStorage.getItem('wisp_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
}

// ---------- Auth ----------
export interface PlanPayload {
  nombrePlan: string;
  tipoTecnologia: string;
  velocidadMbps: number;
  precioMensual: number;
  zonaCobertura: string;
  soporte?: string;
  imagenUrl?: string;
  latitud?: number;
  longitud?: number;
}

export interface RegistroPayload {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  celular?: string;
  correo: string;
  password: string;
}

export const authApi = {
  solicitarCodigoReset: (correo: string) =>
    request('/auth/olvide-clave', { method: 'POST', body: JSON.stringify({ correo }) }),

  restablecerClave: (correo: string, codigo: string, nuevaPassword: string) =>
    request('/auth/restablecer-clave', { method: 'POST', body: JSON.stringify({ correo, codigo, nuevaPassword }) }),
  
  registrar: (payload: RegistroPayload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: async (correo: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
    sessionStorage.setItem('wisp_token', data.token);
    sessionStorage.setItem('wisp_usuario', JSON.stringify(data.usuario));
    return data.usuario as { id: string; nombre: string; correo: string; rol: string };
  },

  logout: () => {
    sessionStorage.removeItem('wisp_token');
    sessionStorage.removeItem('wisp_usuario');
  },

  usuarioActual: () => {
    const raw = sessionStorage.getItem('wisp_usuario');
    return raw ? JSON.parse(raw) : null;
  },
};

// ---------- Planes ----------
export interface PlanPayload {
  nombrePlan: string;
  tipoTecnologia: string;
  velocidadMbps: number;
  precioMensual: number;
  zonaCobertura: string;
  soporte?: string;
  imagenUrl?: string;
  latitud?: number;
  longitud?: number;
}

export const planesApi = {
  listar: (filtros?: { zona?: string; tipo?: string; precioMax?: number }) => {
    const params = new URLSearchParams();
    if (filtros?.zona) params.set('zona', filtros.zona);
    if (filtros?.tipo) params.set('tipo', filtros.tipo);
    if (filtros?.precioMax) params.set('precioMax', String(filtros.precioMax));
    const qs = params.toString();
    return request(`/planes${qs ? `?${qs}` : ''}`);
  },

  misPlanes: () => request('/planes/mios'),

  crear: (payload: PlanPayload) =>
    request('/planes', { method: 'POST', body: JSON.stringify(payload) }),

  editar: (id: string, payload: PlanPayload) =>
    request(`/planes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  cambiarEstado: (id: string, estadoActivo: boolean) =>
    request(`/planes/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estadoActivo }) }),

  eliminar: (id: string) => request(`/planes/${id}`, { method: 'DELETE' }),
};

// ---------- Solicitudes ----------
export const solicitudesApi = {
  crear: (payload: {
    planId: string; sector: string; manzana: string; lote: string;
    referencia: string; horarioPreferido: string;
  }) => request('/solicitudes', { method: 'POST', body: JSON.stringify(payload) }),

  misSolicitudes: () => request('/solicitudes/mias'),
};

export const ticketsApi = {
  crear: (payload: { categoriaFalla: string; descripcion: string; evidenciaUrl?: string }) =>
    request('/tickets', { method: 'POST', body: JSON.stringify(payload) }),

  misTickets: () => request('/tickets/mios'),
  bandeja: () => request('/tickets/bandeja'),
  iniciarAtencion: (id: string) => request(`/tickets/${id}/iniciar`, { method: 'PATCH' }),
  finalizar: (id: string, payload: { diagnosticoTecnico: string; accionesRealizadas: string; requiereVisita: boolean; evidenciaResolucionUrl?: string }) =>
  request(`/tickets/${id}/finalizar`, { method: 'PATCH', body: JSON.stringify(payload) }),

  enviarEncuesta: (id: string, payload: { calificacion: number; comentario?: string }) =>
    request(`/tickets/${id}/encuesta`, { method: 'POST', body: JSON.stringify(payload) }),
};

export const kpiApi = {
  obtener: (desde: string, hasta: string) => request(`/kpi?desde=${desde}&hasta=${hasta}`),

  exportarExcel: async (desde: string, hasta: string) => {
    const token = sessionStorage.getItem('wisp_token');
    const res = await fetch(`${API_URL}/kpi/exportar?desde=${desde}&hasta=${hasta}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('No se pudo generar el reporte Excel.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_kpi_${desde}_a_${hasta}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export function archivoABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


export const mapaApi = {
  tickets: () => request('/mapa/tickets'),
  solicitudes: () => request('/mapa/solicitudes'),
  planes: () => request('/mapa/planes'),
};
