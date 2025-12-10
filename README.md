# Plataforma de Autenticación

[![Build Status](https://img.shields.io/jenkins/build?jobUrl=http://your-jenkins-url/job/react-registro-asistencia)](http://your-jenkins-url/job/react-registro-asistencia)
[![Test Coverage](https://img.shields.io/badge/coverage-70%25-yellow)](http://your-jenkins-url/job/react-registro-asistencia/lastSuccessfulBuild/coverage)
[![Quality Gate](https://img.shields.io/badge/quality%20gate-passing-brightgreen)](http://your-sonarqube-url)

Una aplicación moderna de autenticación construida con React, TypeScript y Tailwind CSS.

## Características

- ✅ **Login de usuario** con validación de formularios
- ✅ **Recuperar contraseña** con confirmación por email
- ✅ **Crear usuario** con datos demográficos completos
- ✅ **Recordar me** para mantener la sesión
- ✅ Diseño minimalista y profesional
- ✅ Completamente responsive
- ✅ Validación de formularios con Zod y React Hook Form

## Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/        # Componentes de React
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ForgotPassword.tsx
├── types/            # Definiciones de TypeScript
│   └── auth.ts
├── utils/            # Utilidades
│   └── validation.ts
├── App.tsx           # Componente principal
├── main.tsx          # Punto de entrada
└── index.css         # Estilos globales
```

## Características de Diseño

- **Minimalista**: Diseño limpio y sin distracciones
- **Responsive**: Adaptable a todos los tamaños de pantalla
- **Profesional**: Interfaz moderna y pulida
- **Innovador**: Efectos visuales sutiles y animaciones suaves

## Validaciones

### Login
- Email válido
- Contraseña mínimo 6 caracteres

### Registro
- Email válido
- Contraseña: mínimo 8 caracteres, mayúscula, minúscula y número
- Confirmación de contraseña
- Datos demográficos completos
- Aceptación de términos y condiciones

### Recuperar Contraseña
- Email válido

## Próximos Pasos

Para integrar con un backend, actualiza las funciones en `App.tsx`:
- `handleLogin`
- `handleRegister`
- `handleForgotPassword`

