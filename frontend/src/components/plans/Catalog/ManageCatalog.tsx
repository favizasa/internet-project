import React, { useState } from 'react';

interface Provider {
  id: number;
  ruc: string;
  businessName: string;
  coverageZone: string;
  planName: string;
  speed: string;
  price: number;
  status: 'Activo' | 'Suspendido';
}

export default function ManageCatalog() {
  // 1. Lista de proveedores y planes iniciales (Estado para permitir CRUD en memoria)
  const [providers, setProviders] = useState<Provider[]>([
    { id: 1, ruc: '20601234567', businessName: 'Pacha Fibra SAC', coverageZone: 'Sector 3, Defensores', planName: 'Plan Inicial Hogar', speed: '100 Mbps', price: 60, status: 'Activo' },
    { id: 2, ruc: '20459876543', businessName: 'Ventanilla Network', coverageZone: 'San Pedro, Agrupamientos', planName: 'Plan Avanzado Familiar', speed: '300 Mbps', price: 90, status: 'Activo' },
    { id: 3, ruc: '20112233445', businessName: 'PachaNet Empresas', coverageZone: 'Av. Unión, Zona Comercial', planName: 'Fibra Corporativa Dedicated', speed: '600 Mbps', price: 160, status: 'Activo' }
  ]);

  // 2. Estados para el formulario de nuevo plan/proveedor
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ruc: '',
    businessName: '',
    coverageZone: '',
    planName: '',
    speed: '100 Mbps',
    price: ''
  });

  // 3. Función para cambiar estado (Activo <-> Suspendido) - Como se sugería en image_de5de0.jpg
  const toggleProviderStatus = (id: number) => {
    setProviders(providers.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'Activo' ? 'Suspendido' : 'Activo'
        };
      }
      return p;
    }));
  };

  // 4. Función para agregar un nuevo registro (Create de nuestro CRUD)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc || !formData.businessName || !formData.coverageZone || !formData.price) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const newProvider: Provider = {
      id: Date.now(),
      ruc: formData.ruc,
      businessName: formData.businessName,
      coverageZone: formData.coverageZone,
      planName: formData.planName || 'Plan Personalizado',
      speed: formData.speed,
      price: parseFloat(formData.price),
      status: 'Activo'
    };

    setProviders([...providers, newProvider]);
    setFormData({ ruc: '', businessName: '', coverageZone: '', planName: '', speed: '100 Mbps', price: '' });
    setShowForm(false);
  };

  // 5. Función para eliminar un plan/proveedor (Delete del CRUD)
  const handleDeleteProvider = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este plan comercial del catálogo?')) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado del Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide uppercase">Gestión de Catálogo Comercial</h2>
          <p className="text-xs text-gray-400 mt-0.5">Panel administrativo CRUD • Rol: Proveedor WISP / Administrador</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/10"
        >
          {showForm ? '✖️ Cancelar Registro' : '➕ Registrar Nuevo Plan'}
        </button>
      </div>

      {/* Formulario de Inserción (CRUD - Create) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Datos del Proveedor y Oferta de Internet</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">RUC del Proveedor</label>
              <input type="text" name="ruc" value={formData.ruc} onChange={handleInputChange} placeholder="Ej. 20601234567" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Razón Social</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Ej. Pacha Fibra Redes" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Zona de Cobertura Destacada</label>
              <input type="text" name="coverageZone" value={formData.coverageZone} onChange={handleInputChange} placeholder="Ej. Sector 5, Pachacútec" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Nombre Comercial del Plan</label>
              <input type="text" name="planName" value={formData.planName} onChange={handleInputChange} placeholder="Ej. Plan Ultra Veloz" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Ancho de Banda (Velocidad)</label>
              <select name="speed" value={formData.speed} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="100 Mbps">100 Mbps (Básico)</option>
                <option value="200 Mbps">200 Mbps (Estándar)</option>
                <option value="300 Mbps">300 Mbps (Avanzado)</option>
                <option value="600 Mbps">600 Mbps (Corporativo)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Precio Mensual (S/.)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ej. 85" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors">
              💾 Guardar en Catálogo Comercial
            </button>
          </div>
        </form>
      )}

      {/* Tabla Principal CRUD (Read / Update / Delete) */}
      <div className="bg-gray-950/40 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 border-b border-gray-800 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="py-3 px-4">RUC</th>
                <th className="py-3 px-4">Proveedor / Empresa</th>
                <th className="py-3 px-4">Plan Ofertado</th>
                <th className="py-3 px-4">Cobertura</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900 text-xs">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/20 transition-colors">
                  {/* RUC */}
                  <td className="py-3 px-4 font-mono text-gray-400">{p.ruc}</td>
                  
                  {/* Proveedor */}
                  <td className="py-3 px-4 font-bold text-white">{p.businessName}</td>
                  
                  {/* Plan y Costo */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-blue-400">{p.planName} <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono ml-1">{p.speed}</span></div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">S/. {p.price.toFixed(2)}/mes</div>
                  </td>
                  
                  {/* Zona */}
                  <td className="py-3 px-4 text-gray-300">{p.coverageZone}</td>
                  
                  {/* Estado Badge */}
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Activo' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' : 'bg-red-950 text-red-400 border border-red-800/30'}`}>
                      {p.status}
                    </span>
                  </td>
                  
                  {/* Acciones del CRUD (Update Status / Delete) */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <button 
                      onClick={() => toggleProviderStatus(p.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors border ${
                        p.status === 'Activo' 
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/50' 
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50'
                      }`}
                    >
                      {p.status === 'Activo' ? 'Suspender' : 'Activar'}
                    </button>
                    <button 
                      onClick={() => handleDeleteProvider(p.id)}
                      className="bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/50 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {providers.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500">
            No hay planes ni proveedores registrados en el catálogo comercial. Usa el botón superior para agregar uno.
          </div>
        )}
      </div>
    </div>
  );
}