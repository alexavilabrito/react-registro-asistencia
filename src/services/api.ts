// Servicio base para simular llamadas a API
// En producción, esto se reemplazaría con llamadas HTTP reales

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simular delay de red
const API_DELAY = 500;

export class ApiService {
  // Leer datos de un archivo JSON (simulado)
  static async readData<T>(key: string): Promise<T> {
    await delay(API_DELAY);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return [] as T;
  }

  // Guardar datos en localStorage (simulado)
  static async saveData<T>(key: string, data: T): Promise<T> {
    await delay(API_DELAY);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }

  // Inicializar datos dummy si no existen
  static async initializeData<T>(key: string, defaultData: T): Promise<T> {
    const existing = localStorage.getItem(key);
    if (!existing) {
      await this.saveData(key, defaultData);
      return defaultData;
    }
    return JSON.parse(existing);
  }
}

