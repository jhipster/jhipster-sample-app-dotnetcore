import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams, HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TreeModule } from 'primeng/tree';
import {
  QueryBuilderModule,
  QueryBuilderConfig,
  RuleSet,
  Rule,
  QueryLanguageSpec,
  QueryBuilderComponent,
} from 'ngx-query-builder';
import {
  bqlToRuleset,
  rulesetToBql,
  validateBql,
  validateRuleset,
} from '../bql';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EditRulesetDialogComponent } from './edit-ruleset-dialog.component';

interface NamedQuery {
  id?: number;
  name: string;
  text: string;
  owner?: string;
  domain?: string;
}

@Component({
  selector: 'lib-query-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TreeModule,
    QueryBuilderModule,
  ],
  styleUrls: ['./query-input.component.scss'],
  templateUrl: './query-input.component.html',
})
export class QueryInputComponent implements OnInit {
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);

  @ViewChild('builder') builder?: QueryBuilderComponent;

  @Input() placeholder = 'BQL';
  @Input() query = '';
  @Input() config?: QueryBuilderConfig;
  // Optional JSON-driven language spec
  @Input() spec?: QueryLanguageSpec | string;
  @Input() allowNot = true;
  @Input() allowConvertToRuleset = true;
  @Input() allowRuleUpDown = true;
  @Input() ruleName = 'Rule';
  @Input() rulesetName = 'Ruleset';
  @Input() defaultRuleAttribute: string | null = null;
  @Input() namedQueryDomain: string | null = null;
  @Input() historyDomain: string | null = null;
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: RuleSet = { condition: 'and', rules: [] };
  namedRulesets: Record<string, RuleSet> = {};
  private namedQueryIds: Record<string, number> = {};
  validQuery = true;
  private previousQuery = '';
  private history: string[] = [];
  private historyIndex = -1;

  ngOnInit(): void {
    this.onQueryChange();
    this.loadNamedQueries();
    // Pre-load history so arrow navigation is responsive when editing starts
    this.loadHistory();
  }

  private loadNamedQueries(): void {
    let params = new HttpParams();
    if (this.namedQueryDomain) {
      params = params.set('domain', this.namedQueryDomain);
    }
    this.http
      .get<NamedQuery[]>('/api/NamedQueries', { params })
      .subscribe(queries => {
        queries.forEach(q => {
          try {
            this.namedRulesets[q.name] = bqlToRuleset(q.text, this.queryBuilderConfig);
            if (q.id !== undefined) {
              this.namedQueryIds[q.name] = q.id;
            }
          } catch {
            // Ignore malformed queries
          }
        });
      });
  }

  startEdit() {
    this.previousQuery = this.query;
    this.editing = true;
    this.onQueryChange();
  }

  clearQuery(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.query = '';
    this.onQueryChange();
    this.queryChange.emit(this.query);
  }

  onQueryChange() {
    this.validQuery = validateBql(this.query, this.queryBuilderConfig);
  }

  // Minimal fallback so the builder works before a spec/config is provided
  defaultConfig: QueryBuilderConfig = {
    fields: {
      document: {
        name: 'Document',
        type: 'string',
        operators: ['contains', '!contains', 'like', '!like'],
        defaultOperator: 'contains',
      },
    },
  };

  get queryBuilderConfig(): QueryBuilderConfig {
    // Start from provided config or minimal default
    const base = { ...(this.config || this.defaultConfig) } as QueryBuilderConfig;

    // If a spec is provided, merge fields/entities and hydrate operators from operatorMap
    if (this.spec) {
      let specObj: QueryLanguageSpec | null = null;
      if (typeof this.spec === 'string') {
        try {
          specObj = JSON.parse(this.spec) as QueryLanguageSpec;
        } catch {
          specObj = null;
        }
      } else {
        specObj = this.spec as QueryLanguageSpec;
      }
      if (specObj && specObj.fields) {
        const opMap = specObj.operatorMap || {};
        const hydratedFields: Record<string, any> = {};
        Object.keys(specObj.fields).forEach((k) => {
          const f = { ...(specObj!.fields as any)[k] };
          if ((!f.operators || f.operators.length === 0) && f.type && opMap[f.type]) {
            f.operators = [...opMap[f.type]];
          }
          hydratedFields[k] = f;
        });
        base.fields = hydratedFields as any;
        if (specObj.entities) {
          base.entities = specObj.entities;
        }
      }
    }

    return {
      ...base,
      listNamedRulesets: this.listNamedRulesets.bind(this),
      getNamedRuleset: this.getNamedRuleset.bind(this),
      saveNamedRuleset: this.saveNamedRuleset.bind(this),
      deleteNamedRuleset: this.deleteNamedRuleset.bind(this),
      editNamedRuleset: this.editNamedRuleset.bind(this),
      customCollapsedSummary: this.collapsedSummary.bind(this),
    } as QueryBuilderConfig;
  }

  clickSearch() {
    this.builderQuery = this.parseQuery(this.query);

    // Ensure the query has the required structure
    if (!this.builderQuery.condition) {
      this.builderQuery.condition = 'and';
    }

    this.showBuilder = true;
  }

  builderApplied(q: RuleSet) {
    this.query = this.stringifyQuery(q);
    this.onQueryChange();
    this.queryChange.emit(this.query);
    this.showBuilder = false;
  }

  cancelEdit() {
    this.editing = false;
    this.query = this.previousQuery;
    this.onQueryChange();
  }

  acceptEdit() {
    if (!this.validQuery) {
      return;
    }
    this.editing = false;
    this.previousQuery = this.query;
    this.queryChange.emit(this.query);
    if (this.historyDomain && this.query) {
      if (this.history[0] !== this.query) {
        this.http.post('/api/Histories', { domain: this.historyDomain, text: this.query }).subscribe();
        this.history.unshift(this.query);
      }
      this.historyIndex = -1;
    }
  }

  onEnter(event: any) {
    if (this.validQuery) {
      this.acceptEdit();
    } else {
      event.preventDefault();
    }
  }

  showPrevHistory(event: any) {
    event.preventDefault();
    if (!this.history.length) {
      return;
    }
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.query = this.history[this.historyIndex];
    }
    this.onQueryChange();
  }

  showNextHistory(event: any) {
    event.preventDefault();
    if (!this.history.length) {
      return;
    }
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.query = this.history[this.historyIndex];
    } else {
      this.historyIndex = -1;
      this.query = '';
    }
    this.onQueryChange();
  }

  private loadHistory(): void {
    if (!this.historyDomain) {
      return;
    }
    this.http
      .get<HistoryDto[]>('/api/Histories', { params: new HttpParams().set('domain', this.historyDomain) })
      .subscribe(res => {
        this.history = res.map(h => h.text);
        this.historyIndex = -1;
      });
    }

  parseQuery(text: string): RuleSet {
    const trimmed = text.trim();
    if (!trimmed) {
      const fields = Object.keys(this.queryBuilderConfig.fields);
      const attr = this.defaultRuleAttribute || fields[0];
      let operator: string | undefined;
      if (attr) {
        const fieldCfg = this.queryBuilderConfig.fields[attr];
        if (fieldCfg) {
          if (fieldCfg.defaultOperator !== undefined) {
            operator =
              typeof fieldCfg.defaultOperator === 'function'
                ? fieldCfg.defaultOperator()
                : fieldCfg.defaultOperator;
          } else if (fieldCfg.operators && fieldCfg.operators.length) {
            operator = fieldCfg.operators[0];
          }
        }
      }
      const rule = attr ? ({ field: attr, operator } as Rule) : undefined;
      return { condition: 'and', rules: rule ? [rule] : [] };
    }

    try {
      return bqlToRuleset(trimmed, this.queryBuilderConfig);
    } catch {
      return { condition: 'and', rules: [] };
    }
  }

  stringifyQuery(obj: RuleSet): string {
    try {
      const cleanQuery = this.cleanQuery(obj);
      return rulesetToBql(cleanQuery, this.queryBuilderConfig);
    } catch {
      return '';
    }
  }

  private cleanQuery(query: RuleSet): RuleSet {
    if (!query || typeof query !== 'object') {
      return { condition: 'and', rules: [] };
    }

    const cleaned: RuleSet = {
      condition: query.condition || 'and',
      rules: (query.rules || [])
        .map((item: any) => {
          // Check if this is a nested ruleset
          if (item.condition && item.rules) {
            // Recursively clean nested rulesets
            return this.cleanQuery(item);
          }
          // This is a regular rule - validate it has required fields
          else if (
            item.field &&
            item.operator &&
            item.value !== undefined &&
            item.value !== ''
          ) {
            return item;
          }
          // Invalid rule, exclude it
          return null;
        })
        .filter((item) => item !== null),
    };

    // Include additional properties if they exist
    if (query.not !== undefined) {
      cleaned.not = query.not;
    }
    if (query.name !== undefined) {
      cleaned.name = query.name;
    }
    if (query.collapsed !== undefined) {
      cleaned.collapsed = query.collapsed;
    }
    if (query.isChild !== undefined) {
      cleaned.isChild = query.isChild;
    }

    return cleaned;
  }

  applyQuery() {
    this.builderApplied(this.builderQuery);
  }

  cancelQuery() {
    this.showBuilder = false;
  }

  listNamedRulesets(): string[] {
    return Object.keys(this.namedRulesets);
  }

  getNamedRuleset(name: string): RuleSet {
    return JSON.parse(JSON.stringify(this.namedRulesets[name]));
  }

  saveNamedRuleset(rs: RuleSet) {
    if (rs.name) {
      this.namedRulesets[rs.name] = JSON.parse(JSON.stringify(rs));
      const rsClone = JSON.parse(JSON.stringify(rs));
      delete rsClone.name;
      const bql = rulesetToBql(rsClone, this.queryBuilderConfig);
      const payload: NamedQuery = {
        name: rs.name,
        text: bql,
        domain: this.namedQueryDomain ?? undefined,
      };
      const id = this.namedQueryIds[rs.name];
      if (id) {
        this.http.put(`/api/NamedQueries/${id}`, { ...payload, id }).subscribe();
      } else {
        this.http.post<NamedQuery>('/api/NamedQueries', payload).subscribe(res => {
          if (res.id !== undefined) {
            this.namedQueryIds[rs.name!] = res.id;
          }
        });
      }
    }
  }

  deleteNamedRuleset(name: string) {
    delete this.namedRulesets[name];
    const id = this.namedQueryIds[name];
    if (id !== undefined) {
      this.http.delete(`/api/NamedQueries/${id}`).subscribe();
      delete this.namedQueryIds[name];
    }
  }

  async editNamedRuleset(
    rs: RuleSet,
    ancestors: string[] = [],
  ): Promise<RuleSet | null> {
    const result = await firstValueFrom(
      this.dialog
        .open(EditRulesetDialogComponent, {
          data: {
            ruleset: JSON.parse(JSON.stringify(rs)),
            rulesetName: this.rulesetName,
            validate: (r: any) =>
              !!r &&
              typeof r === 'object' &&
              Array.isArray(r.rules) &&
              r.rules.length > 0 &&
              validateRuleset(r, this.queryBuilderConfig, [
                ...ancestors,
                rs.name ?? '',
              ]),
            config: this.queryBuilderConfig,
          },
          width: '800px',
          panelClass: 'resizable-dialog',
          autoFocus: false,
        })
        .afterClosed(),
    );
    return result || null;
  }

  collapsedSummary(ruleset: RuleSet): string {
    const names = new Set<string>();
    const walk = (rs: RuleSet) => {
      rs.rules.forEach((r) => {
        if ((r as Rule).field) {
          const field = this.queryBuilderConfig.fields[(r as Rule).field];
          names.add(field?.name || (r as Rule).field);
        } else if ((r as RuleSet).rules) {
          walk(r as RuleSet);
        }
      });
    };
    walk(ruleset);
    return Array.from(names).join(', ');
  }
}

interface HistoryDto {
  id?: number;
  domain?: string;
  text: string;
}

interface HistoryDto {
  id?: number;
  domain?: string;
  text: string;
}
