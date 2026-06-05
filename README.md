# Manga como recurso para el aula

Recurso interactivo para profesorado sobre el manga japonés como recurso didáctico. Construido sobre el fondo del **Aula de Cómic** de la Biblioteca del Campus del Obelisco · ULPGC.

**Versión:** 5.34 · **Licencia contenidos:** CC BY-NC 4.0

---

## Estructura del proyecto

Sigue **Spec-Driven Development (SDD)**: la fuente de verdad son las especificaciones de cada feature, los tests las validan, el código las implementa.

```
manga-aula/
├── README.md                ← este archivo
├── specs/                   ← especificaciones por feature
│   ├── README.md            ← índice y guía de SDD
│   ├── overview.md          ← visión y arquitectura general
│   ├── features/            ← una spec por feature
│   │   ├── 01-portada.md
│   │   ├── 02-recurso-arquitectura.md
│   │   ├── 03-catalogo.md
│   │   ├── 04-url-state.md
│   │   ├── 05-ficha-pdf.md
│   │   ├── 06-deck-claustro.md
│   │   ├── 07-manual-docente.md
│   │   └── 08-pwa.md
│   └── architecture/        ← preocupaciones transversales
│       ├── csp.md
│       ├── accessibility.md
│       └── design-system.md
├── site/                    ← implementación (lo que se despliega)
│   ├── index.html           ← portada cinematográfica
│   ├── recurso.html         ← recurso completo (catálogo, situaciones…)
│   ├── manual-docente.html  ← manual imprimible
│   ├── deck-claustro.html   ← presentación 8 slides
│   ├── landing/htm-app.js   ← React + htm de la portada
│   ├── js/                  ← módulos JS
│   ├── css/                 ← estilos
│   ├── img/  · icons/       ← assets
│   ├── manifest.json
│   ├── sw.js · sw-register.js
│   └── revision-uxui.html   ← informe de la auditoría UX/UI
└── tests/                   ← validación (Playwright)
    ├── README.md
    ├── package.json · playwright.config.js · serve.mjs
    └── specs/               ← un test file por feature spec
        ├── smoke.spec.js
        ├── url-state.spec.js
        └── ficha-pdf.spec.js
```

---

## Cómo trabajar con esto

### Para entender el proyecto
1. Lee `specs/overview.md` — visión, paths principales, decisiones de fondo.
2. Lee la spec del feature que te interese en `specs/features/`.
3. Mira el test correspondiente en `tests/specs/` para ver los criterios de aceptación ejecutables.

### Para añadir un feature
1. Escribir su spec en `specs/features/NN-nombre.md` siguiendo la plantilla.
2. Escribir/ampliar los tests en `tests/specs/nombre.spec.js`.
3. Implementar el código en `site/` hasta que los tests pasen.
4. Actualizar `specs/overview.md` si el feature cambia la arquitectura.

### Para corregir un bug
1. Reproducir con un test que falle.
2. Si el bug viola una spec, citar la spec en el commit/PR.
3. Arreglar el código hasta que el test pase.
4. Si la spec era ambigua o estaba mal, actualizarla antes.

---

## Cómo desplegar

Servir la carpeta `site/` desde cualquier hosting estático (GitHub Pages, Netlify, servidor institucional ULPGC). El Service Worker hace el resto: PWA instalable, caché offline, invalidación con cada bump de `CACHE_NAME`.

```sh
# Desarrollo local rápido
cd site && python -m http.server 8080
# o
cd tests && node serve.mjs
```

## Cómo correr los tests

```sh
cd tests
npm install
npm run install:browsers
npm test                                  # contra servidor local
BASE_URL=https://tu.dominio npm test      # contra deploy real
```

---

## Equipo

**Dirección:** Daniel Becerra Romero
**Equipo:** Paula Arocha Moros · Lucía Hernández Chio · Daniel Hernández García · Zaira Rodríguez Panadero
**Institución:** Aula de Cómic · Facultad de Ciencias de la Educación · Universidad de Las Palmas de Gran Canaria

