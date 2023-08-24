import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    //creando la validación del Pipe para el id de mongo
    // console.log({ value, metadata });
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid MongoId`);
    }

    return value.toUpperCase();
  }
}
