import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'manageSearch',
  pure: false
})
export class ManageSearchPipe implements PipeTransform {

  transform(items: any[], filter: any) {
    return items.filter(function (item) {
      if (filter == undefined || filter == null) {
        return true;
      }
      const firstName = item.profile.firstName;
      const lastName = item.profile.lastName;
      const email = item.bio.email;
      const cell = item.bio.cell;
      if (firstName !== null && firstName.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (lastName !== null && lastName.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (email !== null && email.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else if (cell !== null && cell.toLowerCase().indexOf(filter) !== -1) {
        return true;
      } else {
        return false;
      }

    });
  }
}
