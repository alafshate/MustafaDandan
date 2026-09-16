import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { PortfolioData } from '../models/portfolio.models';
import bundledContent from '../../../data/portfolio.json';
import contentSchema from '../../../server/portfolio.schema.json';

interface ContentSchema {
  type?: string;
  anyOf?: ContentSchema[];
  enum?: unknown[];
  properties?: Record<string, ContentSchema>;
  required?: string[];
  items?: ContentSchema;
  maxItems?: number;
  maxLength?: number;
}

// Check the model-generated schema without shipping the backend's validator
// library. These are the schema constructs emitted by generate-schema.mjs.
function matchesSchema(value: unknown, schema: ContentSchema): boolean {
  if (schema.anyOf) return schema.anyOf.some(option => matchesSchema(value, option));
  if (schema.enum && !schema.enum.includes(value)) return false;
  switch (schema.type) {
    case 'null': return value === null;
    case 'string': return typeof value === 'string' && value.length <= (schema.maxLength ?? Infinity);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value) && value.length <= (schema.maxItems ?? Infinity) &&
      !!schema.items && value.every(item => matchesSchema(item, schema.items!));
    case 'object': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const record = value as Record<string, unknown>;
      const properties = schema.properties ?? {};
      return (schema.required ?? []).every(key => Object.hasOwn(record, key)) &&
        Object.keys(record).every(key => Object.hasOwn(properties, key) && matchesSchema(record[key], properties[key]));
    }
    default: return false;
  }
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly document = inject(DOCUMENT);
  private validate(content: unknown): content is PortfolioData { return matchesSchema(content, contentSchema); }
  data!: PortfolioData;
  async load(): Promise<boolean> {
    // Same relative static URL on GitHub Pages and self-hosted installations.
    // The optional admin server may serve saved content at this URL, but is never
    // required: Angular copies the canonical JSON here for every static build.
    const url = new URL('data/portfolio.json', this.document.baseURI);
    try {
      const response = await fetch(url, { cache: 'no-cache', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} loading ${url}`);
      const content: unknown = await response.json();
      if (!this.validate(content)) throw new Error(`Content at ${url} does not match the portfolio model.`);
      this.data = content;
    } catch (error) {
      // Preserve diagnostics while keeping a failed saved file/network request
      // from taking the portfolio offline. No authentication or API request here.
      console.warn('Portfolio data request failed; using bundled content.', error);
      const fallback: unknown = structuredClone(bundledContent);
      if (!this.validate(fallback)) throw new Error('Bundled portfolio content is invalid.');
      this.data = fallback;
    }
    return true;
  }
}
