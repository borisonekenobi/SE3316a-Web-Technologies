import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutPage } from './logout.page';

describe('LogoutComponent', () => {
  let component: LogoutPage;
  let fixture: ComponentFixture<LogoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
