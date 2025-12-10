import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import type { Alumno, Grado } from '../types/alumno';
import { grados } from '../types/alumno';
import { alumnoService } from '../services';
import { validateRut, formatRut, cleanRut } from '../utils/rutValidator';

const alumnoSchema = z.object({
  rut: z.string()
    .min(1, 'RUT es requerido')
    .refine((rut) => validateRut(rut), {
      message: 'RUT inválido. Verifique el formato y dígito verificador',
    }),
  nombres: z.string().min(2, 'Nombres es requerido'),
  apellidoPaterno: z.string().min(2, 'Apellido paterno es requerido'),
  apellidoMaterno: z.string().min(2, 'Apellido materno es requerido'),
  grado: z.enum(['blanco', 'blanco-amarillo', 'amarillo', 'naranjo', 'azul', 'verde', 'morado', 'negro']),
  fechaUltimoAscenso: z.string().min(1, 'Fecha de último ascenso es requerida'),
  telefonoContacto: z.string().min(1, 'Teléfono de contacto es requerido'),
  emailContacto: z.string().email('Email inválido').min(1, 'Email de contacto es requerido'),
  nombreContacto: z.string().min(2, 'Nombre del contacto es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),
  notas: z.string().optional(),
});

type AlumnoFormData = z.infer<typeof alumnoSchema>;

const ITEMS_PER_PAGE = 8;

export default function Alumnos() {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alumnoToToggle, setAlumnoToToggle] = useState<Alumno | null>(null);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar alumnos al montar el componente
  useEffect(() => {
    loadAlumnos();
  }, []);

  const loadAlumnos = async () => {
    try {
      setLoading(true);
      const data = await alumnoService.getAllAlumnos();
      setAlumnos(data);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AlumnoFormData>({
    resolver: zodResolver(alumnoSchema),
  });

  // Calcular paginación
  const filteredAlumnos = alumnos.filter((alumno) => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const fullName = `${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`.toLowerCase();
    const rut = cleanRut(alumno.rut).toLowerCase();
    
    return (
      fullName.includes(search) ||
      rut.includes(search) ||
      alumno.rut.toLowerCase().includes(search)
    );
  });
  
  const totalPages = Math.ceil(filteredAlumnos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAlumnos = filteredAlumnos.slice(startIndex, endIndex);

  const handleOpenModal = (alumno?: Alumno) => {
    if (alumno) {
      setEditingAlumno(alumno);
      setAvatarPreview(alumno.avatar || null);
      reset({
        rut: alumno.rut,
        nombres: alumno.nombres,
        apellidoPaterno: alumno.apellidoPaterno,
        apellidoMaterno: alumno.apellidoMaterno,
        grado: alumno.grado,
        fechaUltimoAscenso: alumno.fechaUltimoAscenso,
        telefonoContacto: alumno.telefonoContacto,
        emailContacto: alumno.emailContacto,
        nombreContacto: alumno.nombreContacto,
        direccion: alumno.direccion,
        fechaNacimiento: alumno.fechaNacimiento,
        notas: alumno.notas || '',
      });
    } else {
      setEditingAlumno(null);
      setAvatarPreview(null);
      reset({
        rut: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        grado: 'blanco',
        fechaUltimoAscenso: '',
        telefonoContacto: '',
        emailContacto: '',
        nombreContacto: '',
        direccion: '',
        fechaNacimiento: '',
        notas: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAlumno(null);
    setAvatarPreview(null);
    reset();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AlumnoFormData) => {
    try {
      // Formatear RUT antes de guardar
      const formattedData = {
        ...data,
        rut: formatRut(data.rut),
      };

      if (editingAlumno) {
        // Actualizar alumno existente
        await alumnoService.updateAlumno(editingAlumno.id, {
          ...formattedData,
          avatar: avatarPreview || editingAlumno.avatar,
        });
        toast.success('Alumno actualizado exitosamente');
      } else {
        // Crear nuevo alumno
        await alumnoService.createAlumno({
          ...formattedData,
          avatar: avatarPreview || undefined,
          activo: true, // Por defecto activo
        });
        toast.success('Alumno creado exitosamente');
      }
      await loadAlumnos(); // Recargar la lista
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar alumno:', error);
      toast.error('Error al guardar el alumno');
    }
  };

  const handleToggleActivo = (alumno: Alumno) => {
    setAlumnoToToggle(alumno);
    setShowConfirmModal(true);
  };

  const confirmToggleActivo = async () => {
    if (!alumnoToToggle) return;

    try {
      await alumnoService.toggleActivo(alumnoToToggle.id);
      await loadAlumnos(); // Recargar la lista
      toast.success(
        alumnoToToggle.activo
          ? 'Alumno deshabilitado exitosamente'
          : 'Alumno habilitado exitosamente'
      );
      setShowConfirmModal(false);
      setAlumnoToToggle(null);
    } catch (error) {
      console.error('Error al cambiar estado del alumno:', error);
      toast.error('Error al cambiar el estado del alumno');
    }
  };

  const cancelToggleActivo = () => {
    setShowConfirmModal(false);
    setAlumnoToToggle(null);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/mantenedores/alumnos/${id}`);
  };

  const getGradoColor = (grado: Grado) => {
    return grados.find((g) => g.value === grado)?.color || 'bg-gray-100';
  };

  const getGradoLabel = (grado: Grado) => {
    return grados.find((g) => g.value === grado)?.label || grado;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumnos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona la información de los alumnos ({filteredAlumnos.length} de {alumnos.length} total)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Alumno</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resetear a página 1 al buscar
            }}
            placeholder="Buscar por nombre, apellido o RUT..."
            className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando alumnos...</p>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay alumnos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando un nuevo alumno al sistema.
            </p>
            <div className="mt-6">
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nuevo Alumno
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avatar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      RUT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Apellido Paterno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Apellido Materno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Último Ascenso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentAlumnos.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !alumno.activo ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleViewDetail(alumno.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          {alumno.avatar ? (
                            <img
                              src={alumno.avatar}
                              alt={`${alumno.nombres} ${alumno.apellidoPaterno}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                              {alumno.nombres.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {alumno.rut}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{alumno.nombres}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {alumno.apellidoPaterno}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {alumno.apellidoMaterno}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getGradoColor(
                            alumno.grado
                          )}`}
                        >
                          {getGradoLabel(alumno.grado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(alumno.fechaUltimoAscenso).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            alumno.activo
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {alumno.activo ? 'Activo' : 'Deshabilitado'}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(alumno)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActivo(alumno)}
                            className={`${
                              alumno.activo
                                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300'
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                            }`}
                            title={alumno.activo ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {alumno.activo ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredAlumnos.length)}
                      </span>{' '}
                      de <span className="font-medium">{filteredAlumnos.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-primary-50 dark:bg-primary-900/30 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Formulario - Mantener el mismo código del modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Resto del formulario igual que antes */}
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                        {watch('nombres')?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Foto de Perfil
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Haz clic en el ícono para cambiar la foto (máx. 2MB)
                  </p>
                </div>
              </div>

              {/* Primera fila: RUT, Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RUT *
                  </label>
                  <input
                    type="text"
                    {...register('rut', {
                      onChange: (e) => {
                        // Auto-formatear RUT mientras escribe
                        const formatted = formatRut(e.target.value);
                        e.target.value = formatted;
                      }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="12.345.678-9"
                    maxLength={12}
                  />
                  {errors.rut && (
                    <p className="mt-1 text-sm text-red-600">{errors.rut.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Formato: 12.345.678-9 o 12345678-9
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    {...register('nombres')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="Juan"
                  />
                  {errors.nombres && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombres.message}</p>
                  )}
                </div>
              </div>

              {/* Segunda fila: Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    {...register('apellidoPaterno')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="Pérez"
                  />
                  {errors.apellidoPaterno && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellidoPaterno.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apellido Materno *
                  </label>
                  <input
                    type="text"
                    {...register('apellidoMaterno')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="González"
                  />
                  {errors.apellidoMaterno && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellidoMaterno.message}</p>
                  )}
                </div>
              </div>

              {/* Tercera fila: Grado, Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grado *
                  </label>
                  <select
                    {...register('grado')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  >
                    {grados.map((grado) => (
                      <option key={grado.value} value={grado.value}>
                        {grado.label}
                      </option>
                    ))}
                  </select>
                  {errors.grado && (
                    <p className="mt-1 text-sm text-red-600">{errors.grado.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    {...register('fechaNacimiento')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                  {errors.fechaNacimiento && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha Último Ascenso *
                  </label>
                  <input
                    type="date"
                    {...register('fechaUltimoAscenso')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                  {errors.fechaUltimoAscenso && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fechaUltimoAscenso.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cuarta fila: Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Contacto *
                  </label>
                  <input
                    type="text"
                    {...register('nombreContacto')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="María Pérez"
                  />
                  {errors.nombreContacto && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombreContacto.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    {...register('telefonoContacto')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="+56 9 1234 5678"
                  />
                  {errors.telefonoContacto && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefonoContacto.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    {...register('emailContacto')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="contacto@email.com"
                  />
                  {errors.emailContacto && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailContacto.message}</p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  {...register('direccion')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="Calle Principal 123, Comuna, Ciudad"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas y Progreso
                </label>
                <textarea
                  {...register('notas')}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Registra notas sobre el progreso del alumno, observaciones, logros, etc..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-semibold"
                >
                  {editingAlumno ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && alumnoToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {alumnoToToggle.activo ? 'Deshabilitar Alumno' : 'Habilitar Alumno'}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              {alumnoToToggle.activo ? (
                <>
                  ¿Está seguro que desea deshabilitar a{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alumnoToToggle.nombres} {alumnoToToggle.apellidoPaterno}
                  </span>
                  ? El alumno no aparecerá en la lista de activos.
                </>
              ) : (
                <>
                  ¿Está seguro que desea habilitar a{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alumnoToToggle.nombres} {alumnoToToggle.apellidoPaterno}
                  </span>
                  ?
                </>
              )}
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelToggleActivo}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggleActivo}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  alumnoToToggle.activo
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {alumnoToToggle.activo ? 'Deshabilitar' : 'Habilitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
