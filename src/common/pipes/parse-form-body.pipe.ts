import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseFormBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return JSON.parse(JSON.stringify(value));
  }
}
