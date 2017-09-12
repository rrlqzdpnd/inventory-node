import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json');

@Injectable()
export class ProductDialogService {

  headers = HEADERS

  constructor(private _http: HttpClient) { }

  createItem(data) {
    return this._http.post(
      `/api/product/${data.productId}`,
      JSON.stringify(data.row),
      {
        headers: this.headers
      }
    );
  }

}
