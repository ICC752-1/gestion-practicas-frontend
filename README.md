# Gestión Prácticas DCI - Frontend

Este repositorio contiene el frontend para el sistema de Gestión de Prácticas DCI, construido con [React](https://react.dev/) y [Vite](https://vitejs.dev/).

## Estado y Funcionalidades Actuales

El proyecto actualmente cuenta con una base sólida de maquetación e integración de herramientas modernas:

- **Arquitectura de Componentes**: La interfaz principal de autenticación (Login) se encuentra modularizada, dividiendo estructuralmente la cabecera (`Header`) y el pie de página (`Footer`) como componentes independientes e importables en futuras vistas.
- **Tailwind CSS v4**: El proyecto ha sido configurado para utilizar las directivas modernas (`@theme`) de Tailwind 4, prescindiendo del clásico archivo de configuración para un desarrollo más ágil y limpio.
- **Diseño Responsivo (Flexbox)**: Se refactorizaron los exportados estáticos de diseño (provenientes de Figma/Anima), descartando posiciones absolutas rígidas en favor de un layout fluido de pantalla completa que se adapta naturalmente al tamaño del navegador.
- **Identidad Gráfica Institucional**: El aspecto visual y las proporciones se ajustaron para replicar la experiencia de usuario y apariencia oficial de la web de la **Facultad de Ingeniería y Ciencias (Universidad de La Frontera)**, incluyendo paletas de colores representativas, interacciones dinámicas en navegación e integración de logos institucionales y banners de acreditación.

## Requisitos Previos

Asegúrate de tener instalados los siguientes requerimientos en tu sistema antes de inicializar el proyecto:

- **Node.js**: Se recomienda la versión `22` o superior (puedes usar `nvm install 22` si utilizas Node Version Manager).
- **npm**: Gestor de paquetes que viene incluido con Node.js.

## Solución de Problemas (Linux)

Si al intentar ejecutar el proyecto en Linux te encuentras con el error `ENOSPC: System limit for number of file watchers reached`, significa que el sistema ha alcanzado el límite de archivos que puede observar al mismo tiempo. Para solucionarlo, ejecuta los siguientes comandos en tu terminal:

```bash
# Aumentar el límite actual de forma inmediata
sudo sysctl fs.inotify.max_user_watches=524288

# Hacer el cambio permanente para que persista tras reiniciar
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Paso a Paso para Inicializar el Repositorio

Sigue estos pasos para descargar, configurar e iniciar el proyecto de forma local:

1. **Ubicarse en el directorio principal**
   Asegúrate de estar ubicado en la raíz del repositorio (la carpeta `gestion-practicas-frontend`).

2. **Acceder a la carpeta de la aplicación React**
   El código principal del frontend se encuentra alojado dentro del subdirectorio `practicas-dci`:
   ```bash
   cd practicas-dci
   ```

3. **Instalar las dependencias**
   Instala todos los paquetes requeridos por el proyecto utilizando `npm`:
   ```bash
   npm install
   ```

4. **Ejecutar el servidor de desarrollo**
   Inicia el entorno de desarrollo que soporta *Hot Module Replacement* (HMR):
   ```bash
   npm run dev
   ```

5. **Abrir la aplicación en tu navegador**
   Una vez el servidor esté en funcionamiento, puedes ver la aplicación ingresando en tu navegador a la URL que la terminal indique (por defecto, suele ser `http://localhost:5173`).

## Scripts Disponibles

Dentro del directorio `practicas-dci`, puedes hacer uso de los siguientes comandos de `npm`:

- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Compila la aplicación y la optimiza para su despliegue en producción.
- `npm run lint`: Ejecuta el linter (ESLint) para analizar el código en busca de errores o problemas de formato.
- `npm run preview`: Levanta un servidor local que sirve los archivos estáticos previamente compilados con `build` para poder previsualizar cómo se verá en producción.
