# 🧪 Guía de Pruebas - Sistema de Trabajo Inclusivo

## 📋 Descripción

Este documento describe cómo ejecutar y capturar evidencias de las pruebas del sistema, demostrando:
- ✅ **Bucle de eventos/dispatcher**: Angular Zone.js + RxJS Observables
- ✅ **Robustez**: Manejo de errores y liberación de recursos (RAII)
- ✅ **Pruebas**: 3 casos positivos + 3 negativos con evidencia

---

## 🎯 Funcionalidades Principales Probadas

### 1. **Búsqueda y Filtrado de Trabajos**
- Componente: `JobSearchComponent`
- Servicio: `JobsService`
- Tecnologías: Firebase Firestore, RxJS

### 2. **Aplicación a Ofertas de Trabajo**
- Componente: `ApplicationDialogComponent`
- Servicio: `JobsService`
- Validaciones: Email, archivos (PDF/DOC), tamaño

### 3. **Servicio de Accesibilidad por Audio**
- Servicio: `AudioAccessibilityService`
- APIs: Web Audio API, Speech Synthesis API

---

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Usar el Componente de Pruebas (Recomendado)

1. **Agregar el componente al routing** (si no está):
   ```typescript
   // En app-routing.module.ts
   import { TestRunnerComponent } from './test-cases/test-runner.component';

   const routes: Routes = [
     // ... otras rutas
     { path: 'test-runner', component: TestRunnerComponent }
   ];
   ```

2. **Navegar a la ruta**:
   ```
   http://localhost:4200/test-runner
   ```

3. **Ejecutar pruebas**:
   - Click en "Ejecutar Todas las Pruebas"
   - O ejecutar casos individuales
   - Ver resultados en tiempo real
   - Descargar logs con el botón "📥 Descargar Logs"

### Opción 2: Ejecutar Manualmente y Capturar Logs

1. **Abrir la Consola del Navegador** (F12)

2. **Filtrar logs por caso de prueba**:
   - En la consola, buscar: `=== CASO POSITIVO 1 ===`
   - Los logs están formateados con colores y timestamps

3. **Capturar pantalla de la consola**

4. **Exportar logs desde localStorage**:
   ```javascript
   // En la consola del navegador:
   const results = JSON.parse(localStorage.getItem('test_results'));
   console.log(JSON.stringify(results, null, 2));
   ```

---

## ✅ Casos de Prueba POSITIVOS

### **Caso Positivo 1: Búsqueda Exitosa de Trabajos**

**Pasos:**
1. Navegar a la página principal
2. Esperar carga de trabajos desde Firestore
3. Verificar que se muestran trabajos

**Logs Esperados:**
```
=== CASO POSITIVO 1: BÚSQUEDA EXITOSA ===
[2025-10-05 10:30:15] JobsService: Firebase inicializado correctamente
[2025-10-05 10:30:16] JobsService: 5 trabajos obtenidos correctamente
[2025-10-05 10:30:16] Trabajos cargados desde Firestore: 5
✓ RESULTADO: Búsqueda completada exitosamente
```

**Evidencia de RAII:**
- Observable se completa automáticamente
- Recursos de Firestore liberados
- Retry automático configurado (MAX_RETRIES = 2)

---

### **Caso Positivo 2: Aplicación a Trabajo Exitosa**

**Pasos:**
1. Click en "Aplicar" en cualquier trabajo
2. Llenar formulario con email válido
3. Adjuntar archivo PDF/DOC (< 5MB)
4. Enviar aplicación

**Logs Esperados:**
```
=== CASO POSITIVO 2: APLICACIÓN EXITOSA ===
[2025-10-05 10:35:20] Formulario válido - Email: test@example.com
[2025-10-05 10:35:20] Archivo seleccionado correctamente: CV_Juan_Perez.pdf
[2025-10-05 10:35:21] JobsService: Enviando aplicación a trabajo: job123
[2025-10-05 10:35:22] JobsService: Aplicación enviada exitosamente, ID: app456
✓ RESULTADO: Aplicación registrada en base de datos
```

