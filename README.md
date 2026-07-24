# Bitácora — control de entrenamiento (Angular)

Misma app de antes, reconstruida en Angular. El backend son funciones
serverless de Vercel (Node) que hablan con el mismo Supabase que ya
configuraste — **no necesitas volver a crear la base de datos ni correr el
SQL otra vez** si ya lo hiciste con la versión anterior.

## Arquitectura

- **Frontend**: Angular 18 (standalone components), compilado como app estática.
- **Backend**: funciones en `/api` (Node, formato `.mjs`), cada una habla con Supabase usando la `secret key`.
- **Base de datos**: Supabase Postgres (la misma de antes).
- **Gráficas**: componente propio en SVG (sin librería externa), estilo cuaderno.
- **Ilustraciones de ejercicios**: dibujos de línea originales, igual que antes.

## 1. Si ya tienes el proyecto de Supabase de antes

Solo necesitas dos datos (los mismos de la vez pasada):

- `SUPABASE_URL` (Settings → API → Project URL)
- `SUPABASE_SERVICE_ROLE_KEY` — en la pantalla nueva de Supabase esto es el
  **"Secret key"** (`sb_secret_...`) en Settings → API Keys → Secret keys.

Si es la primera vez, corre `supabase-schema.sql` en el SQL Editor de tu
proyecto Supabase antes de continuar.

## 2. Subir el código a GitHub

```bash
cd bitacora-angular
git init
git add .
git commit -m "Bitácora en Angular"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bitacora-angular.git
git push -u origin main
```

## 3. Desplegar en Vercel

1. En vercel.com, **Add New → Project**, elige este repositorio.
2. Vercel debería detectar Angular automáticamente. Si te pregunta por el
   comando de build y carpeta de salida, usa:
   - Build command: `npm run build`
   - Output directory: `dist/bitacora-angular/browser`
   (ya están definidos en `vercel.json`, así que normalmente ni te los pide).
3. En **Environment Variables** agrega `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   y `AUTH_SECRET` (puedes reusar el mismo `AUTH_SECRET` de la versión anterior,
   o generar uno nuevo — si lo cambias, las sesiones activas se cierran).
4. **Deploy**.

Si vienes de la versión en Next.js y quieres reemplazarla: puedes usar el
mismo proyecto de Vercel (solo cambia el repo conectado) o crear uno nuevo;
cualquiera de los dos apunta al mismo Supabase sin problema.

## Desarrollo local

Necesitas correr dos cosas: el servidor de Angular y las funciones API.

```bash
npm install
cp .env.example .env   # llena tus valores reales

# Terminal 1: funciones API (usa la CLI de Vercel)
npx vercel dev

# Terminal 2: Angular con recarga en caliente, apuntando al puerto que
# te haya dado "vercel dev" (normalmente 3000)
npx ng serve --proxy-config proxy.conf.json
```

`proxy.conf.json` ya viene incluido y redirige `/api/*` hacia
`http://localhost:3000` durante desarrollo.

## Notas

- Las contraseñas se guardan con hash (bcrypt), nunca en texto plano.
- La sesión se guarda en una cookie firmada (JWT), válida por 30 días.
- `jose` (la librería de JWT) es ESM puro, por eso las funciones en `/api`
  usan extensión `.mjs`.
