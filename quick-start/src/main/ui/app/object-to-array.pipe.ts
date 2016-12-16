import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectToArray'
})
export class ObjectToArrayPipe implements PipeTransform {

  transform(obj: any): Array<any> {
    let array = [];
    for (let key of Object.keys(obj)) {
      let newObj = Object.assign(
        {
          __key: key
        },
        obj[key]
      );
      array.push(newObj);
    }
    return array;
  }

}
