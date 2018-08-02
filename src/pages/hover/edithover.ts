import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AuthenticationService } from '../../_services/authentication';
import { Helper } from '../../_services/helperService';
import { CernerService } from '../../_services/cernerProvider';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { HttpService } from '../../_services/http-service';

// import { CHFHistoryPage } from '../chfhistory/chfhistory';

@Component({
  selector: 'page-edithover',
  templateUrl: 'edithover.html'
})

export class EditHoverPage {
  hoverData: any;
  newValue: any;
  yesNoSelect = false;
  legSwellingSelect = true;
  mhiUpdate = new MhiUpdate(null, { code: null }, []);
  documentBo = {
    "resourceType": "DocumentReference",
    "subject": {
      "reference": "Patient/4342010"
    },
    "type": {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "34840-9"
        }
      ]
    },
    "indexed": "2015-11-18T18:00:00Z",
    "status": "current",
    "docStatus": {
      "coding": [
        {
          "system": "http://hl7.org/fhir/composition-status",
          "code": "final"
        }
      ]
    },
    "description": "Rheumatology Note",
    "content": [
      {
        "attachment": {
          "contentType": "application/xhtml+xml;charset=utf-8",
          "data": null
        }
      }
    ],
    "context": {
      "encounter": {
        "reference": "Encounter/4027918"
      },
      "period": {
        "end": "2017-12-31T09:10:14Z"
      }
    }
  }
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private authenticationService: AuthenticationService,
    private helper: Helper,
    public cernerService: CernerService,
    private httpSevice: HttpService
  ) {
    this.hoverData = this.navParams.data;
    console.log(this.hoverData);
    if (this.hoverData.indicator.questions) {
      this.newValue = this.hoverData.indicator.questions[0].value;
      if (this.hoverData.indicator.indicatorCode === 'Low Salt Diet' ||
        this.hoverData.indicator.indicatorCode === 'Fluid Restriction' ||
        this.hoverData.indicator.indicatorCode === 'Meds Taken As Advised') {
        this.yesNoSelect = true;
        this.legSwellingSelect = false;
      } else if (this.hoverData.indicator.indicatorCode === 'Leg Swelling') {
        this.yesNoSelect = false;
        this.legSwellingSelect = true;
      } else {
        this.yesNoSelect = false;
        this.legSwellingSelect = false;
      }
    } else {
      this.newValue = this.hoverData.patient.mhiStatusList.questions[0].value;
      if (this.hoverData.patient.mhiStatusList.indicatorCode === 'Low Salt Diet' ||
        this.hoverData.patient.mhiStatusList.indicatorCode === 'Fluid Restriction' ||
        this.hoverData.patient.mhiStatusList.indicatorCode === 'Meds Taken As Advised') {
        this.yesNoSelect = true;
        this.legSwellingSelect = false;
      } else if (this.hoverData.patient.mhiStatusList.indicatorCode === 'Leg Swelling') {
        this.yesNoSelect = false;
        this.legSwellingSelect = true;
      } else {
        this.yesNoSelect = false;
        this.legSwellingSelect = false;
      }
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  save() {
    if (!this.newValue) {
      this.helper.showAlert('Please fill the value field', 'Empty!');
      return;
    }
    if (this.newValue < 0) {
      this.helper.showAlert("Value can't be less then 0", 'Invalid!');
      return;
    }
    this.helper.showLoading();
    let patientRef = 'Patient/' + this.hoverData.patient.cernerId;
    let patientId = this.hoverData.patient.cernerId;
    let encounterRef;
    this.mhiUpdate.userId = this.hoverData.patient.profile.memberId;
    let ques = [];
    if (this.hoverData.patient.mhiStatusList.questions) {
      ques = this.hoverData.patient.mhiStatusList.questions;
      this.mhiUpdate.indicator.code = this.hoverData.patient.mhiStatusList.indicatorCode;
    } else {
      ques = this.hoverData.indicator.questions;
      this.mhiUpdate.indicator.code = this.hoverData.indicator.indicatorCode;
    }
    this.mhiUpdate.questions.push(new Question(ques[0].code, this.newValue, ques[0].unit));
    console.log(this.mhiUpdate);
    const link = 'saveUserMhi/';
    this.httpSevice.postMemberMhi(this.mhiUpdate)
      .subscribe(result => {
        if (patientId !== null && patientId !== undefined) {
          this.cernerService.getNewToken().subscribe(r => {
            this.cernerService.getEncounters(patientId).subscribe(result => {
              console.log(result.json());
              if ((result.json()).entry !== undefined) {
                encounterRef = 'Encounter/' + ((result.json()).entry[0].resource.id);
              } else {
                encounterRef = 'Encounter/' + ((result.json()).id);
              }
              const indicator = this.hoverData.patient.mhiStatusList.indicatorCode;
              const xmlString = "<!DOCTYPE html><html><head><title>Document</title></head><body><p>" + indicator + "</p><p>" + this.newValue + "</p></body></html>";
              const encodedString = window.btoa(xmlString);
              this.documentBo.subject.reference = patientRef;
              this.documentBo.context.encounter.reference = encounterRef;
              this.documentBo.content[0].attachment.data = encodedString;
              this.cernerService.postDocument(this.documentBo).subscribe(result => {
                this.helper.hideLoading();
                const data = {
                  indicator: this.hoverData.indicator,
                  value: this.newValue
                };
                this.viewCtrl.dismiss(data);
                this.helper.showAlert('Successfully updated the value.', 'Success');
                console.log(result);
              }, error => {
                this.helper.hideLoading();
                console.log(error);
                if (error === 'token') {
                  this.save();
                } else {
                  this.helper.showAlert('Saved on Health Wizz but failed on Cerner.', 'Failed');
                }
              });
            }, error => {
              this.helper.hideLoading();
              if (error === 'token') {
                this.save();
              } else {
                this.helper.showAlert('Saved on Health Wizz but failed on Cerner.', 'Failed');
              }
            });
          }, e => {
            this.helper.showAlert('Session Expired.', 'Signed Out');
            this.navCtrl.setRoot(LoginPage);
          });
        } else {
          this.helper.hideLoading();
          const data = {
            indicator: this.hoverData.indicator,
            value: this.newValue
          };
          this.viewCtrl.dismiss(data);
          this.helper.showAlert('Successfully updated the value.', 'Success');
        }
      }, error => {
        console.log(error);
        this.helper.hideLoading();
        this.helper.showAlert('Failed to save the new value.', 'Failed');
      });
  }
}



class MhiUpdate {
  constructor(
    public userId: any,
    public indicator: { code: string },
    public questions: Array<Question>
  ) { }
}

class Question {
  constructor(
    public code: string,
    public value: any,
    public unit: any
  ) { }
}