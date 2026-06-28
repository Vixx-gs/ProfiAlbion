import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { lookupItem } from './wiki-data';

const BIOME_MAP: Record<string, string> = {
  'T1_CARROT': 'Lymhurst',
  'T2_BEAN': 'Bridgewatch',
  'T3_WHEAT': 'Martlock',
  'T4_TURNIP': 'Fort Sterling',
  'T5_CABBAGE': 'Thetford',
  'T6_POTATO': 'Martlock',
  'T7_CORN': 'Bridgewatch',
  'T8_PUMPKIN': 'Lymhurst',
  'T2_AGARIC': 'Thetford',
  'T3_COMFREY': 'Caerleon',
  'T4_BURDOCK': 'Lymhurst',
  'T5_TEASEL': 'Bridgewatch',
  'T6_FOXGLOVE': 'Martlock',
  'T7_MULLEIN': 'Thetford',
  'T8_YARROW': 'Fort Sterling',
};

@Component({
  selector: 'app-wiki-item',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './wiki-item.html',
  styleUrl: './wiki-item.scss',
})
export class WikiItem {
  readonly params = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((p) => ({
        section: p.get('section') ?? '',
        category: p.get('category') ?? '',
        folder: p.get('item') ?? '',
      })),
    ),
    { initialValue: { section: '', category: '', folder: '' } },
  );

  readonly data = computed(() =>
    lookupItem(this.params().section, this.params().category, this.params().folder),
  );

  readonly cropName = computed(() => {
    const d = this.data();
    if (!d) return '';
    return d.name.replace(/^Semilla de /, '');
  });

  readonly recommendedCity = computed(() => {
    const d = this.data();
    return d ? (BIOME_MAP[d.harvestId] ?? 'Lymhurst') : 'Lymhurst';
  });

  iconUrl(): string {
    const d = this.data();
    if (!d) return '';
    return `https://render.albiononline.com/v1/item/${d.itemId}.png?size=64`;
  }

  get label(): string {
    const d = this.data();
    return d?.name ?? this.params().folder.replace(/_/g, ' ');
  }
}
