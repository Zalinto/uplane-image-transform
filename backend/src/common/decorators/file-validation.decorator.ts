import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFile', async: false })
export class IsFileConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    return !!file;
  }
}

export function IsFile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFileConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsImage', async: false })
export class IsImageConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!file) {
      return false;
    }

    return validMimeTypes.includes(file.mimetype);
  }

  defaultMessage() {
    return 'File must be an image (jpeg, jpg, png, gif, or webp)';
  }
}

export function IsImage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsImageConstraint,
    });
  };
}
