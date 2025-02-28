import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'default',
  standalone:true,
})
export class DefaultPipe implements PipeTransform {
  transform(value: any, fallback: string = 'N/A'): any {
    return (value === null || value === undefined || value === '') ? fallback : value;
  }
}
