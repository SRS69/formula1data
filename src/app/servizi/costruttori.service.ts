import { Injectable } from '@angular/core';
import { Costruttore } from '../classi/costruttore';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CostruttoriService {

  constructor(private apiService: ApiService) { }
}
