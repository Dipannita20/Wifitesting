import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import ProgramModel from '../../../../models/program.model';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { NetworkService } from 'src/app/shared/services/network.service';
import { LoggingService } from 'src/app/shared/services/logging.service';

@Component({
  selector: 'app-program',
  templateUrl: './program.page.html',
  styleUrls: ['./program.page.scss'],
})
export class ProgramPage implements OnInit {
  program: string | undefined;

  programLst: ProgramModel[] = [];

  constructor(
    private router: Router,
    private firebase: FirebaseService,
    private network: NetworkService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.network.checkNetworkStatus();
    this.programList();
    if (this.firebase.program) {
      this.program = this.firebase.program;
    }
  }

  programList(): void {
    this.firebase.getProgramList().subscribe((data) => {
      this.firebase.programList = data;
      data.forEach((element: ProgramModel) => {
        if (element.Client !== undefined && element.Client !== null) {
          this.programLst.push(element as ProgramModel);
        }
      });
    });
  }

  public next() {
    this.loggingService.saveLog('Program-Next', {
      program: this.program,
    });
    this.router.navigate(['/home/processing']);
  }

  public previous() {
    this.router.navigate(['/home/dealer-locator']);
  }

  handleChange(e: any) {
    this.firebase.program = e.key;
    this.program = this.firebase.program;
    this.next();
  }
}
