import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionStatus } from '@capacitor/network';
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';
import { LoggingService } from 'src/app/shared/services/logging.service';
import { NetworkService } from 'src/app/shared/services/network.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.page.html',
  styleUrls: ['./connection.page.scss'],
})
export class ConnectionPage implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject();
  public networkStatus: ConnectionStatus | null = null;

  downloadSpeed: number | undefined;
  downloadInProgress: boolean = false;

  constructor(
    private router: Router,
    private network: NetworkService,
    private loggingService: LoggingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initNetworkConnectivity();
  }

  private initNetworkConnectivity() {
    this.network.status$
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$))
      .subscribe((networkStatus) => {
        this.networkStatus = networkStatus;
        this.cdr.detectChanges();
      });
  }

  public next() {
    this.loggingService.saveLog('Connection-Next', {
      connectionType: this.networkStatus?.connectionType,
    });
    this.router.navigate(['/home/dealer-locator']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(false);
    this.ngUnsubscribe$.complete();
  }
}
