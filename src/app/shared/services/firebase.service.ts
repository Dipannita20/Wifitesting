import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { Observable, map, of } from 'rxjs';
import ProgramModel from 'src/models/program.model';
import { Retailer } from '../interfaces/programdata.interface';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  programPath = '/WifiTestApp/Program';
  programRef: AngularFireList<ProgramModel>;
  public programList: any;

  selectedDealer: Retailer | undefined;
  selectedTempDealer: { dealer?: string; selected?: boolean } = {};
  program: string | undefined;

  constructor(private db: AngularFireDatabase) {
    this.programRef = db.list(this.programPath);
  }

  getProgramList(): Observable<any> {
    return this.programRef
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
  }

  getSelectedProgram(): Observable<ProgramModel> {
    return of(
      this.programList.filter((x: { key: string }) => x.key == this.program)[0]
    );
  }
}
