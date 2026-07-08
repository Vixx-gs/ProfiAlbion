import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SearchResult {
  Id: string;
  Name: string;
  GuildId: string;
  GuildName: string | null;
  AllianceId: string;
  AllianceName: string | null;
  AllianceTag: string;
  Avatar: string;
  AvatarRing: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  totalKills: number | null;
  gvgKills: number | null;
  gvgWon: number | null;
}

interface SearchResponse {
  guilds: unknown[];
  players: SearchResult[];
}

interface GatheringStat {
  Total: number;
  Royal: number;
  Outlands: number;
  Avalon: number;
}

export interface PlayerInfo {
  Id: string;
  Name: string;
  GuildName: string;
  GuildId: string;
  AllianceName: string;
  AllianceId: string;
  AllianceTag: string;
  Avatar: string;
  AvatarRing: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  AverageItemPower: number;
  Equipment: Record<string, unknown>;
  LifetimeStatistics: {
    PvE: GatheringStat;
    Gathering: {
      All: GatheringStat;
      Fiber: GatheringStat;
      Hide: GatheringStat;
      Ore: GatheringStat;
      Rock: GatheringStat;
      Wood: GatheringStat;
    };
    Crafting: GatheringStat;
    CrystalLeague: number;
    FishingFame: number;
    FarmingFame: number;
  };
}

type Region = 'us' | 'eu' | 'asia';
const REGION: Region = 'eu';

function gameinfoUrl(path: string): string {
  return `/api/gameinfo${path}`;
}

@Injectable({ providedIn: 'root' })
export class GameInfoService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<SearchResult[]> {
    if (!query || query.length < 2) return of([]);
    return this.http
      .get<SearchResponse>(`${gameinfoUrl('/search?q=')}${encodeURIComponent(query)}`)
      .pipe(
        map((res) => res.players ?? []),
        catchError(() => of([])),
      );
  }

  getPlayer(playerId: string): Observable<PlayerInfo | null> {
    return this.http
      .get<PlayerInfo>(`${gameinfoUrl('/players/')}${encodeURIComponent(playerId)}`)
      .pipe(
        catchError(() => of(null)),
      );
  }

  searchPlayerExact(name: string): Observable<SearchResult | null> {
    return this.search(name).pipe(
      map((results) => {
        const exact = results.find(
          (r) => r.Name.toLowerCase() === name.trim().toLowerCase(),
        );
        return exact ?? null;
      }),
    );
  }
}
