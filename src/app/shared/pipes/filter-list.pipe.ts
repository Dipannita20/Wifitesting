import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterList',
})
export class FilterListPipe implements PipeTransform {
  transform(
    items: any[],
    property: string,
    condition: string,
    value: any
  ): any[] {
    if (!items || !property || !condition) {
      return items;
    }

    return items.filter((item) => {
      switch (condition) {
        case 'greaterThan':
          return item[property] > value;
        case 'equal':
          return (item[property] = value);
        default:
          return false;
      }
    });
  }
}
