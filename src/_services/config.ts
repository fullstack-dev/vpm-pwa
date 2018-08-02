import { Injectable } from '@angular/core';

@Injectable()
export class Config {
  // ******healthwizz server***************
  FHIR_APIURI: string;
  FHIR_CLIENT_ID: string;
  // APIURL: string = 'http://52.207.221.179:8080/mobile/v1.1/';
  APIURL: string = 'http://192.168.1.4:8081/mobile/v1.1/';

  // *************Cerner sandbox***************
  // SERVICE_URI = "https://sb-fhir-dstu2.smarthealthit.org/smartdstu2/data/" //smart 
  CERNER_SERVICE_URI = "https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/"; //non-patient
  EPIC_SERVICE_URI = "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/";
  // EPIC_SERVICE_URI = 'https://open-ic.epic.com/argonaut/api/FHIR/Argonaut/';
  // ***********Redirect and launch uri***********************
  // REDIRECT_URI = "http://192.168.1.28:8080/PWA/#/login/"; // local tomcat uri
  // LAUNCH_URI = "http://192.168.1.28:8080/PWA/#/login/";

  REDIRECT_URI = "http://192.168.1.13:8100/#/login/"; // local ionic uri
  LAUNCH_URI = "http://192.168.1.13:8100/#/login/";

  // REDIRECT_URI = "http://52.207.221.179:8080/HealthWizzPWA/#/login/"; //staging uri
  // LAUNCH_URI = "http://52.207.221.179:8080/HealthWizzPWA/#/login/";

  // ****************Cerner client id****************
  // CERNER_CLIENT_ID = "0e811e11-5e16-4945-bd7b-73cc4b3198f5"; // runs on staging server(Smart app)

  // CERNER_CLIENT_ID = "ae90dd00-e03f-49c1-bc8f-25d5e71d8771" // runs on local tomcat(sol demo)

  CERNER_CLIENT_ID = "d169f1a5-a2b5-41c0-b274-dab34e77e058"; // runs on local ionic server(local ionic)
  EPIC_CLIENT_ID = "9835b7c4-2d80-42b9-8b45-0f36baba95e2"; //non-prod
  // ***************Cerner login Scope*************
  CERNER_SCOPE = "launch/user,openid,profile,online_access,user/Slot.read,user/MedicationOrder.read,user/Appointment.read,user/Appointment.write,user/Patient.read,user/Practitioner.read,user/Observation.read, user/DocumentReference.read, user/DocumentReference.write,user/Encounter.read, user/Binary.read";
  EPIC_SCOPE = "openid, profile, online_access";
  constructor() { }
  setFhirUri(uri: string) {
    this.FHIR_APIURI = uri;
  }

  getFhirUri(): string {
    return this.FHIR_APIURI;
  }

  setFhirClientId(clientId: string) {
    this.FHIR_CLIENT_ID = clientId;
  }

  getFhirClientId(): string {
    return this.FHIR_CLIENT_ID;
  }
}
