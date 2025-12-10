import { ApiService } from './api';
import type { Alumno } from '../types/alumno';
import alumnosData from '../data/alumnos.json';

class AlumnoService {
  private readonly ALUMNOS_KEY = 'alumnos';

  async initializeAlumnos(): Promise<void> {
    await ApiService.initializeData(this.ALUMNOS_KEY, alumnosData);
  }

  async getAllAlumnos(): Promise<Alumno[]> {
    await this.initializeAlumnos();
    return await ApiService.readData<Alumno[]>(this.ALUMNOS_KEY);
  }

  async getAlumnoById(id: string): Promise<Alumno | null> {
    const alumnos = await this.getAllAlumnos();
    return alumnos.find((a) => a.id === id) || null;
  }

  async createAlumno(alumno: Omit<Alumno, 'id'>): Promise<Alumno> {
    const alumnos = await this.getAllAlumnos();
    const newAlumno: Alumno = {
      ...alumno,
      id: Date.now().toString(),
      activo: alumno.activo !== undefined ? alumno.activo : true,
    };

    alumnos.push(newAlumno);
    await ApiService.saveData(this.ALUMNOS_KEY, alumnos);
    return newAlumno;
  }

  async updateAlumno(id: string, updates: Partial<Alumno>): Promise<Alumno> {
    const alumnos = await this.getAllAlumnos();
    const index = alumnos.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Alumno no encontrado');
    }

    alumnos[index] = { ...alumnos[index], ...updates };
    await ApiService.saveData(this.ALUMNOS_KEY, alumnos);
    return alumnos[index];
  }

  async deleteAlumno(id: string): Promise<void> {
    const alumnos = await this.getAllAlumnos();
    const filtered = alumnos.filter((a) => a.id !== id);
    await ApiService.saveData(this.ALUMNOS_KEY, filtered);
  }

  async toggleActivo(id: string): Promise<Alumno> {
    const alumno = await this.getAlumnoById(id);
    if (!alumno) {
      throw new Error('Alumno no encontrado');
    }
    return await this.updateAlumno(id, { activo: !alumno.activo });
  }

  async getAlumnosActivos(): Promise<Alumno[]> {
    const alumnos = await this.getAllAlumnos();
    return alumnos.filter((a) => a.activo);
  }

  async searchAlumnos(query: string): Promise<Alumno[]> {
    const alumnos = await this.getAllAlumnos();
    const lowerQuery = query.toLowerCase();
    return alumnos.filter(
      (a) =>
        a.nombres.toLowerCase().includes(lowerQuery) ||
        a.apellidoPaterno.toLowerCase().includes(lowerQuery) ||
        a.apellidoMaterno.toLowerCase().includes(lowerQuery) ||
        a.rut.includes(query)
    );
  }
}

export const alumnoService = new AlumnoService();