---

## Cambios v5.11 (auditoría aplicada)

Correcciones derivadas de la auditoría sistemática de mayo de 2026:

- **Rendimiento:** React pasa a *build de producción* (`react-dom` ~1,2 MB → 132 KB) con SRI recalculado. Imágenes optimizadas (logo 808 KB → 48 KB JPG / 27 KB WebP; banner 276 KB → 37 KB / 24 KB) servidas con `<picture>` (WebP + respaldo JPG). `app.js`/`datos.js` con `defer`.
- **Accesibilidad (WCAG 2.1 AA):** el generador de viñetas es operable por teclado (las viñetas son `<button>`; Intro/Espacio ciclan el estilo, con foco conservado tras cada cambio). Líneas cinéticas y posición del texto en controles propios con `aria-pressed`, eliminando la ambigüedad clic/doble clic. `prefers-reduced-motion` unificado en CSS y honrado en la portada vía `MotionConfig reducedMotion="user"`. `100vh` → `100dvh` con respaldo.
- **Didáctica:** sentido de lectura derecha→izquierda por defecto, con numeración de viñetas coherente con la lectura del manga; bocadillo y onomatopeya colocables en cualquier viñeta; saltos de línea reales en el bocadillo; botón de reinicio.
- **Mantenimiento:** `Service Worker` a `manga-ulpgc-v5.11` (invalida caché previa) con los nuevos assets precacheados; `meta viewport` añadido a `pagina-vacia.html`.

Pendiente como mejora futura (no bloqueante): minificación/troceado de `app.js`, exportación de la composición del generador a PNG/enlace, y decisión documentada sobre el uso de raya tipográfica en prosa frente a microcopia.

### Bundles minificados (despliegue)

El sitio sirve `site/js/app.min.js` y `site/js/datos.min.js`. Los **fuentes
editables** siguen siendo `app.js` y `datos.js`: edítalos y regenera con
`tools/minify.sh` (requiere `terser`). El catálogo del panel docente se sigue
editando sobre `datos.js`. Tras regenerar, sube `CACHE_NAME` en `site/sw.js`.

## Cambios v5.12 (mejoras didácticas)

- **Tarjeta de actividad del generador** (`js/actividad-vinetas.js`): convierte el generador de viñetas en una tarea productiva con consigna, pasos, criterios de logro autoevaluables y un ejemplo modelado de lectura. Fundamento: aprendizaje generativo y análisis multimodal del manga (Tejuelo, 2026, DOI: 10.17398/1988-8430.43.31).
- **Autocomprobación formativa** (`js/autocomprobacion.js` + `autocomprobacion-datos.js`): cuestionarios de bajo riesgo, no calificables, con realimentación explicativa inmediata y reintento, tras el glosario y al cierre de cada parte. Fundamento: práctica de recuperación / testing effect (Roediger y Karpicke, 2006, DOI: 10.1111/j.1467-9280.2006.01693.x).

Ambos componentes son accesibles por teclado, respetan el sistema de diseño y `prefers-reduced-motion`, y no guardan datos. Service Worker a `manga-ulpgc-v5.12`.

## Cambios v5.13 (segmentación y señalización)

- **Situaciones de aprendizaje a paso a paso** (`js/segmentacion.js`): cada situación se presenta en segmentos a ritmo del usuario (un bloque cada vez, con progreso "Paso N de M", título del paso y navegación Anterior/Siguiente). Botón "Ver todo" para recuperar la vista completa (control del usuario; el contenido permanece en el DOM y es buscable). Es el principio de segmentación.
- **Línea del tiempo con modo foco**: en lugar de trocear el eje (cuyo valor es ver el conjunto), un "Modo foco" atenúa las eras no seleccionadas y resalta una, con navegación entre eras, manteniendo todo visible. Es el principio de señalización.

