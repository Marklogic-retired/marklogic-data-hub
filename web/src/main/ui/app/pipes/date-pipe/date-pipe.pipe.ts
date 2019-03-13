import { Pipe, PipeTransform } from '@angular/core';
import { distanceInWords } from 'date-fns';

@Pipe({
  name: 'datePipe'
})
export class DatePipePipe implements PipeTransform {

  transform(value: Date | string | number, ...args: any[]): any {
    if (!value) return '';
    return distanceInWords(value, new Date()) + ' ago';
  }
}
