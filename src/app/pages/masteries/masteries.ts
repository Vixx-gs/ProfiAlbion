import { Component, HostListener, computed, effect, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MASTERIES_CATALOG, MasteryDef } from './masteries.catalog';
import { GameInfoService, SearchResult, PlayerInfo } from '../../core/gameinfo.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface CharacterSheet {
  id: string;
  name: string;
  playerId: string | null;
  guildName: string | null;
  allianceName: string | null;
  allianceTag: string | null;
  killFame: number;
  deathFame: number;
  pveFame: number;
  gatheringFame: number;
  craftingFame: number;
  avatar: string | null;
  avatarRing: string | null;
  createdAt: number;
}

type MasteryLevels = Record<string, number>;

const AVATARS = Array.from({ length: 11 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return [`AVATAR_${n}`, `AVATAR_${n}_FEMALE`];
}).flat();

const STORAGE_KEY = 'profialbion.characterSheets';
const ACTIVE_KEY = 'profialbion.activeCharacterSheet';
const LEVELS_PREFIX = 'profialbion.masteryLevels.';

function formatFame(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function avatarUrl(name: string | null): string | null {
  if (!name) return null;
  return `https://www.albiondatabase.com/icons/avatars/${encodeURIComponent(name)}.png`;
}

@Component({
  selector: 'app-masteries',
  imports: [FormsModule],
  templateUrl: './masteries.html',
  styleUrl: './masteries.scss',
})
export class Masteries {
  private readonly gameinfo = inject(GameInfoService);

  readonly sheets = signal<CharacterSheet[]>(this.loadSheets());
  readonly activeId = signal<string | null>(this.loadActiveId());
  readonly editingId = signal<string | null>(null);
  readonly creating = signal(false);

  formName = '';
  formGuild = '';
  formAlliance = '';
  formAllianceTag = '';
  formKillFame = 0;
  formDeathFame = 0;
  formPvEFame = 0;
  formGatheringFame = 0;
  formCraftingFame = 0;
  formAvatar = '';
  formAvatarRing = '';

  readonly searchQuery = signal('');
  readonly searchResults = signal<SearchResult[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly playerFound = signal<SearchResult | null>(null);
  readonly playerDetail = signal<PlayerInfo | null>(null);
  readonly searchOpen = signal(false);
  readonly avatarPickerOpen = signal(false);

  private readonly search$ = new Subject<string>();

  readonly masteries = MASTERIES_CATALOG;
  readonly expanded = signal<ReadonlySet<string>>(new Set());

  toggleExpanded(key: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  private readonly savedLevels = signal<MasteryLevels>(this.loadLevels(this.activeId()));
  readonly draftLevels = signal<MasteryLevels>({ ...this.savedLevels() });

  readonly hasChanges = computed(() => {
    const saved = this.savedLevels();
    const draft = this.draftLevels();
    const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
    for (const key of keys) {
      if ((saved[key] ?? 0) !== (draft[key] ?? 0)) return true;
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

    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.length < 2) {
            this.searchResults.set([]);
            this.searchOpen.set(false);
            this.searching.set(false);
            return [];
          }
          this.searching.set(true);
          this.searchError.set(null);
          return this.gameinfo.search(q);
        }),
      )
      .subscribe((results) => {
        this.searching.set(false);
        if (results.length) {
          this.searchResults.set(results);
          this.searchOpen.set(true);
        } else {
          this.searchResults.set([]);
          this.searchOpen.set(false);
        }
      });
  }

  onSearchInput(target: EventTarget | null): void {
    const value = (target as HTMLInputElement).value;
    this.formName = value;
    this.searchQuery.set(value);
    this.playerFound.set(null);
    this.playerDetail.set(null);
    this.searchError.set(null);
    this.resetFormFields();
    this.search$.next(value);
  }

  selectPlayer(result: SearchResult): void {
    this.formName = result.Name;
    this.searchQuery.set(result.Name);
    this.playerFound.set(result);
    this.searchOpen.set(false);
    this.searchError.set(null);

    this.formGuild = result.GuildName ?? '';
    this.formAlliance = result.AllianceName ?? '';
    this.formAllianceTag = result.AllianceTag ?? '';
    this.formKillFame = result.KillFame ?? 0;
    this.formDeathFame = result.DeathFame ?? 0;
    this.formAvatar = result.Avatar ?? '';
    this.formAvatarRing = result.AvatarRing ?? '';

    this.gameinfo.getPlayer(result.Id).subscribe((detail) => {
      this.playerDetail.set(detail);
      if (detail) {
        this.formPvEFame = detail.LifetimeStatistics?.PvE?.Total ?? 0;
        this.formGatheringFame = detail.LifetimeStatistics?.Gathering?.All?.Total ?? 0;
        this.formCraftingFame = detail.LifetimeStatistics?.Crafting?.Total ?? 0;
      }
    });
  }

  private resetFormFields(): void {
    this.formGuild = '';
    this.formAlliance = '';
    this.formAllianceTag = '';
    this.formKillFame = 0;
    this.formDeathFame = 0;
    this.formPvEFame = 0;
    this.formGatheringFame = 0;
    this.formCraftingFame = 0;
    this.formAvatar = '';
    this.formAvatarRing = '';
  }

  selectAvatar(name: string): void {
    this.formAvatar = name;
    this.avatarPickerOpen.set(false);
  }

  clearSearch(): void {
    this.formName = '';
    this.resetFormFields();
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchOpen.set(false);
    this.playerFound.set(null);
    this.playerDetail.set(null);
    this.searchError.set(null);
  }

  closeSearch(): void {
    setTimeout(() => this.searchOpen.set(false), 200);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

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

  totalFor(m: MasteryDef): number {
    if (m.subMasteries?.length) {
      return m.subMasteries.reduce((sum, s) => sum + this.subLevel(m.key, s.key), 0);
    }
    return this.draftLevels()[m.key] ?? 0;
  }

  saveChanges(): void {
    const id = this.activeId();
    if (!id) return;
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
    if (!id) return {};
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
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.clearSearch();
    this.creating.set(true);
  }

  openEditForm(sheet: CharacterSheet): void {
    this.creating.set(false);
    this.editingId.set(sheet.id);
    this.formName = sheet.name;
    this.formGuild = sheet.guildName ?? '';
    this.formAlliance = sheet.allianceName ?? '';
    this.formAllianceTag = sheet.allianceTag ?? '';
    this.formKillFame = sheet.killFame;
    this.formDeathFame = sheet.deathFame;
    this.formPvEFame = sheet.pveFame;
    this.formGatheringFame = sheet.gatheringFame;
    this.formCraftingFame = sheet.craftingFame;
    this.formAvatar = sheet.avatar ?? '';
    this.formAvatarRing = sheet.avatarRing ?? '';
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchOpen.set(false);
    this.playerFound.set(null);
    this.playerDetail.set(null);
  }

  cancelForm(): void {
    this.creating.set(false);
    this.editingId.set(null);
    this.clearSearch();
  }

  saveForm(): void {
    const name = this.formName.trim();
    if (!name) return;

    const found = this.playerFound();

    const editingId = this.editingId();
    if (editingId) {
      this.sheets.update((list) =>
        list.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name,
                playerId: found?.Id ?? s.playerId,
                guildName: this.formGuild || null,
                allianceName: this.formAlliance || null,
                allianceTag: this.formAllianceTag || null,
                killFame: this.formKillFame,
                deathFame: this.formDeathFame,
                pveFame: this.formPvEFame,
                gatheringFame: this.formGatheringFame,
                craftingFame: this.formCraftingFame,
                avatar: this.formAvatar || found?.Avatar || null,
                avatarRing: this.formAvatarRing || found?.AvatarRing || null,
              }
            : s,
        ),
      );
    } else {
      const sheet: CharacterSheet = {
        id: crypto.randomUUID(),
        name,
        playerId: found?.Id ?? null,
        guildName: this.formGuild || null,
        allianceName: this.formAlliance || null,
        allianceTag: this.formAllianceTag || null,
        killFame: this.formKillFame,
        deathFame: this.formDeathFame,
        pveFame: this.formPvEFame,
        gatheringFame: this.formGatheringFame,
        craftingFame: this.formCraftingFame,
        avatar: this.formAvatar || found?.Avatar || null,
        avatarRing: this.formAvatarRing || found?.AvatarRing || null,
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

  protected readonly formatFame = formatFame;
  protected readonly avatarUrl = avatarUrl;
  protected readonly AVATARS = AVATARS;
}
