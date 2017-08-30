import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json')

@Injectable()
export class AppService {
  headers = HEADERS

  constructor(private http: HttpClient) { }

  getSidebar() {
    return this.http.get(
      '/api/products',
      {
        headers: this.headers
      }
    );
  }

}
