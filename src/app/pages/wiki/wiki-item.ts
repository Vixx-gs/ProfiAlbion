import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { lookupItem, lookupAnimal } from './wiki-data';

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

  readonly animal = computed(() => {
    if (this.params().section !== 'animales') return null;
    return lookupAnimal(this.params().folder);
  });

  iconUrl(itemId: string = ''): string {
    const id = itemId || this.data()?.itemId;
    if (!id) return '';
    return `https://render.albiononline.com/v1/item/${id}.png?size=64`;
  }

  itemUrl(itemId: string): string {
    return `https://render.albiononline.com/v1/item/${itemId}.png?size=64`;
  }

  get label(): string {
    const d = this.data();
    return d?.name ?? this.params().folder.replace(/_/g, ' ');
  }

  get mode(): string {
    if (this.params().section === 'animales') return 'Animal';
    if (this.params().section === 'semillas') return 'Semilla';
    return 'Cultivo';
  }

  get category(): string {
    const cat = this.params().category;
    if (cat === 'agricultor') return 'Agricultor';
    if (cat === 'herborista') return 'Herborista';
    return '';
  }
}