Mejora progresiva: si el JS no carga, el contenido sigue completo y visible. Accesible por teclado, respeta el sistema de diseño y `prefers-reduced-motion`, no toca los tooltips del timeline gestionados por `app.js`. Fundamento: Mayer, *Multimedia Learning* (DOI: 10.1017/CBO9780511811678.013). Service Worker a `manga-ulpgc-v5.13`.

## Cambios v5.14 (mediación modelada + planificador)

- **Ejemplo modelado de mediación lectora** (`js/mediacion.js`): worked example para el profesorado en la Parte I. Recorre paso a paso seis momentos de una lectura mediada (anticipación, observación guiada, el ma, recursos visuales, síntesis, metacognición) indicando qué hace el docente, qué pregunta y por qué. Reduce la carga de quien diseña desde cero.
- **Planificador "Mi selección"** (`js/planificador.js`): el profesorado guarda títulos del catálogo (botón en el modal de ficha) y conserva o comparte la selección por enlace. Reutiliza `url-state.js` (parámetro `?sel=` con índices del catálogo); panel en la cabecera del catálogo con copia de enlace y vaciado. No invade el render del catálogo: se engancha en el modal estable y resuelve los títulos desde `window.CATALOGO`.

Ambos accesibles por teclado, fieles al sistema de diseño y `prefers-reduced-motion`. Service Worker a `manga-ulpgc-v5.14`. Con esto se cierran las mejoras didácticas planificadas (autocomprobación, actividad del generador, segmentación/señalización, mediación modelada y planificador).

## Cambios v5.15 (corrección didáctica)

- **Atención a la diversidad (DUA)** incorporada como bloque estructural en las cinco situaciones de aprendizaje, con medidas concretas para los tres principios (representación, implicación, acción/expresión) y elementos transversales (coeducación, ciudadanía, educación en valores). Resuelve el hallazgo principal de la verificación didáctica.
- **Anclaje normativo corregido y completado.** Se subsana la referencia errónea (figuraba «Decreto 82/2022» para Primaria de Canarias) y se citan los decretos autonómicos correctos verificados en fuentes oficiales: Decreto 196/2022 (Infantil), Decreto 211/2022 (Primaria) y Decreto 30/2023 (ESO y Bachillerato), junto a los RD estatales 95/2022, 157/2022, 217/2022 y 243/2022.

Service Worker a `manga-ulpgc-v5.15`.

## Cambios v5.16 (corrección del catálogo)

- Corregida la inconsistencia entre `nivel` (filtro) y `niveles` (etapas visibles) en dos fichas: *Hokusai* (añadida «Universidad») y *Bajo un cielo nuevo* (añadida «Secundaria»). Verificado: las 279 fichas tienen ahora ambos campos coherentes. Regenerado `datos.min.js`; Service Worker a `manga-ulpgc-v5.16`.

## Cambios v5.17 (fidelidad del catálogo — lote 1)

Correcciones tras la verificación externa de fichas contra la obra real:
- **Gon**: retirado del tramo Infantil (pasa a Primaria/Secundaria) y añadida nota de mediación, porque la obra muestra con crudeza la violencia y la muerte propias de la naturaleza. El catálogo deja de tener títulos etiquetados en Infantil.
- **Kamen Rider**: reasignado a Secundaria/Bachillerato y añadida nota de que el manga original de Ishinomori es más oscuro que la serie de TV.
- **Ataque a los titanes**: etiqueta de edad elevada de 14+ a 16+, en línea con la clasificación editorial.

Regenerado `datos.min.js`; Service Worker a `manga-ulpgc-v5.17`.

## Cambios v5.18 (fidelidad del catálogo — lote 3)

