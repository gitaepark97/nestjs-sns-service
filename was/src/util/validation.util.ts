import { ConflictException, NotFoundException } from "@nestjs/common";

export abstract class Validation {
  static async conflict<T>(
    exist: T | null | Promise<T | null>,
    errorMessage: string,
  ) {
    if (exist instanceof Promise) exist = await exist;

    if (exist) throw new ConflictException(errorMessage);
  }

  static async notFound<T>(
    exist: T | null | Promise<T | null>,
    errorMessage: string,
  ) {
    if (exist instanceof Promise) exist = await exist;

    if (!exist) throw new NotFoundException(errorMessage);
    return exist;
  }
}
