// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

/**
 * Contratos de produccion del catalogo.
 *
 * Estas pruebas no validan preferencias editoriales: protegen invariantes que
 * romperian filtros, rutas docentes, PWA, fichas PDF o lectura guiada.
 */

const RECURSO = '/recurso.html';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATOS_JS = path.resolve(__dirname, '../../site/js/datos.js');

const USO_BADGE = {
  historia: 'Historia',
  filosofia: 'Filosofía y ética',
  emocional: 'Educación emocional',
  lenguas: 'Lengua extranjera',
  inclusion: 'Inclusión',
  visual: 'Alfabetización visual',
  ciencia: 'Ciencia y tecnología',
  genero: 'Género e identidad',
};

const NIVEL_LABEL = {
  infantil: 'Infantil',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  bachillerato: 'Bachillerato',
  universidad: 'Universidad',
};

function catalog() {
  const context = { window: {} };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(DATOS_JS, 'utf8'), context, { filename: DATOS_JS });
  return context.window.CATALOGO;
}

test.describe('Catalogo · contratos de datos', () => {
  test('mantiene 283 entradas con titulos exactos no duplicados', async () => {
    const cat = catalog();
    expect(cat).toHaveLength(283);

    const titles = cat.map((t) => String(t.titulo || '').trim());
    expect(titles.filter(Boolean)).toHaveLength(283);

    const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(duplicates, 'Titulos exactos duplicados').toHaveLength(0);
  });

  test('cada ficha tiene campos minimos, OPAC y ODS validos', async () => {
    const cat = catalog();
    const invalid = cat.flatMap((t, i) => {
      const errors = [];
      for (const field of ['titulo', 'autor', 'uso', 'nivel', 'color', 'tip', 'periodo', 'opac']) {
        if (!String(t[field] || '').trim()) errors.push(`${i + 1} ${t.titulo || '(sin titulo)'}: falta ${field}`);
      }
      if (!/^#[0-9a-f]{6}$/i.test(String(t.color || ''))) errors.push(`${i + 1} ${t.titulo}: color invalido`);
      if (!String(t.opac || '').includes('opac.ulpgc.es')) errors.push(`${i + 1} ${t.titulo}: OPAC no ULPGC`);
      if (!Array.isArray(t.ods) || !t.ods.every((n) => Number.isInteger(n) && n >= 1 && n <= 17)) {
        errors.push(`${i + 1} ${t.titulo}: ODS invalidos`);
      }
      return errors;
    });

    expect(invalid, invalid.join('\n')).toHaveLength(0);
  });

  test('uso/badges y nivel/niveles son coherentes', async () => {
    const cat = catalog();
    const bad = [];

    for (const [i, t] of cat.entries()) {
      const usos = String(t.uso || '').split(/\s+/).filter(Boolean);
      const niveles = String(t.nivel || '').split(/\s+/).filter(Boolean);

      for (const uso of usos) {
        if (!USO_BADGE[uso]) bad.push(`${i + 1} ${t.titulo}: uso desconocido "${uso}"`);
        else if (!Array.isArray(t.badges) || !t.badges.includes(USO_BADGE[uso])) {
          bad.push(`${i + 1} ${t.titulo}: falta badge "${USO_BADGE[uso]}"`);
        }
      }

      for (const badge of t.badges || []) {
        if (!Object.values(USO_BADGE).includes(badge)) bad.push(`${i + 1} ${t.titulo}: badge desconocido "${badge}"`);
        else if (!usos.some((uso) => USO_BADGE[uso] === badge)) bad.push(`${i + 1} ${t.titulo}: badge extra "${badge}"`);
      }

      for (const nivel of niveles) {
        if (!NIVEL_LABEL[nivel]) bad.push(`${i + 1} ${t.titulo}: nivel desconocido "${nivel}"`);
        else if (!Array.isArray(t.niveles) || !t.niveles.includes(NIVEL_LABEL[nivel])) {
          bad.push(`${i + 1} ${t.titulo}: falta nivel visible "${NIVEL_LABEL[nivel]}"`);
        }
      }

      for (const label of t.niveles || []) {
        if (!Object.values(NIVEL_LABEL).includes(label)) bad.push(`${i + 1} ${t.titulo}: nivel visible desconocido "${label}"`);
        else if (!niveles.some((nivel) => NIVEL_LABEL[nivel] === label)) bad.push(`${i + 1} ${t.titulo}: nivel visible extra "${label}"`);
      }
    }

    expect(bad, bad.join('\n')).toHaveLength(0);
  });

  test('advertencias sensibles son explicitas y no aparecen en etapas bajas', async () => {
    const cat = catalog();
    const sensitive = cat.filter((t) => t.sensitive);

    expect(sensitive.length, 'El paquete revisado espera 59 fichas sensibles').toBe(59);

    const bad = sensitive.flatMap((t, i) => {
      const errors = [];
      if (!String(t.sens_label || '').trim()) errors.push(`${i + 1} ${t.titulo}: sensitive sin sens_label`);
      if (String(t.nivel || '').includes('infantil') || String(t.nivel || '').includes('primaria')) {
        errors.push(`${i + 1} ${t.titulo}: sensitive en Infantil/Primaria`);
      }
      return errors;
    });

    expect(bad, bad.join('\n')).toHaveLength(0);
  });

  test('el color de cada ficha coincide con su primer uso pedagogico', async () => {
    const cat = catalog();
    const colors = {
      historia: '#5A3A1A',
      filosofia: '#4A2A6A',
      emocional: '#7A5A0A',
      lenguas: '#2E6E3A',
      inclusion: '#3A4A8A',
      visual: '#5E3A8A',
      ciencia: '#1A5A8B',
      genero: '#8B1A4A',
    };
    const result = cat.flatMap((t, i) => {
      const first = String(t.uso || '').split(/\s+/).filter(Boolean)[0];
      const expected = colors[first];
      return expected && t.color !== expected ? [`${i + 1} ${t.titulo}: ${t.color} != ${expected}`] : [];
    });

    expect(result, result.join('\n')).toHaveLength(0);
  });
});

test.describe('Selector docente · contratos de experiencia', () => {
  test('arranca en modo aula con seleccion visible y catalogo colapsado', async ({ page }) => {
    await page.goto(RECURSO);
    await page.waitForSelector('#docenteResults .docente-card');

    await expect(page.locator('#catalogo')).toHaveClass(/catalog-collapsed/);
    await expect(page.locator('#modeAulaBtn')).toHaveAttribute('aria-pressed', 'true');

    const cards = await page.locator('#docenteResults .docente-card').count();
    expect(cards).toBeGreaterThan(0);
    expect(cards).toBeLessThanOrEqual(12);
  });

  test('las rutas docentes renderizan titulos existentes del catalogo', async ({ page }) => {
    await page.goto(RECURSO);
    await page.waitForSelector('#docenteResults .docente-card');

    const routes = ['primeros', 'memoria', 'cuerpo', 'identidad', 'yokai'];
    for (const route of routes) {
      await page.locator(`[data-action="applyDocenteRoute"][data-arg="${route}"]`).click();
      await expect(page.locator('#docenteResults .ruta-selection-note')).toBeVisible();
      await expect(page.locator('#docenteResults .docente-card')).toHaveCount(6);
    }
  });

  test('modo biblioteca expande el fondo completo sin perder estado accesible', async ({ page }) => {
    await page.goto(RECURSO);
    await page.waitForSelector('#docenteResults .docente-card');

    await page.locator('#modeBibliotecaBtn').click();
    await expect(page.locator('#catalogo')).not.toHaveClass(/catalog-collapsed/);
    await expect(page.locator('#modeBibliotecaBtn')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('#modeAulaBtn').click();
    await expect(page.locator('#catalogo')).toHaveClass(/catalog-collapsed/);
    await expect(page.locator('#modeAulaBtn')).toHaveAttribute('aria-pressed', 'true');
  });
});
