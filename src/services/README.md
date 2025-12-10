# Servicios de la Plataforma

Este directorio contiene todos los servicios que simulan llamadas a una API. Los servicios utilizan datos dummy almacenados en JSON y localStorage para persistencia.

## Estructura

- `api.ts` - Servicio base con funciones comunes para leer/escribir datos
- `authService.ts` - Servicio de autenticación (login, registro, recuperación de contraseña)
- `alumnoService.ts` - Servicio CRUD de alumnos
- `asistenciaService.ts` - Servicio de gestión de asistencia
- `dashboardService.ts` - Servicio para estadísticas del dashboard

## Datos Dummy

Los datos dummy se encuentran en `src/data/`:
- `users.json` - Usuarios del sistema
- `alumnos.json` - Alumnos registrados
- `asistencia.json` - Registros de asistencia

## Uso

### Autenticación

```typescript
import { authService } from './services';

// Login
const { user, token } = await authService.login({
  email: 'admin@plataforma.com',
  password: 'admin123',
  rememberMe: true
});

// Registro
const { user, token } = await authService.register({
  email: 'nuevo@email.com',
  password: 'password123',
  // ... otros campos
});

// Actualizar perfil
const updatedProfile = await authService.updateProfile('email@example.com', {
  firstName: 'Nuevo Nombre',
  avatar: 'base64...'
});
```

### Alumnos

```typescript
import { alumnoService } from './services';

// Obtener todos los alumnos
const alumnos = await alumnoService.getAllAlumnos();

// Obtener alumno por ID
const alumno = await alumnoService.getAlumnoById('1');

// Crear nuevo alumno
const nuevoAlumno = await alumnoService.createAlumno({
  rut: '12.345.678-9',
  nombres: 'Juan',
  // ... otros campos
});

// Actualizar alumno
const updated = await alumnoService.updateAlumno('1', {
  grado: 'azul'
});

// Deshabilitar/Habilitar alumno
const toggled = await alumnoService.toggleActivo('1');
```

### Asistencia

```typescript
import { asistenciaService } from './services';

// Obtener asistencia por fecha
const asistencia = await asistenciaService.getAsistenciaByFecha('2024-04-15');

// Registrar asistencia
const registro = await asistenciaService.createAsistencia({
  alumnoId: '1',
  fecha: '2024-04-15',
  presente: true,
  justificado: false
});

// Obtener resumen del día
const resumen = await asistenciaService.getResumenFecha('2024-04-15');
```

### Dashboard

```typescript
import { dashboardService } from './services';

// Obtener estadísticas
const stats = await dashboardService.getStats();
// Retorna: { totalAlumnos, alumnosActivos, asistenciasHoy, promedioAsistencia }
```

## Notas

- Los servicios simulan un delay de red de 500ms
- Los datos se persisten en localStorage
- En producción, estos servicios se reemplazarían con llamadas HTTP reales a un backend
- Los datos dummy se inicializan automáticamente la primera vez que se usan

