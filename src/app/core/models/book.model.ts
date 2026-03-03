import { BookCreateDTO, BookUpdateDTO } from '@openapi';

export interface Book {
  id: string;
  title: string;
  price: number;
  onSale: boolean;
  pageCount: number;
  lastUpdated?: number;
  lastUpdatedBy?: string;
}

export interface CreateBookPayload {
  title: string;
  price: number;
  onSale: boolean;
  pageCount: number;
}

export interface UpdateBookPayload {
  title: string;
  price: number;
  onSale: boolean;
  pageCount: number;
  lastUpdated: number;
}

export interface CreateBookRequestParams {
  bookCreateDTO: BookCreateDTO;
}

export interface UpdateBookRequestParams {
  bookId: string;
  bookUpdateDTO: BookUpdateDTO;
}
