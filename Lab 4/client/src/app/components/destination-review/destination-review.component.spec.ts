import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationReviewComponent } from './destination-review.component';

describe('DestinationReviewComponent', () => {
  let component: DestinationReviewComponent;
  let fixture: ComponentFixture<DestinationReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
