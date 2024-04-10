import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IFirewall,
  ISpeedTestResult,
} from 'src/app/shared/interfaces/speedtest.interface';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { LoggingService } from 'src/app/shared/services/logging.service';
import { SpeedService } from 'src/app/shared/services/speed.service';
import { environment } from 'src/environments/environment';
import ProgramModel, { Url } from 'src/models/program.model';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.page.html',
  styleUrls: ['./processing.page.scss'],
})
export class ProcessingPage implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject();
  speedTestResult: ISpeedTestResult = {};
  data: ProgramModel | undefined;
  firewallStatus: IFirewall = {
    status: 0,
  };
  firewallProgress: number = 0;
  firewallSuccessCount: number = 0;
  firewallUrls: Array<string> = [];
  firewallTestStarted: boolean = false;

  constructor(
    private router: Router,
    public speed: SpeedService,
    private firebase: FirebaseService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.firebase.getSelectedProgram().subscribe((data) => {
      this.data = data;
      this.firewallUrls = this.data?.network?.firewall || [];
      this.initTest();
    });

    this.speed.speedTestResult$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((results) => {
        this.speedTestResult = results;
      });
  }

  initTest(): void {
    if (this.data?.network?.download) {
      this.initDownloadSpeedTest();
    } else {
      this.speed.downloadProgress = 1;
      this.initUploadSpeedTest();
    }
  }

  initDownloadSpeedTest(): void {
    let downloadUrls = this.data?.network?.download?.urls || [];
    if (downloadUrls.length == 0) {
      this.speed.downloadProgress = 1;
      return;
    }

    this.speed
      .getDownloadSpeed(downloadUrls)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((downloadSpeedMbps) => {
        console.log('downloadSpeedMbps ' + downloadSpeedMbps);
        this.speedTestResult.downloadSpeed = downloadSpeedMbps;
        if (this.speed.downloadProgress >= 1) {
          this.initUploadSpeedTest();
        }
      });
  }

  initUploadSpeedTest(): void {
    const uploadUrls = this.data?.network?.upload?.url || [];
    if (uploadUrls.length == 0) {
      this.speed.uploadProgress = 1;
      this.initFirewallTest();
      return;
    }

    this.speed.timer = 0;
    let totalSpeed = 0;
    let averageSpeed = 0;

    const uploadFileUrls = [{ url: 'https://file.io/', size: '1' }];

    const numberOfUrl = uploadFileUrls.length;
    let uploadedUrls = 1;
    for (let i = 0; i < numberOfUrl; i++) {
      if (this.speed.timer > environment.timer) {
        uploadedUrls = numberOfUrl;
        break;
      }
      this.speed.uploadFileToFileSync(
        uploadFileUrls[i],
        uploadedUrls,
        numberOfUrl
      );
      uploadedUrls++;
    }
    let numberOfHits = 0;
    this.speed.uploadSpeedSubject
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((speed) => {
        numberOfHits++;
        totalSpeed += speed;
        averageSpeed = totalSpeed / numberOfHits;
        this.speedTestResult.uploadSpeed = averageSpeed;

        if (this.speed.uploadProgress == 1) {
          if (this.firewallTestStarted) return;
          this.firewallTestStarted = true;
          this.initFirewallTest();
        }
      });
  }

  async initFirewallTest() {
    const total = this.firewallUrls?.length;
    if (total == 0) {
      this.firewallProgress = 100;
      return;
    }
    this.speedTestResult.firewallTestUrls = [];

    for (const url of this.firewallUrls) {
      this.firewallStatus.url = url;
      this.firewallStatus.status = 0;

      const status = await this.speed.getStatus(url);

      this.firewallStatus.status = status;
      this.speedTestResult.firewallTestUrls?.push({ url, status });

      this.firewallProgress =
        (this.speedTestResult.firewallTestUrls!.length / total) * 100;

      this.firewallSuccessCount = this.speedTestResult.firewallTestUrls!.filter(
        (item) => item.status == 200
      ).length;
      await this.delay(2000);
    }
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getPercentage(
    success: number | undefined,
    total: number | undefined
  ): number {
    return (success! / total!) % 100;
  }

  public rerun() {
    this.loggingService.saveLog('Process-Rerun', {});
    this.reset();
    this.initTest();
  }

  public reset() {
    this.speed.resetSpeedTest();
    this.firewallProgress = 0;
    this.firewallSuccessCount = 0;
    this.firewallTestStarted = false;
  }

  public next() {
    this.loggingService.saveLog('Process-Next', this.speedTestResult);
    this.speed.setSpeedTestResult(this.speedTestResult);
    this.router.navigate(['/home/result']);
  }

  public previous() {
    this.reset();
    this.router.navigate(['home/program']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
