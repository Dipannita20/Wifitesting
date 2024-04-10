import { HttpClient } from '@angular/common/http';
import {
  AfterContentInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { ModalController } from '@ionic/angular';
import { Retailer } from 'src/app/shared/interfaces/programdata.interface';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { environment } from 'src/environments/environment';
import { ModalPage } from '../modal/modal.page';
import { NewDealerModalComponent } from './new-dealer-modal/new-dealer-modal.component';
import { LoggingService } from 'src/app/shared/services/logging.service';

@Component({
  selector: 'app-dealer-locator',
  templateUrl: './dealer-locator.page.html',
  styleUrls: ['./dealer-locator.page.scss'],
})
export class DealerLocatorPage implements OnInit, AfterContentInit {
  latitude: any;
  longitude: any;
  data: Retailer[] | undefined;
  cordpath: string | undefined;
  nearByRetailer: Retailer[] | undefined;
  dealerpath = 'assets/files/DealerData.json';

  @ViewChild('map')
  mapRef!: ElementRef;
  map: GoogleMap | undefined;
  markers: Marker[] = new Array<Marker>();
  retailersWithin5KM: Retailer[] = new Array<Retailer>();
  constructor(
    private http: HttpClient,
    public firebase: FirebaseService,
    private router: Router,
    private modalCtrl: ModalController,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    console.log(
      'this.selectedDealer ' + JSON.stringify(this.firebase.selectedDealer)
    );
  }
  ngAfterContentInit(): void {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    })
      .then((position) => {
        // Handle the success case here
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        console.log('Current position:', position);
        this.getData(this.dealerpath);
      })
      .catch((error) => {
        // Handle the error here
        console.error('Error getting location:', error);
        this.getData(this.dealerpath);
      });
  }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'map',
      apiKey: environment.mapsKey,
      element: this.mapRef?.nativeElement,
      forceCreate: true,
      config: {
        center: {
          lat: this.latitude,
          lng: this.longitude,
        },
        zoom: 10,
      },
    });
    this.map.addMarkers(this.markers);
    this.map.setOnMarkerClickListener(async (marker) => {
      const modal = await this.modalCtrl.create({
        component: ModalPage,
        componentProps: {
          marker,
        },
        breakpoints: [0, 0.3],
        initialBreakpoint: 0.3,
      });
      modal.present();
      // console.log(marker);
    });
  }

  addMarker(marker: Retailer) {
    this.markers.push({
      coordinate: {
        lat: marker.Lat,
        lng: marker.Long,
      },
      title: marker.Name,
    });
  }

  getData(path: string) {
    this.http.get(path).subscribe(
      (res: any) => {
        this.data = res.RetailerData as Retailer[];
        this.nearByRetailer = this.data.filter((r) => r.State == 'WI');
        if (this.latitude) {
          this.nearByRetailer = this.nearByRetailer.sort((d1, d2) => {
            const distance1 = this.calculateDistance(
              d1.Lat,
              d1.Long,
              this.latitude,
              this.longitude
            );
            const distance2 = this.calculateDistance(
              d2.Lat,
              d2.Long,
              this.latitude,
              this.longitude
            );
            return distance1 - distance2;
          });
        }
        // .slice(0, 10);

        /*this.retailersWithin5KM = this.data?.filter(
          (d) =>
            this.calculateDistance(
              d.Lat,
              d.Long,
              this.latitude,
              this.longitude
            ) < 5000
        );
        this.retailersWithin5KM.forEach((r) => {
          this.addMarker(r);
        });*/

        // console.log(this.nearByRetailer);
      },
      (err) => {
        console.error('Failed loading JSON data', err);
      }
    );
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const earthRadius = 6371; // Radius of the Earth in kilometers

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance in meters
    const distance = earthRadius * c * 1000;
    //console.log(distance);
    return distance; // Distance in meters
  }

  handleOptionClick(e: any) {
    this.firebase.selectedTempDealer.selected = false;
    this.firebase.selectedDealer = e;
    this.next();
  }

  handleOptionClickForTempDealer() {
    this.firebase.selectedTempDealer.selected = true;
    this.firebase.selectedDealer = undefined;
    this.next();
  }

  public next() {
    this.loggingService.saveLog(
      'Dealer-Next',
      this.firebase.selectedDealer
        ? this.firebase.selectedDealer
        : { Name: this.firebase.selectedTempDealer.dealer }
    );
    this.router.navigate(['/home/program']);
  }
  public previous() {
    this.router.navigate(['/home/connection']);
  }

  async openDealerModal() {
    const modal = await this.modalCtrl.create({
      component: NewDealerModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.firebase.selectedTempDealer = { dealer: data, selected: true };
      this.handleOptionClickForTempDealer();
    }
  }
}
