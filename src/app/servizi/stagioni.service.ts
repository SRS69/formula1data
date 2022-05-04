import { Injectable } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StagioniService {

  constructor(private apiService: ApiService) { }
    
}
