import {Component, inject} from '@angular/core';
import {List} from '../../list';
import {ActivatedRoute} from '@angular/router';
import {User} from '../../user';
import {ListService} from '../../list.service';
import {ListComponent} from '../../components/list/list.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [
    ListComponent,
    NgForOf,
  ],
  templateUrl: './lists.page.html',
  styleUrl: './lists.page.css'
})
export class ListsPage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  listService: ListService = inject(ListService);
  lists: List[] = [];
  user!: User;

  constructor() {
    this.listService.getLists().then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.lists = r;
    });
  }
}
