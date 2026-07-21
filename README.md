# Cuaderno de seguimiento

Producto para que un profesor particular de matemática lleve el seguimiento
de sus alumnos: fechas de examen, avance por tema/materia, registro de
clases y resultados de simulacros — con cuenta propia y sincronización entre
dispositivos. Funciona con o sin internet. Ver `INSTRUCCIONES.md` para la
guía de uso.

## Este repo

Este repo es **sólo el sitio web** — la landing y la app, publicados a
GitHub Pages. No tiene build, ni package manager, ni dependencias: todo es
HTML/CSS/JS hecho a mano.

```
web/
├── index.html        landing/marketing (raíz del sitio)
└── app/               la app en sí (PWA)
    ├── index.html
    ├── styles.css
    ├── js/            config, helpers, auth, sync, views-*.js (9 archivos), events
    ├── sw.js          service worker
    └── manifest.webmanifest
```

`.github/workflows/deploy-pages.yml` publica `web/` a GitHub Pages en cada
push a `main` que toque `web/**` (landing en la raíz del sitio, app en
`/app/`).

Ver `ARQUITECTURA.md` para el mapa de qué archivo tiene qué vista/función, y
`CLAUDE.md` para el resto (cómo funciona el render, el modelo de estado,
etc.) y `SEGURIDAD.md` para la auditoría de seguridad del proyecto.

## Estructura completa del producto

El resto de "Cuaderno de seguimiento" vive repartido en otros repos, cada
uno con su propio historial:

| Repo | Qué es |
|---|---|
| **este repo** | El sitio web: landing + app (PWA). Lo único que se publica a GitHub Pages y lo único que consumen los demás repos como fuente de los archivos de la app. |
| [`cuaderno-supabase`](https://github.com/manugandini53-design/cuaderno-supabase) | La base de datos (Supabase): migraciones SQL numeradas para reconstruir el proyecto entero desde cero. |
| [`cuaderno-desktop`](https://github.com/manugandini53-design/cuaderno-desktop) | Empaquetado de escritorio (Tauri). **En pausa** — ver su README para cómo retomarlo. |
| [`cuaderno-android`](https://github.com/manugandini53-design/cuaderno-android) | Empaquetado Android (Capacitor). **En pausa** — ver su README para cómo retomarlo. |

Los releases de escritorio ya publicados (instaladores `.msi`/`.exe`) siguen
viviendo en las **Releases de este repo**, no en `cuaderno-desktop`.

## Cómo desarrollar

No hay que instalar nada. Para probar cambios:

```
npx serve web
```

(o cualquier otro servidor estático — `python -m http.server` desde `web/`,
etc.) y entrá a `http://localhost:.../` para la landing o
`http://localhost:.../app/` para la app.

Sirve para probar el service worker y el comportamiento offline/PWA, que no
funcionan bien abriendo el archivo directo con `file://`. Para cambios
rápidos que no toquen el service worker, alcanza con abrir
`web/app/index.html` directo en el navegador.

Después de editar cualquier archivo bajo `web/app/`, acordate de bumpear
`CACHE` en `web/app/sw.js` y revisar que su lista `FILES` siga completa —
ver `CLAUDE.md` para el detalle.
