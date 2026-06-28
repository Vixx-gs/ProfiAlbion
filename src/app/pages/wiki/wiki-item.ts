import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { lookupItem } from './wiki-data';

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
