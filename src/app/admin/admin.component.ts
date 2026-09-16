import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioData } from '../models/portfolio.models';
import { AdminService } from './admin.service';
import { EditorFieldComponent, FieldSchema } from './editor-field.component';

@Component({
  standalone: true, imports: [FormsModule, EditorFieldComponent],
  template: `
    <main class="admin">
      <header><h1>{{ loginPage ? 'Admin login' : 'Portfolio content' }}</h1><a href="/" target="_blank" rel="noopener">View portfolio</a></header>
      @if (loginPage) {
        <form (ngSubmit)="login()"><label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="256" [(ngModel)]="password" /></label>
          <button type="submit" [disabled]="busy || !password">{{ busy ? 'Logging in…' : 'Log in' }}</button>
        </form>
      } @else {
        <div class="actions"><button type="button" (click)="save()" [disabled]="busy || !data || !dirty">{{ busy ? 'Please wait…' : 'Save Changes' }}</button>
          <button type="button" (click)="logout()" [disabled]="busy">Logout</button></div>
        @if (dirty) { <p>You have unsaved changes.</p> }
      }
      <p role="status" aria-live="polite">{{ message }}</p>
      @if (error) { <p role="alert">{{ error }}</p> }
      @if (!loginPage && data && schema) {
        <fieldset class="editor" [disabled]="busy">
          @for (key of keys; track key) {
            <details><summary>{{ title(key) }}</summary>
              <app-editor-field [label]="title(key)" [schema]="schema.properties![key]" [value]="field(key)" (valueChange)="update(key, $event)" />
            </details>
          }
        </fieldset>
      }
    </main>
  `,
  styles: `
    .admin { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem 5rem; }
    header, .actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .actions { justify-content: flex-start; position: sticky; top: 0; padding: 1rem 0; background: var(--bg-surface); z-index: 2; }
    button, input { font: inherit; padding: .7rem 1rem; border: 1px solid #888; border-radius: 4px; }
    button { cursor: pointer; } button:disabled { opacity: .55; cursor: default; }
    label { display: grid; gap: .5rem; max-width: 400px; margin-bottom: 1rem; }
    input { background: var(--bg-surface); color: var(--text-primary); }
    details { border: 1px solid #888; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    summary { cursor: pointer; font-size: 1.2rem; font-weight: 600; }
    [role=alert] { border-left: 4px solid #c44; padding: 1rem; overflow-wrap: anywhere; }
    .editor { border: 0; padding: 0; min-width: 0; }
  `,
})
export class AdminComponent implements OnInit {
  private readonly api = inject(AdminService);
  private readonly router = inject(Router);
  readonly loginPage = this.router.url.startsWith('/admin/login');
  password = '';
  data?: PortfolioData;
  schema?: FieldSchema;
  version = '';
  busy = false;
  dirty = false;
  message = '';
  error = '';
  get keys(): string[] { return Object.keys(this.schema?.properties ?? {}); }
  title(key: string): string { return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()); }
  field(key: string): unknown { return this.data![key as keyof PortfolioData]; }
  update(key: string, value: unknown): void { Object.assign(this.data!, { [key]: value }); this.dirty = true; this.message = ''; }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent): void { if (this.dirty) { event.preventDefault(); event.returnValue = ''; } }
  async ngOnInit(): Promise<void> {
    if (this.loginPage) return;
    await this.run(async () => {
      const result = await this.api.request<{ data: PortfolioData; version: string; schema: FieldSchema }>('content');
      this.data = result.data; this.version = result.version; this.schema = result.schema;
    });
  }
  async login(): Promise<void> {
    await this.run(async () => { await this.api.login(this.password); this.password = ''; await this.router.navigateByUrl('/admin'); });
  }
  async save(): Promise<void> {
    await this.run(async () => {
      const result = await this.api.request<{ version: string }>('content', 'PUT', { data: this.data, version: this.version });
      this.version = result.version; this.dirty = false; this.message = 'Changes saved. Refresh the public portfolio to see them.';
    });
  }
  async logout(): Promise<void> {
    if (this.dirty && !window.confirm('Discard unsaved changes and log out?')) return;
    await this.run(async () => { await this.api.logout(); this.dirty = false; await this.router.navigateByUrl('/admin/login'); });
  }
  private async run(action: () => Promise<void>): Promise<void> {
    this.busy = true; this.error = ''; this.message = '';
    try { await action(); } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to complete request.'; }
    finally { this.busy = false; }
  }
}
