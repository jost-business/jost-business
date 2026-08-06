import { Injectable, signal, computed, inject } from '@angular/core';
import { WidgetRegistryService } from './widget-registry.service';
import { WidgetItem, SerializedLayout } from '../models/widget.model';

const STORAGE_KEY = 'portal-dashboard-layout-v1';
const COLS = 12;

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly registry = inject(WidgetRegistryService);

  private readonly _items = signal<WidgetItem[]>(this.loadLayout());

  readonly allWidgets = this._items.asReadonly();

  readonly visibleWidgets = computed(() =>
    this._items().filter(w => w.visible)
  );

  moveWidget(id: string, x: number, y: number): void {
    this._items.update(items =>
      items.map(w => (w.id === id ? { ...w, x, y } : w))
    );
    this.persist();
  }

  toggleWidget(id: string): void {
    this._items.update(items =>
      items.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
    this.persist();
  }

  resetLayout(): void {
    this._items.set(this.buildDefaultLayout());
    this.persist();
  }

  private buildDefaultLayout(): WidgetItem[] {
    let x = 0, y = 0, rowH = 0;
    return this.registry.widgets.map(def => {
      if (x + def.defaultW > COLS) {
        x = 0;
        y += rowH;
        rowH = 0;
      }
      const item: WidgetItem = {
        ...def,
        x, y,
        w: def.defaultW,
        h: def.defaultH,
        visible: true,
      };
      x += def.defaultW;
      rowH = Math.max(rowH, def.defaultH);
      return item;
    });
  }

  private loadLayout(): WidgetItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SerializedLayout = JSON.parse(raw);
        return this.registry.widgets.map(def => {
          const entry = saved.find(s => s.id === def.id);
          return entry
            ? { ...def, ...entry }
            : { ...def, x: 0, y: 0, w: def.defaultW, h: def.defaultH, visible: true };
        });
      }
    } catch {
      // corrupted storage – fall back to default
    }
    return this.buildDefaultLayout();
  }

  private persist(): void {
    const layout: SerializedLayout = this._items().map(
      ({ id, x, y, w, h, visible }) => ({ id, x, y, w, h, visible })
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }
}
