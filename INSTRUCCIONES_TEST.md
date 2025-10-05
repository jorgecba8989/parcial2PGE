# 🧪 Instrucciones para Ejecutar el Test Runner

## 📋 Pasos para Probar

### 1. Asegúrate de que el servidor esté corriendo
```bash
ng serve
```

### 2. Navega a la ruta del Test Runner
Abre tu navegador y ve a:
```
http://localhost:4200/test-runner
```

### 3. ¿Qué deberías ver?

✅ **Pantalla inicial:**
- Título: "🧪 Ejecutor de Pruebas - Trabajo Inclusivo"
- 3 botones arriba: "Ejecutar Todas las Pruebas", "Limpiar Resultados", "📥 Descargar Logs"
- Sección "✅ Casos Positivos" con 3 botones
- Sección "❌ Casos Negativos" con 3 botones
- Caja "📊 Resultados" (vacía con mensaje placeholder)
- Caja "📝 Consola de Logs" (vacía con mensaje placeholder)

### 4. Al hacer click en un botón de prueba

✅ **Deberías ver:**
1. **Banner púrpura animado** arriba con:
   - Spinner girando (círculo blanco que rota)
   - Texto: "🔄 Ejecutando Caso X: [Nombre]..."

2. **En "Resultados"** (después de completarse):
   - Icono ✓ (verde) o ✗ (rojo)
   - Nombre del caso
   - Duración en segundos
   - Detalles del resultado

3. **En "Consola de Logs"**:
   - Logs con formato tipo terminal
   - Timestamps
   - Mensajes del caso de prueba

### 5. ¿No ves nada?

**Verifica lo siguiente:**

#### A. Abre la consola del navegador (F12)
- ¿Hay errores en rojo?
- Copia y pega los errores

#### B. Errores comunes:

**Error: "Cannot find module"**
```bash
# Reinstala dependencias
npm install
```

**Error de compilación de Angular**
```bash
# Recompila
ng serve --force
```

**Error: "Component not declared"**
- Ya lo agregamos al `app.module.ts`, pero verifica que esté ahí

#### C. Prueba navegando manualmente
```
http://localhost:4200/test-runner
```

### 6. Debugging adicional

Si nada funciona, abre el componente directamente:

**Agrega esto temporalmente en `app.component.html`:**
```html
<app-test-runner></app-test-runner>
```

Luego navega a `http://localhost:4200/`

---

## 🎯 Comportamiento Esperado

### Caso 1: Búsqueda Exitosa
- Click → Banner aparece → Llama a Firebase → Muestra resultado
- **Tiempo:** 2-5 segundos

### Caso 2: Aplicación Exitosa
- Click → Banner aparece → Envía aplicación a Firebase → Muestra resultado
- **Tiempo:** 1-3 segundos

### Caso 3: Audio Funcional
- Click → Banner aparece → Reproduce sonidos → Muestra resultado
- **Tiempo:** <1 segundo
- **Deberías escuchar:** Sonidos beep y voz

### Caso 4-6: Casos Negativos
- Click → Banner aparece → Simula error → Muestra resultado
- **Tiempo:** <1 segundo

---

## 📸 Capturas para Evidencia

1. **Pantalla inicial** (sin pruebas ejecutadas)
2. **Durante ejecución** (con banner púrpura visible)
3. **Resultados completos** (después de ejecutar todas)
4. **Consola de logs** (con logs visibles)

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué no veo el spinner?**
R: Puede que la prueba sea muy rápida. El Caso 3 (Audio) es instantáneo.

**P: ¿Por qué la consola está vacía?**
R: Verifica que el `TestLoggerService` esté inyectado correctamente.

**P: ¿Puedo ejecutar las pruebas sin Firebase?**
R: Sí, los casos 3, 5 y 6 no requieren Firebase.

---

## 🔧 Solución de Problemas

Si después de todo esto no funciona:

1. Reinicia el servidor Angular
2. Limpia la caché del navegador
3. Verifica la consola del navegador (F12)
4. Revisa que todos los archivos estén guardados
