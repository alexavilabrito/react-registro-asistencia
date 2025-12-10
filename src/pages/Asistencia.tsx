import { useState, useEffect } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { alumnoService } from '../services/alumnoService';
import { asistenciaService } from '../services/asistenciaService';
import type { Alumno } from '../types/alumno';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClasesAsistencia {
  clase1: boolean;
  clase2: boolean;
  clase3: boolean;
  claseKata: boolean;
  claseShiai: boolean;
}

interface AlumnoConAsistencia extends Alumno {
  presente: boolean;
  clases: ClasesAsistencia;
  observaciones: string;
  ultimaAsistencia?: string;
}

export default function Asistencia() {
  const [todosAlumnos, setTodosAlumnos] = useState<Alumno[]>([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<AlumnoConAsistencia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAlumnos();
  }, []);

  const loadAlumnos = async () => {
    try {
      const data = await alumnoService.getAllAlumnos();
      setTodosAlumnos(data.filter(a => a.activo));
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      alert('Error al cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const getUltimaAsistencia = async (alumnoId: string): Promise<string> => {
    try {
      const asistencias = await asistenciaService.getAsistenciaByAlumno(alumnoId);
      if (asistencias.length === 0) return 'Sin registros';
      
      const ultimaAsistencia = asistencias.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )[0];
      
      return new Date(ultimaAsistencia.fecha).toLocaleDateString('es-CL');
    } catch (error) {
      return 'Sin registros';
    }
  };

  const agregarAlumno = async (alumno: Alumno) => {
    // Verificar si ya está en la lista
    if (alumnosSeleccionados.find(a => a.id === alumno.id)) {
      alert('El alumno ya está en la lista');
      return;
    }

    const ultimaAsistencia = await getUltimaAsistencia(alumno.id);
    
    const alumnoConAsistencia: AlumnoConAsistencia = {
      ...alumno,
      presente: false,
      clases: {
        clase1: false,
        clase2: false,
        clase3: false,
        claseKata: false,
        claseShiai: false
      },
      observaciones: '',
      ultimaAsistencia
    };

    setAlumnosSeleccionados([...alumnosSeleccionados, alumnoConAsistencia]);
    setSearchTerm('');
  };

  const removerAlumno = (id: string) => {
    setAlumnosSeleccionados(alumnosSeleccionados.filter(a => a.id !== id));
  };

  const togglePresente = (id: string) => {
    setAlumnosSeleccionados(alumnosSeleccionados.map(a =>
      a.id === id ? { ...a, presente: !a.presente } : a
    ));
  };

  const toggleClase = (id: string, clase: keyof ClasesAsistencia) => {
    setAlumnosSeleccionados(alumnosSeleccionados.map(a =>
      a.id === id ? { 
        ...a, 
        clases: { ...a.clases, [clase]: !a.clases[clase] },
        presente: true // Auto marcar como presente si selecciona alguna clase
      } : a
    ));
  };

  const updateObservaciones = (id: string, observaciones: string) => {
    setAlumnosSeleccionados(alumnosSeleccionados.map(a =>
      a.id === id ? { ...a, observaciones } : a
    ));
  };

  const handleGuardar = async () => {
    if (alumnosSeleccionados.length === 0) {
      alert('No hay alumnos en la lista para guardar');
      return;
    }

    setSaving(true);
    try {
      for (const alumno of alumnosSeleccionados) {
        await asistenciaService.createAsistencia({
          alumnoId: alumno.id,
          fecha,
          presente: alumno.presente,
          justificado: false,
          clases: alumno.clases,
          observaciones: alumno.observaciones || (alumno.presente ? 'Asistencia normal' : 'No asistió')
        });
      }
      
      alert('Asistencia guardada exitosamente');
      setAlumnosSeleccionados([]);
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error al guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  const alumnosFiltrados = todosAlumnos.filter(alumno =>
    `${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.rut}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const calcularResumen = () => {
    const presentes = alumnosSeleccionados.filter(a => a.presente).length;
    const ausentes = alumnosSeleccionados.filter(a => !a.presente).length;
    
    // Contar total de clases marcadas
    let totalClases = 0;
    alumnosSeleccionados.forEach(alumno => {
      if (alumno.clases.clase1) totalClases++;
      if (alumno.clases.clase2) totalClases++;
      if (alumno.clases.clase3) totalClases++;
      if (alumno.clases.claseKata) totalClases++;
      if (alumno.clases.claseShiai) totalClases++;
    });
    
    return { presentes, ausentes, total: alumnosSeleccionados.length, totalClases };
  };

  const resumen = calcularResumen();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registro de Asistencia</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Busca alumnos, marca su asistencia y guarda la información</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buscador de Alumnos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buscar Alumnos</h2>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, RUT..."
                  className="pl-11"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1 top-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {searchTerm && alumnosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  {alumnosFiltrados.slice(0, 10).map((alumno) => (
                    <button
                      key={alumno.id}
                      onClick={() => agregarAlumno(alumno)}
                      className="w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 text-left"
                    >
                      <div className="h-10 w-10 flex-shrink-0">
                        {alumno.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={alumno.avatar}
                            alt={`${alumno.nombres} ${alumno.apellidoPaterno}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                              {alumno.nombres[0]}{alumno.apellidoPaterno[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {alumno.nombres} {alumno.apellidoPaterno}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {alumno.rut} • Cinturón {alumno.grado}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-primary-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista de Alumnos Seleccionados */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alumnos en Clase ({alumnosSeleccionados.length})
              </h2>
              <Button
                onClick={handleGuardar}
                disabled={saving || alumnosSeleccionados.length === 0}
                className="flex items-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>{saving ? 'Guardando...' : 'Guardar Asistencia'}</span>
              </Button>
            </div>

            {alumnosSeleccionados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No hay alumnos en la lista</p>
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">Busca y agrega alumnos para registrar su asistencia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alumnosSeleccionados.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={alumno.presente}
                            onChange={() => togglePresente(alumno.id)}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </div>

                        {/* Avatar e Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 flex-shrink-0">
                                {alumno.avatar ? (
                                  <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    src={alumno.avatar}
                                    alt={`${alumno.nombres} ${alumno.apellidoPaterno}`}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    <span className="text-primary-700 dark:text-primary-300 font-semibold">
                                      {alumno.nombres[0]}{alumno.apellidoPaterno[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {alumno.nombres} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{alumno.rut}</p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerAlumno(alumno.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>

                          {/* Información Adicional */}
                          <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Grado:</span>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${alumno.grado === 'blanco' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                    alumno.grado === 'blanco-amarillo' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    alumno.grado === 'amarillo' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' :
                                    alumno.grado === 'naranjo' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    alumno.grado === 'azul' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    alumno.grado === 'verde' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    alumno.grado === 'morado' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                  }`}>
                                  {alumno.grado}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Última asistencia:</span>
                              <p className="mt-1 text-gray-900 dark:text-white font-medium">{alumno.ultimaAsistencia}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                              <p className={`mt-1 font-medium ${alumno.presente ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {alumno.presente ? '✓ Presente' : '— Sin marcar'}
                              </p>
                            </div>
                          </div>

                          {/* Checkboxes de Clases */}
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Clases del Día:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alumno.clases.clase1}
                                  onChange={() => toggleClase(alumno.id, 'clase1')}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Clase 1</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alumno.clases.clase2}
                                  onChange={() => toggleClase(alumno.id, 'clase2')}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Clase 2</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alumno.clases.clase3}
                                  onChange={() => toggleClase(alumno.id, 'clase3')}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Clase 3</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alumno.clases.claseKata}
                                  onChange={() => toggleClase(alumno.id, 'claseKata')}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Clase Kata</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alumno.clases.claseShiai}
                                  onChange={() => toggleClase(alumno.id, 'claseShiai')}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Clase Shiai</span>
                              </label>
                            </div>
                          </div>

                          {/* Observaciones */}
                          <div className="mt-3">
                            <Input
                              type="text"
                              value={alumno.observaciones}
                              onChange={(e) => updateObservaciones(alumno.id, e.target.value)}
                              placeholder="Observaciones adicionales..."
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total en Clase</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-500">{resumen.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Presentes</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-500">{resumen.presentes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sin Marcar</span>
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-500">{resumen.ausentes}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Clases</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">{resumen.totalClases}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Clase</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alumnos Activos</Label>
                <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                  {todosAlumnos.length} alumnos
                </div>
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">¿Cómo usar?</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Busca alumnos por nombre o RUT</li>
                  <li>• Marca el checkbox si asistió a clase</li>
                  <li>• Agrega observaciones si es necesario</li>
                  <li>• Guarda para registrar la asistencia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

