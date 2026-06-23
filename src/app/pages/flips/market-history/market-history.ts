import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AlbionDataService, HistoryPoint } from '../../../core/albion-data.service';
import { MarketFlip } from '../../../core/market-flips.service';

/** Escala temporal: horas por punto + cuántos puntos mostrar. */
interface Scale {
  label: string;
  timeScale: number;
  points: number;
}

/** Geometría calculada de un punto de la gráfica. */
interface ChartPoint {
  x: number;
  priceY: number;
  barY: number;
  barH: number;
  price: number;
  count: number;
  time: string;
}

@Component({
  selector: 'app-market-history',
  imports: [DecimalPipe],
  templateUrl: './market-history.html',
  styleUrl: './market-history.scss',
})
export class MarketHistory implements OnInit {
  private readonly api = inject(AlbionDataService);

  /** Flip cuyo histórico se muestra. */
  readonly flip = input.required<MarketFlip>();
  /** Cerrar el modal. */
  readonly close = output<void>();

  readonly scales: Scale[] = [
    { label: '24 horas', timeScale: 1, points: 24 },
    { label: '7 días', timeScale: 6, points: 28 },
    { label: '4 semanas', timeScale: 24, points: 28 },
  ];

  readonly scale = signal<Scale>(this.scales[0]);

  /** Ciudades disponibles para el filtro. */
  readonly cities = AlbionDataService.CITIES;
  /** Ciudad cuyo histórico se consulta (por defecto la de venta del flip). */
  readonly selectedCity = signal<string>('');

  readonly points = signal<HistoryPoint[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  /** Índice del punto resaltado al pasar el ratón. */
  readonly hover = signal<number | null>(null);

  private sub?: import('rxjs').Subscription;

  // Dimensiones del lienzo SVG.
  readonly W = 620;
  readonly H = 230;
  private readonly padL = 38;
  private readonly padR = 16;
  private readonly padT = 16;
  private readonly padB = 30;

  ngOnInit(): void {
    // Por defecto, la ciudad de venta del flip.
    this.selectedCity.set(this.flip().sellCity);
    this.load();
  }

  cityName(): string {
    return this.selectedCity();
  }

  setScale(s: Scale): void {
    this.scale.set(s);
    this.load();
  }
  setCity(target: EventTarget | null): void {
    const city = (target as HTMLSelectElement).value;
    if (city === this.selectedCity()) return;
    this.selectedCity.set(city);
    this.load();
  }

  private load(): void {
    const f = this.flip();
    const city = this.cityName();
    const s = this.scale();
    this.loading.set(true);
    this.error.set(null);
    this.hover.set(null);
    this.sub?.unsubscribe();
    this.sub = this.api.getHistory(f.itemId, [city], [f.quality], s.timeScale).subscribe({
      next: (entries) => {
        const entry = entries.find((e) => e.location === city) ?? entries[0];
        const data = (entry?.data ?? []).slice(-s.points);
        this.points.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial.');
        this.loading.set(false);
      },
    });
  }

  /** Precio medio del periodo mostrado. */
  readonly avgPrice = computed<number>(() => {
    const pts = this.points();
    if (!pts.length) return 0;
    return Math.round(pts.reduce((s, p) => s + p.avg_price, 0) / pts.length);
  });

  /** Geometría de la gráfica (null si no hay datos). */
  readonly chart = computed(() => {
    const pts = this.points();
    if (!pts.length) return null;

    const innerW = this.W - this.padL - this.padR;
    const innerH = this.H - this.padT - this.padB;
    const n = pts.length;
    const priceMax = Math.max(...pts.map((p) => p.avg_price), 1);
    const countMax = Math.max(...pts.map((p) => p.item_count), 1);
    const barAreaH = innerH * 0.5; // las barras ocupan la mitad inferior
    const stepX = n > 1 ? innerW / (n - 1) : 0;

    const fmt = (iso: string): string => {
      const d = new Date(iso + 'Z');
      return this.scale().timeScale === 1
        ? `${d.getHours()}:00`
        : `${d.getDate()}/${d.getMonth() + 1}`;
    };

    const items: ChartPoint[] = pts.map((p, i) => {
      const x = n > 1 ? this.padL + i * stepX : this.padL + innerW / 2;
      const priceY = this.padT + (1 - p.avg_price / priceMax) * innerH;
      const barH = (p.item_count / countMax) * barAreaH;
      return {
        x,
        priceY,
        barH,
        barY: this.padT + innerH - barH,
        price: p.avg_price,
        count: p.item_count,
        time: fmt(p.timestamp),
      };
    });

    const linePath = items
      .map((it, i) => `${i ? 'L' : 'M'}${it.x.toFixed(1)} ${it.priceY.toFixed(1)}`)
      .join(' ');

    // Etiquetas del eje X en 4 posiciones.
    const ticks = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((i) => ({ x: items[i].x, label: items[i].time }));

    return {
      items,
      linePath,
      priceMax,
      barW: Math.max(3, stepX * 0.55),
      ticks,
      baseY: this.padT + innerH,
      topY: this.padT,
    };
  });

  /** Tooltip del punto resaltado. */
  readonly tip = computed(() => {
    const h = this.hover();
    const c = this.chart();
    if (h == null || !c) return null;
    const it = c.items[h];
    // Lado del tooltip para que no se salga por la derecha.
    const left = it.x > this.W * 0.6;
    return { x: it.x, y: it.priceY, price: it.price, count: it.count, time: it.time, left };
  });

  setHover(i: number): void {
    this.hover.set(i);
  }
  clearHover(): void {
    this.hover.set(null);
  }

  onClose(): void {
    this.sub?.unsubscribe();
    this.close.emit();
  }

  /** Icono del item. */
  iconUrl(): string {
    return `https://render.albiononline.com/v1/item/${this.flip().itemId}.png?size=64`;
  }
}
