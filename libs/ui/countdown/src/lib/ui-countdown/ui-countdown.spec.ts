import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiCountdown } from './ui-countdown';

describe('UiCountdown', () => {
  let component: UiCountdown;
  let fixture: ComponentFixture<UiCountdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCountdown],
    }).compileComponents();

    fixture = TestBed.createComponent(UiCountdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
