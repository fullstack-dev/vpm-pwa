import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], filter: any) {
    return items.filter(function (item) {
      if (filter == undefined || filter == null) {
        return true;
      }
      const name = item.profile.firstName;
      return name.toLowerCase().indexOf(filter) !== -1;
    });
  }
}
