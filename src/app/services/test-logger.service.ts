import { Injectable } from '@angular/core';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  TEST = 'TEST'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TestLoggerService {
  private currentCaseLogs: LogEntry[] = [];
  private allLogs: LogEntry[] = [];
  private testCaseName: string = '';
  private testStartTime: number = 0;

  constructor() {
    console.log('TestLoggerService: Inicializado');
  }

  // Iniciar un caso de prueba
  startTestCase(caseName: string): void {
    this.testCaseName = caseName;
    this.testStartTime = Date.now();
    this.currentCaseLogs = [];

    const separator = '='.repeat(50);
    console.log(`\n${separator}`);
    console.log(`=== ${caseName} ===`);
    console.log(separator);

    this.log(LogLevel.TEST, `Iniciando ${caseName}`, { startTime: this.getTimestamp() });
  }

  // Finalizar un caso de prueba
  endTestCase(success: boolean, details?: string): void {
    const duration = ((Date.now() - this.testStartTime) / 1000).toFixed(2);
    const status = success ? '✓' : '✗';
    const resultMessage = `${status} RESULTADO: ${details || (success ? 'Prueba exitosa' : 'Prueba fallida')} - Duración: ${duration}s`;

    this.log(LogLevel.TEST, resultMessage);

    console.log(`\n${resultMessage}`);
    console.log('='.repeat(50) + '\n');

    // Agregar logs del caso actual a todos los logs
    this.allLogs.push(...this.currentCaseLogs);

    // Guardar en localStorage para persistencia
    this.saveTestResults();
  }

  // Log general
  log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data
    };

    this.currentCaseLogs.push(entry);

    // Formatear para consola con colores
    const prefix = `[${entry.timestamp}]`;
    const logMessage = data ? `${prefix} ${message}` : `${prefix} ${message}`;

    switch (level) {
      case LogLevel.SUCCESS:
        console.log(`%c${logMessage}`, 'color: green; font-weight: bold', data || '');
        break;
      case LogLevel.ERROR:
        console.error(`%c❌ ${logMessage}`, 'color: red; font-weight: bold', data || '');
        break;
      case LogLevel.WARNING:
        console.warn(`%c⚠️ ${logMessage}`, 'color: orange; font-weight: bold', data || '');
        break;
      case LogLevel.TEST:
        console.log(`%c${logMessage}`, 'color: blue; font-weight: bold', data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  // Métodos de conveniencia
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  success(message: string, data?: any): void {
    this.log(LogLevel.SUCCESS, message, data);
  }

  warning(message: string, data?: any): void {
    this.log(LogLevel.WARNING, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  // Obtener todos los logs del caso actual
  getLogs(): LogEntry[] {
    return [...this.currentCaseLogs];
  }

  // Obtener TODOS los logs acumulados
  getAllLogs(): LogEntry[] {
    return [...this.allLogs];
  }

  // Exportar logs del caso actual como texto
  exportLogsAsText(): string {
    let output = `=== ${this.testCaseName} ===\n`;

    this.currentCaseLogs.forEach(entry => {
      output += `[${entry.timestamp}] ${entry.message}\n`;
      if (entry.data) {
        output += `  Datos: ${JSON.stringify(entry.data, null, 2)}\n`;
      }
    });

    return output;
  }

  // Exportar TODOS los logs acumulados como texto
  exportAllLogsAsText(): string {
    const allResults = this.getAllTestResults();
    let output = '='.repeat(70) + '\n';
    output += '         REPORTE COMPLETO DE PRUEBAS - TRABAJO INCLUSIVO\n';
    output += '='.repeat(70) + '\n\n';
    output += `Fecha de generación: ${new Date().toLocaleString()}\n`;
    output += `Total de casos ejecutados: ${allResults.length}\n\n`;

    allResults.forEach((result, index) => {
      output += '='.repeat(70) + '\n';
      output += `CASO ${index + 1}: ${result.caseName}\n`;
      output += `Ejecutado: ${new Date(result.timestamp).toLocaleString()}\n`;
      output += '='.repeat(70) + '\n';

      result.logs.forEach((entry: LogEntry) => {
        output += `[${entry.timestamp}] ${entry.message}\n`;
        if (entry.data) {
          output += `  Datos: ${JSON.stringify(entry.data, null, 2)}\n`;
        }
      });

      output += '\n';
    });

    return output;
  }

  // Guardar resultados en localStorage
  private saveTestResults(): void {
    try {
      const testResults = {
        caseName: this.testCaseName,
        logs: this.currentCaseLogs,
        timestamp: new Date().toISOString()
      };

      const allResults = this.getAllTestResults();
      allResults.push(testResults);

      localStorage.setItem('test_results', JSON.stringify(allResults));
      console.log('Resultados guardados en localStorage');
    } catch (error) {
      console.error('Error al guardar resultados:', error);
    }
  }

  // Obtener todos los resultados de pruebas
  getAllTestResults(): any[] {
    try {
      const stored = localStorage.getItem('test_results');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al leer resultados:', error);
      return [];
    }
  }

  // Limpiar resultados almacenados
  clearTestResults(): void {
    localStorage.removeItem('test_results');
    this.allLogs = [];
    this.currentCaseLogs = [];
    console.log('Resultados de pruebas limpiados');
  }

  // Formatear timestamp
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Descargar logs como archivo (solo caso actual)
  downloadLogs(): void {
    const text = this.exportLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-log-${this.testCaseName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Descargar TODOS los logs acumulados como archivo
  downloadAllLogs(): void {
    const text = this.exportAllLogsAsText();
    const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `reporte-completo-pruebas-${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Reporte completo descargado');
  }
}