Correcciones sobre el contenido sensible, contrastadas con clasificaciones editoriales:
- **Uzumaki**, **Death Note**, **Fragmentos del Mal** y **Tombs**: etiquetas subidas de 14+ a 16+, en línea con la clasificación «Older Teen / Teen Plus» de VIZ Media y las guías de padres especializadas. El catálogo ya no tiene ninguna ficha con 14+.
- **Gorda** (Moyoko Anno): corregido «Manga autobiográfico» por «Manga de ficción josei»; la obra es ficción con protagonista inventada (Noko Hanazawa), no una autobiografía.

Regenerado `datos.min.js`; Service Worker a `manga-ulpgc-v5.18`.

## Cambios v5.19 (fidelidad del catálogo — lote 4)

Dos fichas de Secundaria/Bachillerato que carecían de indicador sensible pese a tener contenido gráfico intenso:
- **Vinland Saga**: añadido `⚠ 16+ · Violencia` — sein de historia vikinga con gore gráfico (desmembramientos, decapitaciones), clasificado R-17+ en su adaptación anime y 16+ por Kodansha.
- **Vagabond**: añadido `⚠ 18+ · Violencia` — sein de Takehiko Inoue con violencia extrema y violencia sexual explícita, consistente con *Lady Snowblood* (ya marcada 18+ por razones similares).

El catálogo pasa de 21 a **23 fichas con indicador sensible**. Regenerado `datos.min.js`; Service Worker a `manga-ulpgc-v5.19`.

## Cambios v5.20 (fidelidad del catálogo — lote 5)

Cinco obras de Secundaria/Bachillerato sin indicador sensible pese a tener contenido adulto:
- **Alabaster** (Tezuka): `⚠ 16+ · Violencia` — obra oscura y violenta del autor, con escenas de crudeza explícita; tip actualizado para reflejar esta naturaleza.
- **Santuario** (Fumimura/Ikegami): `⚠ 18+ · Violencia / Adulto` — seinen con erotismo, desnudez y violencia sangrienta explícitos.
- **Monster** (Urasawa): `⚠ 16+ · Violencia` — VIZ Signature (16+), thriller de asesino en serie; consistente con Death Note.
- **Pluto** (Urasawa): `⚠ 16+ · Violencia` — mismo sello y lógica editorial que Monster.
- **Las penas del joven Werther: el manga**: `⚠ 16+ · Suicidio (literatura)` — el suicidio es el desenlace central; aviso formal para el docente.

El catálogo pasa de 23 a **28 fichas con indicador sensible**. Service Worker a `manga-ulpgc-v5.20`.

## Cambios v5.21 (fidelidad del catálogo — lote 6)

- **El Lobo solitario y su cachorro** (Koike/Kojima): añadido `⚠ 18+ · Violencia / Sexual`. La obra contiene violencia gráfica extrema y contenido sexual explícito (clasificado como «Graphic Violence · Explicit Sexual Content» en el Internet Archive y por múltiples reseñas especializadas). Su ficha ya lo adelantaba con «narrativa manga adulta» pero carecía del indicador formal.

El catálogo pasa a **29 fichas con indicador sensible**. Quedan pendientes de revisión por inspección física: Hanzō (Koike), Oen (Ikegami), Yuko (Ikegami) y El hombre sediento (Koike). Service Worker a `manga-ulpgc-v5.21`.

## Cambios v5.22 (fidelidad del catálogo — lote 7)

- **Akira** (Otomo): `⚠ 16+ · Violencia` — Kodansha advierte explícitamente «violence, sex, nudity or strong language not suitable for some audiences».
- **Hanzō: el camino del asesino** (Koike/Kojima): `⚠ 18+ · Violencia / Adulto` — Dark Horse y Penguin Random House lo clasifican 18+ en todos los volúmenes («adult manga at its most challenging — violent, complex, and boldly erotic»). Es obra del mismo equipo que El Lobo solitario.

El catálogo pasa a **31 fichas con indicador sensible**. Pendientes de verificación o revisión experta: Nana (Yazawa), Oen e Yuko (Ikegami). Service Worker a `manga-ulpgc-v5.22`.

