import { Directive, ElementRef, inject } from '@angular/core';

/** Tilts at most this many degrees towards the pointer. */
const MAX_TILT = 7;

/**
 * Tilts the element a little towards the mouse pointer, like a photo held in
 * the hand, and moves a highlight with it. The styles read the custom
 * properties --tilt-x, --tilt-y (degrees) and --glare-x, --glare-y (percent).
 *
 * Only with a mouse and without "reduce motion": on a touch screen the finger
 * covers the photo anyway, and some people get dizzy from moving things.
 */
@Directive({
  selector: '[jostTilt]',
  host: {
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
  },
})
export class TiltDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly enabled =
    typeof matchMedia === 'function' &&
    matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

  protected move(event: PointerEvent): void {
    if (!this.enabled || event.pointerType !== 'mouse') return;
    const box = this.element.getBoundingClientRect();
    // -0.5 … 0.5 from the centre
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    const style = this.element.style;
    style.setProperty('--tilt-x', `${(-y * 2 * MAX_TILT).toFixed(2)}deg`);
    style.setProperty('--tilt-y', `${(x * 2 * MAX_TILT).toFixed(2)}deg`);
    style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`);
    style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  protected reset(): void {
    for (const name of ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y']) this.element.style.removeProperty(name);
  }
}
