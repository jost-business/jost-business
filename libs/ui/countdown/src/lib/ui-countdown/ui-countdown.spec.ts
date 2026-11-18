import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountdownComponent } from './ui-countdown';

describe('CountdownComponent', () => {
  const start = new Date(2026, 10, 18, 12, 0, 0);
  let fixture: ComponentFixture<CountdownComponent>;
  let component: CountdownComponent;
  let arrivedCount: number;

  function create(target: Date): void {
    fixture = TestBed.createComponent(CountdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('targetDate', target);
    arrivedCount = 0;
    component.arrived.subscribe(() => arrivedCount++);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
    await TestBed.configureTestingModule({ imports: [CountdownComponent] }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.useRealTimers();
  });

  it('shows the remaining time while the target is in the future', () => {
    create(new Date(start.getTime() + (2 * 24 * 60 + 3 * 60 + 4) * 60 * 1000));

    expect(component.state()).toMatchObject({ days: 2, hours: 3, minutes: 4, arrived: false });
  });

  it('emits arrived once when the countdown reaches zero', () => {
    create(new Date(start.getTime() + 3000));

    vi.advanceTimersByTime(2000);
    expect(arrivedCount).toBe(0);

    vi.advanceTimersByTime(1000);
    expect(component.state().arrived).toBe(true);
    expect(arrivedCount).toBe(1);

    vi.advanceTimersByTime(5000);
    expect(arrivedCount).toBe(1);
  });

  it('does not emit when the target is already in the past at start', () => {
    create(new Date(start.getTime() - 1000));

    vi.advanceTimersByTime(5000);
    expect(component.state().arrived).toBe(true);
    expect(arrivedCount).toBe(0);
  });

  it('emits again when a new target is reached', () => {
    create(new Date(start.getTime() + 1000));
    vi.advanceTimersByTime(1000);
    expect(arrivedCount).toBe(1);

    fixture.componentRef.setInput('targetDate', new Date(Date.now() + 2000));
    vi.advanceTimersByTime(2000);
    expect(arrivedCount).toBe(2);
  });
});
