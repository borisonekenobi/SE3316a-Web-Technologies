import {Component, inject, Input} from '@angular/core';
import {DestinationComponent} from '../destination/destination.component';
import {NgForOf, NgIf} from '@angular/common';
import {List} from '../../list';
import {ListService} from '../../list.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    DestinationComponent,
    NgForOf,
    NgIf,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  @Input() list!: List;
  listService: ListService = inject(ListService);
  isOpen: boolean = false;
  isCurrentUser!: boolean;
  protected readonly parseFloat = parseFloat;
  protected readonly String = String;

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user') as string);
    this.isCurrentUser = this.list.user.id === user?.id;
  }

  viewMore() {
    window.location.href = `/lists/${this.list.id}`;
  }

  editList() {
    window.location.href = `/lists/${this.list.id}`;
  }

  deleteList() {
    if (!confirm('Are you sure you want to delete this list?')) return;
    this.listService.deleteList(this.list).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }
      window.location.href = '/profile';
    });
  }

  deleteDestination(destination: any) {
    if (!confirm('Are you sure you want to remove this destination?')) return;
    this.listService.deleteDestinationFromList(this.list, destination).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }

      this.list.destinations = this.list.destinations.filter(d => d.id !== destination.id);
    });
  }
}
