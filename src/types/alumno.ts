export type Grado = 
  | 'blanco'
  | 'blanco-amarillo'
  | 'amarillo'
  | 'naranjo'
  | 'azul'
  | 'verde'
  | 'morado'
  | 'negro';

export interface Alumno {
  id: string;
  avatar?: string;
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  grado: Grado;
  fechaUltimoAscenso: string;
  telefonoContacto: string;
  emailContacto: string;
  nombreContacto: string;
  direccion: string;
  fechaNacimiento: string;
  notas?: string;
  activo: boolean;
}

export const grados: { value: Grado; label: string; color: string }[] = [
  { value: 'blanco', label: 'Blanco', color: 'bg-white border-gray-300' },
  { value: 'blanco-amarillo', label: 'Blanco Amarillo', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'amarillo', label: 'Amarillo', color: 'bg-yellow-200 border-yellow-300' },
  { value: 'naranjo', label: 'Naranjo', color: 'bg-orange-200 border-orange-300' },
  { value: 'azul', label: 'Azul', color: 'bg-blue-200 border-blue-300' },
  { value: 'verde', label: 'Verde', color: 'bg-green-200 border-green-300' },
  { value: 'morado', label: 'Morado', color: 'bg-purple-200 border-purple-300' },
  { value: 'negro', label: 'Negro', color: 'bg-gray-800 border-gray-900 text-white' },
];

