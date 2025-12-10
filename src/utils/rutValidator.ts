/**
 * Formatea un RUT chileno con puntos y guión
 * Ejemplo: 12345678-9 -> 12.345.678-9
 */
export function formatRut(rut: string): string {
  // Eliminar puntos y guiones
  const cleanRut = rut.replace(/[.-]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  // Separar número y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Formatear con puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
}

/**
 * Limpia un RUT eliminando puntos y guiones
 * Ejemplo: 12.345.678-9 -> 123456789
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.-]/g, '');
}

/**
 * Calcula el dígito verificador de un RUT
 */
function calculateDV(rutBody: string): string {
  let sum = 0;
  let multiplier = 2;
  
  // Calcular suma con multiplicadores (de derecha a izquierda)
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const dv = 11 - remainder;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Valida un RUT chileno
 * @param rut RUT a validar (puede incluir puntos y guión)
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar el RUT
  const cleanedRut = cleanRut(rut.trim());
  
  // Verificar longitud (mínimo 7 dígitos + DV, máximo 8 dígitos + DV)
  if (cleanedRut.length < 2 || cleanedRut.length > 9) return false;
  
  // Verificar que solo contenga números y opcionalmente K al final
  if (!/^[0-9]+[0-9K]$/i.test(cleanedRut)) return false;
  
  // Separar cuerpo y DV
  const body = cleanedRut.slice(0, -1);
  const dv = cleanedRut.slice(-1).toUpperCase();
  
  // Verificar que el cuerpo solo tenga números
  if (!/^[0-9]+$/.test(body)) return false;
  
  // Calcular y comparar DV
  const calculatedDV = calculateDV(body);
  
  return dv === calculatedDV;
}

/**
 * Valida el formato de un RUT (con o sin puntos y guión)
 * @param rut RUT a validar
 * @returns true si el formato es válido
 */
export function validateRutFormat(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  // Formatos aceptados:
  // 12345678-9
  // 12.345.678-9
  // 1234567-8
  // 1.234.567-8
  
  const patterns = [
    /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,  // Formato con puntos: 12.345.678-9
    /^\d{7,8}-[\dkK]$/,                // Formato sin puntos: 12345678-9
    /^\d{7,9}$/                        // Solo números: 123456789
  ];
  
  return patterns.some(pattern => pattern.test(rut.trim()));
}

/**
 * Mensaje de error personalizado para RUT inválido
 */
export function getRutErrorMessage(rut: string): string {
  if (!rut || rut.trim() === '') {
    return 'RUT es requerido';
  }
  
  if (!validateRutFormat(rut)) {
    return 'Formato de RUT inválido. Use: 12.345.678-9 o 12345678-9';
  }
  
  if (!validateRut(rut)) {
    return 'RUT inválido. Verifique el dígito verificador';
  }
  
  return 'RUT inválido';
}
