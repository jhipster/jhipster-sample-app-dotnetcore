export interface IQueryRule {
    field: string,
    operator: string,
    value: string
}

export interface IQuery {
    condition: string,
    rules: IQueryRule[],
    not: boolean,
    name?: string,
    Invalid?: boolean,
    position?: number
}

interface IParse {
    matches: boolean,
    string: string,
    i: number
}

export class BirthdayQueryParserService {
  queryNames: string[] = [];
  rulesetMap: Map<string, IQuery | IQueryRule> | null = null;
  parse(query: string): IQuery {
    if (query.trim() === ""){
        return {"condition":"or","not":false,"rules":[]};
    }
    this.queryNames = [...(this.rulesetMap as Map<string, IQuery>).keys()].sort((a, b) => a > b ? -1 : 1);;
    const queryNameRegexString = this.queryNames.length > 0 ? "|(" + this.queryNames.join("|") + ")": "";
    query = query.replace(/\\\\/g,'\x01').replace(/\\"/g, '\x02').replace(/`/g,'\x03');
    // const tokens = query.replace(/\s*([()]|"" (sign|dob|lname|fname|isAlive|document)|(=|!=|CONTAINS|LIKE|>=|<=|>|<)|(&|\||!)|[A-Z_]+|[\w\d".*-]+)\s*/g, '`$1').split('`');
    const regexString = "\\s*([()]" + queryNameRegexString + "|(sign|dob|lname|fname|isAlive|document)|(=|!=|CONTAINS|LIKE|>=|<=|>|<)|(&|\\||!)|[\\w\\d\".*-]+)\\s*";
    const regex = new RegExp(regexString, "g");
    const tokens = query.replace(regex, '`$1').split('`');
    // join adjacent words
    let looping = tokens.length > 2;
    while (looping){
      for (let iTokens = 1; iTokens < (tokens.length - 1); iTokens++){
        looping = false;
        if (!/^(&|\||CONTAINS|LIKE|AN|CO|CON|CONT|CONTA|CONTAI|CONTAIN|LI|LIK)$/.test(tokens[iTokens]) 
          && /^[\w\d".*-]+/.test(tokens[iTokens])
          && !/^(&|\||CONTAINS|LIKE|AN|CO|CON|CONT|CONTA|CONTAI|CONTAIN|LI|LIK)$/.test(tokens[iTokens + 1]) 
          && /^[\w\d".*-]+/.test(tokens[iTokens + 1])){
            tokens[iTokens] += (" " + tokens[iTokens + 1]);
            tokens.splice(iTokens + 1, 1);
            looping = tokens.length > 2;
            break;
          }

      }
    }
    const i = 1;
    let ret = this.parseRuleset(tokens, i, false);
    if (!ret.matches){
      ret = this.parseRule(tokens, i);
    }
    if (!ret.string.startsWith('{"condition')){
      ret.string = '{"condition":"or","rules":[' + ret.string + '],"not":false}';
    }
    if (!ret.matches || ret.i < tokens.length){
      return { Invalid :true, position: ret.i, condition: "", rules:[], not: false}
    }
    return this.normalize(JSON.parse(ret.string), this.rulesetMap as Map<string, IQuery>);
  }

  normalize(query: IQuery, rulesetMap: Map<string, IQuery>): IQuery{
    if (query.name && this.rulesetMap && rulesetMap.has(query.name)){
      return rulesetMap?.get(query.name) as IQuery;
    }
    for (let i = 0; i < query.rules.length; i++){
      const testQuery = query.rules[i] as any as IQuery;
      if (testQuery.rules){
        (query.rules[i] as any) = this.normalize(testQuery, rulesetMap);
      }
    }
    return query;
  }

  parseRule(tokens: string[], i: number):IParse{
    const parse: IParse = {
      matches: false,
      string: "",
      i
    }
    if (i >= tokens.length){
      return parse;
    }
    if (!/^(sign|dob|lname|fname|isAlive|document)$/.test(tokens[parse.i])){
        if ((/^[\w\d.* -]+$/.test(tokens[i]) && /[a-z0-9]/.test(tokens[i])) || /^"[^"]+"$/.test(tokens[i])){
            const documentValue = '"' + (tokens[i].replace(/\x03/g,'`').replace(/\x02/g,'"').replace(/\x01/g,"\\\\").replace(/"/g,"\\\"")) + '"';
            parse.matches = true;
            parse.string = '{"field":"document", "operator":"contains","value":' + documentValue + '}';
            parse.i++;
            return parse;
        }            
        parse.string = '[invalid field name]';
        return parse;
    }
    if ((i + 2) > tokens.length){
        return parse;
    }        
    parse.i++;
    parse.string = '[invalid operator]'
    switch (tokens[i]){
      case 'isAlive':
      case 'sign':
        if (tokens[i + 1] !== '='){
          return parse;
        }
        break;
      
      case 'dob':
        if (!/^(=|!=|>=|<=|>|<)$/.test(tokens[i + 1])){
          return parse;
        }
        break;
      
      case 'lname':
      case 'fname':
        if (!/^(=|!=|CONTAINS|LIKE)$/.test(tokens[i + 1])){
          return parse;
        }
        break;

      case 'document':
        if (tokens[i + 1] !== 'CONTAINS'){
          return parse;
        }
        break;
      
      default:
        return parse;
        break;
    }
    parse.i++;
    parse.string = '[invalid value]';
    switch (tokens[i]){
      case 'isAlive':
        if (!/^(true|false)$/.test(tokens[i + 2])){
          return parse;
        }
        break;

      case 'sign':
        if (!/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/.test(tokens[i + 2])){
          return parse;
        }
        break;
      
      case 'dob':
        if (!/^\d{4,4}-\d{2,2}-\d{2,2}$/.test(tokens[i + 2])){
          return parse;
        }
        break;
      
      case 'lname':
      case 'fname':
      case 'document':
        if (!/^[\w\d.* -]+$/.test(tokens[i + 2]) && !/^"[^"]+"$/.test(tokens[i + 2])){
          return parse;
        }
        break;

      default:
        return parse;
    }
    parse.i++;
    let value = "";
    if (tokens[i + 2] === undefined){
      return parse; // no value
    }
    if (tokens[i] === "isAlive"){
      value = tokens[i + 2];
    } else {
/* eslint "no-control-regex": 0 */ 
      value = '"' + (tokens[i + 2].replace(/\x03/g,'`').replace(/\x02/g,'"').replace(/\x01/g,"\\\\").replace(/"/g,"\\\"")) + '"';
    }
    parse.matches = true;
    parse.string = '{"field":"' + tokens[i] + '","operator":"' + tokens[i + 1].toLowerCase() + '","value":' + value + '}';
    return parse;
  }

  parseRuleset(tokens: string[], i: number, not: boolean):IParse{
    let ret = this.parseAndOrRuleset(tokens, i, not);
    if (!ret.matches){
      if (ret.string !== ""){
        return ret;
      }
      ret = this.parseNotRuleset(tokens, i);
    }
    if (!ret.matches){
      ret = this.parseParened(tokens, i);
    }
    return ret;
  }

  parseAndOrRuleset(tokens: string[], i: number, not: boolean):IParse{
    const rules : string[] = [];
    const parse: IParse = {
      matches: false,
      string: "",
      i
    }
    let ret = this.parseParened(tokens, i);
    if (!ret.matches){
      if (ret.string !== ""){
        return ret;
      }
      ret = this.parseRule(tokens, i);
      if (!ret.matches){
        if (ret.string !== ""){
          return ret;
        }
        return parse;
      }
    }
    if (!/^(&|\|)$/.test(tokens[ret.i])){
      if (not && tokens[ret.i] === ")"){ // strange condition caused by !(named_query)
        return {
          matches: true,
          i: ret.i,
          string: '{"condition":"or","rules":[' + ret.string + '],"not": true}'
        }        
      }
      return parse;
    }
    const condition = tokens[ret.i];
    parse.i = ret.i + 1;
    parse.matches = true;
    rules.push(ret.string);
    let loop = true;
    while (loop){
      ret = this.parseParened(tokens, parse.i);
      if (!ret.matches){
        if (ret.string !== ""){
          return ret;
        }
        ret = this.parseRule(tokens, parse.i);
        if (!ret.matches){
          if (ret.string !== ""){
            return ret;
          }
          loop = false;
        }
      }
      if (ret.matches){
        rules.push(ret.string);
        parse.i = ret.i;
        if (tokens[ret.i] !== condition){
          loop = false;
        } else {
          parse.i++;
        }        
      } else {
        loop = false;
      }
    }
    if (rules.length < 2){
        parse.matches = false;
        return parse;
    }
    parse.string = '{"condition":"' + (condition === "&" ? "and" : "or") + '","rules":[' + rules.join(',') + '],"not":' + (not ? 'true' : 'false') + '}'
    return parse;
  }

  parseNotRuleset(tokens: string[], i: number):IParse{
    const parse: IParse = {
      matches: false,
      string: "",
      i
    }
    if (tokens[i++] !== "!"){
      return parse;
    }
    const ret = this.parseParened(tokens, i);
    if (!ret.matches){
      if (ret.string !== ""){
        return ret;
      }
      parse.string = "[! is not followed by parenthesized expression]";
      return parse;
    } else {
      const obj = JSON.parse(ret.string);
      obj.not = true;
      ret.string = JSON.stringify(obj);
    }
    return ret;
  }

  parseParened(tokens: string[], i: number):IParse{
    const parse: IParse = {
      matches: false,
      string: "",
      i
    }
    let not = false;
    if (tokens[i] === "!"){
      i++;
      not = true;
    }
    if (this.queryNames.includes(tokens[i])){
      if (not){
        // the named query must be nested in a parenthis to add NOT
        return {
          matches: true,
          i: i + 1,
          string: '{"condition":"or","rules":[' + JSON.stringify(this.rulesetMap?.get(tokens[i])) + '],"not": true}'
        }
      }
      return {
        matches: true,
        string: JSON.stringify(this.rulesetMap?.get(tokens[i])) ,
        i: i + 1
      };
    }     
    if (tokens[i++] !== "("){
      return parse;
    }
    parse.i++;
    let ret = this.parseRuleset(tokens, i, not);
    if (!ret.matches && ret.string === ""){
      ret = this.parseRule(tokens, i);
      if (ret.matches){
        ret.string = ret.string = '{"condition":"or","rules":[' + ret.string + '],"not":' + (not ? 'true' : 'false') + '}';
      } else {
        return ret;
      }
    }
    if (tokens[ret.i] !== ')'){
      ret.matches = false;
      ret.string = "[missing right paren]";
    } else {
      ret.i++;
    }
    return ret;
  }

  queryAsString(query : IQuery, recurse?: boolean): string{
    let result = "";
    let multipleConditions = false;
    query.rules.forEach((r)=>{
      if (result.length > 0){
        result += (' ' + (query.condition === "and" ? "&" : "|") + ' ');
        multipleConditions = true;
      }
      if ((r as any).condition !== undefined){
        const ruleQuery: IQuery = r as any as IQuery;
        if (ruleQuery.name){
          result += ruleQuery.name;
          // rulesetMap?.set(ruleQuery.name, ruleQuery);
        } else {
          result += this.queryAsString(r as unknown as IQuery, query.rules.length > 1); // note: is only one rule, treat it as a top level
        }
      } else if (r.field === "document" && r.value !== undefined) { 
        result += (r.value.toString().toLowerCase());
      } else {
        result += r.field;
        result += (' ' +  r.operator.toUpperCase() + ' ');
        if (r.value !== undefined) {
          result += (r.value.toString().toLowerCase());
        }
      }
    });
    if (query.not){
      result = '!(' + result + ')';
    } else if (recurse && multipleConditions){
      result = '(' + result + ')';
    }
    return result;
  }
  simplifyQuery(query: IQuery):void{
    query.rules.forEach(r=>{
      if ((r as any).rules !== undefined){
        // rule is a query
        this.simplifyQuery(r as unknown as IQuery);
      } 
    });
    if (query.rules.length === 1 && 
        (query.rules[0] as any).rules !== undefined && 
        (query.rules[0] as any).rules.length === 1 &&
        (query as any).name !== undefined){
      // remove one level
      query.rules = [(query.rules[0] as any).rules[0]];
    }
  }
}