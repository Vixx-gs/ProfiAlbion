import { Component, HostListener, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MASTERIES_CATALOG, MasteryDef } from './masteries.catalog';

/** Ficha de personaje guardada localmente en el navegador. */
interface CharacterSheet {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

/** Niveles de maestría por profesión, p.ej. { "Espada": 45, "Arco": 12 }. */
type MasteryLevels = Record<string, number>;

const STORAGE_KEY = 'profialbion.characterSheets';
const ACTIVE_KEY = 'profialbion.activeCharacterSheet';
const LEVELS_PREFIX = 'profialbion.masteryLevels.';

@Component({
  selector: 'app-masteries',
  imports: [FormsModule],
  templateUrl: './masteries.html',
  styleUrl: './masteries.scss',
})
export class Masteries {
  readonly sheets = signal<CharacterSheet[]>(this.loadSheets());
  readonly activeId = signal<string | null>(this.loadActiveId());

  /** Id de la ficha que se está editando (null = ninguna). */
  readonly editingId = signal<string | null>(null);
  /** Si el formulario de nueva ficha está abierto. */
  readonly creating = signal(false);

  formName = '';
  formDescription = '';

  /** Catálogo de maestrías a listar. */
  readonly masteries = MASTERIES_CATALOG;
  /** Claves de las maestrías actualmente desplegadas. */
  readonly expanded = signal<ReadonlySet<string>>(new Set());

  toggleExpanded(key: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  /** Niveles guardados (última vez que se pulsó "Guardar cambios"). */
  private readonly savedLevels = signal<MasteryLevels>(this.loadLevels(this.activeId()));
  /** Niveles en edición (lo que se ve y se toca en pantalla). */
  readonly draftLevels = signal<MasteryLevels>({ ...this.savedLevels() });

  readonly hasChanges = computed(() => {
    const saved = this.savedLevels();
    const draft = this.draftLevels();
    const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
    for (const key of keys) {
      if ((saved[key] ?? 0) !== (draft[key] ?? 0)) {
        return true;
      }
    }
    return false;
  });

  constructor() {
    effect(() => {
      const id = this.activeId();
      const levels = this.loadLevels(id);
      this.savedLevels.set(levels);
      this.draftLevels.set({ ...levels });
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }

    if (event.key.toLowerCase() === 'a' && this.hasChanges()) {
      event.preventDefault();
      this.saveChanges();
    } else if (event.key.toLowerCase() === 'x') {
      event.preventDefault();
      this.resetAllLevels();
    }
  }

  setLevel(profession: string, level: number): void {
    this.draftLevels.update((levels) => ({ ...levels, [profession]: level }));
  }

  // ===== Sub-maestrías (p.ej. los elaboradores de Alquimia) =====

  /** Clave compuesta bajo la que se guarda el nivel de una sub-maestría. */
  private subKey(parentKey: string, subKey: string): string {
    return `${parentKey}.${subKey}`;
  }

  subLevel(parentKey: string, subKey: string): number {
    return this.draftLevels()[this.subKey(parentKey, subKey)] ?? 0;
  }

  setSubLevel(parentKey: string, subKey: string, max: number, value: number): void {
    const clamped = Math.max(0, Math.min(max, Math.round(value) || 0));
    this.setLevel(this.subKey(parentKey, subKey), clamped);
  }

  onSubSlider(parentKey: string, subKey: string, max: number, target: EventTarget | null): void {
    this.setSubLevel(parentKey, subKey, max, Number((target as HTMLInputElement).value));
  }

  incSub(parentKey: string, subKey: string, max: number): void {
    this.setSubLevel(parentKey, subKey, max, this.subLevel(parentKey, subKey) + 1);
  }

  decSub(parentKey: string, subKey: string, max: number): void {
    this.setSubLevel(parentKey, subKey, max, this.subLevel(parentKey, subKey) - 1);
  }

  maxSub(parentKey: string, subKey: string, max: number): void {
    this.setSubLevel(parentKey, subKey, max, max);
  }

  /** Nivel total de una maestría: suma de sus sub-maestrías, o su propio nivel si no las tiene. */
  totalFor(m: MasteryDef): number {
    if (m.subMasteries?.length) {
      return m.subMasteries.reduce((sum, s) => sum + this.subLevel(m.key, s.key), 0);
    }
    return this.draftLevels()[m.key] ?? 0;
  }

  saveChanges(): void {
    const id = this.activeId();
    if (!id) {
      return;
    }
    this.savedLevels.set({ ...this.draftLevels() });
    localStorage.setItem(LEVELS_PREFIX + id, JSON.stringify(this.savedLevels()));
  }

  discardChanges(): void {
    this.draftLevels.set({ ...this.savedLevels() });
  }

  resetAllLevels(): void {
    this.draftLevels.set({});
  }

  private loadLevels(id: string | null): MasteryLevels {
    if (!id) {
      return {};
    }
    try {
      const raw = localStorage.getItem(LEVELS_PREFIX + id);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private loadSheets(): CharacterSheet[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadActiveId(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sheets()));
  }

  private persistActive(): void {
    const id = this.activeId();
    if (id) {
      localStorage.setItem(ACTIVE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formDescription = '';
    this.creating.set(true);
  }

  openEditForm(sheet: CharacterSheet): void {
    this.creating.set(false);
    this.editingId.set(sheet.id);
    this.formName = sheet.name;
    this.formDescription = sheet.description;
  }

  cancelForm(): void {
    this.creating.set(false);
    this.editingId.set(null);
  }

  saveForm(): void {
    const name = this.formName.trim();
    if (!name) {
      return;
    }

    const editingId = this.editingId();
    if (editingId) {
      this.sheets.update((list) =>
        list.map((s) =>
          s.id === editingId ? { ...s, name, description: this.formDescription.trim() } : s,
        ),
      );
    } else {
      const sheet: CharacterSheet = {
        id: crypto.randomUUID(),
        name,
        description: this.formDescription.trim(),
        createdAt: Date.now(),
      };
      this.sheets.update((list) => [...list, sheet]);
      if (!this.activeId()) {
        this.activeId.set(sheet.id);
        this.persistActive();
      }
    }

    this.persist();
    this.cancelForm();
  }

  setActive(id: string): void {
    this.activeId.set(id);
    this.persistActive();
  }

  remove(id: string): void {
    this.sheets.update((list) => list.filter((s) => s.id !== id));
    this.persist();
    localStorage.removeItem(LEVELS_PREFIX + id);

    if (this.activeId() === id) {
      const next = this.sheets()[0]?.id ?? null;
      this.activeId.set(next);
      this.persistActive();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('es-ES');
  }
}
