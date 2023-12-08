import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import * as leaflet from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import Geohash from 'latlon-geohash';
import { H3Index, latLngToCell, cellToBoundary, CoordPair } from 'h3-js';
import { Polygon } from 'geojson';
import { GeoJSON } from 'leaflet';

enum MapStateEnum {
  S2 = 'S2',
  H3 = 'H3',
  GH = 'GH'
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements AfterViewInit{
  public latitude: number = 44.874349694274;
  public longitude: number = -0.5782135318973474;
  public resolution = 7;
  public layer!: GeoJSON;


  protected mapState!: MapStateEnum;
  protected readonly MapStateEnum = MapStateEnum;
  private map!: leaflet.Map;

  public ngAfterViewInit(): void {
    this.initMap();
    this.initMapControls();
  }

  public createGeoHash() {
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

    this.layer = leaflet.geoJSON(polygon).addTo(this.map);
    this.map.fitBounds(this.layer.getBounds());

    this.layer.on('click', () => {
      popup.setLatLng(this.layer.getBounds().getCenter());
      popup.setContent(geohash);
      this.map.openPopup(popup);
    });
  }

  public setCoordinate(): void {
    this.clearMap();
    switch (this.mapState) {
      case MapStateEnum.H3:
        this.createH3Zone();
        break;
      case MapStateEnum.GH:
        this.createGeoHash();
        break;
      case MapStateEnum.S2:
        break;
    }
  }

  private initMap(): void {
    this.map = leaflet.map('map', {
      center: [ 44.837789, -0.57918 ],
      zoom: 9,
    });

    const tiles = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private initMapControls(): void {
    const h3Control = this.createControl('H3', () => this.mapState = MapStateEnum.H3);
    const geoHashControl = this.createControl('GH', () => this.mapState = MapStateEnum.GH);

    new h3Control({ position: 'topright' }).addTo(this.map);
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

  private clearMap() {
    if (!this.layer) {
      return;
    }
    this.map.removeLayer(this.layer);
  }

  private createH3Zone() {
    const popup = new leaflet.Popup();
    const index: H3Index = latLngToCell(this.latitude, this.longitude, this.resolution);
    const boundary: CoordPair[] = cellToBoundary(index, true);

    const polygon: Polygon = {
      "coordinates": [
        boundary,
      ],
      "type": "Polygon"
    }

    this.layer = leaflet.geoJSON(polygon).addTo(this.map);
    this.map.fitBounds(this.layer.getBounds());

    this.layer.on('click', () => {
      popup.setLatLng(this.layer.getBounds().getCenter());
      popup.setContent(index);
      this.map.openPopup(popup);
    });
  }
}
