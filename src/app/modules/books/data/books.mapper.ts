import { Book, CreateBookPayload, UpdateBookPayload } from '@app/core/models/book.model';
import { BookCreateDTO, BookDTO, BookUpdateDTO } from '@openapi';

export function toBook(dto: BookDTO): Book {
  return {
    id: dto.id,
    title: dto.title,
    price: dto.price ?? 0,
    onSale: dto.onSale ?? false,
    pageCount: dto.pageCount ?? 0,
    lastUpdated: dto.lastUpdated as string,
    lastUpdatedBy: dto.lastUpdatedBy ?? undefined,
  };
}

export function toCreateBookDto(payload: CreateBookPayload): BookCreateDTO {
  return {
    title: payload.title,
    price: payload.price,
    onSale: payload.onSale,
    pageCount: payload.pageCount,
  };
}

export function toUpdateBookDto(payload: UpdateBookPayload): BookUpdateDTO {
  return {
    title: payload.title,
    price: payload.price,
    onSale: payload.onSale,
    pageCount: payload.pageCount,
    lastUpdated: payload.lastUpdated as unknown as number, //todo fix on open api level
  };
}
