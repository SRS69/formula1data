import { Injectable } from '@angular/core';
import { Pilota } from '../classi/pilota';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PilotiService {

  constructor(private apiService: ApiService) { 
  }
}