## Cambios v5.23 (fidelidad del catálogo — lote 7 completo)

- **Nana** (Yazawa): `⚠ 16+ · Temática adulta` — VIZ describe explícitamente «sexo, música, moda y fiestas nocturnas»; incluye abuso de drogas y embarazos no deseados.
- **The Ghost in the Shell** (Shirow): `⚠ 18+ · Sexual / Violencia` — clasificado 18+/«For Mature Readers»/«Explicit content» por Dark Horse y Kodansha; contiene desnudez y escenas sexuales explícitas.
- **Akira** (Otomo): `⚠ 16+ · Violencia` — Kodansha advierte: «violence, sex, nudity or strong language». *(Aplicado en v5.22)*
- **Hanzō: el camino del asesino** (Koike/Kojima): `⚠ 18+ · Violencia / Adulto` — 18+ content advisory en todos los volúmenes. *(Aplicado en v5.22)*
- **Ikigami: Comunicado de muerte** (Mase): `⚠ 16+ · Violencia` — manga sobre ejecuciones aleatorias por ley; VIZ Signature; temas de muerte y injusticia distópica.

El catálogo pasa a **34 fichas con indicador sensible**. Pendientes de revisión experta (por inspección física): Oen e Yuko (Ikegami), El hombre sediento (Koike) y Amor es cuando cesa la lluvia. Service Worker a `manga-ulpgc-v5.23`.

## Cambios v5.24 (fidelidad del catálogo — lote 8)

- **Golden Kamuy** (Noda): `⚠ 16+ · Violencia` — VIZ lo clasifica "M for Mature / Parental Advisory: Explicit Content" por gore extremo, violencia y nudez parcial.
- **Frankenstein** (Junji Ito): `⚠ 16+ · Horror` — adaptación de Ito; coherente con todos los demás títulos de Ito en el catálogo (ya marcados 16+).
- **La casa de los insectos** (Umezz): `⚠ 16+ · Horror` — Kazuo Umezz, maestro del horror japonés adulto.
- **Tokyo Revengers** (Wakui): `⚠ 16+ · Violencia` — manga de bandas callejeras con asesinatos y crímenes; a nivel *secundaria* conviene aviso para el docente.

El catálogo pasa a **38 fichas con indicador sensible**. Pendientes de verificación experta o revisión física: Innocent/Innocent rouge (Sakamoto), Ayako 1 y 2 (Tezuka), La canción de Apolo (Tezuka). Service Worker a `manga-ulpgc-v5.24`.

## Cambios v5.25 (fidelidad del catálogo — lote 9)

Cinco obras de bachillerato sin indicador sensible pese a tener contenido adulto verificado:
- **Innocent rouge** (Sakamoto): `⚠ 18+ · Violencia / Sexual` — Dark Horse M; avisos de violencia sexual, abuso sexual de menores, gore y horror médico (Anime News Network).
- **Innocent** (Sakamoto): `⚠ 18+ · Violencia / Adulto` — Dark Horse M; «bordea lo pornográfico» (Goodreads), gore de ejecuciones.
- **La canción de Apolo** (Tezuka): `⚠ 16+ · Temática adulta` — etapa oscura de Tezuka; centra su discurso en el amor, el erotismo y el sexo.
- **Ayako 1** y **Ayako 2** (Tezuka): `⚠ 16+ · Temática adulta` — incesto implícito, encarcelamiento durante décadas, abuso y corrupción moral; la más oscura de sus obras de género.

El catálogo pasa a **43 fichas con indicador sensible** (18+: 16 | 16+: 27). Service Worker a `manga-ulpgc-v5.25`.

## Cambios v5.26 (fidelidad del catálogo — lote 10)

