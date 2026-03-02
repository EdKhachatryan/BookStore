import { BookCreateDTO, BookUpdateDTO } from '@openapi';

export interface Book {
  id: string;
  title: string;
  price: number;
  onSale: boolean;
  pageCount: number;
  lastUpdated: string;
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
  lastUpdated: string;
}

export interface CreateBookRequestParams {
  bookCreateDTO: BookCreateDTO;
}

export interface UpdateBookRequestParams {
  bookId: string;
  bookUpdateDTO: BookUpdateDTO;
}
