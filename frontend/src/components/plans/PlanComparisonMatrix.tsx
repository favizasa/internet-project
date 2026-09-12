import React, { useState } from 'react';

// Estructura de TypeScript para el tipado de los planes
interface Plan {
  id: number;
  wisp: string;
  nombre: string;
  velocidad: string;
  precio: number;
  mensualidad: number;
  tecnologia: string;
  soporte: string;
  cobertura: string;
  beneficios: string[];
}

interface PlanComparisonMatrixProps {
  // Recibe la función de navegación optimizada que creamos en App.tsx
  onNavigate: (view: string, planData?: { nombre: string; wisp: string; mensualidad: number }) => void;
}

export default function PlanComparisonMatrix({ onNavigate }: PlanComparisonMatrixProps) {
  // Lista de planes basada en tu matriz de comparación
  const planes: Plan[] = [
    {
      id: 1,
      wisp: 'WIN',
      nombre: 'Fibra Hogar Alta Velocidad',
      velocidad: '200 Mbps',
      precio: 79,
      mensualidad: 79,
      tecnologia: 'Fibra Óptica (FTTH) Simétrica',
      soporte: '24/7 Digital + Técnico en campo 24h',
      cobertura: 'Alta en Ventanilla Alta y Cercanías',
      beneficios: ['Mesh Wi-Fi Gratis por 3 meses', 'Latencia < 10ms para gaming', 'Instalación en 48 horas']
    },
    {
      id: 2,
      wisp: 'Telwing',
      nombre: 'Internet Inalámbrico Prepago',
      velocidad: '50 Mbps',
      precio: 50,
      mensualidad: 50,
      tecnologia: 'Antena Microondas (Inalámbrico WISP)',
      soporte: 'Lunes a Sábado 8am - 8pm',
      cobertura: 'Excelente en Pachacútec (Zonas altas)',
      beneficios: ['Sin contratos forzosos', 'Ideal para zonas sin cableado', 'Bajo costo de instalación']
    },
    {
      id: 3,
      wisp: 'Cable Más',
      nombre: 'Dúo Internet + Cable TV',
      velocidad: '100 Mbps',
      precio: 89,
      mensualidad: 89,
      tecnologia: 'Híbrido Coaxial (HFC)',
      soporte: 'Call Center regular + Soporte Técnico 48h',
      cobertura: 'Urb. Satélite y Mi Perú',
      beneficios: ['80 canales HD incluidos', 'Router básico incluido', 'Descuento el primer mes']
    }
  ];

  // Estados para filtros interactivos
  const [wispFiltro, setWispFiltro] = useState<string>('TODOS');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Filtrado lógico de los planes
  const planesFiltrados = planes.filter(plan => {
    if (wispFiltro !== 'TODOS' && plan.wisp !== wispFiltro) return false;
    return true;
  });

  return (
    <div className="w-full space-y-6">
      
      {/* SECCIÓN DE FILTROS INTERACTIVOS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Matriz de Comparación</h3>
          <p className="text-xs text-gray-400 mt-0.5">Compara y selecciona los mejores proveedores locales en Ventanilla y Pachacútec.</p>
        </div>
        
        {/* Botones selectores de WISP */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['TODOS', 'WIN', 'Telwing', 'Cable Más'].map((prov) => (
            <button
              key={prov}
              onClick={() => setWispFiltro(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                wispFiltro === prov 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-slate-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {prov === 'TODOS' ? '🌐 Todos' : prov}
            </button>
          ))}
        </div>
      </div>

      {/* REJILLA DE TARJETAS DE PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planesFiltrados.map((plan) => (
          <div 
            key={plan.id}
            className="bg-slate-900/40 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden group"
          >
            {/* Tag del Proveedor */}
            <div className="absolute top-0 right-0 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl border-l border-b border-blue-900/40">
              {plan.wisp}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{plan.tecnologia.split(' ')[0]}</p>
              <h4 className="text-lg font-black text-white mt-1 group-hover:text-blue-400 transition-colors">{plan.nombre}</h4>
              
              {/* Contenedor de Precio y Velocidad */}
              <div className="my-5 flex items-baseline justify-between bg-slate-950/60 p-3 rounded-xl border border-gray-800/60">
                <div>
                  <span className="text-2xl font-black text-white">S/. {plan.precio}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">/ mes</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 block">{plan.velocidad}</span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Velocidad</span>
                </div>
              </div>

              {/* Características Rápidas */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-xs text-gray-300">
                  <span className="text-blue-500 mr-2">📍</span> 
                  <span className="truncate">{plan.cobertura}</span>
                </li>
                <li className="flex items-center text-xs text-gray-300">
                  <span className="text-emerald-500 mr-2">⚡</span> 
                  <span>Fibra Simétrica o Inalámbrico</span>
                </li>
              </ul>
            </div>

            {/* BOTÓN INTERACTIVO PARA VER DETALLES */}
            <button
              onClick={() => setSelectedPlan(plan)}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white border border-gray-800 hover:border-gray-700 font-bold p-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Ver Detalles del Plan
            </button>
          </div>
        ))}
      </div>

      {/* 🔴 MODAL DETALLADO CON ACCIÓN DE REDIRECCIÓN */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            
            {/* Botón Cerrar X */}
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer font-bold text-sm"
            >
              ✕
            </button>

            {/* Cabecera del Plan */}
            <div className="mb-4">
              <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-blue-900/50">
                PROVEEDOR: {selectedPlan.wisp}
              </span>
              <h3 className="text-xl font-black text-white tracking-tight mt-2.5">{selectedPlan.nombre}</h3>
            </div>

            {/* Detalles Técnicos */}
            <div className="space-y-4 my-5 bg-slate-950/70 p-4 rounded-xl border border-gray-800">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-800/80 pb-3">
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Costo Mensual</p>
                  <p className="text-base font-black text-white">S/. {selectedPlan.mensualidad}.00</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ancho de Banda</p>
                  <p className="text-base font-black text-emerald-400">{selectedPlan.velocidad}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-gray-400 block mb-0.5">Tecnología de Red:</span>
                  <p className="text-gray-200">{selectedPlan.tecnologia}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block mb-0.5">Soporte y Garantía:</span>
                  <p className="text-gray-200">{selectedPlan.soporte}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block mb-0.5">Cobertura Operativa:</span>
                  <p className="text-gray-200">{selectedPlan.cobertura}</p>
                </div>
              </div>

              {/* Lista de Beneficios */}
              <div className="pt-2 border-t border-gray-800/80">
                <span className="font-bold text-gray-400 block mb-1.5 text-xs">Beneficios Adicionales:</span>
                <div className="space-y-1.5">
                  {selectedPlan.beneficios.map((ben, i) => (
                    <p key={i} className="text-xs text-gray-300 flex items-center">
                      <span className="text-blue-500 mr-2">✓</span> {ben}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* 🚀 BOTÓN CLAVE: Envía los datos y hace el salto de pantalla */}
            <div className="space-y-2">
              <button 
                onClick={() => {
                  const planParaEnviar = {
                    nombre: selectedPlan.nombre,
                    wisp: selectedPlan.wisp,
                    mensualidad: selectedPlan.mensualidad
                  };
                  setSelectedPlan(null); // Cierra el modal primero
                  onNavigate('solicitud', planParaEnviar); // Dispara la inyección de datos y redirección en App.tsx
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black p-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-wider cursor-pointer"
              >
                Solicitar Instalación Ahora
              </button>
              
              <button 
                onClick={() => setSelectedPlan(null)}
                className="w-full bg-transparent hover:bg-slate-800 text-gray-400 hover:text-white font-bold p-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Volver al catálogo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}