Ocho obras de bachillerato/universidad con contenido adulto confirmado o consistente con el sistema de indicadores del catálogo:
- **Historia de una geisha** y **Una mujer de la era Shōwa** (Kamimura): `⚠ 16+ · Temática adulta` — Ramen Para Dos las cataloga explícitamente como "adulto, seinen"; Kamimura es el dibujante de Lady Snowblood (ya marcada 18+).
- **Joe del mañana** (Takamori): `⚠ 16+ · Violencia` — clásico del manga de boxeo; violencia deportiva brutal y destino trágico del protagonista.
- **La leyenda de madre Sarah** (Otomo): `⚠ 16+ · Violencia` — ciencia ficción postapocalíptica del guionista de Akira (ya marcada 16+).
- **NeuN** (Takahashi): `⚠ 16+ · Violencia` — experimentos nazis sobre niños; contenido oscuro y perturbador.
- **Los locos del Gekiga** (Matsumoto): `⚠ 16+ · Temática adulta` — la propia ficha anuncia "el nacimiento del manga adulto".
- **Pescadores de medianoche** y **Mundo perdido** (Tatsumi): `⚠ 16+ · Temática adulta` — Yoshihiro Tatsumi, padre del gekiga; sus colecciones incluyen prostitución, crimen y desesperación.

El catálogo pasa a **51 fichas con indicador sensible** (18+: 16 | 16+: 35). Service Worker a `manga-ulpgc-v5.26`.

## Cambios v5.27 (verificación completa del catálogo)

- **El club del divorcio** (Kamimura): `⚠ 16+ · Temática adulta` — consistente con las otras dos obras de Kamimura ya marcadas.
- **Oen** (Ikegami): `⚠ 16+ · Temática adulta` — el propio tip declara «maestro del manga adulto»; mismo criterio que Los locos del Gekiga.
- **El chico de los ojos de gato** (Umezz): `⚠ 16+ · Horror` — Kazuo Umezz, mismo autor que La casa de los insectos (ya 16+ Horror).

**El catálogo cuenta con 54 fichas con indicador sensible** (16 con ⚠ 18+, 38 con ⚠ 16+), ninguna en Infantil ni Primaria. Se ha completado la revisión sistemática de las 279 fichas. Service Worker a `manga-ulpgc-v5.27`.

## Cambios v5.28 (verificación final del catálogo)

- **Yuko** (Ikegami): `⚠ 16+ · Temática adulta` — consistente con todos los demás títulos de Ryoichi Ikegami en el catálogo (Oen 16+, Santuario 18+, Vagabond 18+).
- **Family Compo** (Hojo): VERIFICADO como apropiado sin indicador — «mantiene el contenido a nivel PG» (Bleeding Cool); tratamiento sensible de la identidad trans sin contenido explícito.
- **Amor es cuando cesa la lluvia** (Mayuzuki): VERIFICADO como apropiado sin indicador — Zona Negativa confirma que es una «deconstrucción del fetiche del adulto», restrained y sin contenido explícito.

**El catálogo cuenta con 55 fichas con indicador sensible** (18+: 16 | 16+: 39). Quedan 3 títulos recomendados para inspección física: El hombre sediento (Koike), The Legend of Kamui (Shirato) y Nieve roja (Katsumata). Service Worker a `manga-ulpgc-v5.28`.

## Cambios v5.29 (calidad descriptiva del catálogo)

Mejoras de calidad descriptiva tras la verificación completa:
- **Devorar la tierra**: normalizada capitalización («Tierra» → «tierra», consistente con la obra de Tezuka).
- **Regreso al mar**: eliminado punto final residual del sistema OPAC; ahora consistente con la segunda edición.
- **Romeo y Julieta. (Shakespeare, 2020)** y **Romeo y Julieta (Igarashi, 2022)**: descripción diferenciada para dos adaptaciones distintas; la versión Igarashi menciona a la creadora de *Candy Candy* como reclamo didáctico.
- **Amor es cuando cesa la lluvia**: añadida nota de mediación docente sobre las dinámicas de poder en la relación de diferente edad.

