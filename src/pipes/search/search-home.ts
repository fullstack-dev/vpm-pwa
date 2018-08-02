import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'homeSearch',
})
export class SearchHomePipe implements PipeTransform {

  transform(items: any[], filter: any) {
    return items.filter(function (item) {
      if (filter == undefined || filter == null) {
        return true;
      }
      const firstName = item.patient.profile.firstName;
      const lastName = item.patient.profile.lastName;
      const email = item.patient.bio.email;
      const cell = item.patient.bio.cell;
      if (firstName.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (lastName.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (email !== null && email.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (cell.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else {
        return false;
      }
    });
  }
}
