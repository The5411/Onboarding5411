## Plan mínimo para restaurar el Preview

1. **Confirmar el estado real del Preview**
   - Revisar logs recientes del servidor de desarrollo.
   - Verificar que la ruta `/` responda correctamente.
   - Confirmar si el problema es de compilación o del orquestador del preview.

2. **Validar compilación sin tocar diseño**
   - Ejecutar únicamente checks de build/typecheck necesarios para detectar errores reales.
   - No modificar componentes visuales, contenido, layout, estilos ni funcionalidades existentes.

3. **Si hay error real de build**
   - Corregir solo el error bloqueante específico.
   - Limitar cambios al archivo causante.
   - No hacer refactors ni reorganizaciones.

4. **Si no hay error de build**
   - Reiniciar únicamente el servidor de preview/dev para forzar regeneración.
   - Volver a verificar respuesta HTTP y carga visual básica de la página.

5. **Resultado esperado**
   - Preview accesible nuevamente.
   - Aplicación compilando correctamente.
   - Cero cambios de diseño, estructura o funcionalidades salvo una corrección técnica mínima si aparece un error bloqueante.