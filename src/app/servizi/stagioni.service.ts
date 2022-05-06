import { Injectable } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class StagioniService {

  constructor(private api: ApiService, private cache: CacheService) { }
  
  
}
