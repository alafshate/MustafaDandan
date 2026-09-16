import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })
export class ShellComponent {}

@Component({ standalone: true, template: '<main style="padding:3rem"><h1>Content temporarily unavailable</h1><p>Please try loading the portfolio again.</p><a href="/">Retry</a></main>' })
export class UnavailableComponent {}
