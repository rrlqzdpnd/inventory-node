import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const HEADERS = new HttpHeaders().set('Content-Type', 'application/json')

@Injectable()
export class NewTypeService {
  headers = HEADERS

  constructor(private http: HttpClient) { }

  sendNewType(name) {
    var params = {
      'name': name
    }

    this.http.post(
      '/api/newType',
      JSON.stringify(params),
      // {
      //   headers: this.headers
      // }
    )
    .subscribe()
  }
}
