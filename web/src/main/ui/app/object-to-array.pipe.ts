import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectToArray'
})
export class ObjectToArrayPipe implements PipeTransform {

  transform(obj: any): Array<any> {
    let array = [];
    for (let key of Object.keys(obj)) {
      let val = obj[key];
      if (val instanceof Object && !(val instanceof String)) {
        let newObj = Object.assign(
          {
            __key: key
          },
          val
        );
        array.push(newObj);
      } else {
        array.push({
          __key: key,
          value: val
        });
      }
    }
    return array;
  }

}
