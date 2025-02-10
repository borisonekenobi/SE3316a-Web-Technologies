import {Component, inject} from '@angular/core';
import {Destination} from '../../destination';
import {NgForOf, NgIf} from '@angular/common';
import {DestinationService} from '../../destination.service';
import {DestinationComponent} from '../../components/destination/destination.component';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [NgForOf, DestinationComponent, NgIf],
  templateUrl: './destinations.page.html',
  styleUrl: './destinations.page.css',
})
export class DestinationsPage {
  resultPage: number = 0;
  destinations: Destination[] = [];
  destinationInfo: Map<string, boolean> = new Map<string, boolean>();
  destinationService: DestinationService = inject(DestinationService);
  isAdmin: boolean = (() => {
    return sessionStorage.getItem('user') ?
        JSON.parse(sessionStorage.getItem('user') as string).type === 'admin' :
        false;
  })();

  constructor() {
    this.showAllDestinations();
  }

  loadMap() {
    const mapDiv = document.getElementById('map');
    mapDiv?.children[0]?.remove();

    let avgLong = 0;
    let avgLat = 0;
    for (const destination of this.destinations) {
      avgLong += parseFloat(destination.longitude);
      avgLat += parseFloat(destination.latitude);
    }

    avgLong /= this.destinations.length;
    avgLat /= this.destinations.length;

    // @ts-ignore
    new ol.Map({
      target: 'map', layers: [
        // @ts-ignore
        new ol.layer.Tile({
          // @ts-ignore
          source: new ol.source.OSM(),
        })], // @ts-ignore
      view: new ol.View({
        // @ts-ignore
        center: ol.proj.fromLonLat([avgLong, avgLat]), zoom: 4,
      }),
    });
  }

  createDestinationInfo() {
    this.destinationInfo.clear();
    this.destinations.forEach(destination => {
      this.destinationInfo.set(destination.id, false);
    });
  }

  showAllDestinations() {
    this.destinationService.getAllDestinations().
        then(destinations => {
          if ('message' in destinations) {
            console.error(destinations.message);
            return;
          }

          this.destinations = destinations;
          this.loadMap();
          this.createDestinationInfo();
        });

    const showAllBtn = document.getElementById('show-all') as HTMLButtonElement;
    if (showAllBtn) showAllBtn.disabled = true;
  }

  search() {
    const showAllBtn = document.getElementById('show-all') as HTMLButtonElement;
    const prevBtn = document.getElementById('prev') as HTMLButtonElement;
    const nextBtn = document.getElementById('next') as HTMLButtonElement;
    const results = document.getElementById('results') as HTMLUListElement;
    const destinationsUl = document.getElementById(
        'destinations') as HTMLUListElement;
    const sort = document.getElementById('sort') as HTMLSelectElement;

    const search = (document.getElementById(
        'search') as HTMLInputElement).value;
    const limit = parseInt(
        (document.getElementById('limit') as HTMLSelectElement).value);

    if (search === '' && isNaN(limit) && sort.value === 'tourist_desc') {
      this.showAllDestinations();
      return;
    }

    showAllBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    results.innerText = '';
    sort.disabled = false;
    const getResults = isNaN(limit) ? limit : +limit + 1;
    this.destinationService.searchDestinations(search, getResults,
        this.resultPage * limit, sort.value).then(async destinations => {
      if (destinations.length > limit) {
        nextBtn.disabled = false;
        destinations.pop();
      } else {
        nextBtn.disabled = true;
      }
      this.destinations = destinations;
      const currentResults = destinationsUl.children.length;
      if (this.resultPage === 0) prevBtn.disabled = true;
      results.innerText = isNaN(limit) ?
          'Showing All Results' :
          `Showing Results: ${this.resultPage * limit + 1} - ${this.resultPage *
          limit + currentResults}`;
      if (destinations.length === 0) {
        results.innerText = 'No Results Found';
      }
    });

    this.loadMap();
    this.createDestinationInfo();
  }

  resetResults() {
    this.resultPage = 0;
    this.search();
  }

  prevResults() {
    this.resultPage--;
    this.search();
  }

  nextResults() {
    this.resultPage++;
    this.search();
  }

  async replaceData(fileData: string, inputElement: HTMLInputElement) {
    const replace = confirm(
        'Do you want to replace all destination data? This action cannot be undone.');
    if (replace) {
      await this.destinationService.updateAllDestinations(fileData);
      this.showAllDestinations();
    }
    inputElement.value = '';
    inputElement.files = null;
  }

  readFile() {
    const inputElement = document.getElementById('file') as HTMLInputElement;
    const file = !!inputElement.files ? inputElement.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const textContent: string = e.target?.result as string;
      await this.replaceData(textContent, inputElement);
    };
    reader.onerror = (e) => {
      const error = e.target?.error;
      console.error(`Error occurred while reading ${file.name}`, error);
    };
    reader.readAsText(file);
  }

  protected readonly String = String;
}
