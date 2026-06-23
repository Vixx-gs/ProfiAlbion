import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  label: string;
  /** Item id de Albion para el icono (se renderiza con render.albiononline.com). */
  iconId?: string;
  shortcut?: string;
  /** Ruta interna a la que navega (si la tiene). */
  route?: string;
}

interface NavSection {
  title?: string;
  links: NavLink[];
}

interface NavMenu {
  label: string;
  /** Secciones enriquecidas (con icono/atajo). Tiene prioridad sobre `items`. */
  sections?: NavSection[];
  /** Lista simple de enlaces. */
  items?: string[];
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly version = 'v0.1.0';

  readonly menus: NavMenu[] = [
    {
      label: 'Calculadoras de Profit',
      sections: [
        {
          links: [
            { label: 'Calculadora de Agricultura', iconId: 'T8_PUMPKIN', shortcut: 'Ctrl + 1' },
            { label: 'Calculadora de Animales', iconId: 'T8_FARM_OX_GROWN', shortcut: 'Ctrl + 2' },
            { label: 'Calculadora de Trabajadores', iconId: 'T8_JOURNAL_WOOD' },
            { label: 'Calculadora de Encantamiento', iconId: 'T8_RUNE' },
            { label: 'Calculadora de Refinado', iconId: 'T8_METALBAR', shortcut: 'Ctrl + 6' },
            { label: 'Calculadora de Flipping de Mercado', iconId: 'T8_BAG', shortcut: 'Ctrl + 3', route: '/flips' },
            { label: 'Calculadora de Cocina', iconId: 'T8_MEAL_STEW', shortcut: 'Ctrl + 4' },
            { label: 'Calculadora de Alquimia', iconId: 'T8_POTION_LAVA', shortcut: 'Ctrl + 5' },
            { label: 'Calculadora de Pescado Troceado', iconId: 'T8_FISH_FRESHWATER_ALL_COMMON' },
          ],
        },
      ],
    },
    {
      label: 'Herramientas',
      sections: [
        {
          links: [
            { label: 'Comprobador de precios', iconId: 'T8_JOURNAL_WOOD', shortcut: 'Ctrl + 8' },
            { label: 'Precios de recursos', iconId: 'T8_METALBAR' },
            { label: 'Mapa de Avalon', iconId: 'T8_RELIC' },
            { label: 'Gestión de islas', iconId: 'T8_PUMPKIN' },
            { label: 'Mercado de la isla', iconId: 'T8_BAG' },
            { label: 'Temporizadores', iconId: 'T8_POTION_LAVA' },
            { label: 'Historial del precio del oro', iconId: 'T4_SKILLBOOK_STANDARD' },
            { label: 'Planificador de crafteo', iconId: 'T8_2H_HAMMER', shortcut: 'Ctrl + 7' },
            { label: 'Gestión de maestrías', iconId: 'T8_RUNE' },
          ],
        },
      ],
    },
    { label: 'Builds', items: ['Builds Meta', 'PvP', 'PvE'] },
    { label: 'Guías', items: ['Para empezar', 'Economía', 'Mazmorras'] },
    { label: 'Tablas', items: ['Items', 'Recursos', 'Encantamientos'] },
    { label: 'Más', items: ['Sobre ProfiAlbion', 'Discord', 'Patreon'] },
  ];
}
