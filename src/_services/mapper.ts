
import { Injectable } from '@angular/core';
import { CernerService } from './cernerProvider';
import { Profile, Bio, CernerProfile } from '../models/models';
import { DataService } from './data-service';

@Injectable()
export class MapperService {
  cernerPatients: Array<any>;
  mapped_user: Array<MappedUser>;
  constructor(
    public cernerService: CernerService,
    private dataService: DataService
  ) { }

  loadPatients() {
    this.cernerPatients = [];
    return new Promise((resolve) => {
      // this.checkEHRLoginState()
      //   .then(r => {
      this.getPatients()
        .then(_ => {
          this.mapped_user = [];
          this.mapUser();
          resolve();
        });
      // });
    });
  }

  // checkEHRLoginState() {
  //   return new Promise((resolve, reject) => {
  //     if (localStorage.getItem('refreshToken_provider')) {
  //       this.cernerService.getNewToken()
  //         .subscribe(res => {
  //           this.dataService.setAccessToken(res.access_token);
  //           resolve();
  //         }, err => {
  //           reject('ehr');
  //         });
  //     } else {
  //       reject('ehr');
  //     }
  //   });
  // }

  getCall(param) {
    return new Promise((resolve, reject) => {
      this.cernerService.getPatients(param).subscribe(result => {
        let _patients = (result.json()).entry;
        _patients.forEach(p => {
          if (p.resource.telecom) {
            if (this.findPatient(p) == false) {
              this.cernerPatients.push(p);
            }
          }
        });
        resolve();
      }, err => {
        console.log(err);
        reject();
      });
    });
  }

  getCernerId(email: string, phone: string) {
    return new Promise(resolve => {
      if (localStorage.getItem('EHRprovider') === 'Cerner') {
        let emailFound = false;
        let phoneFound = false;
        let cernerId;
        if (email) {
          this.searchByEmail(email)
            .then(id => {
              resolve(id);
            }).catch(e => {
              if (phone) {
                this.searchByPhone(phone)
                  .then(id => {
                    resolve(id);
                  });
              } else {
                resolve(null);
              }
            })
        } else if (phone) {
          this.searchByPhone(phone)
            .then(id => {
              resolve(id);
            }).catch(e => {
              resolve(null);
            });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  // TODO: use upper function
  getCernerProfile(email: string, phone: string) {
    return new Promise(resolve => {
      if (localStorage.getItem('EHRprovider') === 'Cerner') {
        let emailFound = false;
        let phoneFound = false;
        let cernerId;
        if (email) {
          this.searchProfileByEmail(email)
            .then(patient => {
              resolve(patient);
            }).catch(e => {
              if (phone) {
                this.searchProfileByPhone(phone)
                  .then(patient => {
                    resolve(patient);
                  });
              } else {
                resolve(null);
              }
            })
        } else if (phone) {
          this.searchProfileByPhone(phone)
            .then(patient => {
              resolve(patient);
            }).catch(e => {
              resolve(null);
            });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }

    });
  }

  searchProfileByEmail(email) {
    return new Promise(resolve => {
      this.cernerService.searchPatientByEmail(email)
        .subscribe((res) => {
          if (res.total != 0) {
            let patient = res.entry[0];
            resolve(patient);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        })
    });
  }

  searchProfileByPhone(phone) {
    return new Promise(resolve => {
      this.cernerService.searchPatientByEmail(phone)
        .subscribe((res) => {
          if (res.total != 0) {
            let patient = res.entry[0];
            resolve(patient);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        });
    });
  }

  searchByEmail(email) {
    return new Promise(resolve => {
      this.cernerService.searchPatientByEmail(email)
        .subscribe((res) => {
          if (res.total != 0) {
            let patient = res.entry[0];
            resolve(patient.resource.id);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        })
    });
  }

  searchByPhone(phone) {
    return new Promise(resolve => {
      this.cernerService.searchPatientByEmail(phone)
        .subscribe((res) => {
          if (res.total != 0) {
            let patient = res.entry[0];
            resolve(patient.resource.id);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        });
    });
  }

  findPatient(patient) {
    let found = false;
    if (this.cernerPatients.length > 0) {
      this.cernerPatients.forEach((p, i, a) => {
        if (patient.resource.id === p.resource.id) {
          found = true;
        }
      });
    }
    return found;
  }

  getPatients() {
    let promises: Array<Promise<any>> = [];
    promises.push(this.getCall('A'));
    promises.push(this.getCall('B'));
    promises.push(this.getCall('C'));
    return Promise.all(promises);
  }

  getCernerPatients() {
    if (this.mapped_user) {
      return this.mapped_user;
    }
  }

  mapPatient(patient: any) {
    let _profile: CernerProfile;
    this.mapped_user.forEach(p => {
      if (p.email === patient.bio.email) {
        _profile = p.patient;
      }
    });
    return _profile;
  }

  mapUser() {
    console.log('========mapping==========');
    console.log(this.cernerPatients);
    this.cernerPatients.forEach(_patient => {
      let _new_patient = this.makeProfile(_patient);
      if (_patient.resource.id === "847932") { //BURRIS, ALAN P
        this.mapped_user.push(new MappedUser(_new_patient, "yaduvanshimayank042@gmail.com"));
      } else if (_patient.resource.id === "1067998") { //BROWNE, ZACHARY AARON
        this.mapped_user.push(new MappedUser(_new_patient, "dhirendra@sollogics.com"));
      } else if (_patient.resource.id === "2192007") { //ARNOLD, ADAM
        this.mapped_user.push(new MappedUser(_new_patient, "vikash@sollogics.com"));
      } else if (_patient.resource.id === "687961") { //BEGAY CERNER
        this.mapped_user.push(new MappedUser(_new_patient, "saugat@mailinator.com"));
      } else if (_patient.resource.id === "789936") { //BRANDY
        this.mapped_user.push(new MappedUser(_new_patient, "bhoope57@gmail.com"));
      } else if (_patient.resource.id === "687934") { //JOHN CERNER
        this.mapped_user.push(new MappedUser(_new_patient, "saugatan@interrait.com"));
      } else {
        this.mapped_user.push(new MappedUser(_new_patient, null));
      }
    });
    console.log('======Mapped users=======');
    console.log(this.mapped_user);
  }

  makeProfile(_patient) {
    let resource = _patient.resource
    let cell = null;
    let email = null;
    let flag1 = true;
    let flag2 = true;
    let avatar;
    if (resource.telecom) {
      resource.telecom.forEach(tele => {
        if (flag1) {
          if (tele.system === 'phone') {
            cell = tele.value;
            flag1 = false;
          }
        }
        if (flag2) {
          if (tele.system === 'email') {
            email = tele.value;
            flag2 = false;
          }
        }
      });
    }

    if (resource.gender && resource.gender === "male") {
      avatar = "assets/img/avatar_male.png";
    } else {
      avatar = "assets/img/avatar_female.png";
    }
    let first_name = resource.name[0].given[0] + ' ' + (resource.name[0].given[1] ? resource.name[0].given[1] : '');
    let last_name = resource.name[0].family[0];
    const profile = new Profile(first_name, last_name, _patient.fullUrl, resource.id);
    const bio = new Bio(first_name, last_name, cell, email, resource.gender, resource.birthDate);
    return new CernerProfile(profile, bio, avatar);
  }
}

class MappedUser {
  constructor(
    public patient: CernerProfile,
    public email: string
  ) { }
}