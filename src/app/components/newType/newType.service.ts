import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json');

@Injectable()
export class NewTypeService {

  headers = HEADERS

  constructor(private _http: HttpClient) { }

  sendNewType(data) {
    return this._http.post(
      '/api/newType',
      JSON.stringify(data),
      {
        headers: this.headers
      }
    );
  }

}
