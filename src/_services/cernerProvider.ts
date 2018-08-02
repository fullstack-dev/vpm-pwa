import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map'
import { Config } from './config';
import { Helper } from './helperService';
import { LoginPage } from '../pages/login/login';
import { DataService } from './data-service';

@Injectable()
export class CernerService {
  patient: Patient;
  cernerPatients: any;
  slots: any;
  // public accessToken: string;
  constructor(
    private http: Http,
    private config: Config,
    private helper: Helper,
    private dataService: DataService
  ) {
  }

  // getAccessToken() {
  //   if (this.accessToken) {
  //     return this.accessToken;
  //   }
  //   alert('Invalid access token');
  // }

  // TODO: remove below  2 method when using getPatients();

  getTempPatients() {
    if (this.cernerPatients) {
      return this.cernerPatients;
    } else {
      this.helper.showAlert('Failed to get patients.', 'Try again');
    }

  }

  getTempSlots() {
    if (this.slots) {
      return this.slots;
    } else {
      this.helper.showAlert('Failed to get time slots.', 'Try again');
    }

  }

  getCernerHeaders() {
    let headers = new Headers();
    const accessToken = this.dataService.getAccessToken();
    headers.append('Content-Type', 'application/json+fhir');
    headers.append('Authorization', 'Bearer ' + accessToken);
    headers.append('Accept', 'application/json+fhir');
    return headers;
  }

  postCernerHeaders() {
    let headers = new Headers();
    const accessToken = this.dataService.getAccessToken();
    headers.append('Accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + accessToken);
    return headers;
  }

  getPatientByParam(param) {
    // let resource;

    if (param.indexOf('Patient') === -1) {
      param = 'Patient/' + param;
    }

    return this.http.get(this.config.getFhirUri().concat(param), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  searchPatientByEmail(email) {
    return this.http.get(this.config.getFhirUri().concat('Patient?email=' + email), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response.json();
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  searchPatientByPhone(phone) {
    return this.http.get(this.config.getFhirUri().concat('Patient?phone=' + phone), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response.json();
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  searchPatientByName(name) {
    return this.http.get(this.config.getFhirUri().concat('Patient?given=' + name), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response.json();
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  getPatients(param: string) {
    return this.http.get(this.config.getFhirUri().concat('Patient?given=' + param + '&_count=25'), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  searchForPatient(param: string) {

  }


  postPatient() {
    let headers = new Headers();
    const accessToken = this.dataService.getAccessToken();
    headers.append('Accept', 'application/json+fhir');
    headers.append('Authorization', 'Bearer ' + accessToken);
    this.patient.resourceType = 'Patient';
    this.patient.identifier.push(new Identifier('usual'));
    this.patient.active = true;
    this.patient.name.push(new Name('usual', ['cerner'], ['Noah'], ['Emma']));
    this.patient.telecom.push(new Telecom('1234567890', 'home'));
    this.patient.gender = 'male';
    this.patient.birthDate = '2000-01-01';
    this.patient.deceasedBoolean = false;
    this.patient.address.push(new Address('home', 'postal', ['1'], 'noida', 'noida', 'up', '201301', 'india'));
    this.patient.maritalStatus = new MaritalStatus('unmarried');
    this.patient.contact = new Contact([{ 'text': 'private' }], new Name('usual', ['cerner'], ['freds'], ['charly']));
    this.http.post(this.config.getFhirUri(), this.patient, { headers }).map((response: Response) => {
      return response;
    }, error => {
      this.helper.hideLoading();
      console.error(error);
    });
  }



  getAppointments(patientRef: string) {
    return this.http.get(this.config.getFhirUri().concat('Appointment?date=2012&patient=' + patientRef), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  getPatientAppointment(patientRef) {
    return this.http.get(this.config.getFhirUri().concat('Appointment?date=2012&patient=' + patientRef), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  getDocument(patientRef) {
    const ref = "DocumentReference/$docref?patient=" + patientRef + "&type=http%3A%2F%2Floinc.org%7C34133-9"
    return this.http.get(this.config.getFhirUri().concat(ref), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  getBinary(url) {
    return this.http.get(url, { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }



  postAppointment(appointment) {
    return this.http.post(this.config.getFhirUri().concat('Appointment'), appointment, { headers: this.postCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      })
  }

  getSlots() {
    // Practitioner/4464007 "user portal"
    const actor = 'Practitioner/937933';
    const slot_type = 'http://snomed.info/sct|394581000';
    return this.http.get(this.config.getFhirUri().concat('Slot?schedule.actor=' + actor + '&start=2012&slot-type=' + slot_type + '&_count=10'), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  getEncounters(patientRef) {
    return this.http.get(this.config.getFhirUri().concat('Encounter?patient=' + patientRef), { headers: this.getCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      });
  }

  postDocument(document) {
    return this.http.post(this.config.getFhirUri().concat('DocumentReference'), document, { headers: this.postCernerHeaders() })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
        console.error(error);
      })
  }


  getNewToken() {
    const refresh_token = localStorage.getItem('refreshToken_provider');
    var data = "client_id=" + this.config.getFhirClientId() + "&redirect_uri=" + this.config.REDIRECT_URI + "&grant_type=refresh_token" + "&refresh_token=" + refresh_token;
    var headers = new Headers();
    headers.append('Content-Type', 'application/X-www-form-urlencoded');
    const token_url_p = localStorage.getItem('token_url_p');
    return this.http.post(token_url_p, data, { headers: headers }).map((data1) => {
      // var result_json = data1.json();
      // var accessToken_p = result_json.access_token;
      // localStorage.setItem('accessToken_provider', accessToken_p);
      // this.dataService.setAccessToken()
      return data1.json();
    });
  }
}




class Patient {
  constructor(
    public resourceType: string,
    public identifier: Array<Identifier>,
    public active: Boolean,
    public name: Array<Name>,
    public telecom: Array<Telecom>,
    public gender: string,
    public birthDate: string,
    public deceasedBoolean: Boolean,
    public address: Array<Address>,
    public maritalStatus: MaritalStatus,
    public contact: Contact,

  ) { }
}

class Identifier {
  constructor(
    public use: string
  ) { }
}

class Name {
  constructor(
    public use: string,
    public family: Array<any>,
    public prefix: Array<any>,
    public suffix: Array<any>
  ) { }
}

class Telecom {
  constructor(
    public value: string,
    public use: string
  ) { }
}

class Address {
  constructor(
    public use: string,
    public type: string,
    public line: Array<any>,
    public city: string,
    public district: string,
    public state: string,
    public postalCode: string,
    public country: string
  ) { }
}

class MaritalStatus {
  constructor(
    public text: string
  ) { }
}

class Contact {
  constructor(
    public relationship: Array<Relationship>,
    public name: Name
  ) { }
}

class Relationship {
  constructor(
    public text: string
  ) { }
}