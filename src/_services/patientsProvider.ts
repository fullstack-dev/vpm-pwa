import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Config } from './config';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Helper } from './helperService';
import { ChallengePatientList, Patient } from '../models/models';
import { MapperService } from './mapper';
import { HttpService } from './http-service';
@Injectable()
export class PatientsService {
  private indicators: any;
  constructor(
    private helper: Helper,
    public domSanitizer: DomSanitizer,
    public mapper: MapperService,
    private httpService: HttpService
  ) { }

  public getChallengePatientsList(BY, challenge) {
    return new Promise((resolve, reject) => {
      this.getPatients(challenge).then((_cplist: ChallengePatientList) => {
        this.sortChallengePatients(BY, _cplist).then(result => {
          resolve(_cplist);
        });
      }).catch(e => {
        this.helper.hideLoading();
        console.error(e);
      });
    });
  }

  public getPatients(challenge) {
    return new Promise((resolve, reject) => {
      this.indicators = [];
      this.indicators = challenge.challengeTemplateInfo.indicatorLst;
      this.indicators.push({ code: 'Next Appointment' })
      this.getMembers(challenge.campaignInfo.circleInfo.id, challenge.creatorId)
        .then((patientsList: Array<any>) => {
          resolve(new ChallengePatientList(challenge, patientsList));
        });
    });
  }


  getMembers(circleId, creatorId) {
    return new Promise((resolve, reject) => {
      let patientsList: Array<any> = [];
      this.httpService.get('circles/' + circleId + '/members')
        .subscribe((_members) => {
          let members: Array<any> = _members.info;
          members.forEach((member, index, membersArray) => {
            if (member.invitationState === 'accept' || member.invitationState === 'invite') {
              if (member.memberId !== creatorId) {
                this.getMHIStatus(member)
                  .then(indicators => {
                    this.getBio(member.memberId).then((bio: any) => {
                      this.getProfilePic(member.memberId, bio)
                        .then(profilePic => {
                          if (bio.externalProvider == null || bio.externalProvider.length == 0) {
                            // no ext -> search and save
                            this.mapper.getCernerId(bio.email, bio.cell)
                              .then((id: string) => {
                                patientsList.push(new Patient(member, bio, indicators, profilePic, { red: 0, yellow: 0, green: 0 }, [], true, id));
                                if (patientsList.length === members.length - 1) {
                                  resolve(patientsList);
                                }
                              });
                          } else {
                            // have ext
                            bio.externalProvider.forEach(item => {
                              let name1 = (item.externalSystemName).toLowerCase();
                              let name2 = (localStorage.getItem('EHRprovider')).toLowerCase();
                              if (name1 == name2) {
                                patientsList.push(new Patient(member, bio, indicators, profilePic, { red: 0, yellow: 0, green: 0 }, [], true, item.externalId));
                              }
                            });
                            if (patientsList.length === members.length - 1) {
                              resolve(patientsList);
                            }
                          }
                        });
                    });
                  });
              } else if (patientsList.length === members.length - 1) {
                resolve(patientsList);
              }
            }
          });
        }, error => {
          this.helper.hideLoading();
        });
    });
  }

  getBio(memberId) {
    return new Promise((resolve, reject) => {
      this.httpService.getMemberProfile(memberId)
        .subscribe(profile => {
          resolve(profile.data);
        }, error => {
          this.helper.hideLoading();
        });
    });
  }

