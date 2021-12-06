interface IQueryRule {
    field: string,
    operator: string,
    value: string
}

interface IQuery {
    condition: string,
    rules: IQueryRule[],
    not: boolean
}

interface IParse {
    matches: boolean,
    string: string,
    i: number
}

export class BirthdayQueryParserService {
    parse(query: string): string{
        if (query.trim() === ""){
            return '{"condition":"or","not":false,"rules":[]}';
        }
        query = query.replace(/\\\\/g,'\x01').replace(/\\"/g, '\x02').replace(/`/g,'\x03');
        const tokens = query.replace(/\s*([()]|(sign|dob|lname|fname|isAlive|document)|(=|!=|CONTAINS|LIKE|>=|<=|>|<)|"[^"]+"|(AND|OR|!)|[\w\d-*]+)\s*/g, '`$1').split('`');
        const i = 1;
        let ret = this.parseRuleset(tokens, i);
        if (!ret.matches){
          ret = this.parseRule(tokens, i);
        }
        if (!ret.string.startsWith('{"condition')){
          ret.string = '{"condition":"or","rules":[' + ret.string + '],"not":false}';
        }
        if (!ret.matches || ret.i < tokens.length){
          return '{"Invalid":true, "position": ' + ret.i + '}'
        }
        return ret.string;
      }
    
      parseRule(tokens: string[], i: number):IParse{
        const parse: IParse = {
          matches: false,
          string: "",
          i
        }

        if (!/^(sign|dob|lname|fname|isAlive|document)$/.test(tokens[parse.i])){
            if (/^[\w\d-*]+$/.test(tokens[i]) || /^"[^"]+"$/.test(tokens[i])){
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
            if (!/^[\w\d-*]+$/.test(tokens[i + 2]) && !/^"[^"]+"$/.test(tokens[i + 2])){
              return parse;
            }
            break;
    
          default:
            return parse;
        }
        parse.i++;
        let value = "";
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
    
      parseRuleset(tokens: string[], i: number):IParse{
        let ret = this.parseAndOrRuleset(tokens, i);
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
    
      parseAndOrRuleset(tokens: string[], i: number):IParse{
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
        if (!/^(AND|OR)$/.test(tokens[ret.i])){
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
        parse.string = '{"condition":"' + condition.toLowerCase() + '","rules":[' + rules.join(',') + '],"not":false}'
        return parse;
      }
    
      parseNotRuleset(tokens: string[], i: number):IParse{
        const parse: IParse = {
          matches: false,
          string: "",
          i
        }
        if (tokens[i++] !== "NOT"){
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
          ret.string.replace('"not":false', '"not":true')
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
        if (tokens[i++] !== "("){
          return parse;
        }
        parse.i++;
        let ret = this.parseRuleset(tokens, i);
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
}