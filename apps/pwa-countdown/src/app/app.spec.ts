import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TravelService } from '@jost/shared';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    // The testing backend keeps the app-open tracking from hitting the real API
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the countdown before the next trip starts', () => {
    const trip = TestBed.inject(TravelService).travelYears[0].trips[0];
    vi.setSystemTime(new Date(trip.from.getTime() - 24 * 60 * 60 * 1000));

    const el = render();

    expect(el.querySelector('lib-romantic-countdown')).not.toBeNull();
    expect(el.querySelector('lib-together-card')).toBeNull();
  });

  it('shows the together card while a trip is in progress', () => {
    const trip = TestBed.inject(TravelService).travelYears[0].trips[0];
    vi.setSystemTime(new Date(trip.from.getTime() + 60 * 60 * 1000));

    const el = render();

    expect(el.querySelector('lib-together-card')).not.toBeNull();
    expect(el.querySelector('lib-romantic-countdown')).toBeNull();
  });

  it('shows "coming soon" when no trip is planned anymore', () => {
    const trips = TestBed.inject(TravelService).travelYears.flatMap(year => year.trips);
    const lastEnd = Math.max(...trips.map(trip => trip.to.getTime()));
    vi.setSystemTime(new Date(lastEnd + 60 * 60 * 1000));

    const el = render();

    expect(el.querySelector('h1')?.textContent).toContain('Coming soon');
    expect(el.querySelector('lib-romantic-countdown')).toBeNull();
    expect(el.querySelector('lib-together-card')).toBeNull();
  });

  it('switches to the together card when the countdown reaches zero', () => {
    const trip = TestBed.inject(TravelService).travelYears[0].trips[0];
    vi.setSystemTime(new Date(trip.from.getTime() - 2000));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('lib-together-card')).not.toBeNull();
  });

  it('reports the app open to the API once', () => {
    render();

    const request = TestBed.inject(HttpTestingController).expectOne('https://jost.business/api/pwa/notification');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ event: 'app_open' });
  });
});
