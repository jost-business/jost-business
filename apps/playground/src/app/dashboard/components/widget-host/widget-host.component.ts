import { Component, input, OnInit, inject, ElementRef } from '@angular/core';

/**
 * Renders a web component by tag name inside an Angular component.
 * Falls back to a styled placeholder if the custom element is not registered.
 */
@Component({
  selector: 'app-widget-host',
  standalone: true,
  templateUrl: './widget-host.component.html',
  styleUrl: './widget-host.component.scss',
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
