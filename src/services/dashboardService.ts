import { alumnoService } from './alumnoService';
import { asistenciaService } from './asistenciaService';

export interface DashboardStats {
  totalAlumnos: number;
  alumnosActivos: number;
  asistenciasHoy: {
    presentes: number;
    ausentes: number;
    justificados: number;
  };
  promedioAsistencia: number;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const alumnos = await alumnoService.getAllAlumnos();
    const alumnosActivos = await alumnoService.getAlumnosActivos();
    
    const hoy = new Date().toISOString().split('T')[0];
    const resumenHoy = await asistenciaService.getResumenFecha(hoy);

    // Calcular promedio de asistencia (últimos 30 días)
    const fechaHoy = new Date();
    const ultimos30Dias: string[] = [];
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(fechaHoy);
      fecha.setDate(fecha.getDate() - i);
      ultimos30Dias.push(fecha.toISOString().split('T')[0]);
    }

    let totalAsistencias = 0;
    let totalPresentes = 0;

    for (const fecha of ultimos30Dias) {
      const resumen = await asistenciaService.getResumenFecha(fecha);
      totalAsistencias += resumen.total;
      totalPresentes += resumen.presentes;
    }

    const promedioAsistencia =
      totalAsistencias > 0 ? (totalPresentes / totalAsistencias) * 100 : 0;

    return {
      totalAlumnos: alumnos.length,
      alumnosActivos: alumnosActivos.length,
      asistenciasHoy: {
        presentes: resumenHoy.presentes,
        ausentes: resumenHoy.ausentes,
        justificados: resumenHoy.justificados,
      },
      promedioAsistencia: Math.round(promedioAsistencia),
    };
  }

  async getActividadReciente(): Promise<any[]> {
    // En producción, esto vendría de un servicio de actividad/logs
    return [];
  }
}

export const dashboardService = new DashboardService();

