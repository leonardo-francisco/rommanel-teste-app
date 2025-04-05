import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Client } from "../model/client.model";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl: string = 'https://localhost:7086/api';

  constructor(private http: HttpClient) {}

  getClients(): Observable<any>{
    const url = `${this.baseUrl}/Client`;
    return this.http.get<any>(url);
  }

  getById(id: string): Observable<any>{
    const url = `${this.baseUrl}/Client/${id}`;
    return this.http.get<any>(url);
  }


  addClient(client: Client): Observable<Client>{
    const url = `${this.baseUrl}/Client`;
    const body = client;
    return this.http.post<any>(url, body);
  }

  updateClient(id: string, client: Client): Observable<Client>{
    const url = `${this.baseUrl}/Client/${id}`;
    const body = client;
    return this.http.put<any>(url, body);
  }

  removeClient(id: string): Observable<Client>{
    const url = `${this.baseUrl}/Client/${id}`;
    return this.http.delete<any>(url);
  }


}