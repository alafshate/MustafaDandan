import { Injectable } from '@angular/core';
import { PortfolioData } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  data!: PortfolioData;
  async load(): Promise<boolean> {
    const response = await fetch('/api/portfolio', { cache: 'no-store' });
    if (!response.ok) throw new Error('Portfolio content is unavailable.');
    this.data = await response.json() as PortfolioData;
    return true;
  }
}
