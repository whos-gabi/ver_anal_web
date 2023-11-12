import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private API_BASEURL = 'http://localhost:3000/api/';
  constructor(private http: HttpClient) { }

  fetchAudit(data:any): Observable<HttpResponse<any>> {
    return this.http.post(this.API_BASEURL + "analyse", data, {
      observe: "response",
    });
  }
}
