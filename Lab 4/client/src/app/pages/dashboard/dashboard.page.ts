import {Component, inject} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {List} from '../../list';
import {ListService} from '../../list.service';
import {DestinationComponent} from '../../components/destination/destination.component';
import {ListComponent} from '../../components/list/list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DestinationComponent,
    ListComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  listService: ListService = inject(ListService);
  lists: List[] = [];
  listInfo: Map<string, boolean> = new Map<string, boolean>();

  constructor() {
    this.listService.getRandomLists(10).then((r) => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.lists = r;
      this.lists.forEach((list) => {
        this.listInfo.set(list.id, false);
      });
    });
  }

  protected readonly parseFloat = parseFloat;
  protected readonly String = String;
}
