import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListsPage } from './lists.page';

describe('ListsComponent', () => {
  let component: ListsPage;
  let fixture: ComponentFixture<ListsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
