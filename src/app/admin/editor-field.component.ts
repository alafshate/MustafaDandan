import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FieldSchema {
  type?: string;
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
  enum?: (string | number)[];
  anyOf?: FieldSchema[];
  maxItems?: number;
  maxLength?: number;
}

@Component({
  selector: 'app-editor-field', standalone: true, imports: [FormsModule],
  template: `
    @if (effective.type === 'object') {
      <fieldset><legend>{{ label }}</legend>
        @for (key of keys; track key) {
          <app-editor-field [label]="title(key)" [schema]="effective.properties![key]"
            [value]="value[key]" (valueChange)="setProperty(key, $event)" />
        }
      </fieldset>
    } @else if (effective.type === 'array') {
      <fieldset><legend>{{ label }}</legend>
        @for (item of value; track $index; let i = $index) {
          <div class="item">
            <app-editor-field [label]="label + ' ' + (i + 1)" [schema]="effective.items!"
              [value]="item" (valueChange)="setProperty(i, $event)" />
            <button type="button" (click)="remove(i)" [attr.aria-label]="'Remove ' + label + ' ' + (i + 1)">Remove</button>
          </div>
        }
        <button type="button" (click)="add()" [disabled]="value.length >= (effective.maxItems || 100)">Add {{ label }}</button>
      </fieldset>
    } @else if (effective.type === 'boolean') {
      <label class="check"><input type="checkbox" [ngModel]="value || false" (ngModelChange)="valueChange.emit($event)" />{{ label }}</label>
    } @else if (effective.enum) {
      <label>{{ label }}<select [ngModel]="value" (ngModelChange)="valueChange.emit($event)">
        @for (option of effective.enum; track option) { <option [ngValue]="option">{{ option }}</option> }
      </select></label>
    } @else {
      <label>{{ label }}
        @if (longText) {
          <textarea rows="4" [maxlength]="effective.maxLength || 10000" [ngModel]="value ?? ''" (ngModelChange)="textChange($event)"></textarea>
        } @else {
          <input type="text" [maxlength]="effective.maxLength || 10000" [ngModel]="value ?? ''" (ngModelChange)="textChange($event)" />
        }
      </label>
      @if (nullable) { <small>Leave blank to disable this link.</small> }
    }
  `,
  styleUrl: './editor-field.component.scss',
})
export class EditorFieldComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) schema!: FieldSchema;
  // The server validates editor values against the model-derived schema on save.
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();
  get effective(): FieldSchema { return this.schema.anyOf?.find(s => s.type !== 'null') ?? this.schema; }
  get nullable(): boolean { return !!this.schema.anyOf?.some(s => s.type === 'null'); }
  get keys(): string[] { return Object.keys(this.effective.properties ?? {}); }
  get longText(): boolean { return /intro|summary|description|paragraph|bullet|lead|detail/i.test(this.label); }
  title(key: string): string { return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()); }
  setProperty(key: string | number, value: unknown): void { this.value[key] = value; this.valueChange.emit(this.value); }
  textChange(value: string): void { this.valueChange.emit(this.nullable && !value ? null : value); }
  remove(index: number): void { this.value.splice(index, 1); this.valueChange.emit(this.value); }
  add(): void { this.value.push(this.empty(this.effective.items!)); this.valueChange.emit(this.value); }
  empty(schema: FieldSchema): any {
    if (schema.anyOf) return schema.anyOf.some(s => s.type === 'null') ? null : this.empty(schema.anyOf[0]);
    if (schema.enum) return schema.enum[0];
    if (schema.type === 'array') return [];
    if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties ?? {}).map(([key, child]) => [key, this.empty(child)]));
    return schema.type === 'boolean' ? false : '';
  }
}
