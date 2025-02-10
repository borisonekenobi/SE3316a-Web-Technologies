import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationsPage } from './destinations.page';

describe('DestinationLocationComponent', () => {
  let component: DestinationsPage;
  let fixture: ComponentFixture<DestinationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
