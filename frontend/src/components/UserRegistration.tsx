import React, { useState } from 'react';
import { authApi } from '../api';

interface UserRegistrationProps {
  onNavigateToLogin: () => void;
}

export default function UserRegistration({ onNavigateToLogin }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    docType: 'DNI',
    docNumber: '',
    celular: '',
    email: '',
    password: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Flujo Alterno A2: campos obligatorios vacíos
    if (!formData.fullName || !formData.docNumber || !formData.email || !formData.password) {
      setStatus('error');
      setMessage('Complete los campos requeridos con el formato correcto.');
      return;
    }

    setStatus('loading');
    setMessage('Procesando datos y encriptando credenciales...');

    try {
      await authApi.registrar({
        nombre: formData.fullName,
        tipoDocumento: formData.docType,
        numeroDocumento: formData.docNumber,
        celular: formData.celular,
        correo: formData.email,
        password: formData.password,
      });

      setStatus('success');
      setMessage('¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => onNavigateToLogin(), 1800);
    } catch (err) {
      // Flujo Alterno A1: usuario duplicado (o cualquier error del backend)
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'No se pudo completar el registro.');
    }
  };

  const bloqueado = status === 'loading' || status === 'success';

  return (
    <div className="p-8 max-w-xl mx-auto mt-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-black text-white mb-2">Registro Único</h2>
      <p className="text-sm text-gray-400 mb-6">
        Formulario estructurado verticalmente para residentes y negocios de Pachacútec.
      </p>

      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-semibold">
          ⚠️ {message}
        </div>
      )}
      {status === 'success' && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm font-semibold">
          ✅ {message}
        </div>
      )}
      {status === 'loading' && (
        <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg text-blue-200 text-sm font-semibold animate-pulse">
          ⏳ {message}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Nombre Completo / Razón Social
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={bloqueado}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Ej. Juan Pérez o Wisp del Norte"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Tipo Documento
            </label>
            <select
              name="docType"
              value={formData.docType}
              onChange={handleChange}
              disabled={bloqueado}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="DNI">DNI</option>
              <option value="Carnet de Extranjería">Carnet de Extranjería</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Número de Documento
            </label>
            <input
              type="text"
              name="docNumber"
              value={formData.docNumber}
              onChange={handleChange}
              disabled={bloqueado}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="12345678"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Celular
          </label>
          <input
            type="text"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            disabled={bloqueado}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="9XXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={bloqueado}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="usuario@pachanet.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={bloqueado}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={bloqueado}
          className="w-full bg-blue-600 hover:bg-blue-700 font-bold p-3 rounded-lg text-white transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
    </div>
  );
}
