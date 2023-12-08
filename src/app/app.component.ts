import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as leaflet from 'leaflet';
import { MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatInputModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit{
  private map!: leaflet.Map;

  public ngAfterViewInit(): void {
    this.initMap();
    this.initMapControls();
  }

  private initMap(): void {
    this.map = leaflet.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });

    const tiles = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private initMapControls(): void {
    const h3Control = this.createControl('H3', () => {});
    const s2Control = this.createControl('S2', () => {});
    const geoHashControl = this.createControl('GH', () => {});

    new h3Control({ position: 'topright' }).addTo(this.map);
    new s2Control({ position: 'topright' }).addTo(this.map);
    new geoHashControl({ position: 'topright' }).addTo(this.map);

  }

  private createControl(name: string, clickHandler: () => void): any {
    return leaflet.Control.extend({
      onAdd: function () {
          const element = leaflet.DomUtil.create('button', 'leaflet-bar leaflet-custom-control');

        element.innerHTML = name;
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          clickHandler();
        })

        return element;
      },
    });
  }
}