**Evidencia de RAII:**
- Archivo limpiado en `ngOnDestroy`
- FormGroup destruido automáticamente
- Observable completado correctamente

---

### **Caso Positivo 3: Servicio de Audio Funcional**

**Pasos:**
1. Navegar por la aplicación
2. Verificar que se reproducen sonidos
3. Verificar síntesis de voz en español

**Logs Esperados:**
```
=== CASO POSITIVO 3: ACCESIBILIDAD POR AUDIO ===
[2025-10-05 10:40:10] AudioContext inicializado correctamente
[2025-10-05 10:40:10] Preferencia de voz cargada: true
[2025-10-05 10:40:11] Reproduciendo tono: 800Hz, duración: 0.1s, tipo: sine
[2025-10-05 10:40:11] SpeechSynthesis: "Formulario de aplicación abierto"
✓ RESULTADO: Todos los eventos de audio ejecutados sin errores
```

**Evidencia de RAII:**
- Oscillator nodes creados y destruidos automáticamente
- Gain nodes liberados después de uso
- AudioContext permanece en memoria (singleton)

---

## ❌ Casos de Prueba NEGATIVOS

### **Caso Negativo 1: Timeout al Cargar Trabajos**

**Pasos:**
1. Simular conexión lenta (DevTools > Network > Slow 3G)
2. Recargar aplicación
3. Esperar timeout (10 segundos)

**Logs Esperados:**
```
=== CASO NEGATIVO 1: TIMEOUT EN CARGA DE TRABAJOS ===
[2025-10-05 10:45:01] Iniciando carga de trabajos...
[2025-10-05 10:45:11] ⚠️ TimeoutError: Tiempo de espera agotado (10000ms)
[2025-10-05 10:45:11] Usando datos de ejemplo como respaldo
✓ RESULTADO: Timeout manejado correctamente, sistema usa fallback
```

**Evidencia de Robustez:**
- Timeout configurado: `TIMEOUT_MS = 10000`
- Retry automático: `MAX_RETRIES = 2`
- Fallback a datos de ejemplo
- Sistema NO crashea

---

### **Caso Negativo 2: Aplicación con Datos Inválidos**

**Pasos:**
1. Click en "Aplicar"
2. Ingresar email inválido: `correo_sin_arroba.com`
3. Adjuntar archivo ZIP (no permitido)
4. Intentar enviar

**Logs Esperados:**
```
=== CASO NEGATIVO 2: DATOS INVÁLIDOS EN APLICACIÓN ===
[2025-10-05 10:50:05] ❌ Email inválido: "correo_sin_arroba.com"
[2025-10-05 10:50:05] Error en formulario: email destinatario
[2025-10-05 10:50:10] ❌ Tipo de archivo no permitido: application/zip
✓ RESULTADO: Validaciones funcionando, aplicación bloqueada correctamente
```

**Evidencia de Robustez:**
- Validación de email con `Validators.email`
- Validación de tipo de archivo: `['pdf', 'doc', 'docx']`
- Validación de tamaño: `maxSize = 5MB`
- Errores mostrados al usuario

---

### **Caso Negativo 3: Error de Permisos en Firebase**

**Pasos:**
1. Configurar reglas de Firebase para denegar escritura
2. Intentar aplicar a un trabajo
3. Observar error de permisos

**Logs Esperados:**
```
=== CASO NEGATIVO 3: ERROR DE PERMISOS ===
[2025-10-05 10:55:01] ❌ FirebaseError: permission-denied
[2025-10-05 10:55:01] Error code: permission-denied
[2025-10-05 10:55:01] Error retornado: "No tiene permisos para realizar esta acción"
✓ RESULTADO: Error capturado, usuario notificado, sistema permanece estable
```

**Evidencia de Robustez:**
- Error capturado con `catchError`
- Usuario notificado con mensaje amigable
- `isLoading = false` restaurado
- Sistema NO crashea

---

## 📊 Evidencia de Bucle de Eventos y Dispatcher

### **Angular Zone.js**
Angular utiliza Zone.js para interceptar operaciones asíncronas:

