import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private csrf = '';
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(`/api/admin/${path}`, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'PortfolioAdmin', 'X-Admin-CSRF': this.csrf },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed. Please try again.');
    return result as T;
  }
  async authenticated(): Promise<boolean> {
    try { this.csrf = (await this.request<{ csrf: string }>('session')).csrf; return true; }
    catch { this.csrf = ''; return false; }
  }
  async login(password: string): Promise<void> {
    this.csrf = (await this.request<{ csrf: string }>('login', 'POST', { password })).csrf;
  }
  async logout(): Promise<void> {
    await this.request('logout', 'POST', {});
    this.csrf = '';
  }
}
