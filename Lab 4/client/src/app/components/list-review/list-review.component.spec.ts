import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReviewComponent } from './list-review.component';

describe('ReviewComponent', () => {
  let component: ListReviewComponent;
  let fixture: ComponentFixture<ListReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
