import { Component, input, OnInit, inject, ElementRef } from '@angular/core';

/**
 * Renders a web component by tag name inside an Angular component.
 * Falls back to a styled placeholder if the custom element is not registered.
 */
@Component({
  selector: 'app-widget-host',
  standalone: true,
  template: `
    @if (customElements.get(tag())) {
      <!-- real web component is mounted in ngOnInit -->
    } @else {
      <div class="placeholder">
        @if (image()) {
          <img class="preview-img" [src]="image()" [alt]="label()" />
        }
        <code class="tag">{{ tag() }}</code>
      </div>
    }
  `,
  styles: [`
    :host { display: flex; height: 100%; }

    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 100%;
      padding: 12px;
      overflow: hidden;
    }

    .preview-img {
      max-width: 100%;
      max-height: calc(100% - 28px);
      object-fit: contain;
      border-radius: 6px;
    }

    .tag {
      font-size: 10px;
      font-family: monospace;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
      color: #6366f1;
      flex-shrink: 0;
    }
  `],
})
export class WidgetHostComponent implements OnInit {
  readonly tag = input.required<string>();
  readonly label = input<string>('');
  readonly image = input<string>('');

  protected readonly customElements = customElements;
  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    if (customElements.get(this.tag())) {
      const wc = document.createElement(this.tag());
      this.el.nativeElement.innerHTML = '';
      this.el.nativeElement.appendChild(wc);
    }
  }
}
