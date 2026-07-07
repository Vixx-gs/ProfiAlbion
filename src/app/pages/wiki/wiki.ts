import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ALL_CROP_FOLDERS, ALL_HERB_FOLDERS, ALL_ANIMAL_FOLDERS } from './wiki-data';

@Component({
  selector: 'app-wiki',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './wiki.html',
  styleUrl: './wiki.scss',
})
export class Wiki {
  readonly CROP_FOLDERS = ALL_CROP_FOLDERS;
  readonly HERB_FOLDERS = ALL_HERB_FOLDERS;
  readonly ANIMAL_FOLDERS = ALL_ANIMAL_FOLDERS;

  readonly expandedSection = signal<'cultivos' | 'semillas' | 'animales' | null>(null);
  readonly expandedCategory = signal<'agricultor' | 'herborista' | null>(null);

  toggleSection(section: 'cultivos' | 'semillas' | 'animales'): void {
    if (this.expandedSection() === section) {
      this.expandedSection.set(null);
      this.expandedCategory.set(null);
    } else {
      this.expandedSection.set(section);
      this.expandedCategory.set(null);
    }
  }

  toggleCategory(cat: 'agricultor' | 'herborista'): void {
    if (this.expandedCategory() === cat) {
      this.expandedCategory.set(null);
    } else {
      this.expandedCategory.set(cat);
    }
  }

  itemRoute(folder: string): string {
    const section = this.expandedSection();
    const cat = this.expandedCategory();
    if (!section || !cat) return '';
    const f = section === 'semillas' ? `Semilla_${folder}` : folder;
    return `/wiki/${section}/${cat}/${f}`;
  }

  animalRoute(folder: string): string {
    return `/wiki/animales/ganadero/${folder}`;
  }
}
