# Onboarding5411

Aplicación web de onboarding para empleados de 5411, construida con [TanStack Start](https://tanstack.com/start) (React 19). Incluye un flujo de user por etapas para nuevos empleados y un panel de administración para gestionar el contenido.

## Stack

- **Framework**: TanStack Start + TanStack Router (file-based routing)
- **UI**: React 19, Tailwind CSS v4, Radix UI, shadcn-style components (`src/components/ui`)
- **Editor de contenido**: Tiptap
- **Backend / datos**: Supabase (Postgres + Auth + Storage)
- **Runtime / build**: Vite, Nitro
- **Package manager**: Bun (hay lockfile de `bun` y de `npm`; usar Bun salvo que se decida lo contrario)
- **Deploy**: Railway (ver `railway.json`)

## Requisitos previos

- [Bun](https://bun.sh) instalado
- Acceso a un proyecto de Supabase (URL + anon key)
- Un Google Sheet de empleados compartido como "cualquiera con el enlace puede ver"

## Configuración

1. Instalar dependencias:

   ```bash
   bun install
   ```

2. Crear un archivo `.env.local` en la raíz con las siguientes variables:

   ```bash
   # Link de "Compartir" del Google Sheet de empleados
   EMPLOYEES_SHEET_URL=

   # Supabase (URL y anon key son públicas por diseño; la seguridad la da RLS)
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

3. (Opcional) Aplicar el esquema de base de datos a tu proyecto de Supabase usando los archivos en [supabase/](supabase/) (`schema.sql`, `seed.sql`, `storage.sql`, y las migraciones `migrate-*.sql`).

## Scripts

```bash
bun run dev        # levanta el servidor de desarrollo (Vite)
bun run build      # build de producción
bun run build:dev  # build en modo development
bun run preview    # sirve el build de producción localmente
bun run lint       # ESLint
bun run format     # Prettier (escribe los cambios)
```

## Estructura del proyecto

```
src/
  routes/       # rutas file-based de TanStack Router (ver src/routes/README.md)
  components/   # componentes de UI (admin, onboarding, ui/ genéricos)
  data/         # datos estáticos (p. ej. quizzes.ts)
  lib/          # utilidades, cliente de Supabase, config server-side, manejo de errores
  hooks/        # hooks de React
  assets/       # assets estáticos importados por el código
supabase/       # esquema SQL, seeds, storage y migraciones
public/         # archivos estáticos servidos tal cual
```

Las rutas siguen las convenciones de TanStack Start (file-based). Ver [src/routes/README.md](src/routes/README.md) para el detalle de convenciones — importante: no crear `src/pages/` ni layouts al estilo Next.js/Remix.

Páginas principales:
- `/` — landing (`src/routes/index.tsx`)
- `/login` — login
- `/admin` — panel de administración
- `/simulacro/:stage` — flujo de onboarding por etapas

## Deploy

El deploy está configurado para Railway usando Railpack (`railway.json`):

```bash
NITRO_PRESET=node-server bun run build
node .output/server/index.mjs
```
