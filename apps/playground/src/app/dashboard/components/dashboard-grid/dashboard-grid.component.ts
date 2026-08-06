import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
  CdkDragMove,
  CdkDragPlaceholder,
  CdkDragStart,
} from '@angular/cdk/drag-drop';
import { LayoutService } from '../../services/layout.service';
import { WidgetItem } from '../../models/widget.model';
import { WidgetHostComponent } from '../widget-host/widget-host.component';

interface DropHighlight {
  col: number; // 0-based
  row: number;
  w: number;
  h: number;
}

const COLS = 12;
const ROW_HEIGHT = 120; // px
const GAP = 16; // px

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [CdkDrag, CdkDragHandle, CdkDragPlaceholder, WidgetHostComponent],
  templateUrl: './dashboard-grid.component.html',
  styleUrl: './dashboard-grid.component.scss',
})
export class DashboardGridComponent {
  private readonly layoutService = inject(LayoutService);

  readonly visibleWidgets = this.layoutService.visibleWidgets;
  readonly dropHighlight = signal<DropHighlight | null>(null);
  readonly draggingId = signal<string | null>(null);

  private readonly gridContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('gridContainer');

  onDragStarted(_event: CdkDragStart, widget: WidgetItem): void {
    this.draggingId.set(widget.id);
  }

  onDragMoved(event: CdkDragMove<WidgetItem>, widget: WidgetItem): void {
    const pos = this.pointerToGrid(
      event.pointerPosition.x,
      event.pointerPosition.y,
      widget
    );
    this.dropHighlight.set(pos ? { ...pos, w: widget.w, h: widget.h } : null);
  }

  onDragEnded(event: CdkDragEnd<WidgetItem>, widget: WidgetItem): void {
    const pos = this.pointerToGrid(
      event.dropPoint.x,
      event.dropPoint.y,
      widget
    );
    if (pos && !this.wouldCollide(widget, pos.col, pos.row)) {
      this.layoutService.moveWidget(widget.id, pos.col, pos.row);
    }
    this.dropHighlight.set(null);
    this.draggingId.set(null);
    // reset CDK's internal transform so CSS Grid takes over positioning
    event.source.reset();
  }

  /** Convert viewport coordinates to 0-based grid col/row. Returns null if outside the grid. */
  private pointerToGrid(
    clientX: number,
    clientY: number,
    widget: WidgetItem
  ): { col: number; row: number } | null {
    const el = this.gridContainer().nativeElement;
    const rect = el.getBoundingClientRect();

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top
    ) {
      return null;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Each cell takes (cellWidth + gap) pixels; last cell has no trailing gap
    const cellW = (rect.width + GAP) / COLS;
    const cellH = ROW_HEIGHT + GAP;

    const col = Math.max(
      0,
      Math.min(Math.round(relX / cellW), COLS - widget.w)
    );
    const row = Math.max(0, Math.round(relY / cellH));

    return { col, row };
  }

  private wouldCollide(
    moving: WidgetItem,
    newX: number,
    newY: number
  ): boolean {
    return this.visibleWidgets().some(
      w =>
        w.id !== moving.id &&
        newX < w.x + w.w &&
        newX + moving.w > w.x &&
        newY < w.y + w.h &&
        newY + moving.h > w.y
    );
  }

  // used in template to compute CSS grid-column / grid-row strings
  gridColumn(widget: WidgetItem): string {
    return `${widget.x + 1} / span ${widget.w}`;
  }

  gridRow(widget: WidgetItem): string {
    return `${widget.y + 1} / span ${widget.h}`;
  }
}
