import { AfterViewInit, Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import * as leaflet from 'leaflet';
import { MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {h3ToGeo} from "h3-js";

enum Data {
  S2 = 'S2',
  H3 = 'H3',
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements AfterViewInit{
  public latitude!: number;
  public longitude!: number;
  public resolution = 9; // You can set the resolution of your choosing here


  private map!: leaflet.Map;

  public ngAfterViewInit(): void {
    this.initMap();
    this.initMapControls();
  }

  public setCoordinate(): void {
    console.log(this.latitude);
    console.log(this.longitude);

    const index = h(this.latitude, this.longitude, this.resolution);
    const h3Index = h3.geoToH3(37.3615593, -122.0553238, 7);  }

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
