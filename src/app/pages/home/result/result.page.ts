import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import {
  IFirewall,
  ISpeedTestResult,
} from 'src/app/shared/interfaces/speedtest.interface';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { LoggingService } from 'src/app/shared/services/logging.service';
import { SpeedService } from 'src/app/shared/services/speed.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnDestroy, OnInit {
  public speedTestResult: ISpeedTestResult | undefined;
  private ngUnsubscribe$ = new Subject();
  public firewallUrls: IFirewall[] | undefined = [];
  data: any;

  public isDownloadSpeedOkay: boolean = true;
  public isUploadSpeedOkay: boolean = true;
  public isFirewallTestOkay: boolean = true;
  public selectedProgram: string | undefined;

  programCanBeInstalled: boolean = false;

  constructor(
    private router: Router,
    private speed: SpeedService,
    private firebase: FirebaseService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.speed.speedTestResult$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        switchMap((result: ISpeedTestResult | undefined) => {
          this.speedTestResult = result;
          return this.firebase.getSelectedProgram();
        })
      )
      .subscribe((data: any) => {
        if (this.speedTestResult) {
          this.data = data;
          this.selectedProgram = this.firebase?.program;
          const downloadMinimum = this.data?.network.download?.minimum || 0;
          const uploadMinimum = this.data?.network.upload?.minimum || 0;

          if (this.data?.network?.upload) {
            this.isUploadSpeedOkay =
              this.speedTestResult.uploadSpeed &&
              this.speedTestResult.uploadSpeed >= uploadMinimum
                ? true
                : false;
          }

          if (this.data?.network?.download) {
            this.isDownloadSpeedOkay =
              this.speedTestResult.downloadSpeed &&
              this.speedTestResult.downloadSpeed >= downloadMinimum
                ? true
                : false;
          }

          if (this.data?.network?.firewall) {
            this.firewallUrls =
              this.speedTestResult?.firewallTestUrls?.sort(
                (a, b) => b.status - a.status
              ) || [];

            this.isFirewallTestOkay =
              this.firewallUrls.length > 0 &&
              this.firewallUrls.findIndex((x) => x.status !== 200) === -1
                ? true
                : false;
          }
        }
      });
  }

  public previous() {
    this.router.navigate(['/home/processing']);
  }

  public goHome() {
    this.loggingService.saveLog('Result-Home', {
      result:
        this.isDownloadSpeedOkay &&
        this.isUploadSpeedOkay &&
        this.isFirewallTestOkay,
    });
    this.speed.resetSpeedTest();
    this.router.navigate(['home']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