La app tiene conteo dinámico de títulos sensibles; las 55 fichas marcadas se gestionan correctamente sin cambios en el código. Service Worker a `manga-ulpgc-v5.29`.

## Cambios v5.30 (audit técnico + ficha de trabajo)

Resultados del audit técnico de la aplicación en v5.29:
- **`ficha_trabajo_manga.pdf` creado** — el botón «↓ Descargar ficha de trabajo (PDF)» estaba apuntando a un fichero inexistente desde el principio. Se ha generado un worksheet completo (2 páginas, A4) con: datos del alumnado, sección de primer contacto con el manga, análisis del lenguaje visual, exploración del catálogo y reflexión crítica. Diseño editorial coherente con el recurso (colores, branding ULPGC, CC BY-NC 4.0). Añadido a la lista de precaché del Service Worker.
- **Calidad descriptiva del catálogo**: normalización de títulos (*Devorar la tierra*, *Regreso al mar*), tips diferenciados para las dos adaptaciones de *Romeo y Julieta* (Shakespeare 2020 vs. Igarashi 2022), nota de mediación docente en *Amor es cuando cesa la lluvia*.
- **Filtros y conteo sensible**: verificado que el sistema de conteo es 100% dinámico — no hay valores codificados en duro; las 55 fichas con indicador sensible se gestionan correctamente.

Service Worker a `manga-ulpgc-v5.30`.

## Cambios v5.31 (ficha de trabajo definitiva)

- **`ficha_trabajo_manga.pdf` actualizada**: sustituida por la versión definitiva elaborada por el equipo ULPGC/Aula de Cómic. La nueva ficha es de 2 páginas: la p.1 está diseñada para ESO, Bachillerato y Formación Universitaria (análisis histórico/cultural, análisis visual/semiótico, comprensión lectora, conexión curricular, tarea creativa y reflexión final); la p.2 para 2.º–3.er ciclo de Educación Primaria (8–12 años), con actividades adaptadas al nivel.
- **Comentario del Service Worker**: actualizado el ejemplo de nombre de caché del comentario interno (`v5.9` → `v5.31`).

Service Worker a `manga-ulpgc-v5.31`.

## Cambios v5.32 (generadores IA — correcciones)

Tres correcciones en el motor IA dual tras diagnóstico técnico del endpoint Anthropic:
- **Modelo actualizado**: `claude-sonnet-4-20250514` → `claude-sonnet-4-6` (modelo actual en producción).
- **Cabeceras añadidas** a `claudeRequest`: `anthropic-version: 2023-06-01` y `anthropic-dangerous-direct-browser-access: true`, requeridas para acceso directo desde el navegador.
- **UI honesta**: el mensaje «El asistente ya funciona con Claude IA sin ninguna configuración» era incorrecto para despliegue autónomo (solo es válido dentro de artifacts de claude.ai, donde el proxy inyecta la clave). El nuevo mensaje indica que se requiere la clave de Gemini para activar los generadores en servidor propio.

**Arquitectura resultante:**
- Servidor ULPGC autónomo: Gemini API key (Google AI Studio, gratuita) → generadores operativos.
- Artifact claude.ai: Claude Sonnet 4.6 → operativo sin configuración adicional.
- Sin clave: catálogo, S/A estáticas y ficha de trabajo disponibles sin IA.

Service Worker a `manga-ulpgc-v5.32`.

## Cambios v5.34 (texto: «primeras etapas» completo)

Corrección ampliada de «etapas bajas» → «primeras etapas»: la v5.33 solo actualizó `recurso.html`. Se localizaron y corrigieron dos ficheros adicionales:
- `landing/htm-app.js` (L192) — tarjeta de portada de la landing page (la que generaba la inconsistencia visible).
- `js/autocomprobacion-datos.js` (L74) — título del cuestionario de autocomprobación para esa sección.

El término «etapas bajas» ha desaparecido de todos los ficheros funcionales del proyecto. Service Worker a `manga-ulpgc-v5.34`.
