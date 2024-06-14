import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

export abstract class Validation {
  static conflict<T>(exist: T | null, errorMessage: string) {
    if (exist) throw new ConflictException(errorMessage);
  }

  static async asyncConflict<T>(
    promise: Promise<T | null>,
    errorMessage: string,
  ) {
    const exist = await promise;

    if (exist) throw new ConflictException(errorMessage);
  }

  static notFound<T>(exist: T | null, errorMessage: string) {
    if (!exist) throw new NotFoundException(errorMessage);

    return exist;
  }

  static async asyncNotFound<T>(
    promise: Promise<T | null>,
    errorMessage: string,
  ) {
    const exist = await promise;

    if (!exist) throw new NotFoundException(errorMessage);

    return exist;
  }

  static forbidden<T>(isAllowed: boolean, errorMessage: string) {
    if (!isAllowed) throw new ForbiddenException(errorMessage);
  }
}