```typescript
// Ejemplo en JobsService
return from(getDocs(jobsCollection)).pipe(
  timeout(this.TIMEOUT_MS),  // ← Operación asíncrona manejada por Zone.js
  retry(this.MAX_RETRIES),   // ← Retry automático
  map(snapshot => { ... }),  // ← Transformación en el dispatcher
  catchError(error => { ... }) // ← Manejo de errores
);
```

**Logs de evidencia:**
- Cada operación asíncrona genera logs con timestamps
- Los observables se completan automáticamente
- Zone.js detecta cambios y actualiza la UI

### **RxJS Observables**
RxJS actúa como dispatcher de eventos:

```typescript
// Ejemplo de encadenamiento
this.jobsService.getJobs()  // ← Emisor
  .pipe(
    timeout(10000),           // ← Operador de timeout
    retry(2)                  // ← Operador de retry
  )
  .subscribe({                // ← Suscriptor
    next: (jobs) => { ... },
    error: (err) => { ... }
  });
```

---

## 🛡️ Evidencia de RAII (Resource Acquisition Is Initialization)

### **1. Limpieza de Archivos en Diálogo**
```typescript
// application-dialog.component.ts:45
ngOnDestroy(): void {
  try {
    this.selectedFile = null;  // ← Liberar referencia
    console.log('Recursos liberados correctamente');
  } catch (error) {
    console.error('Error al liberar recursos:', error);
  }
}
```

### **2. Liberación de Observables**
```typescript
// jobs.service.ts:55
ngOnDestroy(): void {
  console.log('Servicio destruido, recursos liberados');
  // RxJS completa automáticamente los observables
}
```

### **3. Timeout y Retry**
```typescript
// jobs.service.ts:70
return from(getDocs(jobsCollection)).pipe(
  timeout(this.TIMEOUT_MS),   // ← Si no responde en 10s, cancela
  retry(this.MAX_RETRIES),    // ← Máximo 2 reintentos
  catchError(error => { ... }) // ← Captura y maneja error
);
```

---

## 📸 Capturas Recomendadas

1. **Consola del navegador** mostrando logs de un caso positivo
2. **Consola del navegador** mostrando logs de un caso negativo
3. **Interfaz del TestRunner** con resultados de todas las pruebas
4. **Archivo de log descargado** (.txt)

---

## 📝 Notas Adicionales

### **Bucle de Eventos en Angular**
- Angular usa Zone.js para interceptar operaciones asíncronas
- Cada suscripción a Observable crea un listener en el bucle de eventos
- Los timeouts y promesas son manejados automáticamente

### **Manejo de Errores**
- Todos los servicios usan `try/catch` para errores síncronos
- Todos los Observables usan `catchError` para errores asíncronos
- Los errores se loguean y se muestran al usuario

### **Liberación de Recursos**
- Componentes implementan `OnDestroy` para limpieza
- Archivos y referencias se limpian explícitamente
- Observables se completan automáticamente

---

## ✅ Checklist de Cumplimiento

- [x] **Bucle de eventos**: Zone.js + RxJS
- [x] **Robustez**: try/catch + catchError + timeout + retry
- [x] **RAII**: ngOnDestroy + limpieza de recursos
- [x] **3 Casos Positivos** con evidencia de logs
- [x] **3 Casos Negativos** con evidencia de logs
- [x] **Sistema de logging** automatizado (`TestLoggerService`)
- [x] **Componente de pruebas** visual (`TestRunnerComponent`)
- [x] **Descarga de logs** en formato .txt

---

## 🎓 Conclusión

Este sistema demuestra:
1. ✅ Uso correcto del **bucle de eventos** de Angular/RxJS
2. ✅ **Robustez** mediante manejo de errores, timeouts y reintentos
3. ✅ **RAII** con limpieza automática de recursos
4. ✅ **6 casos de prueba** documentados con logs completos

Todos los logs están disponibles en:
- Consola del navegador (F12)
- localStorage (`test_results`)
- Archivos descargables (.txt)
