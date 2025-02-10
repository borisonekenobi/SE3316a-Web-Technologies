import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {Destination} from '../../destination';

@Component({
  selector: 'app-component-destination',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.css'
})
export class DestinationComponent {
  @Input() destination!: Destination;
  isOpen: boolean;
  protected readonly parseFloat = parseFloat;
  protected readonly String = String;
  protected readonly window = window;

  constructor() {
    this.isOpen = false;
  }
}
