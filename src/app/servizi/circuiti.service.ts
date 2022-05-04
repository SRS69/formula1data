import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CircuitiService {

  constructor(private apiService: ApiService) { }
}
