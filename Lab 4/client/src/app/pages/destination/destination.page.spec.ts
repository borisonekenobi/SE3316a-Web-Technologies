import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationPage } from './destination.page';

describe('DestinationComponent', () => {
  let component: DestinationPage;
  let fixture: ComponentFixture<DestinationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
