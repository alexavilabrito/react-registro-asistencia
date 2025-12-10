import { ApiService } from './api';
import asistenciaData from '../data/asistencia.json';

export interface Asistencia {
  id: string;
  alumnoId: string;
  fecha: string;
  presente: boolean;
  justificado: boolean;
  clases: {
    clase1: boolean;
    clase2: boolean;
    clase3: boolean;
    claseKata: boolean;
    claseShiai: boolean;
  };
  observaciones?: string;
}

class AsistenciaService {
  private readonly ASISTENCIA_KEY = 'asistencia';

  async initializeAsistencia(): Promise<void> {
    await ApiService.initializeData(this.ASISTENCIA_KEY, asistenciaData);
  }

  async getAllAsistencia(): Promise<Asistencia[]> {
    await this.initializeAsistencia();
    return await ApiService.readData<Asistencia[]>(this.ASISTENCIA_KEY);
  }

  async getAsistenciaByFecha(fecha: string): Promise<Asistencia[]> {
    const asistencia = await this.getAllAsistencia();
    return asistencia.filter((a) => a.fecha === fecha);
  }

  async getAsistenciaByAlumno(alumnoId: string): Promise<Asistencia[]> {
    const asistencia = await this.getAllAsistencia();
    return asistencia.filter((a) => a.alumnoId === alumnoId);
  }

  async createAsistencia(
    asistencia: Omit<Asistencia, 'id'>
  ): Promise<Asistencia> {
    const allAsistencia = await this.getAllAsistencia();
    const newAsistencia: Asistencia = {
      ...asistencia,
      id: Date.now().toString(),
    };

    allAsistencia.push(newAsistencia);
    await ApiService.saveData(this.ASISTENCIA_KEY, allAsistencia);
    return newAsistencia;
  }

  async updateAsistencia(
    id: string,
    updates: Partial<Asistencia>
  ): Promise<Asistencia> {
    const allAsistencia = await this.getAllAsistencia();
    const index = allAsistencia.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Registro de asistencia no encontrado');
    }

    allAsistencia[index] = { ...allAsistencia[index], ...updates };
    await ApiService.saveData(this.ASISTENCIA_KEY, allAsistencia);
    return allAsistencia[index];
  }

  async deleteAsistencia(id: string): Promise<void> {
    const allAsistencia = await this.getAllAsistencia();
    const filtered = allAsistencia.filter((a) => a.id !== id);
    await ApiService.saveData(this.ASISTENCIA_KEY, filtered);
  }

  async getResumenFecha(fecha: string): Promise<{
    presentes: number;
    ausentes: number;
    justificados: number;
    total: number;
  }> {
    const asistencia = await this.getAsistenciaByFecha(fecha);
    const presentes = asistencia.filter((a) => a.presente).length;
    const ausentes = asistencia.filter((a) => !a.presente && !a.justificado).length;
    const justificados = asistencia.filter((a) => !a.presente && a.justificado).length;

    return {
      presentes,
      ausentes,
      justificados,
      total: asistencia.length,
    };
  }

  async registrarAsistenciaMasiva(
    fecha: string,
    registros: { alumnoId: string; presente: boolean; justificado?: boolean }[]
  ): Promise<Asistencia[]> {
    const newRecords: Asistencia[] = registros.map((r) => ({
      id: `${Date.now()}_${r.alumnoId}`,
      alumnoId: r.alumnoId,
      fecha,
      presente: r.presente,
      justificado: r.justificado || false,
      clases: {
        clase1: false,
        clase2: false,
        clase3: false,
        claseKata: false,
        claseShiai: false
      },
      observaciones: r.presente ? 'Asistencia normal' : r.justificado ? 'Ausente justificado' : 'Ausente sin justificación',
    }));

    const allAsistencia = await this.getAllAsistencia();
    allAsistencia.push(...newRecords);
    await ApiService.saveData(this.ASISTENCIA_KEY, allAsistencia);
    return newRecords;
  }
}

export const asistenciaService = new AsistenciaService();

