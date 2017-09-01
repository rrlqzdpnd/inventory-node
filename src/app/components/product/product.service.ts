import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json');

@Injectable()
export class ProductService {

  headers = HEADERS

  constructor(private _http: HttpClient) {}

  getProduct(id: number) {
    return this._http.get(
      `/api/product/${id}`,
      {
        headers: this.headers
      }
    );
  }

}
