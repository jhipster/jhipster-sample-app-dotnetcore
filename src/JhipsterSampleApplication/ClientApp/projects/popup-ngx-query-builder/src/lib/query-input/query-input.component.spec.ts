import { QueryInputComponent } from './query-input.component';
import { RuleSet, Rule } from 'ngx-query-builder';

describe('QueryInputComponent', () => {
  it('should set default operator when parsing empty query', () => {
    const component = new QueryInputComponent();
    component.defaultRuleAttribute = 'document';
    const rs: RuleSet = component.parseQuery('');
    const rule = rs.rules[0] as Rule;
    expect(rule.field).toBe('document');
    expect(rule.operator).toBe('contains');
  });

  it('should save named ruleset text instead of name', () => {
    const component = new QueryInputComponent();
    (component as any).config = { fields: {} } as any;
    const postSpy = jasmine
      .createSpy('post')
      .and.returnValue({ subscribe: () => {} } as any);
    (component as any).http = { post: postSpy, put: jasmine.createSpy('put') };
    const rs: RuleSet = {
      condition: 'and',
      rules: [{ field: 'a', operator: '=', value: 1 }],
      name: 'TEST',
    };
    component.saveNamedRuleset(rs);
    const payload = postSpy.calls.mostRecent().args[1];
    expect(payload.text).toBe('a=1');
  });
});
