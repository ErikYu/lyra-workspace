import { Injectable } from '@angular/core';
import { ScrollingService } from './scrolling.service';

@Injectable()
export class RenderService {
  constructor(private scrolling: ScrollingService) {}
}
