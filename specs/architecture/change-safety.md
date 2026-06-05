# Arquitectura — Protocolo de cambios seguros

**Estado:** en produccion  
**Aplica a:** `site/recurso.html`, `site/js/*.js`, `site/css/*.css`, `site/js/datos.js`

Este recurso funciona como PWA estatica, sin backend y con CSP estricta en
`recurso.html`. La prioridad de mantenimiento es preservar la experiencia
docente sin romper filtros, rutas, modales, lectura guiada, ficha PDF ni cache
offline.

## Invariantes no negociables

- `window.CATALOGO` expone exactamente 283 fichas base.
- `window.CATALOGO_EFECTIVO` puede incluir ediciones locales, pero no debe
  mutar `CATALOGO`.
- Cada ficha mantiene coherencia entre:
  - `uso` y `badges`;
  - `nivel` y `niveles`;
  - primer `uso` y `color`.
- Los titulos exactos no se duplican.
- Las fichas `sensitive` siempre tienen `sens_label` y no se asignan a
  Infantil/Primaria.
- `recurso.html` conserva los IDs usados como contrato:
  `catalogo`, `catGrid`, `catalogSearch`, `filterBar`,
  `selector-docente`, `docenteResults`, `modeAulaBtn`,
  `modeBibliotecaBtn`.
- Las acciones interactivas usan `data-action`; no se introducen handlers
  inline (`onclick`, `onchange`, etc.).
- Si cambia cualquier asset precacheado, se incrementa `CACHE_NAME` en
  `site/sw.js`.

## Superficies fragiles

| Superficie | Riesgo si se cambia sin contrato |
|---|---|
| `recurso.html` | Romper selectores de JS, anchors, CSP o accesibilidad semantica. |
| `app.js` | Romper delegacion `data-action`, filtros, modales, IA, quiz, mapa o panel docente. |
| `datos.js` | Romper filtros, rutas docentes, PDF, lectura guiada, URL state y tests. |
| Orden de CSS | Perder contraste, modo accesible, overlays, print o layout responsive. |
| Service Worker | Servir HTML nuevo con JS/CSS viejo por cache persistente. |

## Regla de oro para redisenos

Cambiar primero la presentacion, no el contrato.

Se puede cambiar:

- layout interno de una tarjeta;
- jerarquia visual;
- tokens de color/espaciado;
- microcopy;
- imagenes didacticas;
- estados hover/focus;
- densidad y responsive.

No se debe cambiar sin migracion:

- IDs principales;
- nombres de `data-action`;
- estructura de los modales;
- nombres de campos en `CATALOGO`;
- relacion `uso`/`badges` y `nivel`/`niveles`;
- carga de scripts y orden de CSS.

## Estrategia de modularizacion

`app.js` es el modulo de mayor riesgo. La extraccion debe hacerse por capas:

1. Crear modulo nuevo con API explicita.
2. Mantener las funciones globales antiguas como adaptadores.
3. Añadir test de contrato.
4. Cambiar una sola superficie de DOM.
5. Verificar desktop + mobile + modo accesible.
6. Solo entonces retirar codigo duplicado.

Orden recomendado:

1. `catalog-contracts`: validacion de datos y rutas.
2. `catalog-render`: render de `.cat-card`.
3. `catalog-filters`: estado de filtros y URL.
4. `docente-selector`: recomendaciones/rutas.
5. `modal-manager`: focus trap y overlays.
6. `activity-modules`: quiz, lectura, ficha PDF, mapa.

## Checklist pre-publicacion

- `npm test` en `tests/`.
- Capturas visuales desktop y mobile de:
  - portada;
  - selector docente;
  - catalogo colapsado/abierto;
  - modal de ficha;
  - ficha PDF;
  - modo lectura/accesibilidad.
- Validar en consola:
  - sin violaciones CSP;
  - sin errores de JS;
  - `window.CATALOGO.length === 283`.
- Bump de `CACHE_NAME`.
- Si se toca `datos.js`, regenerar o sincronizar `datos.min.js`.

## Principio didactico

El catalogo no es la experiencia principal: es la base de datos. La experiencia
principal debe ayudar a una docente a responder rapido:

- que titulo usar;
- para que nivel;
- con que riesgo;
- con que actividad;
- con que alternativa;
- con que evidencia pedagogica.
