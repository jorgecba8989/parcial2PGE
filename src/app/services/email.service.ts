import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() {
    console.log('EmailService iniciado - Modo simulación');
  }

  async sendEmail(
    toEmail: string,
    message: string,
    attachmentFile?: File
  ): Promise<boolean> {
    console.log('========================================');
    console.log('📧 SIMULACIÓN DE ENVÍO DE EMAIL');
    console.log('========================================');
    console.log('📨 Destinatario:', toEmail);
    console.log('💬 Mensaje:', message);
    console.log('📅 Fecha de envío:', new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));

    if (attachmentFile) {
      console.log('📎 Archivo adjunto:', attachmentFile.name);
      console.log('📏 Tamaño del archivo:', this.formatFileSize(attachmentFile.size));
      console.log('🗂️ Tipo de archivo:', attachmentFile.type);
    } else {
      console.log('📎 Sin archivo adjunto');
    }

    console.log('========================================');

    // Simular delay de envío de email
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Email enviado exitosamente (simulación)');
        console.log('📬 El email habría sido enviado en un entorno real');
        resolve(true);
      }, 2000); // Simular 2 segundos de delay
    });
  }

  // Función auxiliar para formatear tamaño de archivo
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método para validar configuración - siempre retorna true en simulación
  isConfigured(): boolean {
    console.log('✅ Configuración validada (modo simulación)');
    return true;
  }

  // Método para test de conexión
  async testEmailService(): Promise<boolean> {
    console.log('🧪 Ejecutando test del servicio de email (simulación)');
    return await this.sendEmail(
      'test@ejemplo.com',
      'Prueba de servicio de email - Simulación funcionando correctamente'
    );
  }
}