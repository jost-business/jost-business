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
  selector: 'app-visa-free',
  standalone: true,
  imports: [],
  templateUrl: './visa-free.component.html',
  styleUrl: './visa-free.component.scss',
})
export class VisaFreeComponent implements AfterViewInit, OnDestroy {
  private maps: L.Map[] = [];

  readonly regions: Region[] = [
    {
      title: 'Afrika',
      mapId: 'map-africa',
      center: [5, 18],
      zoom: 3,
      countries: [
        { name: 'Angola', position: [-11.2027, 17.8739] },
        { name: 'Benin', position: [9.3077, 2.3158] },
        { name: 'Burkina Faso', position: [12.3641, -1.5339] },
        { name: 'Cabo Verde', position: [15.1111, -23.6167] },
        { name: "Cote d'Ivoire", position: [7.54, -5.5471] },
        { name: 'Gabon', position: [-0.8037, 11.6094] },
        { name: 'Gambia', position: [13.4432, -15.3101] },
        { name: 'Ghana', position: [7.9465, -1.0232] },
        { name: 'Guinea', position: [9.9456, -11.2874] },
        { name: 'Kenia', position: [-0.0236, 37.9062] },
        { name: 'Mali', position: [17.5707, -3.9962] },
        { name: 'Niger', position: [17.6078, 8.0817] },
        { name: 'Ruanda', position: [-1.9403, 29.8739] },
        { name: 'Sao Tome und Principe', position: [0.1864, 6.6131] },
        { name: 'Senegal', position: [14.4974, -14.4524] },
        { name: 'Togo', position: [8.6195, 0.8248] },
        { name: 'Tunesien', position: [33.8869, 9.5375] },
        { name: 'Sambia', position: [-13.1339, 27.8493] },
      ],
    },
    {
      title: 'Asien',
      mapId: 'map-asia',
      center: [30, 85],
      zoom: 3,
      countries: [
        { name: 'Aserbaidschan', position: [40.1431, 47.5769] },
        { name: 'Hongkong', position: [22.3193, 114.1694] },
        { name: 'Kasachstan', position: [48.0196, 66.9237] },
        { name: 'Macao', position: [22.1987, 113.5439] },
        { name: 'Malaysia', position: [4.2105, 101.9758] },
        { name: 'Philippinen', position: [12.8797, 121.774] },
        { name: 'Thailand', position: [15.87, 100.9925] },
        { name: 'Tuerkei', position: [38.9637, 35.2433] },
        { name: 'Syrien', position: [34.8021, 38.9968], note: 'theoretisch visumfrei, aber praktisch nicht empfehlenswert' },
      ],
    },
    {
      title: 'Ozeanien',
      mapId: 'map-oceania',
      center: [-10, 170],
      zoom: 3,
      countries: [
        { name: 'Cookinseln', position: [-21.2367, -159.7777] },
        { name: 'Kiribati', position: [1.8709, -157.3626] },
        { name: 'Mikronesien', position: [7.4256, 150.5508] },
        { name: 'Vanuatu', position: [-15.3767, 166.9592] },
      ],
    },
    {
      title: 'Amerika',
      mapId: 'map-america',
      center: [5, -65],
      zoom: 3,
      countries: [
        { name: 'Barbados', position: [13.1939, -59.5432] },
        { name: 'Belize', position: [17.1899, -88.4976] },
        { name: 'Brasilien', position: [-14.235, -51.9253] },
        { name: 'Colombia', position: [4.5709, -74.2973] },
        { name: 'Dominica', position: [15.415, -61.371] },
        { name: 'Dominikanische Republik', position: [18.7357, -70.1627] },
        { name: 'Ecuador', position: [-1.8312, -78.1834] },
        { name: 'Grenada', position: [12.1165, -61.679] },
        { name: 'Haiti', position: [18.9712, -72.2852] },
        { name: 'St. Vincent und die Grenadinen', position: [12.9843, -61.2872] },
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
