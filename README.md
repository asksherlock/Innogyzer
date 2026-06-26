<div align="center">
  <img src="./public/assets/innogyzer_logo_light.png" alt="Innogyzer Logo" width="250" />
  <h1>Innogyzer Website & CMS Ecosystem</h1>
  <p><strong>Transformando organizaciones con Innovación e Inteligencia Artificial</strong></p>
</div>

---

## 🚀 Overview

Este repositorio contiene el código fuente del ecosistema web de **Innogyzer**, diseñado con un enfoque "Premium B2B". Consta de dos piezas fundamentales:
1. **Frontend (Website):** Una landing page ultra rápida, moderna y fluida con diseño *Glassmorphism* y animaciones inmersivas.
2. **Backend (Headless CMS):** Un administrador de contenido basado en Payload CMS para gestionar testimonios, equipo y publicaciones de blog en tiempo real.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React + TypeScript + Vite
- **Estilado:** Tailwind CSS (Glassmorphism, gradientes dinámicos)
- **Animaciones:** Framer Motion & Lenis (Smooth Scrolling)
- **Iconografía:** Heroicons & React Icons

### Backend (CMS)
- **Framework:** Payload CMS v3 (Next.js App Router)
- **Base de Datos:** PostgreSQL alojado en **Supabase**
- **Almacenamiento de Medios (S3):** Supabase Storage

---

## 🏗️ Arquitectura y Estructura

El ecosistema está desacoplado (Headless). El Frontend renderiza la interfaz gráfica y consume mediante peticiones `fetch` la API REST expuesta por el Backend de Payload CMS.

* **Frontend Port:** `http://localhost:8082` (o el asignado por Vite)
* **Backend Admin URL:** `http://localhost:3000/admin`
* **Backend API Base:** `http://localhost:3000/api`

### Secciones dinámicas (CMS):
- **Equipo (Team):** Gestión de roles y fotos del equipo directivo.
- **Testimonios:** Carrusel dinámico de reseñas de clientes y partners.
- **Blog (Posts):** Sistema de gestión de artículos y noticias (Editor Lexical).

---

## 💻 Guía de Instalación Local

### 1. Requisitos Previos
Asegúrate de tener instalado en tu máquina:
- **Node.js** (v18 o superior recomendado)
- **npm** o **yarn**

### 2. Configuración del Backend (Payload CMS)
Navega a la carpeta de tu CMS (ej. `innogyzer-cms`), instala las dependencias y configura tus variables de entorno:

```bash
cd innogyzer-cms
npm install
```

Crea un archivo `.env` en la raíz del CMS con el siguiente formato:
```env
PAYLOAD_SECRET=your-secret-here
DATABASE_URI=postgresql://postgres:[TU_CONTRASEÑA]@db.[ID_SUPABASE].supabase.co:5432/postgres
S3_ENDPOINT=https://[ID_SUPABASE].supabase.co/storage/v1/s3
S3_BUCKET=innogyzer-media
S3_ACCESS_KEY_ID=[TU_ACCESS_KEY]
S3_SECRET_ACCESS_KEY=[TU_SECRET_KEY]
S3_REGION=auto
```

Ejecuta el servidor de desarrollo:
```bash
npm run dev
# El panel administrador estará disponible en http://localhost:3000/admin
```

### 3. Configuración del Frontend (Website)
Abre otra pestaña en tu terminal, navega a la carpeta del frontend, instala e inicia el proyecto:

```bash
cd innogyzer-website-light
npm install
npm run dev
# La web cargará típicamente en http://localhost:8082
```

---

## 🎨 Principios de Diseño (UI/UX)
El frontend de Innogyzer sigue un conjunto estricto de reglas de diseño para mantener la autoridad B2B:
- **Colores:** Fondo oscuro translúcido con acentos en verde lima vibrante (`#dcea22`).
- **Glassmorphism:** Paneles semitransparentes con bordes sutiles en blanco (`bg-black/40 backdrop-blur-xl border border-white/10`).
- **Tipografía:** Espaciados amplios (`tracking-widest`), fuentes pesadas en encabezados y lectura cómoda para párrafos.
- **Animaciones:** Reveal de texto progresivo, scroll infinito para Partners, y auto-ocultamiento de secciones dinámicas vacías.

---

<div align="center">
  <p>Construido con ❤️ por el equipo de Innogyzer.</p>
</div>
