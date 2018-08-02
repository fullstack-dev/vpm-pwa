import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { NgCalendarModule } from 'ionic2-calendar';
import { PopoverModule } from 'ng2-popover';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { PatientsPage } from '../pages/patients/patients';
import { SendAlertPage } from '../pages/sendalert/sendalert';
import { AppointmentsPage } from '../pages/appointments/appointments';
import { ManagePatientsPage } from '../pages/managepatients/managepatients';
import { RightMenuPage } from '../pages/rightmenu/rightmenu';
import { PatientListItemPage } from '../pages/patientlistitem/patientlistitem';
import { AlertHistoryPage } from '../pages/alerthistory/alerthistory';
import { CHFHistoryPage } from '../pages/chfhistory/chfhistory';
import { DailyWeightPage } from '../pages/dailyweight/dailyweight';

import { PopoverPage } from '../pages/popover/popover';
import { EditListPage } from '../pages/editlist/editlist';
import { HoverPage } from '../pages/hover/hover';

import { AuthenticationService } from '../_services/authentication';
import { Helper } from '../_services/helperService';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Config } from '../_services/config';
import { PatientsService } from '../_services/patientsProvider';
import { CernerService } from '../_services/cernerProvider';
import { AlertHoverPage } from '../pages/hover/alert.hover';
import { EditHoverPage } from '../pages/hover/edithover';
import { PatientModalPage } from '../pages/appointments/patient-modal';
import { PipesModule } from '../pipes/pipes.module';
import { HomePageModule } from '../pages/home/home.module';
import { HttpService } from '../_services/http-service';
import { EditGroupPageModule } from '../pages/edit-group/edit-group.module';
import { DataService } from '../_services/data-service';
import { MapperService } from '../_services/mapper';
import { DeleteGroupPageModule } from '../pages/delete-group/delete-group.module';
import { IonTagsInputModule } from "ionic-tags-input";
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { PatientSearchService } from '../_services/patient-search-service';
import { InviteResultModalPageModule } from '../pages/invite-result-modal/invite-result-modal.module';
// import { RlTagInputModule } from 'angular2-tag-input';
// import { TagInputModule } from 'ngx-chips';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    PatientsPage,
    SendAlertPage,
    AppointmentsPage,
    ManagePatientsPage,
    RightMenuPage,
    PatientListItemPage,
    AlertHistoryPage,
    CHFHistoryPage,
    DailyWeightPage,
    PopoverPage,
    EditListPage,
    HoverPage,
    AlertHoverPage,
    EditHoverPage,
    PatientModalPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    PipesModule,
    NgCalendarModule,
    PopoverModule,
    HomePageModule,
    EditGroupPageModule,
    DeleteGroupPageModule,
    IonTagsInputModule,
    AutoCompleteModule,
    InviteResultModalPageModule,
    // BrowserAnimationsModule,
    // TagInputModule,
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: LoginPage, name: 'login', segment: 'login' },
        { component: HomePage, name: 'home', segment: 'home' }
      ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    PatientsPage,
    SendAlertPage,
    AppointmentsPage,
    ManagePatientsPage,
    RightMenuPage,
    PatientListItemPage,
    AlertHistoryPage,
    CHFHistoryPage,
    DailyWeightPage,
    PopoverPage,
    EditListPage,
    HoverPage,
    AlertHoverPage,
    EditHoverPage,
    PatientModalPage
  ],
  providers: [
    StatusBar,
    PatientsService,
    SplashScreen,
    AuthenticationService,
    Helper,
    Config,
    InAppBrowser,
    CernerService,
    DataService,
    HttpService,
    MapperService,
    PatientSearchService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
