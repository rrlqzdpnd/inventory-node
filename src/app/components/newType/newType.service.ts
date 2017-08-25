import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json')

@Injectable()
export class NewTypeService {
  headers = HEADERS

  constructor(private http: HttpClient) { }

  sendNewType(data) {
    return this.http.post(
      '/api/newType',
      JSON.stringify(data),
      {
        headers: this.headers
      }
    );
  }
  
}
