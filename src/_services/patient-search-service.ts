// import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import 'rxjs/add/operator/map'
import { CernerService } from './cernerProvider';

@Injectable()
export class PatientSearchService {
  constructor(private http: Http, private cernerService: CernerService) {

  }
  getResults(keyword: string) {     // gives list of patients or empty list
    return new Promise((resolve, reject) => {
      if (this.isNumber(keyword) == true) {
        this.getCernerProfile(null, keyword, null)
          .then((patients: Array<any>) => {
            if (patients == null) {
              resolve([]); //empty list
            } else {
              resolve(patients); //patient list
            }
          });
      } else if (this.isEmail(keyword) == true) {
        this.getCernerProfile(keyword, null, null)
          .then((patients: Array<any>) => {
            if (patients == null) {
              resolve([]); //empty list
            } else {
              resolve(patients); //patient list
            }
          });
      } else {
        this.getCernerProfile(null, null, keyword)
          .then((patients: Array<any>) => {
            if (patients == null) {
              resolve([]); //empty list
            } else {
              resolve(patients); //patient list
            }
          });
      }
    });
  }

  isNumber(value) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(value);
  }

  isEmail(value: string) {
    if (value.search('@') !== -1) {
      return true;
    }
    return false;
  }

  getCernerProfile(email: string, phone: string, name: string) {
    return new Promise(resolve => {
      if (email) {
        this.searchProfileByEmail(email)
          .then((patients: Array<any>) => {
            resolve(patients);
          }).catch(e => {
            resolve(null);
          });
      } else if (phone) {
        this.searchProfileByPhone(phone)
          .then((patients: Array<any>) => {
            console.log(patients);
            resolve(patients);
          }).catch(e => {
            resolve(null);
          });
      } else if (name) {
        this.searchProfileByName(name)
          .then((patients: Array<any>) => {
            console.log(patients);
            resolve(patients);
          }).catch(e => {
            resolve(null);
          });
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
            let patients = res.entry; //list
            resolve(patients);
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
      console.log(phone);
      this.cernerService.searchPatientByPhone(phone)
        .subscribe((res) => {
          console.log(res);
          if (res.total != 0) {
            let patients = res.entry; //list
            resolve(patients);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        });
    });
  }

  searchProfileByName(name) {
    return new Promise(resolve => {
      console.log(name);
      this.cernerService.searchPatientByName(name)
        .subscribe((res) => {
          console.log(res);
          if (res.total != 0) {
            let patients = res.entry; //list
            resolve(patients);
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        });
    });
  }

}