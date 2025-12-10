import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Alumno } from '../types/alumno';
import { grados } from '../types/alumno';

export default function AlumnoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAlumnos = localStorage.getItem('alumnos');
    if (savedAlumnos && id) {
      const alumnos: Alumno[] = JSON.parse(savedAlumnos);
      const foundAlumno = alumnos.find((a) => a.id === id);
      setAlumno(foundAlumno || null);
    }
    setLoading(false);
  }, [id]);

  const getGradoColor = (grado: string) => {
    return grados.find((g) => g.value === grado)?.color || 'bg-gray-100';
  };

  const getGradoLabel = (grado: string) => {
    return grados.find((g) => g.value === grado)?.label || grado;
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Alumno no encontrado
          </h2>
          <button
            onClick={() => navigate('/mantenedores/alumnos')}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Volver a la lista de alumnos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/mantenedores/alumnos')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {alumno.nombres} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Información detallada del alumno
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              alumno.activo
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {alumno.activo ? 'Activo' : 'Deshabilitado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Personales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Datos Personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  RUT
                </label>
                <p className="text-base text-gray-900 dark:text-white">{alumno.rut}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nombres
                </label>
                <p className="text-base text-gray-900 dark:text-white">{alumno.nombres}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Apellido Paterno
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {alumno.apellidoPaterno}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Apellido Materno
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {alumno.apellidoMaterno}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fecha de Nacimiento
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(alumno.fechaNacimiento).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Dirección
                </label>
                <p className="text-base text-gray-900 dark:text-white">{alumno.direccion}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Información de Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nombre del Contacto
                </label>
                <p className="text-base text-gray-900 dark:text-white">{alumno.nombreContacto}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Teléfono de Contacto
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {alumno.telefonoContacto}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email de Contacto
                </label>
                <p className="text-base text-gray-900 dark:text-white">{alumno.emailContacto}</p>
              </div>
            </div>
          </div>

          {/* Notas y Progreso */}
          {alumno.notas && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notas y Progreso
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {alumno.notas}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                {alumno.avatar ? (
                  <img
                    src={alumno.avatar}
                    alt={`${alumno.nombres} ${alumno.apellidoPaterno}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                    {alumno.nombres.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información de Grado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grado</h3>
            <div className="space-y-4">
              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-lg border text-sm font-semibold ${getGradoColor(
                    alumno.grado
                  )}`}
                >
                  {getGradoLabel(alumno.grado)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fecha Último Ascenso
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(alumno.fechaUltimoAscenso).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

