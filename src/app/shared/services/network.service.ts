import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { BehaviorSubject, distinctUntilChanged, timer } from 'rxjs';
import { ToastService } from './toast.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  public status$ = new BehaviorSubject<ConnectionStatus>(
    { connected: false, connectionType: 'none' } // Default status
  );

  constructor(private toast: ToastService, private router: Router) {
    this.initNetwork();
  }

  public checkNetworkStatus() {
    this.status$.pipe(distinctUntilChanged()).subscribe((s) => {
      if (s.connectionType != 'wifi') {
        this.toast.showToast('Network Changed, Please check the wifi!');
        timer(5000).subscribe(() => this.router.navigate(['/home/connection']));
      }
    });
  }

  private initNetwork() {
    Network.getStatus().then((initialStatus: ConnectionStatus) => {
      this.status$.next(initialStatus);

      Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        console.log('Network status changed', status);
        this.status$.next(status);
      });
    });
  }
}
