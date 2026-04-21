import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

interface Country {
  name: string;
  position: [number, number];
  note?: string;
}

interface Region {
  title: string;
  mapId: string;
  center: [number, number];
  zoom: number;
  countries: Country[];
}

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-e-visa',
  standalone: true,
  imports: [],
  templateUrl: './e-visa.component.html',
  styleUrl: './e-visa.component.scss',
})
export class EVisaComponent implements AfterViewInit, OnDestroy {
  private maps: L.Map[] = [];

  readonly regions: Region[] = [
    {
      title: 'Europa',
      mapId: 'evisa-map-europe',
      center: [44, 33],
      zoom: 4,
      countries: [
        { name: 'Albanien', position: [41.15, 20.17] },
        { name: 'Armenien', position: [40.07, 45.04] },
        { name: 'Moldau', position: [47.41, 28.37] },
      ],
    },
    {
      title: 'Asien',
      mapId: 'evisa-map-asia',
      center: [25, 75],
      zoom: 3,
      countries: [
        { name: 'Bahrain', position: [26.03, 50.55] },
        { name: 'Bhutan', position: [27.51, 90.43] },
        { name: 'Indien', position: [20.59, 78.96] },
        { name: 'Iran', position: [32.43, 53.69] },
        { name: 'Irak', position: [33.22, 43.68] },
        { name: 'Israel', position: [31.05, 34.85] },
        { name: 'Kirgisistan', position: [41.2, 74.76] },
        { name: 'Myanmar', position: [21.91, 95.96] },
        { name: 'Oman', position: [21.51, 55.92] },
        { name: 'Pakistan', position: [30.38, 69.35] },
        { name: 'Katar', position: [25.35, 51.18] },
        { name: 'Singapur', position: [1.35, 103.82] },
        { name: 'Vereinigte Arabische Emirate', position: [23.42, 53.85] },
        { name: 'Usbekistan', position: [41.38, 64.59] },
        { name: 'Vietnam', position: [14.06, 108.28] },
      ],
    },
    {
      title: 'Afrika',
      mapId: 'evisa-map-africa',
      center: [5, 18],
      zoom: 3,
      countries: [
        { name: 'Botswana', position: [-22.33, 24.68] },
        { name: 'Kamerun', position: [3.87, 11.52] },
        { name: 'Tschad', position: [15.45, 18.73] },
        { name: 'Kongo (Dem. Rep.)', position: [-4.04, 21.76] },
        { name: 'Äquatorialguinea', position: [1.65, 10.27] },
        { name: 'Lesotho', position: [-29.61, 28.23] },
        { name: 'Libyen', position: [26.34, 17.23] },
        { name: 'Malawi', position: [-13.25, 34.3] },
        { name: 'Mauretanien', position: [21.01, -10.94] },
        { name: 'Namibia', position: [-22.96, 18.49] },
        { name: 'Nigeria', position: [9.08, 8.68] },
        { name: 'Somalia', position: [5.15, 46.2] },
        { name: 'Südafrika', position: [-30.56, 22.94] },
        { name: 'Südsudan', position: [6.88, 31.57] },
        { name: 'St. Helena', position: [-15.96, -5.72] },
        { name: 'Uganda', position: [1.37, 32.29] },
        { name: 'Simbabwe', position: [-19.02, 29.15] },
      ],
    },
    {
      title: 'Ozeanien',
      mapId: 'evisa-map-oceania',
      center: [-25, 135],
      zoom: 4,
      countries: [
        { name: 'Australien', position: [-25.27, 133.78] },
      ],
    },
    {
      title: 'Amerika',
      mapId: 'evisa-map-america',
      center: [8, -65],
      zoom: 3,
      countries: [
        { name: 'Antigua und Barbuda', position: [17.06, -61.8] },
        { name: 'Bahamas', position: [25.03, -77.4] },
        { name: 'Bolivien', position: [-16.29, -63.59] },
        { name: 'El Salvador', position: [13.79, -88.9] },
        { name: 'Guyana', position: [4.86, -58.93] },
        { name: 'St. Kitts und Nevis', position: [17.36, -62.78] },
        { name: 'Suriname', position: [3.92, -56.03] },
      ],
    },
  ];

  ngAfterViewInit(): void {
    for (const region of this.regions) {
      const map = L.map(region.mapId).setView(region.center, region.zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      for (const country of region.countries) {
        L.marker(country.position, { icon: iconDefault })
          .bindPopup(country.note ? country.name + ' (' + country.note + ')' : country.name)
          .addTo(map);
      }
      this.maps.push(map);
    }
  }

  ngOnDestroy(): void {
    for (const map of this.maps) {
      map.remove();
    }
  }
}