  getProfilePic(memberId, bio) {
    return new Promise((resolve, reject) => {
      let imagePath: SafeResourceUrl;
      this.httpService.getMemberProfilePic(memberId)
        .subscribe(pic => {
          let img = pic.image;
          if (img != null) {
            imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,'
              + img);
          }
          resolve(imagePath);
        }, error => {
          if (bio.gender === '1') {
            imagePath = this.domSanitizer.bypassSecurityTrustUrl('assets/img/avatar_male.png');
          } else {
            imagePath = this.domSanitizer.bypassSecurityTrustUrl('assets/img/avatar_female.png');
          }
          resolve(imagePath);
        });
    });
  }

  getMHIStatus(member) {
    return new Promise((resolve) => {
      this.httpService.getMemberMhiStatus(member.memberId)
        .subscribe(mhiStatus => {
          let rIndicators = [];
          mhiStatus.data.forEach(pIndicator => {
            this.indicators.forEach(indicator => {
              if (pIndicator.indicatorCode === indicator.code) {
                pIndicator.lastUpdatedDate = this.helper.getTimeDifference(parseInt(pIndicator.lastUpdatedDate));
                pIndicator.questions[0].unit = this.getUnit(pIndicator.indicatorCode, pIndicator.questions[0].unit);
                if (pIndicator.questions[0].unit == 'kg') {
                  pIndicator.questions[0].unit = 'lb';
                  pIndicator.questions[0].value = ((pIndicator.questions[0].value) * (2.2046)).toFixed(2);
                }
                if (pIndicator.questions[0].value == NaN || pIndicator.questions[0].value == null) {
                  pIndicator.status = 'NONE';
                }
                rIndicators.push(pIndicator);
              }
            });
          });
          const templist = [];
          this.indicators.forEach(ci => {
            rIndicators.forEach(pi => {
              if (ci.code === pi.indicatorCode) {
                templist.push(pi);
              }
            });
          });
          rIndicators = templist;
          rIndicators.push({
            indicatorCode: 'Next Appointment',
            questions: [
              { value: null }
            ],
            lastUpdatedDate: 'Not Scheduled',
            status: 'NONE'
          });
          resolve(rIndicators);
        });
    });
  }

  getUnit(indicator_code: string, unit: string): string {
    let _unit = null;
    if (indicator_code === 'Daily Weight') {
      _unit = 'lb';
      if (unit == 'kg') {
        _unit = 'kg';
      }
    }
    if (indicator_code === 'Breath Rate')
      _unit = 'bpm';
    if (indicator_code === 'Pulse')
      _unit = 'bpm';
    if (indicator_code === 'Oxygen Saturation')
      _unit = '%';
    return _unit;
  }




  sortChallengePatients(BY, _cpList: ChallengePatientList) {
    return new Promise((resolve, reject) => {
      let cpList: any;
      switch (BY) {
        case 'R-H':
          cpList = this.getStatusCount(_cpList);
          cpList.patients.sort(this.sortPatientsRH);
          resolve(cpList);
          break;
        case 'H-R':
          cpList = this.getStatusCount(_cpList);
          cpList.patients.sort(this.sortPatientsHR);
          resolve(cpList);
          break;
        case 'A-Z':
          _cpList.patients.sort(this.sortByNameAscending);
          resolve(_cpList);
          break;
        case 'Z-A':
          _cpList.patients.sort(this.sortByNameDescending);
          resolve(_cpList);
          break;
        default:
          reject('Wrong sort type.');
          break;
      }
    });
  }

  getStatusCount(cpList: ChallengePatientList) {
    cpList.patients.forEach((patient, iIndex, array) => {
      const red = [];
      const yellow = [];
      const green = [];
      const NA = [];
      if (patient.mhiStatusList) {
        patient.mhiStatusList.forEach(indicator => {
          if (indicator.status === 'RED') {
            red.push(indicator);
          } else if (indicator.status === 'YELLOW') {
            yellow.push(indicator);
          } else if (indicator.status === 'GREEN') {
            green.push(indicator);
          } else {
            NA.push(indicator);
          }
        });
        patient.statusCount.red = red.length;
        patient.statusCount.yellow = yellow.length;
        patient.statusCount.green = green.length;
      }
    });
    return cpList;
  }

  sortPatientsRH(a, b) {
    let redA;
    let redB;
    if (a.statusCount == undefined) {
      redA = 0;
    } else {
      redA = a.statusCount.red;
    }
    if (b.statusCount == undefined) {
      redB = 0;
    } else {
      redB = b.statusCount.red;
    }
    if (redA > redB) {
      return -1;
    }
    if (redA < redB) {
      return 1;
    }
    return 0;
  }

  sortPatientsHR(a, b) {
    let redA;
    let redB;
    if (a.statusCount == undefined) {
      redA = 0;
    } else {
      redA = a.statusCount.green;
    }
    if (b.statusCount == undefined) {
      redB = 0;
    } else {
      redB = b.statusCount.green;
    }

    if (redA > redB) {
      return -1;
    }
    if (redA < redB) {
      return 1;
    }
    return 0;
  }
  sortByNameAscending(a, b) {
    let nameA;
    let nameB;
    if (a.profile.firstName == null) {
      nameA = 'z';
    } else {
      nameA = a.profile.firstName.toUpperCase();
    }
    if (b.profile.firstName == null) {
      nameB = 'z';
    } else {
      nameB = b.profile.firstName.toUpperCase();
    }
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  sortByNameDescending(a, b) {
    let nameA;
    let nameB;
    if (a.profile.firstName == null) {
      nameA = 'z';
    } else {
      nameA = a.profile.firstName.toUpperCase();
    }
    if (b.profile.firstName == null) {
      nameB = 'z';
    } else {
      nameB = b.profile.firstName.toUpperCase();
    }
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }
    return 0;

  }
}

