import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Polygon } from 'geojson';
import * as leaflet from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import Geohash from 'latlon-geohash';

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
  public resolution = 7; // You can set the resolution of your choosing here


  private map!: leaflet.Map;

  public ngAfterViewInit(): void {
    this.initMap();
    this.initMapControls();
  }

  public geoHash() {
    const popup = new leaflet.Popup();
    const geohash: string = Geohash.encode(this.latitude, this.longitude, this.resolution);
    const bound = Geohash.bounds(geohash);

    const polygon: Polygon = {
      "type": "Polygon",
      "coordinates": [
        [
          [bound.sw.lon, bound.ne.lat],
          [bound.ne.lon, bound.ne.lat],
          [bound.ne.lon, bound.sw.lat],
          [bound.sw.lon, bound.sw.lat],
          [bound.sw.lon, bound.ne.lat],
        ]
      ]
    }

    const polygon_layer = leaflet.geoJSON(polygon).addTo(this.map);
    this.map.fitBounds(polygon_layer.getBounds());

    polygon_layer.on('click', () => {
      popup.setLatLng(polygon_layer.getBounds().getCenter());
      popup.setContent(geohash);
      this.map.openPopup(popup);
    });
  }

  // public s2Cell() {
  //   const cellId = S2CellId.fromPoint(
  //     S2LatLng.fromDegrees(this.latitude, this.longitude).toPoint()
  //   );
  //
  //   const cell = new S2Cell(cellId);
  //   const geojson = cell.toGEOJSON();
  //
  //   console.log(geojson);
  //
  //   const layer = leaflet.geoJson().addTo(this.map);
  //   // layer.addData(cell.toGEOJSON());
  // }

  public setCoordinate(): void {
    this.geoHash();
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
