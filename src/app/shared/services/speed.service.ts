import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  concatMap,
  map,
  of,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { ISpeedTestResult } from '../interfaces/speedtest.interface';
import { Url } from 'src/models/program.model';
import { environment } from 'src/environments/environment';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class SpeedService {
  public speedTestResult$ = new BehaviorSubject<ISpeedTestResult>({});
  public downloadProgress: number = 0;
  public uploadProgress: number = 0;

  uploadSpeedSubject = new Subject<number>();

  uploadStartTime: number = 0;
  uploadEndTime: number = 0;
  timer: number = 0;

  constructor(private http: HttpClient) {}

  public async setSpeedTestResult(
    speedTestResult: ISpeedTestResult
  ): Promise<void> {
    this.speedTestResult = speedTestResult;
  }

  private set speedTestResult(speedTestResult: ISpeedTestResult) {
    this.speedTestResult$.next(speedTestResult);
  }

  public resetSpeedTest() {
    const speedTestResult = this.speedTestResult$.getValue(); //.program;
    this.speedTestResult = {
      //program: speedTestResult.program,
      firewallTestUrls: [],
    };
    this.downloadProgress = 0;
    this.uploadProgress = 0;
  }

  getDownloadSpeed(urls: Url[]): Observable<number> {
    const startTime = new Date().getTime();
    let totalPreviousBytes = 0;
    let bytesDownloaded = 0;
    let isTimedOut = false;

    return of(...urls).pipe(
      concatMap((url: Url) => {
        let previousPercent = 0;
        return this.http
          .get(url.url + '?no-cache=' + Math.random(), {
            responseType: 'blob',
            observe: 'events',
            reportProgress: true,
          })
          .pipe(
            takeWhile(() => !isTimedOut),
            tap((event) => {
              let percentDone = 0;
              if (event.type === HttpEventType.DownloadProgress) {
                percentDone = Math.round(
                  (100 * event.loaded) /
                    parseFloat(event.total?.toString() || '0')
                );
                this.downloadProgress +=
                  (percentDone - previousPercent) / urls.length / 100;
                previousPercent = percentDone;

                if (event.loaded == event.total) {
                  totalPreviousBytes += event.total;
                } else {
                  bytesDownloaded = event.loaded;
                }

                const currentTime = new Date().getTime();
                const elapsedTime = (currentTime - startTime) / 1000;
                if (elapsedTime >= 30) {
                  this.downloadProgress = 1;
                  isTimedOut = true;
                }
              }
            }),
            catchError((error) => {
              console.error(`Error downloading ${url}: ${error}`);
              this.downloadProgress = 1;
              isTimedOut = true;
              return of(null);
            })
          );
      }),
      map(() => {
        const endTime = new Date().getTime();
        const totalDuration = (endTime - startTime) / 1000;
        const totalBytes = totalPreviousBytes + bytesDownloaded;
        console.log(
          'totalPreviousBytes ' +
            totalPreviousBytes +
            'bytesDownloaded ' +
            bytesDownloaded +
            'totalBytes ' +
            totalBytes +
            ' totalDuration in sec ' +
            totalDuration
        );
        const downloadSpeedMbps = (totalBytes * 8) / (totalDuration * 1000000);
        return downloadSpeedMbps;
      })
    );
  }

  async uploadFileToFileSync(
    serverUrl: Url,
    uploadedUrls: number,
    totalUrls: number
  ): Promise<void> {
    const filePath = 'assets/files/TestFile10Mb.mov';

    try {
      // Fetch the file without converting to a promise
      const fileResponse = this.http.get(filePath, { responseType: 'blob' });

      fileResponse.subscribe((file) => {
        if (file instanceof Blob) {
          const totalSize = parseFloat(file.size.toString());

          const formData = new FormData();
          formData.append('file', file);
          formData.append('expires', new Date().toISOString());
          formData.append('maxDownloads', '1');
          formData.append('autoDelete', 'true');

          this.timer = 0;
          const uploadStartTime = performance.now();

          const headers = new HttpHeaders();
          // headers.append('Authorization', 'Bearer your-access-token');
          let shouldContinue = true;
          this.http
            .post(serverUrl.url, formData, {
              headers,
              reportProgress: true,
              observe: 'events',
            })
            .pipe(
              takeWhile(() => shouldContinue),
              switchMap((event) => {
                if (event.type === HttpEventType.UploadProgress) {
                  const percentDone = Math.round(
                    (100 * event.loaded) /
                      parseFloat(event.total?.toString() || '1')
                  );

                  this.uploadProgress =
                    (uploadedUrls * percentDone) / totalUrls / 100;
                  const uploadEndTime = performance.now();
                  const uploadTimeMilliseconds =
                    uploadEndTime - uploadStartTime;

                  if (uploadTimeMilliseconds / 1000 >= environment.timer) {
                    this.timer += uploadTimeMilliseconds / 1000;
                    this.uploadProgress = 1;
                  }
                  if (this.timer >= environment.timer) {
                    this.uploadProgress = 1;
                    shouldContinue = false;
                  }
                  console.log(
                    'Percentage:',
                    this.uploadProgress + 'timer:',
                    this.timer + 'uploadTimeMilliseconds:',
                    uploadTimeMilliseconds
                  );

                  const uploadSpeedMbps =
                    (event.loaded * 8) /
                    (uploadTimeMilliseconds / 1000) /
                    1000000;

                  this.uploadSpeedSubject.next(uploadSpeedMbps);
                }
                return this.uploadSpeedSubject;
              }),
              catchError((error) => {
                console.error('An error occurred:', error);
                // throw error;
                this.uploadProgress = 1;
                this.uploadSpeedSubject.next(0);
                shouldContinue = false;
                return this.uploadSpeedSubject;
              })
            )
            .subscribe((uploadSpeed) => {
              console.log('Upload Speed:', uploadSpeed.toFixed(2), 'Mbps');
            });
        } else {
          console.error('Error: File response is not a Blob');
        }
      });
    } catch (error) {
      console.error('Error fetching or creating the Blob:', error);
    }
  }

  async getStatus(url: string): Promise<number> {
    const options = {
      url: url + '?no-cache=' + Math.random(),
      connectTimeout: 5000,
    };
    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      return response.status;
    } catch (error) {
      console.log('getStatus error ' + JSON.stringify(error));
      return 0;
    }
  }
}
