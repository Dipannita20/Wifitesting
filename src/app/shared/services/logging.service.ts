import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { App, AppInfo } from '@capacitor/app';
import { Device, DeviceId, DeviceInfo } from '@capacitor/device';
import { v4 as myUuidv4 } from 'uuid';
import { interval } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private analyticsPath = '/WifiTestApp/Analytics';

  private analyticsRef: any;
  private appInfo: AppInfo | undefined;
  private deviceInfo: DeviceInfo | undefined;
  private deviceId: DeviceId | undefined;
  public deviceDataSaved: boolean = false;
  appSessionId: string | undefined;
  isSignedIn: boolean = false;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {
    this.analyticsRef = db.list(this.analyticsPath);

    App.getInfo().then((info) => {
      this.appInfo = info;
    });

    Device.getInfo().then((info) => {
      this.deviceInfo = info;
    });

    Device.getId().then((info) => {
      this.deviceId = info;
    });

    // Check if the session ID is undefined and generate it initially.
    if (!this.appSessionId) {
      this.generateSessionId();
    }

    // Set up a timer to regenerate the session ID every 30 minutes.
    interval(30 * 60 * 1000).subscribe(() => {
      this.generateSessionId();
    });
  }

  generateSessionId() {
    this.appSessionId = myUuidv4();
  }

  saveLog(name: string, properties?: { [key: string]: any }) {
    if (!this.isSignedIn) {
      this.afAuth
        .signInWithEmailAndPassword('demo@demo.com', 'demo@demo.com')
        .then(() => {
          this.isSignedIn = true;
          this.saveEvent(name!, properties);
        })
        .catch((error) => {
          console.error('Auth', error);
        });
    } else {
      this.saveEvent(name!, properties);
    }
  }

  saveEvent(name: string, properties?: { [key: string]: any }) {
    const primaryKey = this.deviceId?.identifier;

    const dataToSave = {
      deviceInfo: this.deviceInfo,
      appInfo: this.appInfo || null,
    };

    const eventData = {
      ...{ eventName: name },
      ...properties,
    };

    if (!this.deviceDataSaved) {
      this.saveDevice(primaryKey!, dataToSave)
        .then(() => {
          this.deviceDataSaved = true;
          this.saveEventData(primaryKey!, eventData);
        })
        .catch((error) => {
          console.error('Error saving device data:', error);
        });
    } else {
      this.saveEventData(primaryKey!, eventData);
    }
  }

  async saveDevice(primaryKey: string, dataToSave: any) {
    return new Promise((resolve, reject) => {
      this.analyticsRef
        .update(primaryKey, dataToSave)
        .then(() => {
          resolve(true);
        })
        .catch((error: any) => {
          console.error('Error saving data:', error);
          reject(error);
        });
    });
  }

  saveEventData(primaryKey: string, eventData: any) {
    const currentUTCTime = Date.now();
    const customEventRef = this.db.object(
      `${this.analyticsPath}/${primaryKey}/events/${this.appSessionId}/${currentUTCTime}`
    );

    customEventRef.set(eventData);
  }
}
