using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Antlr4.Runtime;
using Antlr4.Runtime.Misc;
using Antlr4.Runtime.Tree;
using System.Text.RegularExpressions;
using System.Diagnostics;

namespace TextTemplate
{
    public class TextTemplateVisitor : TextTemplateParserBaseVisitor<object>
    {
        TemplateData context;
        Dictionary<string, string> subtemplates = new Dictionary<string, string>();
        List<string> errors = new List<string>();
        string input;
        BulletIndent bulletIndent;
        int recursionLevel = 0;
        string subtemplateLevel = ""; // keeps track of subtemplates within subtemplates
        Dictionary<string, object> annotations = new Dictionary<string, object>();
        private Dictionary<string, TextTemplateParser.CompilationUnitContext> parsedTemplates = new Dictionary<string, TextTemplateParser.CompilationUnitContext>();
        private Dictionary<string, object> options = new Dictionary<string, object>();
        public TextTemplateVisitor()
        {
            annotations.Add("bulletStyles", null);
            annotations.Add("bulletMode", "implicit");
        }
        // The CSharp ANTLR runtime does not allow the AggregateResult to be overridden.  This method emulates VisitChildren and aggregates the results 
        private object VisitChildrenAggregated(ParserRuleContext ctx)
        {
            if (ctx.ChildCount == 0)
            {
                return "";
            }

            List<object> result = new List<object>();
            foreach (object child in ctx.children)
            {
                object childResult;
                if (child is ITerminalNode)
                {
                    childResult = ((ITerminalNode)child).Accept(this);
                }
                else
                {
                    childResult = ((ParserRuleContext)child).Accept(this);
                }
                if (childResult != null)
                {
                    result.Add(childResult);
                }
            }
	    if (result.Count == 1)
	    {
	    	return result[0];
	    }
            return result;
        }
        public override object VisitText([NotNull] TextTemplateParser.TextContext ctx)
        {
            if (ctx.children[0] is TextTemplateParser.ContinuationContext)
            {
                // replace all white space captured as a "continuation" (starts with `) with a single blank 
                return " ";
            }
            return ctx.GetText();
        }
        public override object VisitIdentifier([NotNull] TextTemplateParser.IdentifierContext ctx)
        {
            return VisitIdentifierWithParserRuleContext(ctx);
        }
        private object VisitIdentifierWithParserRuleContext(ParserRuleContext ctx)
        {
            string key = ctx.GetText();
            /* 
					if (this.annotations.valueFunction){
						let valueFunction = this.annotations.valueFunction;
						delete this.annotations.valueFunction;
						let retValue = valueFunction(ctx, this);
						this.annotations.valueFunction = valueFunction;
						return retValue;
					}
             */
            object value = null;
            if (key == "@")
            {
                return new TemplateData(JsonSupport.Serialize(this.annotations), this.context);
            }
            else if (key.StartsWith("@.")) {
                /*
                if (key == '@.Tokens' || key == '@.Tree'){
                    let parentName;
                    let parent = ctx;
                    do {
                        parentName = parent.constructor.name.replace(/Context$/,'');
                        parent = parent.parentCtx;
                    } while (parent != null && parentName != 'TemplateContents');
                    if (parent != null){
                        // the parent of the template contents is a template.  
                        if (key == '@.Tokens'){
                            // Return the contents without the tokens the "@.Tokens"
                            return tokensAsString(parent).replace(' LBRACE({) IDENTIFIER(@) DOT(.) IDENTIFIER(Tokens) RBRACE(})','');
                        }
                        return this.getParseTree(parent);
                    }
                }
                */
                value = this.annotations[key.Substring(2)];
            }
            else if (this.context == null || !(this.context is TemplateData))
            {
                Debug.Write("Attempting to look up \"" + key + "\" without a data context");
            }
            else
            {
                value = this.context.getValue(key);
            }
            if (value == null)
            {
                Debug.Write("Missing value for " + key);
                string missingValue = annotations.ContainsKey("missingValue") && annotations["missingValue"] != null  ? ((string)annotations["missingValue"]).Replace("{key}", key) : null;
                return new TypedData("missing", missingValue: missingValue, key: key);
            }  else if (this.annotations.ContainsKey("dateTest") && ((Regex)annotations["dateTest"]).IsMatch(key)){
                string dateFormat = annotations.ContainsKey("dateFormat") ? ((string)annotations["dateFormat"]) : null;
                DateTime dt;
                if (DateTime.TryParse(value.ToString(), out dt))
                {
                    if (annotations.ContainsKey("dateFormatMode") && ((string)annotations["dateFormatMode"]) == "GMT")
                    {
                        ///dt = MomentSharp.Parse.ToUTC(dt, dt.zone)
                    }
                } else {
                    ///this.syntaxError('Invalid date', ctx);
                }
                value = new TypedData("date", dateString: value.ToString(), format: dateFormat);
            }
            /*if (typeof value == 'string'){
                if (this.annotations.encoding == 'html'){
                    value = this.encodeHTML(value);
                } else if (this.annotations.encoding == 'xml') {
                    value = this.encodeXML(value);
                } else if (this.annotations.encoding == 'uri') {
                    value = encodeURI(value);
                }
            }*/
            return value;
        }
        public override object VisitTemplateToken([NotNull] TextTemplateParser.TemplateTokenContext ctx)
        {
            // there are three children, the left brace, the token, and the right brace 
            object result = ctx.children[1].Accept(this);
            return result;
        }
        public override object VisitTemplateContents([NotNull] TextTemplateParser.TemplateContentsContext ctx)
        {
            return VisitChildrenAggregated(ctx);
        }
        public override object VisitTemplateContextToken([NotNull] TextTemplateParser.TemplateContextTokenContext ctx)
        {
            return ctx.children[1].Accept(this); // ignore the information in the brackets 
        }
        public override object VisitContextToken([NotNull] TextTemplateParser.ContextTokenContext ctx)
        {
            TemplateData oldContext = this.context;
            bool bHasContext = ctx.children[0].GetText() != ":"; // won't change context if format {:[template]} 
            if (bHasContext && ctx.children[0].ChildCount > 0) // ctx.children[0].children protects against invalid spec 
            {
                object context;
                // (Not sure why we were ignoring url errors) 
                List<string> oldErrors = new List<string>();
                // make a shallow copy so we can undo any errors while acquiring a context url 
                this.errors.ForEach(error => {
                    oldErrors.Add(error);
                });
                if (ctx.children[0] is TextTemplateParser.NamedSubtemplateContext)
                {
                    context = ctx.children[0].Accept(this);
                }
                else
                {
                    context = ctx.children[0].GetChild(0).Accept(this);
                    if (this.context != null && (context is TypedData) && ((TypedData)context).type == "argument")
                    {
                        // special case when the existing context is a list.  Recompute without the context
                        this.context = null;
                        context = ctx.children[0].Accept(this);
                    }
                }
                context = this.compose(context, 0);
                if (context is object[] && ((object[])context).Length == 1)
                {
                    context = ((object[])context)[0];
                }
                if (context is string)
                {
                    // wiping out errors acquiring the url string before the url has been resolved 
                    this.errors.ForEach((error) => {
                        ///if (error.message.includes('Error loading subtemplate')){ 
                        /// 	oldErrors.Add(error); // keep loading errors 
                        ///} 
                    });

                    this.errors = oldErrors;
                    try {
                        if (((string)context).ToLower().StartsWith("http") || ((string)context).StartsWith("/")) {
                            if (options != null && options.ContainsKey("urlCallback") && options["urlCallback"] is Func<string, string>)
                            {
                                string data =  ((Func<string, string>)options["urlCallback"])((string)context);
                                this.context = new TemplateData(data, this.context);
                            }
                            /*
                            if (urls[context] && urls[context].data){
                                if (urls[context].error){
                                    this.syntaxError(urls[context].data, ctx);
                                    this.context = new TemplateData('{}', this.context);
                                } else {
                                    this.context = new TemplateData(urls[context].data, this.context);
                                }
                            } else {
                                if (!urls[context]){
                                    urls[context] = {};
                                    this.context = new TemplateData('{}', this.context); // provide an empty context to prevent lookup errors
                                }
                            }
                            */
                        }
                        else if (((string)context).Length > 0 && (((string)context).Substring(0, 1) == "[" || ((string)context).Substring(0, 1) == "{")){
                            this.context = new TemplateData(context, this.context);
                        } else {
                            // the string isn't JSON and is probably an error, so just output it
                            this.context = oldContext;
                            return context;
                        }
                    } catch (Exception e) {
                        this.context = oldContext;
                        string msg = "Error loading context: " + e.Message;
                        Debug.Write(msg);
                        ///this.syntaxError(msg, ctx); 
                        return msg;
                    }
                    if (ctx.children.Count > 1 && ctx.children[0].ChildCount > 0 && ctx.children[0].GetChild(0) is TextTemplateParser.MethodInvokedContext)
                    {
                        // there is a method invocation on a context that was created here.  We need to rerun the method(s) 
                        IList<IParseTree> invocations = ((ParserRuleContext)ctx.GetChild(0).GetChild(0)).children.Skip(1).ToList<IParseTree>();
                        this.context = (TemplateData)this.invokeMethods(null, invocations); // a null valueContext implies this.context 
                    }
                }
                else if (bHasContext && context is TemplateData) { // context may not be specified
                    this.context = (TemplateData)context;
                }
            }
            object result;
            if (bHasContext && ctx.ChildCount < 3) { // note: this used to check || !ctx.children[2].GetText() || ctx.children[2].exception 
                // protect code against illegal bracketted expression while editing
                result = null;
            }
            result = ctx.children[bHasContext ? 2 : 1].Accept(this);
            /*
            if (this.context != null && typeof this.context == 'object' && this.context.type == 'missing'){
                result = this.context; // can't return a value from a missing context although we still need to visit children
            }
            */
            this.context = oldContext;
            return result;
        }
        public override object VisitCompilationUnit([NotNull] TextTemplateParser.CompilationUnitContext ctx)
        {
            //Debug.Write(this.getParseTree(ctx)); // for debugging
            if (ctx.ChildCount == 0)
            {
                return ""; // no data
            }
            return VisitChildrenAggregated(ctx);

        }
        public override object VisitMethod([NotNull] TextTemplateParser.MethodContext ctx)
        {
            string methodName = ctx.GetText();
            return methodName.Substring(1, methodName.Length - 2); // drop parens 
        }
        public override object VisitMethodInvoked([NotNull] TextTemplateParser.MethodInvokedContext ctx)
        {
            ParserRuleContext valueContext = (ParserRuleContext)ctx.children[0]; // first child is the target value context 
            IList<IParseTree> invocations = ctx.children.Skip(1).ToList<IParseTree>(); // subsequent children are cascaded methods 
            object value = this.invokeMethods(valueContext, invocations);
            return value;
        }
        private object invokeMethods(ParserRuleContext valueContext, IList<IParseTree> invocations)
        {
            object value = null; 
            Dictionary<string, object> oldAnnotations = new Dictionary<string, object>(); 
            annotations.Keys.ToList().ForEach((key) => { 
                oldAnnotations[key] = this.annotations[key]; 
            });
            Dictionary<string, string>  oldSubtemplates = new Dictionary<string, string>(); // only needed if this spec contains subtemplates
            // clone the current subtemplates in case methods add new ones that overwrite more global ones
            foreach (var key in this.subtemplates.Keys){
                oldSubtemplates.Add(key, this.subtemplates[key]);
            }
            if (valueContext != null) { // null implies that the value is the current context
                bool bTargetIsTemplate = valueContext.GetText().StartsWith("[") || valueContext.GetText().StartsWith("#"); // value will be obtained from a template 
                                                                                                                           // process annotations first 
                if (bTargetIsTemplate)
                { // TODO: flag annotations on non-templates as errors 
                    foreach (IParseTree child in invocations)
                    {
                        string method = (string)child.GetChild(0).Accept(this);
                        if (method == null)
                        {
                            ///this.syntaxError('Invalid method syntax', child); 
                            return null; // bad syntax; don't proceed 
                        }
                        if (method.StartsWith("@"))
                        {
                            object args = child.GetChild(1);
                            if (false && method == "@Include")
                            {
                                this.callMethod(method, oldAnnotations, args); // let include modify the annotations that will be restored
                            }
                            else
                            {
                                this.callMethod(method, this.annotations, args); // modify the current annotations so that existing annotations are inherited
                          }
                        }

                    }
                }
                if (this.context != null && this.context.type == "list" && !valueContext.GetText().StartsWith("^"))
                {
                    // for non-annotations and under special circumstances, depending on how it was parsed, we'll obtain a single value rather than a list 
                    bool bAggregatedResult = valueContext is TextTemplateParser.InvokedTemplateSpecContext; // only aggregate for this specific context 
                    if (bAggregatedResult)
                    {
                        foreach (IParseTree child in invocations)
                        {
                            string method = (string)child.GetChild(0).Accept(this);
                            if (method != null)
                            {
                                if (method.StartsWith("@"))
                                {
                                    if (!bTargetIsTemplate)
                                    {
                                        ///this.syntaxError('@ methods can only be applied to subtemplates', child); 
                                    }
                                }
                                else
                                {
                                    bAggregatedResult = false;
                                }
                            }
                        }
                    }
                    if (bAggregatedResult)
                    {
                        value = valueContext.Accept(this); // let the children process the list to obtain a single value
                    } else {
                        // create an "argument" list object to pass to the method 
                        List<object> list = new List<object>();
                        this.context.IterateList((TemplateData newContext) => {
                            TemplateData oldContext = this.context;
                            this.context = newContext;
                            list.Add(this.compose(valueContext.Accept(this), 0)); // reduce each result to a string 
                            this.context = oldContext;
                        });
                        value = new TypedData("argument", list: list);
                    }
                } else {
                    // obtain the single result
                    value = valueContext.Accept(this);
                }
            } else {
                value = this.context;
            }
            // process non-annotations by calling each method serially
            foreach (IParseTree child in invocations)
            {
                // Each child is a method and an argument(s) tree 
                string method = child.GetChild(0) == null ? null : (string)child.GetChild(0).Accept(this);
                if (method == null)
                {
                    ///this.syntaxError('Invalid method syntax', child); 
                }
                else
                {
                    if (!method.StartsWith("@"))
                    { // annotations have already been processed 
                        object args = child.GetChild(1); // passing the argument tree to CallMethod 
                        value = this.callMethod(method, this.compose(value, 0), args);
                    }
                }
            }
            if (JsonSupport.Serialize(annotations["bulletStyles"]) != JsonSupport.Serialize(oldAnnotations["bulletStyles"]))
            {
                // the bullet style has changed, so compose the output before the styles get modified back
                // TODO: consider instead adding the current bullet style to all bullets and lists in the output
                value = this.compose(value, 1);
            }
            this.annotations = oldAnnotations;
            this.subtemplates = oldSubtemplates;
            return value;
        }
        public override object VisitQuoteLiteral([NotNull] TextTemplateParser.QuoteLiteralContext ctx)
        {
            string value = ctx.GetText();
            return this.decodeQuote(value.Substring(1, value.Length - 2), ctx);
        }
        public override object VisitApostropheLiteral([NotNull] TextTemplateParser.ApostropheLiteralContext ctx)
        {
            string value = ctx.GetText();
            return decodeApostrophe(value.Substring(1, value.Length - 2));
        }

        public override object VisitRegex([NotNull] TextTemplateParser.RegexContext ctx)
        {
            string value = ctx.GetText();
            string expression = value.Substring(1, value.LastIndexOf("/") - 1);
            string modifier = value.Substring(value.LastIndexOf("/") + 1);
            object ret = value;
            try{
                RegexOptions ro = RegexOptions.ECMAScript;
                modifier.ToCharArray().ToList().ForEach((chr) => {
                    switch (chr)
                    {
                        case 'i':
                            ro |= RegexOptions.IgnoreCase;
                            break;
                        case 's':
                            ro |= RegexOptions.Singleline;
                            break;
                    }
                });
                ret = new TypedData("regex", regex: new Regex(expression, ro) , flags: modifier);
            } catch(Exception e){
                ///this.syntaxError('invalid regular expression', ctx);
            }
            return ret;
        }
        /*
        visitMethodInvocation = function(ctx) {
            let children : any = this.visitChildren(ctx);
            let methodName : string = children[0]
            let methodArgResult: string[] = children[1]
            let methodArgs: string[] = [];
            if (methodArgResult){
                for (let i = 0; i < methodArgResult.length; i += 2){
                    methodArgs.push(methodArgResult[i]);
                }
            }
            return [methodName, methodArgs];
        };
        visitQuotedArgument = function(ctx) {
            let value = ctx.GetText();
            return this.decodeQuote(value.substr(1, value.length - 2),ctx);
        };
        visitApostrophedArgument = function(ctx) {
            let value = ctx.GetText();
            return this.decodeApostrophe(value.substr(1, value.length - 2));
        };
        visitTextedArgument = function(ctx) {
            return ctx.GetText().trim();
        };
        */
        public override object VisitBracedThinArrow([NotNull] TextTemplateParser.BracedThinArrowContext ctx)
        {
            string oldMissingValue = this.annotations.ContainsKey("missingValue") ? (string)this.annotations["missingValue"] : null;
            this.annotations.Remove("missingValue"); // predicates need to see the absense of a value
            object result = ctx.children[0].Accept(this);
            if (oldMissingValue != null)
            {
                this.annotations["missingValue"] = oldMissingValue;
            }
            if (result is bool && ((bool)result) == true && ctx.children[2].ChildCount > 0)
            {
                // protect against invalid syntax
                return this.VisitChildren((RuleContext)ctx.children[2].GetChild(0)); // true
            }
            if (result is string && ((string)result).StartsWith("ERROR:"))
            {
                return result;
            }
            return ""; // false means ignore this token
        }
        public override object VisitBracedArrow([NotNull] TextTemplateParser.BracedArrowContext ctx)
        {
            object oldMissingValue = this.annotations.ContainsKey("missingValue") ? this.annotations["missingValue"] : null; 
            this.annotations.Remove("missingValue"); // predicates need to see the absense of a value 
            bool result = (bool)ctx.children[0].Accept(this);
            this.annotations.Add("missingValue", oldMissingValue); 
            /*
            if (Array.isArray(result))
            {
                result = result[0]; // TODO:why is this one level deep???? 
            }
            */
            if (result)
            {
                return ctx.children[2].GetChild(0).Accept(this); // true 
            }
            if (ctx.children[2].ChildCount < 3)
            {
                return null; // only true condition specified 
            }
            return ctx.children[2].GetChild(2).Accept(this); // false 
        }
        public override object VisitIdentifierCondition([NotNull] TextTemplateParser.IdentifierConditionContext ctx)
        {
            return this.VisitIdentifierWithParserRuleContext(ctx);
        }
        public override object VisitLogicalOperator([NotNull] TextTemplateParser.LogicalOperatorContext ctx)
        {
            object ret;
            string logicalOperator = (string)ctx.children[1].GetText();
            bool leftCondition = (bool)ctx.children[0].Accept(this);
            if (!leftCondition && logicalOperator == "&"){
                ret = false;
            } else if (leftCondition && logicalOperator == "|") {
                ret = true;
            } else {
                ret = ctx.children[2].Accept(this);
            }
            return ret;
        }
        /*
        visitIdentifierOperand = function(ctx){
            return this.visitIdentifier(ctx);
        }
        visitQuoteOperand = function(ctx){
            return this.visitQuotedArgument(ctx);
        }
        visitApostropheOperand = function(ctx){
            return this.visitApostrophedArgument(ctx);
        }
        */
        public override object VisitDigits([NotNull] TextTemplateParser.DigitsContext ctx) {
            return int.Parse(ctx.GetText());
        }
        /*
        visitRelationalOperand = function(ctx){
            return ctx.children[0].accept(this);
        }
        */
        public override object VisitRelationalOperation([NotNull] TextTemplateParser.RelationalOperationContext ctx)
        {
            object leftValue = ctx.children[0].Accept(this);
            object rightValue = ctx.children[2].Accept(this);
            string op = ctx.children[1].GetText();
            // null == null and  null != !null
            if (leftValue == null || this.valueIsMissing(leftValue)){
                if (rightValue == null || this.valueIsMissing(rightValue) || op == "!="){
                    return true;
                }
                return false;
            }
            // !null != null and !null == null
            if (rightValue == null || this.valueIsMissing(rightValue)){
                if (op == "!="){
                    return true;
                }
                return false;
            }
            bool bIsNumeric = false;
            int parsedLeft = 0;
            int parsedRight = 0;
            if (int.TryParse(leftValue.ToString(), out parsedLeft) && int.TryParse(rightValue.ToString(), out parsedRight))
            {
                bIsNumeric = true;
            }
            bool result = false;
            switch (op){
                case "=":
                case "==":
                    result = bIsNumeric ? (parsedLeft == parsedRight) : (leftValue.ToString() == rightValue.ToString());
                    break;
                case ">":
                    result = bIsNumeric ? (parsedLeft > parsedRight) : (leftValue.ToString().CompareTo(rightValue.ToString()) > 0);
                    break;
                case "<":
                    result = bIsNumeric ? (parsedLeft > parsedRight) : (leftValue.ToString().CompareTo(rightValue.ToString()) < 0);
                    break;
                case ">=":
                    result = bIsNumeric ? (parsedLeft > parsedRight) : (leftValue.ToString().CompareTo(rightValue.ToString()) >= 0);
                    break;
                case "<=":
                    result = bIsNumeric ? (parsedLeft > parsedRight) : (leftValue.ToString().CompareTo(rightValue.ToString()) <= 0);
                    break;
                case "!=":
                    result = bIsNumeric ? (parsedLeft > parsedRight) : (!leftValue.Equals(rightValue.ToString()));
                    break;
            }
            return result;
        }
        public override object VisitBracketedTemplateSpec([NotNull] TextTemplateParser.BracketedTemplateSpecContext ctx)
        {
            List<object> oldSubtemplates = new List<object>(); // only needed if this spec contains subtemplates 
            int lastChildIndex = ctx.ChildCount - 2;
            bool bHasSubtemplates = ctx.children[lastChildIndex] is TextTemplateParser.TemplateContentsContext && ctx.children[lastChildIndex].ChildCount > 0 && ctx.children[lastChildIndex].GetChild(0) is TextTemplateParser.SubtemplateSectionContext;
            if (bHasSubtemplates)
            {
                ///
		// clone the current subtemplates because the ones found here are scoped 
                /*
                for (let key in this.subtemplates){
                    oldSubtemplates[key] = this.subtemplates[key];
                }
                ctx.children[lastChildIndex].accept(this); // visit to load subtemplates
                lastChildIndex--; // no need to visit it again
                */
            }
            List<object> result = new List<object>();
            // skipping the first and last children (and the subtemplates) because the are the surrounding brackets 
            for (int i = 1; i <= lastChildIndex; i++) {
                if (!(ctx.children[i] is TerminalNodeImpl))
                { // skip over unparsed (probably comments) 
                    object childResult = ctx.children[i].Accept(this);
                    if (lastChildIndex != 1 && childResult is TemplateData)
                    {
                        ///this.syntaxError('Data needs to be interpolated with a subtemplate', ctx.children[i]); 
                        childResult = ((TemplateData)childResult).toJson();
                    }
                    result.Add(childResult);
                }
            }
            /*
            if (bHasSubtemplates){
                this.subtemplates = oldSubtemplates; // subtemplates are scoped, so remove the ones we found
            }
            */
            if (result is List<object> && ((List<object>)result).Count == 1) {
                return ((List<object>)result)[0];
            }
            return result;
        }
        public override object VisitMethodableTemplateSpec([NotNull] TextTemplateParser.MethodableTemplateSpecContext ctx)
        {
            if (this.context != null && this.context.type == "list")
            {
                TypedData listObject = new TypedData("list", list: new List<object>()/*,defaultIndent: this.annotations.defaultIndent*/);
                this.context.IterateList((TemplateData newContext) => {
                    TemplateData oldContext = context;
                    context = newContext;
                    listObject.list.Add(ctx.children[0].Accept(this));
                    context = oldContext;
                });
                List<object> refinedList = new List<object>();
                ((TypedData)listObject).list.ForEach((item)=>{
                    if (this.compose(item, 0) != null){
                        refinedList.Add(item);
                    }
                });
                if (refinedList.Count == 0){
                    string missingValue = annotations.ContainsKey("missingValue") ? (string)annotations["missingValue"] : null;
                    refinedList.Add(new TypedData("missing", missingValue: missingValue, key: "list"));
                }
                listObject.list = refinedList;
                if (listObject.list.Count == 1){
                    return listObject.list[0]; // no longer a list
                }
                return listObject;
            }
            return ctx.children[0].Accept(this);
        }
        public override object VisitNamedSubtemplate([NotNull] TextTemplateParser.NamedSubtemplateContext ctx)
        {
            return VisitNamedSubtemplateExt(ctx);
        }
        private object VisitNamedSubtemplateExt(RuleContext ctx, string name = null, bool bInclude = false) {
            string subtemplateName = name != null ? name : ctx.GetText();
            if (!this.subtemplates.ContainsKey(subtemplateName) && options != null && options.ContainsKey("urlCallback") && options["urlCallback"] is Func<string, string>) 
    	    {
                // load the subtemplate from the server
                string subtemplateUrl = "/subtemplate/" + subtemplateName.Substring(1); // remove the #
		    ///
                    /*if (!urls[subtemplateUrl]){
                        urls[subtemplateUrl] = {};
                    }
                    if (!urls[subtemplateUrl].data){
                        return 'loading subtemplate "' + subtemplateName + '"';
                    }
                    // process the loaded subtemplate
                    let data = urls[subtemplateUrl].data;
                    let bError = typeof data == 'object';
                    if (bError || data.substr(0 ,1) != '['){
                        let msg = 'Error loading subtemplate "' + subtemplateName + '": ' + (bError ? data.error : data);
                        Debug.Write(msg);
                        this.syntaxError(msg, ctx);
                        this.subtemplates[subtemplateName] = '[' + msg + ']';
                        return '';
                    }*/
	            // process info between brackets adding an extra nl so "included" subtemplates can start with "Subtemplates:"
		        Dictionary<string, Subtemplate> subtemplates;
		        string data = ((Func<string, string>)options["urlCallback"])(subtemplateUrl);
		        processSubtemplates((bInclude ? "\n" : "") + data.Substring(1, data.LastIndexOf(']') - 1), 0, out input, out subtemplates);
		        // replace the brackets around the extracted input when storing the subtemplate and add any methods on the template
	    	    this.subtemplates[subtemplateName] = "[" + input + "]" + data.Substring(data.LastIndexOf("]") + 1); 
	    	    // parse and cache local subtemplates
	    	    subtemplates.Keys.ToList().ForEach((key)=>{
                        Subtemplate subtemplate = subtemplates[key];
                        this.parseSubtemplates(subtemplates[key], key, subtemplate.line - 1, subtemplate.column);
	    	    });
            }
            string parserInput = "{:" + this.subtemplates[subtemplateName] + "}";
            string oldSubtemplateLevel = this.subtemplateLevel;
            this.subtemplateLevel += ((this.subtemplateLevel != "" ? "." : "") + subtemplateName);
            TextTemplateParser.CompilationUnitContext tree = null;
            if (parsedTemplates.ContainsKey(parserInput))
            {
                tree = parsedTemplates[parserInput];
            }
            else
            {
                // cache the parsed tree and tokens 
                tree = parseTemplate(parserInput);
                parsedTemplates[parserInput] = tree;
                ///parsedTokens[parserInput] = tokensAsString(tree); 
            }
            if (this.recursionLevel > 20)
            {
                Debug.Write("ERROR: too many levels of recursion when invoking " + subtemplateName);
                return "ERROR: too many levels of recursion when invoking " + subtemplateName;
            }
            ++this.recursionLevel;
            string oldInput = this.input;
            /*
            let oldSubtemplates = {};
            let localSubtemplateNames = [];
            for (let key in this.subtemplates){
                if (key.startsWith(subtemplateName + '.')){
                    localSubtemplateNames.push(key);
                }
                oldSubtemplates[key] = this.subtemplates[key];
            }
            // add local subtemplates
            localSubtemplateNames.forEach((localSubtemplateName)=>{
                // this will overwrite any global or higher level local subtemplate
                this.subtemplates[localSubtemplateName.substring(subtemplateName.length + 1)] = this.subtemplates[localSubtemplateName]; 
            });
            */
            this.input = parserInput;
            object result = this.VisitCompilationUnit(tree);
            --this.recursionLevel;
            // restore (pop) old states 
            ///this.subtemplates = oldSubtemplates; 
            this.input = oldInput;
            this.subtemplateLevel = oldSubtemplateLevel;
            /*
            if (typeof result == 'string'){
                result = [result]; // return in an array for consistency
            }
            */
            return result;
        }
        /*
        // TODO: this should go away because subtemplates are now preprocessed
        visitSubtemplateSpecs = function(ctx) {
            if (ctx.children){
                ctx.children.forEach((child)=>{
                    if (child.children[0].children[1].constructor.name == 'NamedSubtemplateContext'){
                        let templateString : string = child.children[0].children[3].GetText();
                        this.subtemplates[child.children[0].children[1].GetText()] = templateString;
                    }
                });
            }
            return null;
        }
        visitBraceArrow = function(ctx) {
            return this.visitChildren(ctx)[0]; // remove a level of arrays
        };
        visitTemplateSpec = function(ctx) {
            let result = this.visitChildren(ctx)[0];
            return result;
        };
        visitOptionallyInvoked = function(ctx) {
            let result = this.visitChildren(ctx);
            //if (result.length == 1){
                return result[0];
            //}
            //return result;
        };*/
        public override object VisitNotPredicate([NotNull] TextTemplateParser.NotPredicateContext ctx)
        {
            object result = VisitChildren(ctx);
            if (result is bool)
            {
                return !(bool)result;
            }
            if (valueIsMissing(result))
            {
                return true;
            }
            return false;
        }
        public override object VisitCondition([NotNull] TextTemplateParser.ConditionContext ctx)
        {
            object value = this.VisitChildren(ctx);
            // testing to see if the identifier has a value
            if (!(value is bool && (bool)value == false) && !valueIsMissing(value) && value.ToString() != ""){
                ///    if (this.annotations.falsy != null && this.annotations.falsy.test(value)){
                ///        return false;
                ///    }
                return true;
            }
            return false;
        }

        /*
        visitBraced = function(ctx) {
            // remove extraneous array
            return this.visitChildren(ctx)[0];
        };
        visitBracketedArgument = function(ctx) {
            // remove extraneous array
            return this.visitChildren(ctx)[0];
        };
        visitNestedPredicate = function(ctx) {
            return this.visitChildren(ctx)[1];  // return second of three children (left paren, the predicate, right paren)
        };
        visitBraceThinArrow = function(ctx) {
            return this.visitChildren(ctx)[0];
        };
        */
        public override object VisitBullet([NotNull] TextTemplateParser.BulletContext ctx)
        {
            return VisitBulletEx(ctx);

        }
        private object VisitBulletEx(ParserRuleContext ctx) {
            string text = ctx.GetText();
            string previousTokenText = GetPreviousTokenText(ctx);
            if (previousTokenText != null)
            {
                if (previousTokenText.StartsWith("[") && previousTokenText.Contains("\n") && !previousTokenText.Contains("`"))
                { // don't correct if continue character (`) is pressent 
                    // correct for bracket removing white space if followed by a bullet
                    text = Regex.Replace(previousTokenText, @"^[^\n]+(.*)", "$1") + text;
                }
            }
            string defaultIndent = this.annotations.ContainsKey("defaultIndent") ? (string)this.annotations["defaultIndent"] : null;
            return new TypedData("bullet", bullet: text.Replace("{", "\x01{"), defaultIndent: defaultIndent, parts: new List<object>());
        }
        private string GetPreviousTokenText(RuleContext ctx)
        {
            if (ctx.Parent == null)
            {
                return null;
            }
            if (ctx.Parent.GetChild(0)!= ctx)
            {
                for (int iChild = 1; iChild < ctx.Parent.ChildCount; iChild++)
                {
                    if (ctx.Parent.GetChild(iChild) == ctx)
                    {
                        if (ctx.Parent.GetChild(iChild - 1) is TerminalNodeImpl)
                        {
                            return ctx.Parent.GetChild(iChild - 1).GetText();
                        }
                        RuleContext foundCtx = (RuleContext)ctx.Parent.GetChild(iChild - 1);
                        while (foundCtx.ChildCount > 1)
                        {
                            foundCtx = (RuleContext)foundCtx.GetChild(foundCtx.ChildCount - 1); // last child
                        }
                        return foundCtx.GetText();
                    }
                }
            }
            return GetPreviousTokenText(ctx.Parent);
        }
        public override object VisitBeginningBullet([NotNull] TextTemplateParser.BeginningBulletContext ctx)
        {
            return VisitBulletEx(ctx);
        }
        
        public object callMethod(string method, object value, object args)
        {
            object externalMethod = null;///Externals.getMethod(method);
            TemplateData oldContext = null;
            if (externalMethod != null)
            {
                ///return externalMethod(value, args, this); 
            }
            List<object> argValues = new List<object>();
            string argsGetText = args is RuleContext ? ((RuleContext)args).GetText() : ((TerminalNodeImpl)args).GetText();
            int argsChildCount = args is RuleContext ? ((RuleContext)args).ChildCount : ((TerminalNodeImpl)args).ChildCount;
            if (args is TextTemplateParser.ConditionContext)
            {
                // the argument is a boolean 
                argValues[0] = ((TextTemplateParser.ConditionContext)args).Accept(this);
            }
            else if (args is TextTemplateParser.ArgumentsContext)
            {
                for (int i = 0; i < argsChildCount; i++)
                {
                    if ((method == "GroupBy" || method == "OrderBy") && i == 0)
                    {
                        // defer evaluation of the first parameter of a Group 
                        argValues.Add(null); // placeholder 
                    }
                    else
                    {
                        object arg = ((RuleContext)args).GetChild(i).Accept(this);
                        if (arg != null)
                        { // remove result of commas 
                            if (arg is TypedData && ((TypedData)arg).type == "regex")
                            {
                                argValues.Add(arg);
                            }
                            else
                            {
                                argValues.Add(this.compose(arg, 0));
                            }
                        }
                    }
                }
            }
            RuleContext parentCtx = args is RuleContext ? ((RuleContext)args).Parent : null;
            if (!(value is string) && !(value is TypedData && ((TypedData)value).type == "date") && (
            method == "ToUpper"
            || method == "ToLower"
            || method == "Trim"
            || method == "EncodeFor"
            ))
            {
                value = this.compose(value, 2); // turn the value into a string
            }
            // TODO: table driven argmument handling
            bool bTemplate = parentCtx != null && parentCtx.ChildCount > 1 && parentCtx.GetChild(1) is TextTemplateParser.InvokedTemplateSpecContext;
            string error = null;
            if (bTemplate || method.StartsWith("#"))
            {
                if (value is List<string>)
                {
                    value = string.Join("", (List<string>)value);
                }
                oldContext = this.context;
                // TODO: consider a clean context as a child of the context 
                TemplateData newContext = new TemplateData(new Dictionary<string, object>(), this.context);
                // add the current value as $0 and each argument as $1...n 
                newContext.add("$0", value);
                for (int i = 0; i < argValues.Count; i++)
                {
                    object argObject = ((RuleContext)args).GetChild(i).Accept(this);
                    if (argObject is List<object> && ((List<object>)argObject).Count == 1)
                    {
                        argObject = ((List<object>)argObject)[0];
                    }
                    if (argObject is TypedData)
                    {
                        if ((((TypedData)argObject).type) == "date")
                        {
                            newContext.add("$" + (i + 1), ((TypedData)argObject).dateString); // provide the original string value 
                        }
                        else if ((((TypedData)argObject).type) == "list")
                        {
                            newContext.add("$" + (i + 1), argValues[i]);
                        }
                        // if the type is "missing", don't add it 
                    }
                    else
                    {
                        newContext.add("$" + (i + 1), argValues[i]);
                    }
                }
                this.context = newContext;
                if (!bTemplate)
                {
                    value = this.VisitNamedSubtemplateExt(args is RuleContext ? ((RuleContext)args).Parent : null, method); // using subtemplate as a meth 
                }
                else
                {
                    value = "";
                    object result = parentCtx == null ? "" : parentCtx.GetChild(1).Accept(this);
                    if (result != null)
                    { // needed to protect against bad syntax 
                        value = result;
                        ///value = result[1]; // ignore the brackets when calling a bracketed template 
                    }
                }
                this.context = oldContext;
            }
            else if (this.valueIsMissing(value) && !(
            method == "Count"
                || method == "Where"
                || method == "ToJson"
                || method == "Matches"
                || method == "IfMissing"
            ))
            {
                value = value; // null with most methods returns null 
            }
            else if (!(value is string) && !(value is TypedData && ((TypedData)value).type == "date") && ( 
                method == "ToUpper"
                || method == "ToLower"
                || method == "Trim"
                || method == "EncodeFor"
            ))
            {
                error = "ERROR: invalid method, " + method + " for this data: " + parentCtx.GetText();
            }
            else if (argsChildCount > 0 && (method == "ToUpper" || method == "ToLower" || method == "Trim"))
            {
                error = "ERROR: invalid argument for " + method + ": " + argsGetText;
            }
            else if (argValues.Count != 2 && (method == "Replace"))
            {
                error = "ERROR: wrong number of arguments for " + method + ": " + argsGetText;
            }
            else if (argsChildCount == 0 && (
                method == "GreaterThan"
                || method == "LessThan"
                || method == "Align"
                || method == "StartsWith"
                || method == "EndsWith"
                || method == "Replace"
                || method == "Contains"
                || method == "Substr"
                || method == "IndexOf"
                || method == "EncodeFor"
            ))
            {
                error = "ERROR: missing argument for " + method + ": " + argsGetText;
            }
            else if (argsChildCount > 1 && (
              method == "@DateTest"
              || method == "@Falsy"
              || method == "@DefaultIndent"
            ))
            {
                error = "ERROR: invalid arguments for " + method + ": " + argsGetText;
            }
            else if ((argsChildCount > 1 || (argsChildCount == 1 && argValues[0] == null)) && (
              method == "GreaterThan"
              || method == "LessThan"
              || method == "StartsWith"
              || method == "EndsWith"
              || method == "Contains"
              || method == "IndexOf"
              || method == "EncodeFor"
              || method == "@EncodeDataFor"
              ))
            {
                error = "ERROR: invalid arguments for " + method + ": " + argsGetText;
            }
            else if (argsChildCount < 3 && method == "Case")
            {
                error = "ERROR: too few arguments for " + method + ": " + argsGetText;
            }
            else if ((value == null || value is TemplateData || (value is TypedData && ((TypedData)value).type == "argument")) && (
                method == ""
                || method == "ToUpper"
                || method == "ToLower"
                || method == "GreaterThan"
                || method == "LessThan"
                || method == "Case"
                || method == "Align"
                || method == "Trim"
                || method == "StartsWith"
                || method == "EndsWith"
                || method == "Replace"
                || method == "Contains"
                || method == "Substr"
                || method == "LastIndexOf"
                || method == "IndexOf"
                || method == "EncodeFor"
            ))
            {
                value = null;
            }
            else
            {
                switch (method)
                {
                    case "ToUpper":
                        value = this.valueAsString(value).ToUpper();
                        break;

                    case "ToLower":
                        value = this.valueAsString(value).ToLower();
                        break;

                    case "EncodeFor":
                        switch ((string)argValues[0])
                        {
                            case "html":
                                ///value = this.encodeHTML(value);
                                break;
                            case "xml":
                                ///value = this.encodeXML(value);
                                break;
                            case "uri":
                                ///value = encodeURIComponent(value); 
                                break;
                            default:
                                ///this.syntaxError("Parameter must be 'xml', 'html' or 'uri'", args); 
                                break;
                        }
                        break;
                    /*
                        case "GreaterThan":
                        case "LessThan":
                            let arg = argValues[0];
                            if (!isNaN(arg) && !isNaN(value)){
                                arg = parseInt(arg);
                                value = parseInt(value)
                            } else {
                                arg = arg.toString();
                                value = value.toString();
                            }
                            value = method == "GreaterThan" ? (value > arg) : (value < arg);
                            break;
                    */
                    case "Case":
                        for (int i = 0; i < argValues.Count; i += 2)
                        {
                            int parseArgValuesI;
                            int parseValue;
                            if ((int.TryParse(argValues[i].ToString(), out parseArgValuesI) && int.TryParse(value.ToString(), out parseValue) && parseArgValuesI == parseValue) || argValues[i].ToString() == value.ToString())
                            {
                                value = argValues[i + 1];
                                break;
                            }
                            else if ((i + 3) == argValues.Count)
                            {
                                value = argValues[i + 2]; // default 
                                break;
                            }
                        }
                        break;


                    case "Assert":
                    case "Matches":
                        object originalValue = value;
                        if (value is string && ((string)value).Contains("\x01{.}"))
                        {
                            // special case for matching the output of bullet templates
			    BulletIndent oldBulletIndent = this.bulletIndent;
                            List<object> composeArray = new List<object>();
                            composeArray.Add(value);
                            value = this.compose(composeArray, 1); // compose with bulleting 
			    this.bulletIndent = oldBulletIndent;
                        }
                        bool matches = false;
                        if (argValues.Count == 0 || this.valueIsMissing(value))
                        {
                            if (argValues.Count == 0 && this.valueIsMissing(value))
                            {
                                matches = true; // TODO: is it appropriate to match nulls? 
                            }
                        }
                        else
                        {
                            bool bFirst = true;
                            List<object> composeArg = new List<object>();
                            composeArg.Add(args);
                            argValues.ForEach((arg) =>
                            {
                                bool bIsNumeric = false;
                                int parsedLeft = 0;
                                int parsedRight = 0;
                                if (arg != null && (method != "Assert" || bFirst))
                                { // Assert only matches the first argument 
                                    if (arg is TypedData && ((TypedData)arg).type == "regex")
                                    {
                                        matches = matches || ((TypedData)arg).regex.IsMatch((string)value);
                                    }
                                    else if ((int.TryParse(arg.ToString(), out parsedLeft) && int.TryParse(value.ToString(), out parsedRight) && parsedLeft == parsedRight) || arg.ToString() == value.ToString())
                                    {
                                        matches = true;
                                    }
                                    else if (arg is string && ((string)arg).Contains("\x0l{.}") && (string)value == (string)compose(composeArg, 1))
                                    {
                                        matches = true;
                                    }
                                    bFirst = false;
                                }
                            });
                        }
                        if (method == "Assert")
                        {
                            if (matches == true)
                            {
                                if (argValues.Count > 1)
                                {
                                    value = argValues[1];

                                }
                                else
                                {
                                    value = originalValue; // if the second argument is missing, return the original value 
                                }
                            }
                            else if (argValues.Count > 2)
                            {
                                value = argValues[2];
                            }
                            else
                            {
                                string failure = "ASSERT FAILURE:\n";
                                string arg = argValues[0].ToString();
                                int i = 0;
                                for (; i < value.ToString().Length && i < arg.Length; i++)
                                {
                                    if (value.ToString().Substring(i, 1) != arg.Substring(i, 1))
                                    {
                                        break;
                                    }

                                }
                                failure += (value.ToString().Substring(0, i) + "--->");
                                if (i == value.ToString().Length)
                                {
                                    failure += ("Missing: " + arg.Substring(i));
                                }
                                else if (i == arg.Length)
                                {
                                    failure += ("Unexpected: " + value.ToString().Substring(i));
                                }
                                else
                                {
                                    failure += ("Mismatch: " + value.ToString().Substring(i));
                                }
                                value = failure;
                            }
                        }
                        else
                        {
                            value = matches;
                        }
                        break;

                    case "Join":
                        if (argValues.Count > 2)
                        {
                            ///this.syntaxError("Too many arguments for the Join method", args); 
                        }
                        if (value is TypedData && ((TypedData)value).type == "argument")
                        {
                            string joiner = ", ";
                            if (argValues.Count > 0)
                            {
                                joiner = (string)argValues[0];
                            }
                            List<object> list = ((TypedData)value).list;
                            for (int i = 0; i < list.Count - 1; i++)
                            {
                                if (argValues.Count > 1 && i == (list.Count - 2))
                                {
                                    list[i] += (string)argValues[1];
                                }
                                else
                                {
                                    list[i] += joiner;
                                }
                            }
                            value = string.Join("", list);
                        }
                        break;

                    case "Compose":
                        value = this.compose(value, 1);
                        this.bulletIndent = null; // reset bulleting
                        break;

                    case "Count":
                    case "Where":
                        if (args is ITerminalNode || ((RuleContext)args).ChildCount == 0)
                        {
                            // no arguments 
                            if (method == "Where")
                            {
                                value = "ERROR: no condition specified for .Where()";
                                ///this. syntaxError(value, args.parentCtx); 
                            }
                            else if (method == "Count")
                            {
                                if (value == null)
                                {
                                    value = 0;
                                }
                                else if (value is TemplateData && ((TemplateData)value).type == "list")
                                {
                                    value = ((TemplateData)value).Count();
                                }
                                else if (value == null || (value is TypedData && ((TypedData)value).type == "missing"))
                                {
                                    value = 0;
                                }
                                else
                                {
                                    value = 1;
                                }
                            }
                        }
                        else
                        {
                            if (value is TemplateData)
                            {
                                oldContext = this.context;
                                // temporarily set the context to the value being evaluated 
                                this.context = (TemplateData)value;
                                Dictionary<string, object> dollarVariables = new Dictionary<string, object>();
                                oldContext.getKeys().ForEach((key) => {
                                    if (key.StartsWith("$"))
                                    {
                                        dollarVariables[key] = oldContext.getValue(key);
                                    }
                                });
                                List<object> result = new List<object>();
                                if (this.context.type == "list")
                                {
                                    this.context.IterateList((TemplateData newContext) => {
                                        this.context = newContext;
                                        dollarVariables.Keys.ToList().ForEach((key) => {
                                            newContext.dictionary[key] = dollarVariables[key]; // pass on the $ variables 
                                        });
                                        object addToResult = args is ITerminalNode ? true : ((RuleContext)args).GetChild(0).Accept(this); // [0]; 
                                        if (this.valueIsMissing(addToResult))
                                        { // || (addToResult is string && this.annotations. ContainsKey("falsy") && this.annotations.falsy.test(addToResult))){ 
                                            addToResult = false;
                                        }
                                        if (addToResult != null && !(addToResult is bool && (bool)addToResult == false))
                                        {
                                            // the condition returned true; add a clone of the iteration 
                                            dollarVariables.Keys.ToList().ForEach((key) => {
                                                newContext.dictionary.Remove(key.ToString()); // remove the added $ variables 
                                            });
                                            context.getKeys().ForEach((key) => {
                                                if (key.StartsWith('$'))
                                                {
                                                    context.Remove(key); // prevent clone from breaking
                                                }
                                            });
                                            result.Add(new TemplateData(this.context));
                                        }
                                        this.context = oldContext;
                                    });
                                }
                                else
                                {
                                    object filterResult = ((RuleContext)args).Accept(this);
                                    while (filterResult is List<object> && ((List<object>)filterResult).Count == 1)
                                    {
                                        filterResult = ((List<object>)filterResult)[0];
                                    }
                                    if (filterResult != null && !(filterResult is bool && ((bool)filterResult) == false))
                                    {
                                        result.Add(this.context); // no filtering (or cloning) necessary 
                                    }
                                }
                                this.context = oldContext; // restore old context 
                                if (result.Count == 0)
                                {
                                    string missingValue = this.annotations.ContainsKey("missingValue") ? (string)this.annotations["missingValue"] : null;
                                    value = new TypedData("missing", missingValue: missingValue, key: "list"); // indication of missing value 

                                }
                                else
                                {
                                    value = new TemplateData(result, this.context);
                                }
                            }
                            if (method == "Count")
                            {
                                if (this.valueIsMissing(value))
                                {
                                    value = 0;
                                }
                                else if (value is TemplateData && ((TemplateData)value).type == "list")
                                {
                                    value = ((TemplateData)value).Count();
                                }
                                else
                                {
                                    value = 1;
                                }
                            }
                        }
                        break;

                    case "Align":
                        int paddingLength;
                        if (argValues.Count > 3 || argValues.Count == 0 || !int.TryParse((string)argValues[0], out paddingLength) 
                            || (argValues.Count > 1 && !(((string)argValues[1]) == "L" || ((string)argValues[1]) == "R" || ((string)argValues[1]) == "C"))){
                            //this.syntaxError("Incorrect arguments for " + method, args);
                        } else {
                            string paddingType = argValues.Count == 1 ? "L" : ((string)argValues[1]);
                            string padding = (argValues.Count == 3 && ((string)argValues[2]) != "") ? argValues[2].ToString() : " ";
                            value = value.ToString();
                            while (((string)value).Length < paddingLength)
                            {
                                if (paddingType == "L" || paddingType == "C")
                                {
                                    value = (value.ToString() + padding).Substring(0, paddingLength);
                                }
                                if (paddingType == "R" || paddingType == "C")
                                {
                                    int newLength = padding.Length + ((string)value).Length;
                                    // insure that multi character padding doesn't cause the actual value to be cut and the value is not larger than padding length 
                                value = ((padding.Substring(newLength > paddingLength ? newLength - paddingLength : 0)) + value).Substring(0, paddingLength);
                                }
                            }
                        }
                        break;

                    case "Trim":
                        value = value.ToString().Trim();
                        break;

                    case "StartsWith":
                        value = value.ToString().StartsWith(argValues[0].ToString());
                        break;

                    case "EndsWith":
                        value = value.ToString().EndsWith(argValues[0].ToString());
                        break;

                    case "Replace":
                        if (argValues[0] is string){
                            value = value.ToString().Replace(argValues[0].ToString(), argValues[1].ToString());
                        } else {
                            // regex
                            if (((TypedData)argValues[0]).flags.Contains("g"))
                            {
                                // The C# regex assumes global 
                                value = ((TypedData)argValues[0]).regex.Replace(value.ToString(), argValues[1].ToString());
                            }
                            else
                            {
                                // only replace the first found
                                value = ((TypedData)argValues[0]).regex.Replace(value.ToString(), argValues[1].ToString(), 1);
                            }
                        }
                        break;

                    case "Contains":
                        value = value.ToString().Contains(argValues[0].ToString());
                        break;

                    case "Substr":
                        int nStart;
                        int nCount = 0;
                        if (argValues.Count > 2 || !int.TryParse(argValues[0].ToString(), out nStart) || (argValues.Count == 2 && !int.TryParse(argValues[1].ToString(), out nCount)))
                        {
                            ///this.syntaxError(" Incorrect arguments for" + method, args);
                        }
                        else
                        {
                            if (nStart > value.ToString().Length)
                            {
                                value = "";
                            }
                            else
                            {
                                if (argValues.Count == 1)
                                {
                                    value = value.ToString().Substring(nStart);
                                }
                                else
                                {
                                    int nMaxLength = value.ToString().Substring(nStart).Length;
                                    value = value.ToString().Substring(nStart, Math.Min(nCount, nMaxLength));
                                }
                            }
                        }
                        break;

                    case "LastIndexOf":
                        value = value.ToString().LastIndexOf(argValues[0].ToString());
                        break;

                    case "IndexOf":
                        value = value.ToString().IndexOf(argValues[0].ToString());
                        break;

                    case "OrderBy":
                    case "GroupBy":
                        if (method == "OrderBy")
                        {
                            if (argValues.Count == 1)
                            {
                                argValues.Add("A");
                            }
                            else if (argValues.Count == 2)
                            {
                                argValues[1] = argValues[1].ToString().ToUpper().Replace("ASC", "A").Replace("DESC", "D");
                            }
                        }
                        oldContext = this.context;
                        Dictionary<string, object> groups = new Dictionary<string, object>();
                        if (method == "GroupBy" && argValues.Count == 2 && !new Regex(@"^[a-zA-Z_][a-zA-Z0-9_]*$").IsMatch(((RuleContext)args).GetChild(0).GetText()))
                        {
                            // A formula or other non-identifier must be aliased
                            ///this.syntaxError("An alias (third parameter) must be provided for the GroupBy name", args.children[0]);
                        }
                        else if (!(value is TemplateData))
                        {
                            ///this.syntaxError("Invalid data type for " + method, args.parentCtx);
                        }
                        else if ((method == "GroupBy" && argValues.Count < 2) || (method == "OrderBy" && (argValues.Count != 2 || !(((string)argValues[1]) == "A" || ((string)argValues[1]) == "D"))))
                        {
                            //this.syntaxError("Invalid arguments for " + method, args.parentCtx);
                        }
                        else
                        {
                            // temporarily set the context to the value being ordered or grouped
                            this.context = (TemplateData)value;
                            Dictionary<string, object> dollarVariables = new Dictionary<string, object>();
                            if (oldContext != null)
                            {
                                oldContext.getKeys().ForEach((key) => {
                                    if (key.StartsWith("$"))
                                    {
                                        dollarVariables[key] = oldContext.getValue(key);
                                    }
                                });
                            }
                            this.context.asList().IterateList((newContext) => {
                                this.context = newContext;
                                dollarVariables.Keys.ToList().ForEach((key) => {
                                    newContext.dictionary[key.ToString()] = dollarVariables[key.ToString()]; // pass on the $ variables in case they are needed for a calculaton
                                });
                                object groupKey = ((RuleContext)args).GetChild(0).Accept(this);
                                if (!(groupKey is string))
                                {
                                    // composite probably created from a template argument that needs to be composed
                                    groupKey = this.compose(groupKey, 1);
                                }
                                dollarVariables.Keys.ToList().ForEach((key) => {
                                    newContext.dictionary.Remove(key.ToString());  // remove the added $ variables
                                });
                                if (!groups.ContainsKey(groupKey.ToString()))
                                {
                                    groups.Add(groupKey.ToString(), this.context);
                                }
                                else
                                {
                                    if (!(groups[groupKey.ToString()] is List<object>))
                                    {
                                        List<object> list = new List<object>();
                                        list.Add(groups[groupKey.ToString()]);
                                        groups.Remove(groupKey.ToString());
                                        groups.Add(groupKey.ToString(), list);
                                    }
                                    ((List<object>)groups[groupKey.ToString()]).Add(this.context);
                                }
                            });
                            this.context = oldContext;
                            List<object> result = new List<object>();
                            List<string> keys = new List<string>();
                            ((Dictionary<string, object>)groups).Keys.ToList().ForEach((key) => {
                                keys.Add(key.ToString());
                            });
                            keys.Sort();
                            if (method == "OrderBy" && ((string)argValues[1]) == "D")
                            {
                                keys.Reverse();
                            }
                            string groupingName = argValues.Count == 3 ? argValues[2].ToString() : ((RuleContext)args).GetChild(0).GetText(); // use an alias or the GroupBy identifier
                            keys.ForEach((key) => {
                                object group = groups[key];
                                if (method == "OrderBy")
                                {
                                    if (group is List<object>)
                                    {
                                        ((List<object>)group).ForEach((member) => {
                                            result.Add(member); // if there is more than one, they are key duplicates
                                        });
                                    }
                                    else
                                    {
                                        result.Add(group);
                                    }
                                }
                                else
                                {
                                    // GroupBy
                                    Dictionary<string, object> data = new Dictionary<string, object>();
                                    data.Add(groupingName, key);
                                    data.Add((string)argValues[1], group);
                                    result.Add(new TemplateData(data));
                                }
                            });
                            value = new TemplateData(result, this.context);
                        }
                        break;

                    case "IfMissing":
                        if (value == null || (value is TypedData && ((TypedData)value).type == "missing"))
                        {
                            value = argValues[0];
                        }
                        break;

                    case "ToJson":
                        if (value == null)
                        {
                            value = "null";
                        }
                        else
                        {
                            if (value is TypedData && ((TypedData)value).type == "argument")
                            {
                                value = new TemplateData(((TypedData)value).list);
                            }
                        }
                        if (value is TemplateData)
                        {
                            value = ((TemplateData)value).toJson();
                        }
                        else if (((RuleContext)args).Parent.Parent != null && ((RuleContext)args).Parent.Parent.GetChild(0) != null)
                        {
                            Dictionary<string, object> obj = new Dictionary<string, object>();
                            string templateText = ((RuleContext)args).Parent.Parent.GetChild(0).GetText();
                            if (templateText.StartsWith("#"))
                            {
                                obj[templateText] = this.subtemplates.ContainsKey(templateText) ? this.subtemplates[templateText] : null;
                            }
                            else if (templateText.StartsWith("["))
                            {
                                obj["template"] = templateText.Substring(1, templateText.Length - 2);
                            }
                            else
                            {
                                obj[templateText] = value == null ? null : value;
                            }
                            value = JsonSupport.Serialize(obj);
                        }
                        else
                        {
                            value = value.ToString();
                        }
                        break;

                    case "ToDate":
                        if (value is TypedData && ((TypedData)value).type == "date"){
                            value = ((TypedData)value).dateString;
                        }
                        DateTime date;
                        if (DateTime.TryParse(value.ToString(), out date))
                        {
                            if (argValues.Count == 0)
                            {
                                if (this.annotations.ContainsKey("dateFormat"))
                                {
                                    string dtString = date.ToString(MomentJSConverter.GenerateCSharpFormatString((string)this.annotations["dateFormat"] + " "));
                                    value = dtString.Substring(0, dtString.Length - 1);
                                }
                                else
                                {
                                    value = date.ToShortDateString(); // for now
                                    //value = date.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' }); // puts out local format
                                }
                            }
                            else
                            {
                                if (argValues.Count > 1 && argValues[1] == "GMT")
                                {
                                    //date.subtract(date.parseZone().utcOffset(), 'minutes');
                                    //date.utc();
                                }
                                string dtString = date.ToString(MomentJSConverter.GenerateCSharpFormatString((string)argValues[0] + " "));
                                value = dtString.Substring(0, dtString.Length - 1);
                            }
                        }
                        break;
                    case "@Include":
                        string templateName = (string)argValues[0];
                        Dictionary<string, object> oldAnnotations = this.annotations;
                        this.annotations = (Dictionary<string, object>)value; // this method is called on higher level template's annotations, so let any @ methods modify it
                        this.VisitNamedSubtemplateExt((RuleContext)args, templateName, true); // run the named subtemplate, preserving any loaded subtemplates
                        this.annotations = oldAnnotations;
                        break;

                    case "@MissingValue":
                        ((Dictionary<string, object>)value)["missingValue"] = argValues[0];
                        break;
                    /*
                    case '@ValueFunction':
                        if (argValues.Count == 0){
                            delete value['valueFunction'];
                        } else {
                            let valueFunction = Externals.getValueFunction(argValues[0]);
                            if (valueFunction){		
                                value['valueFunction'] = valueFunction;
                            } else {
                                this.syntaxError('Value Function not found: ' + argValues[0], args.children[0]);
                                delete value['valueFunction'];
                            }
                        }
                        break;
        */
                    case "@BulletMode":
                        string mode = argValues[0].ToString().ToLower();
                        if (mode != "explicit" && mode != "implicit")
                        {
                            //this.syntaxError('Invalid Bullet Mode', args.children[0]);
                        }
                        else
                        {
                            ((Dictionary<string, object>)value).Add("bulletMode", mode);
                        }
                        break;

                    case "@DateFormat":
                        if (((Dictionary<string, object>)value).ContainsKey("dateFormat"))
                        {
                            ((Dictionary<string, object>)value).Remove("dateFormat");
                        }
                        if (((Dictionary<string, object>)value).ContainsKey("dateFormatMode"))
                        {
                            ((Dictionary<string, object>)value).Remove("dateFormatMode");
                        }
                        if (argValues.Count > 0)
                        {
                            ((Dictionary<string, object>)value).Add("dateFormat", argValues[0]);
                        }
                        if (argValues.Count > 1)
                        {
                            ((Dictionary<string, object>)value).Add("dateFormatMode", argValues[0]);
                        }
                        break;
                    /*
                    case '@DefaultIndent':
                        if (argValues.Count == 0){
                            delete value['defaultIndent'];
                        } else {
                            let nDefaultIndent = parseInt(argValues[0]);
                            if (isNaN(nDefaultIndent) || nDefaultIndent > 25 || nDefaultIndent < 1){
                                this.syntaxError('@DefaultIndent takes a numerical argument between 1 and 25', args);
                            } else {
                                value['defaultIndent'] = (' ' + new Array(nDefaultIndent).join(' ')); // generates a string of n blanks
                            }
                        }
                        break;
                    */
                    case "@DateTest":
                        if (((Dictionary<string, object>)value).ContainsKey("dateTest"))
                        {
                            ((Dictionary<string, object>)value).Remove("dateTest");
                        }
                        if (argValues.Count != 1 || (argValues.Count > 0 && !(argValues[0] is TypedData && ((TypedData)argValues[0]).type == "regex")))
                        {
                            ///this.syntaxError('@DateTest takes a single regular expression', args.parentCtx)
                        }
                        else
                        {
                            ((Dictionary<string, object>)value).Add("dateTest", ((TypedData)argValues[0]).regex);
                        }
                        break;

                    case "@BulletStyle":
                        // TODO: verify that the style is legitimate, including roman numeral correctness
                        for (int i = 0; i < argValues.Count; i++)
                        {
                            if (!(argValues[i] is string))
                            {
                                ///this.syntaxError('ERROR: invalid argument for bullet style', args.parentCtx);
                                argValues = null;
                                break;
                            }
                        }
                        if (((Dictionary<string, object>)value).ContainsKey("bulletStyles"))
                        {
                            ((Dictionary<string, object>)value).Remove("bulletStyles");
                        }
                        List<string> bulletStyles = new List<string>();
                        argValues.ForEach((style) => {
                            bulletStyles.Add(style.ToString());
                        });
                        ((Dictionary<string, object>)value).Add("bulletStyles", bulletStyles);
                        break;
                    /*
                    case '@EncodeDataFor':
                        let encoding = argValues[0];
                        if (argValues.Count == 0){
                            delete this.annotations['encoding'];
                        } else if (encoding != 'html' && encoding != 'xml' && encoding != 'uri'){
                            this.syntaxError("Parameter must be 'xml', 'html' or 'uri'", args.parentCtx);
                        } else {
                            this.annotations['encoding'] = encoding;
                        }
                        break;

                    case '@Falsy':
                        if (argValues.Count == 0){
                            delete this.annotations['falsy'];
                        } else if (argValues.Count != 1 || argValues[0].constructor.name != 'RegExp'){
                            this.syntaxError('@Falsy takes a single regular expression', args.parentCtx)
                        } else {
                            value['falsy'] = argValues[0];
                        }
                        break;
                    */
                    case "Index":
                        int index = 0;
                        if (argValues.Count > 1 || (argValues.Count > 0 && (!int.TryParse(argValues[0].ToString(), out index) || index == 0 || !(value is TemplateData))))
                        {
                            //this.syntaxError('Invalid argument for Index', args.parentCtx);
                            return null;
                        }
                        if (argValues.Count > 0)
                        {
                            if (((TemplateData)value).type == "dictionary")
                            {
                                if (index == 1)
                                {
                                    return value;
                                }
                                else
                                {
                                    return new TemplateData("[]", (TemplateData)value);
                                }
                            }
                            if (((TemplateData)value).list.Count >= index)
                            {
                                return new TemplateData(((TemplateData)value).list[index - 1], (TemplateData)value);
                            }
                            return new TemplateData("[]", (TemplateData)value);
                        }
                        if (value == null || !(value is TemplateData))
                        {
                            return 1;
                        }
                        TemplateData parent = ((TemplateData)value).parent;
                        TemplateData child = (TemplateData)value;
                        while (parent != null && parent.type != "list")
                        {
                            child = parent;
                            parent = child.parent;
                        }
                        if (parent == null)
                        {
                            return 1;
                        }
                        for (int i = 0; i < parent.list.Count; i++)
                        {
                            if (child == parent.list[i])
                            {
                                return i + 1;
                            }
                        }
                        return 1;

                    default:
                        value = value + "[." + method + "(" + string.Join(", ", argValues) + ")]";
                        //this.syntaxError("ERROR: unknown function: ." + method + "(" + argValues.join(", ") + ")", args.parentCtx); 
                        break;
                }
            }
            if (error != null)
            {
                ///this.syntaxError(error, parentCtx);
                return "";
            }
            return value;
        }
        public string getParseTree(ParserRuleContext ctx, string indent = null)
        {
            const string indentBlanks = "   ";
            if (indent == null)
            {
                indent = "";
            }
            ArrayList<string> templateParts = new ArrayList<string>();
            string ctxName = Regex.Replace(ctx.GetType().Name, @"Context$", "");
            switch (ctxName)
            {
                case "TemplateContents":
                case "CompilationUnit":
                case "QuoteLiteral":
                case "ApostropheLiteral":
                case "MethodInvocation":
                case "Comment":
                case "BracedThinArrow":
                case "LogicalOperator":
                case "InvokedTemplateSpec":
                case "SubtemplateSpecs":
                case "BracketedArgument":
                case "Bullet":
                case "BeginningBullet":
                case "MethodInvoked":
                case "TemplateContextToken":
                    templateParts.Add(indent + ctxName);
                    ctx.children.ToList().ForEach((child) =>
                    {
                        if (child.ChildCount > 0)
                        {
                            templateParts.Add(getParseTree((ParserRuleContext)child, indentBlanks + indent));
                        }
                    });
                    break;

                case "Method":
                case "Identifier":
                case "NamedSubtemplate":
                    templateParts.Add(indent + ctxName + " (" + ctx.GetText() + ")");
                    ctx.children.ToList().ForEach(child => {
                        if (child.ChildCount > 0)
                        {
                            templateParts.Add(this.getParseTree((ParserRuleContext)child, indentBlanks + indent));
                        }
                    });
                    break;
                case "Text":
                    templateParts.Add(indent + "Text (\"" + Regex.Replace(ctx.GetText(), @"\n ", "\\n") + "\")");
                    break;
                case "BracketedTemplateSpec":
                case "TemplateToken":
                    templateParts.Add(indent + ctxName);
                    for (int i = 1; i < ctx.ChildCount - 1; i++)
                    {
                        templateParts.Add(this.getParseTree((ParserRuleContext)ctx.children[i], indentBlanks + indent));
                    }
                    break;
                case "BracedArrowTemplateSpec":
                case "BracedArrow":
                    templateParts.Add(indent + ctxName);
                    templateParts.Add(this.getParseTree((ParserRuleContext)ctx.children[0], indentBlanks + indent));
                    if (ctx.children.Count > 2)
                    {
                        templateParts.Add(this.getParseTree((ParserRuleContext)ctx.children[2], indentBlanks + indent));
                    }
                    break;
                case "TerminalNodeImpl":
                    break; // has no children

                default:
                    ctx.children.ToList().ForEach(child => {
                        if (child.ChildCount > 0)
                        {
                            templateParts.Add(this.getParseTree((ParserRuleContext)child, indent));
                        }
                    });
                    break;
            }
            string result = string.Join("\n", templateParts);
            while (result.Contains("\n\n"))
            {
                result = result.Replace("\n\n", "\n"); // empty lines come from children that aren't included in the parse tree
            }
            return result;
        }
        private object compose(object parts, int mode)
        {
            // mode 0 is intermediate without resolving the bullets; mode 1 resolves bullets 
            if (parts is TemplateData || parts is TypedData)
            {
                if (mode == 0 && (parts is TemplateData || ((TypedData)parts).type == "argument" || ((TypedData)parts).type == "missing" || ((TypedData)parts).type == "date")){
                    return parts; // don't compose if not appropriate 
                }
                List<object> partsAsList = new List<object>();
                partsAsList.Add(parts);
                parts = partsAsList; // do compose expects arrays 
            }
            if (!(parts is List<object>)) {
                if (mode == 0){
                    return parts;
                }
                List<object> partsList = new List<object>();
                partsList.Add(parts);
                parts = partsList;
            }
            List<string> lines = new List<string>();
            lines.Add("");
            ComposeOutput output = new ComposeOutput(lines: lines, skipping: false, mode: 0, bullets: new Dictionary<string, object>());
            this.doCompose((List<object>)parts, output, null);
            if (output.skipping)
            {
                // never encountered a new line while skipping 
                if (output.lines.Count == 1)
                {
                    return null; // a null in the array nullified the whole array} 
                }
                output.lines = output.lines.Take(output.lines.Count - 1).ToList<string>(); // remove the deleted line's new line 
            }
            Dictionary<string, object> bullets = output.bullets;
            // sort the found bullets by length and use that to assign them a level 
            var keys = bullets.Keys;
            if (mode == 1 && keys.Count > 0)
            {
                int level = 0;
                bool bSorting = true;
            	while (bSorting){ 
               		string lowest = null; 
		            foreach (var key in keys) { 
                	    if (((TypedData)bullets[key.ToString()]).level == null && (lowest == null || ((TypedData)bullets[key.ToString()]).length < ((TypedData)bullets[lowest]).length))
				        { 
                			lowest = key; 
                	    } 
                	} 
                	if (lowest != null){ 
                		((TypedData)bullets[lowest]).level = level++; 
                	} else { 
                		bSorting = false; 
                	} 
                } 
                List<object> composed = new List<object>();
                composed.Add(string.Join("\n", output.lines));
                List<string> composeLines = new List<string>();
                composeLines.Add("");
                output = new ComposeOutput(lines: composeLines, skipping: false, mode: 1, bullets: bullets);
                this.doCompose(composed, output, null);
            }
            return string.Join("\n", output.lines);
        }
        private string doCompose(List<object> parts, ComposeOutput output, string indent)
        {
            List<string> lines = output.lines;
            int iParts = 0;
            for (; iParts < parts.Count; iParts++)
            {
                object item = parts[iParts];
                if (item != null && item is TypedData)
                {
                    switch (((TypedData)item).type)
                    {
                        case "bullet":
                            if (parts.Count > 1)
                            {
                                // create a new bullet object to avoid a side effect 
                                List<object> bulletParts = new List<object>();
                                foreach (object part in (List<object>)((TypedData)item).parts)
                                {
                                    bulletParts.Add(part);
                                }
                                item = new TypedData("bullet", bullet: ((TypedData)item).bullet, parts: bulletParts, defaultIndent: ((TypedData)item).defaultIndent);
                                for (iParts++; iParts < parts.Count; iParts++)
                                {
                                    ((List<object>)((TypedData)item).parts).Add(parts[iParts]); // repackage the remaining parts by adding them to the bullet object 
                                }
                            }
                            break;
                        case "missing":
                            item = ((TypedData)item).missingValue;
                            break;
                        case "date":
                            item = this.valueAsString(item);
                            break;
                    }
                }
                if (item == null)
                {
                    Debug.Write("Skipping line containing " + lines[lines.Count - 1] + " because of a null in the composition input");
                    lines[lines.Count - 1] = ""; // skipping this line 
                    output.skipping = true;
                } else if (this.isScalar(item))
                {
                    this.addToOutput(item.ToString(), output);
                } else if (item is List<object>) {
                    string bulletInTheOutput = Regex.Replace(lines[lines.Count - 1], @"^([ \t]*(\x01\{\.\})?).*", "$1", RegexOptions.Singleline);
                    // determine if the current bulleted indent is being overridden by a plain indent 
                    bool bReplaceIndent = indent != null && indent.Contains("\x01{.}") && !bulletInTheOutput.Contains("\x01{.}") && bulletInTheOutput.Length > 0;
                    indent = this.doCompose((List<object>)item, output, bReplaceIndent ? bulletInTheOutput : indent);
                }
                else if (item is TypedData)
                {
                    bool bNextLineStartsWithBullet = false;
                    if (((TypedData)item).type == "bullet")
                    {
                        this.addToOutput(((TypedData)item).bullet, output);
                        indent = ((TypedData)item).bullet;
                        if (((TypedData)item).parts == null)
                        {
                        }
                        else if (((TypedData)item).parts is string || ((TypedData)item).parts is int)
                        {
                            this.addToOutput(((TypedData)item).parts.ToString(), output);
                        }
                        else if (((TypedData)item).parts is List<object> || ((TypedData)item).parts is TypedData)
                        {
                            if (((TypedData)item).parts is List<object> || ((TypedData)((TypedData)item).parts).type == "bullet" || ((TypedData)((TypedData)item).parts).type == "missing")
                            {
                                List<object> partsList = new List<object>();
                                partsList.Add(((TypedData)item).parts);
                                this.doCompose(partsList, output, ((TypedData)item).bullet);
                            }
                            else
                            {
                                // list 
                                for (int i = 0; i < ((TypedData)((TypedData)item).parts).list.Count; i++)
                                {
                                    List<object> composeParts = new List<object>();
                                    composeParts.Add(((TypedData)((TypedData)item).parts).list[i]);
                                    this.doCompose(composeParts, output, ((TypedData)item).bullet);
                                    if (i < ((TypedData)((TypedData)item).parts).list.Count - 1)
                                    {
                                        this.addToOutput("\n", output);
                                    }
                                }
                            }
                        }
                        else
                        {
                            string x = "stop"; // unexpected 
                        }
                    } else
                    {
                        // list
                        object nextLine = "";
                        if (((TypedData)item).list.Count > 0)
                        {
                            // preview the next line to let routines below determine what is needed 
                            List<object> partsList = new List<object>();
                            partsList.Add(((TypedData)item).list[0]);
                            nextLine = compose(partsList, 0); // note that send an array to compose insures a string 
                            if (nextLine is string)
                            {
                                bNextLineStartsWithBullet = new Regex(@"^\s*\x01{.}.*", RegexOptions.Singleline).IsMatch((string)nextLine);
                            }
                        }
                        if (indent != null && indent.Contains("\x01{.}"))
                        {
                            // This is an unbulleted list under a bullet, so we need to turn each list item into an indent object with an indented bullet 
                            bool bIncompleteBullet = new Regex(@"^[ \t]*\x01\{\.\}[ \t]*$").IsMatch(lines[lines.Count - 1]);
                            //.test(); 
                            string defaultIndent = ((TypedData)item).defaultIndent == null ? "   " : ((TypedData)item).defaultIndent;
                            string newBullet = Regex.Replace(indent, @"([ \t]*\x01\{\.\})", defaultIndent + "$1");
                            for (int i = 0; i < ((TypedData)item).list.Count; i++)
                            {
                                object itemResult = ((TypedData)item).list[i];
                                object indentObject = itemResult;
                                // let the next level handle an array of items that aren't lists or indents 
                                if (!bNextLineStartsWithBullet)
                                {
                                    indentObject = new TypedData("bullet", parts: itemResult, defaultIndent: defaultIndent, bullet: bIncompleteBullet ? indent : newBullet);
                                }
                                if (i == 0)
                                {
                                    List<object> doComposeParm = new List<object>();
                                    doComposeParm.Add(indentObject);
                                    if (bIncompleteBullet)
                                    {
                                        if (itemResult is List<object>)
                                        {
                                            doComposeParm = (List<object>)itemResult;
                                        }
                                        else
                                        {
                                            doComposeParm = new List<object>();
                                            doComposeParm.Add(itemResult);
                                        }
                                    }
                                    this.doCompose(doComposeParm, output, indent);
                                }
                                else
                                {
                                    object firstItem = indentObject;
                                    string firstItemIndent = "";
                                    if (firstItem is List<object>)
                                    {
                                        firstItem = ((List<object>)firstItem)[0];
                                    }
                                    if (firstItem is TypedData && ((TypedData)firstItem).type == "bullet")
                                    {
                                        firstItemIndent = ((TypedData)firstItem).bullet;
                                    }
                                    if (!indent.Contains("\n") && !firstItemIndent.Contains("\n"))
                                    {
                                        this.addToOutput("\n", output);
                                    }
                                    List<object> partsList = new List<object>();
                                    partsList.Add(indentObject);
                                    this.doCompose(partsList, output, indent);
                                }
                            }
                        }
                        else
                        {
                            // create a list and indent it under the current line, if it isn't empty 
                            bool bEmptyLine = lines[lines.Count - 1] == "";
                            string lastIndent = Regex.Replace(lines[lines.Count - 1], @"^([ \t]*).*$", "$1");
                            string defaultIndent = ((TypedData)item).defaultIndent == null ? "   " : ((TypedData)item).defaultIndent;
                            string newIndent = (indent == null ? defaultIndent + lastIndent : defaultIndent + indent);
                            string nextIndent = "";
                            nextLine = null;
                            if (((TypedData)item).list.Count > 0)
                            {
                                nextLine = this.compose(((TypedData)item).list[0], 0); // preview the next line to see its indent is already sufficient 
                                nextIndent = nextLine is string ? Regex.Replace((string)nextLine, @"^([ \t]*).*", "$1", RegexOptions.Singleline) : "";
                            }
                            if (nextIndent.Length > lastIndent.Length)
                            {

                                newIndent = null; // it is already indented 
                            }
                            bool bIncompleteIndent = lines[lines.Count - 1] == indent;
                            if (bIncompleteIndent)
                            {
                                newIndent = indent;
                            }
                            else if (lastIndent == lines[lines.Count - 1])
                            {
                                // starting a new indent 
                                newIndent = lastIndent;
                                bIncompleteIndent = true;
                            }
                            bool bFirst = true;
                            foreach (object listItemx in ((TypedData)item).list)
                            {
                                object listItem = listItemx;
                                if (nextLine is string && ((string)nextLine).StartsWith("\n"))
                                {
                                    newIndent = indent;
                                }
                                if (nextLine != null && !(nextLine.ToString()).StartsWith("\n") && !(bIncompleteIndent && bFirst) && (!bEmptyLine || !bFirst))
                                {
                                    this.addToOutput("\n", output); // start a new line 
                                    if (newIndent != null && newIndent != "" && !bNextLineStartsWithBullet)
                                    {
                                        this.addToOutput(newIndent, output);
                                        if (listItem is string)
                                        {
                                            // indent the contents 
                                            listItem = Regex.Replace((string)listItem, @"\n ", "\n" + newIndent);
                                        }
                                    }
                                }
                                List<object> composeParts;
                                if (listItem is List<object>)
                                {
                                    composeParts = (List<object>)listItem;
                                }
                                else
                                {
                                    composeParts = new List<object>();
                                    composeParts.Add(listItem);
                                }
                                this.doCompose(composeParts, output, newIndent);
                                bFirst = false;
                            }
                        }
                    }
                }
                else
                {
                    string x = "stop"; // trouble 
                }
            }
            return indent;
        }
        private bool valueIsMissing(object value)
        {
            if (value == null || (value is TypedData && ((TypedData)value).type == "missing"))
            {
                return true;
            }
            return false;
        }
        private string valueAsString(object value)
        {
            if (value is List<object>){
                List<string> result = new List<string>();
                foreach (object item in ((List < object>)value)){
                    result.Add(this.valueAsString(item));
                }
                return string.Join("", result);
            }
            if (value == null)
            {
                return "";
            }
            if (value is TypedData)
            {
                switch (((TypedData)value).type)
                {
                    case "bullet":
                        return ((TypedData)value).bullet + this.valueAsString(((TypedData)value).parts);

                    case "missing":
                        return ((TypedData)value).missingValue;

                    case "list":
                        // return the value of the first item 
                        return this.valueAsString(((TypedData)value).list[0]);

                    case "date":
                        DateTime dt;
                        if (!DateTime.TryParse(((TypedData)value).dateString, out dt)){
                        	return ((TypedData)value).dateString; // put out the original value 
                        } else if (((TypedData)value).format == null){ 
                        	return dt.ToShortDateString(); /// put out local format 
                        } else {
                            string dtString = dt.ToString(MomentJSConverter.GenerateCSharpFormatString(((TypedData)value).format + " "));
                            return dtString.Substring(0, dtString.Length - 1);
                        } 

                }
            }
            return value.ToString();
        }
        private bool isScalar(object value)
        {
            if (value != null && !(value is TypedData || value is List<object>))
            {
                return true;
            }
            return false;
        }
        private void addToOutput(string textLines, ComposeOutput output)
        {
            List<string> lines = output.lines;
            string[] arText = textLines.Split('\n');
            for (int i = 0; i < arText.Length; i++)
            {
                string text = arText[i];
                if (i == 0 && output.skipping)
                {
                    if (arText.Length == 1)
                    {
                        return; // no carriage return, so continue skipping 
                    }
                    else
                    {
                        output.skipping = false; // done with skipping 
                    }
                }
                else
                {
                    if (output.mode == 1)
                    { // only handle bullets on the final composition
		    	    string bulletMode = annotations.ContainsKey("bulletMode") ? (string)annotations["bulletMode"] : "implicit";
                        if (new Regex(@"^[ \t]*\x01\{\.\}").IsMatch(text))
                        {
                            // there is a bullet in the text 
                            string indent = Regex.Replace(text, @"^([ \t]*).*$", "$1");
                            output.bulletIndent = this.bulletIndent == null ? null : this.bulletIndent.clone();
                            object bulletObject = output.bullets[Regex.Replace(text, @"^([ \t]*\x01\{\.\}).*$", "$1")];
                            if (bulletObject == null)
                            {
                                // this could be a strange case where the bullet is on the first line of a new indented subtemplate, so pick the shortest bullet
                                List<string> keys = output.bullets.Keys.ToList<string>();
                                keys.Sort((a, b) => (a.Length > b.Length) ? 1 : -1);
                                if (keys.Count > 0)
                                {
                                    bulletObject = output.bullets[keys[0]];
                                }
                            }
                            if (bulletObject == null)
                            {
                                lines.Add("ERROR computing bullet"); // should never happen TODO: raise exception? 
                            }
                            else
                            {
                            List<string> bulletStyles = null;
                            if (this.annotations.ContainsKey("bulletStyles"))
                            {
                                bulletStyles = (List<string>)this.annotations["bulletStyles"];
                            }
                            this.bulletIndent = new BulletIndent(indent, this.bulletIndent, ((TypedData)bulletObject).level, bulletStyles);
                            }
                            text = Regex.Replace(text, @"[ \t]*\x01\{\.\}", indent + (this.bulletIndent != null ? this.bulletIndent.getBullet() : ""));
                        }
                        else if (this.bulletIndent != null && new Regex(@"\S").IsMatch(text) && bulletMode == "implicit")
			{
                            // there is a non-bulleted line in the output; see if it should reset bulleting levels because it is less indented then the bullet(s)
                            string nextLineIndent = Regex.Replace(text, @"^([ \t]*).*$", "$1"); // TODO: Should this be an option? 
                            while (this.bulletIndent != null && this.bulletIndent.indent.Length > nextLineIndent.Length)
                            {
                                this.bulletIndent = this.bulletIndent.parent;
                            }
                        }
                    }
                    else if (new Regex(@"^[ \t]*\x01\{\.\}").IsMatch(text))
                    {
                        // during mode 0, capture the unique bullets
                        string bullet = Regex.Replace(text, @"^([ \t]*\x01\{\.\}).*$", "$1");
                        output.bullets[bullet] = new TypedData("bullet", length: bullet.Length); 
                        if (lines[lines.Count - 1] != "")
                        {
                            // bullets must start on a new line 
                            lines.Add("");
                        }
                    }
                    lines[lines.Count - 1] += text;
                    if (i < (arText.Length - 1))
                    {
                        lines.Add("");
                    }
                }
            }
        }
        private string decodeApostrophe(string value){
            return  Regex.Replace(Regex.Replace(Regex.Replace(Regex.Replace(value, @"\\n","\n"), @"\\'","'"), @"\\\\","\\"),@"\\\/","/"); 
        }
        private string decodeQuote(string value, ParserRuleContext ctx)
        {
            // using the JSON parser to unescape the string 
            try
            {
                Dictionary<string, object> tempJson = (Dictionary<string, object>)JsonSupport.Deserialize(@"{""data"":""" + value + @"""}");
                return (string)tempJson["data"];
            }
            catch (Exception e)
            {
                ///this.syntaxError('Invalid quote literal', ctx); 
                return "";
            }
        }

        /*
        syntaxError(msg, ctx){
            Debug.Write(msg);
            let offset = this.getOffsetsFromProcessedSubtemplates(this.subtemplateLevel);
            let startColumnOffset = ctx.start.line == 1 ? offset.columnOffset : 0;
            let stopColumnOffset = ctx.stop.line == 1 ? offset.columnOffset : 0;
            this.errors.push(new Error(ctx.start.line + offset.lineOffset, ctx.stop.line + offset.lineOffset, ctx.start.column + 1 + startColumnOffset, ctx.stop.column + 1 + stopColumnOffset, msg));
        }
        getOffsetsFromProcessedSubtemplates(subtemplateLevel){
            // this routine navigates through the output of processSubtemplates to find the locations in the editor of subtemplates
            // it tries to find the longest qualified level for which it can find the subtemplate named at the lowest level
            let lineOffset = 0;
            let columnOffset = 0;
            let processed = processedSubtemplates;
            if (subtemplateLevel != ''){
                let levels = subtemplateLevel.split('.');
                while (levels.length > 0){
                    for (let iLevel = 0; iLevel < levels.length; iLevel++){
                        processed = processed.subtemplates == null ? null : processed.subtemplates[levels[iLevel]];
                        if (processed != null){
                            lineOffset += (processed.line - 1);
                            columnOffset = processed.column;
                            if (iLevel == (levels.length - 1)){
                                levels = []; // all done
                            }
                        } else {
                            // this level was not found.  Eliminate the one level up and try again
                            levels.splice(levels.length - 2, 1);
                            if (levels.length != 0){
                                lineOffset = 0;
                                columnOffset = 0;
                                processed = processSubtemplates;
                            }
                            break;
                        }
                    }
                }
            }
            return {lineOffset: lineOffset, columnOffset: columnOffset};
        }
        encodeHTML (str) {
          const replacements = {
              ' ' : '&nbsp;',
              '¢' : '&cent;',
              '£' : '&pound;',
              '¥' : '&yen;',
              '€' : '&euro;', 
              '©' : '&copy;',
              '®' : '&reg;',
              '<' : '&lt;', 
              '>' : '&gt;',  
              '"' : '&quot;', 
              '&' : '&amp;',
              '\'' : '&apos;'
          };
          return str.replace(/[\u00A0-\u9999<>\&''""]/gm, (c)=>replacements[c] ? replacements[c] : '&#' + c.charCodeAt(0) + ";");
        }
        encodeXML (str) {
          const replacements = {
              '<' : '&lt;', 
              '>' : '&gt;',  
              '"' : '&quot;', 
              '&' : '&amp;',
              '\'' : '&apos;'
          };
          return str.replace(/[<>=&']/gm, (c)=>replacements[c]);
        }
    }

    interface TextTemplateVisitor {
        (source: string, subString: string): boolean;
    }

    class Error {
        startLine: number;
        endLine: number;
        startCol: number;
        endCol: number;
        message: string;

        constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string) {
            this.startLine = startLine;
            this.endLine = endLine;
            this.startCol = startCol;
            this.endCol = endCol;
            this.message = message;
        }

    }

    class CollectorErrorListener extends error.ErrorListener {

        private errors : Error[] = []

        constructor(errors: Error[]) {
            super()
            this.errors = errors
        }

        syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
            var endColumn = column + 1;
            if (offendingSymbol._text !== null) {
                endColumn = column + offendingSymbol._text.length;
            }
            this.errors.push(new Error(line, line, column, endColumn, msg));
        }

    }
    class RelocatingCollectorErrorListener extends CollectorErrorListener {
        private _line : number
        private _column : number;
        constructor(errors: Error[], line : number, column : number){
            super(errors);
            this._line = line; // zero origined
            this._column = column;
        }
        syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
            super.syntaxError(recognizer, offendingSymbol, line + this._line, line == 1 ? (column + this._column) : column, msg, e);
        }
    }

    function createLexer(input: String) {
        const chars = new InputStream(input);
        const lexer = new TextTemplateLexer(chars);

        lexer.strictMode = false;
        return lexer;
    }

    function parseTemplate(input, listeners? : ConsoleErrorListener[]){
        const lexer = createLexer(input);
        if (listeners != null){
            lexer.removeErrorListeners();
            lexer.addErrorListener(listeners[0]);
        }
        const parser = createParserFromLexer(lexer);
        if (listeners != null){
            parser.removeErrorListeners();
            parser.addErrorListener(listeners[1]);
        }
        parser._errHandler = new TextTemplateErrorStrategy();
        let tree = parser.compilationUnit();
        if (/^[ \t]*\/\//.test(input) && tree.children[0].getText() == '\n'){
            // this is a HACK to remove the new line resulting from a comment at the beginning of a template
            // it would not be necessary if ANTLR had a BOF condition like the EOF
            tree.children.splice(0, 1); // remove the comment element
        }
        return tree;
    }
    */
        // processSubtemplates uses the lexer to tokenize a template string in order to find and extract subtemplates from the subtemplate section
        // It returns an object containing the input without the subtemplate section and a map of the subtemplate objects keyed by the name and 
        // containing the text plus the line/column where the subtemplate was found
        // The routine calls itself recursively to find subtemplates with the subtemplates
        private void processSubtemplates(string input, int lineOffset, out string processedInput, out Dictionary<string, Subtemplate> processedSubtemplates)
        {
            if (!input.Contains("\nSubtemplates:")){ 
                processedSubtemplates = new Dictionary<string, Subtemplate>();
                processedInput = input;
                return;
            }
            Dictionary<string, Subtemplate> subtemplates = new Dictionary<string, Subtemplate>();
            string newInput = "";
            List<TokenRepresentation> tokenArray = getTokensWithSymbols(input);
            bool bFound = false;
            for (int iToken = 0; iToken < tokenArray.Count; iToken++)
            {
                TokenRepresentation tokenObject = tokenArray[iToken];
                string tokenName = tokenObject.name;
                if (tokenName == "SUBTEMPLATES")
                {
                    int numberBlankLines = tokenObject.text.Split(new[] { "\nSubtemplates:" }, StringSplitOptions.None)[0].Split('\n').Length; // computes the number of new lines before 'Subtemplates:';
                    bFound = true;
                    newInput = input.Substring(0, tokenObject.start);
                    bool bExtractingSubtemplates = true;
                    while (bExtractingSubtemplates)
                    {
                        List<TokenRepresentation> parts = new List<TokenRepresentation>();
                        for (++iToken; parts.Count < 5 && iToken < tokenArray.Count; iToken++)
                        {
                            if (tokenArray[iToken].name != "COMMENT" && tokenArray[iToken].name != "NL" && tokenArray[iToken].name != "SPACES")
                            {
                                parts.Add(tokenArray[iToken]);
                            }
                        }
                        if (parts.Count == 5 && parts[0].name == "LBRACE" && parts[1].name == "POUND" && parts[2].name == "IDENTIFIER" && parts[3].name == "COLON" && parts[4].name == "LBRACKET" && parts[2].text.Length > 0)
                        {
                            iToken = findMatching("LBRACKET", tokenArray, iToken - 1);
                            for (; parts.Count < 7 && iToken < tokenArray.Count; iToken++)
                            {
                                if (tokenArray[iToken].name == "METHODNAME")
                                {
                                    iToken = findMatching("LP", tokenArray, iToken);
                                }
                                else if (tokenArray[iToken].name != "COMMENT" && tokenArray[iToken].name != "NL" && tokenArray[iToken].name != "SPACES")
                                {
                                    parts.Add(tokenArray[iToken]);
                                }
                            }
                            if (parts.Count > 6 && parts[5].name == "RBRACKET" && parts[6].name == "RBRACE")
                            {
                                string text = input.Substring(parts[4].start, parts[6].start - parts[4].start);
                                Dictionary<string, Subtemplate> subSubtemplates = null; // subtemplates in the subtemplate 
                                if (text.Contains("\nSubtemplates:"))
                                {
                                    string subProcessedInput;
                                    processSubtemplates(input.Substring(parts[4].start + 1, parts[5].start), parts[4].line + lineOffset - 1, out subProcessedInput, out subSubtemplates);// process the text between the brackets 
                                    // reconstruct the text without the subtemplates				    
                                    text = "[" + subProcessedInput + input.Substring(parts[5].start, parts[6].start - parts[5].start);
                                }
                                subtemplates["#" + parts[2].text] = new Subtemplate(text: text, line: parts[0].line, column: parts[4].column, endLine: parts[6].line, endColumn: parts[6].column, subtemplates: subSubtemplates);
                            } else {
                                newInput += "\nERROR extracting subtemplate \"" + parts[2].text + "\"" + " missing right bracket or brace";
                                Debug.Write("ERROR extracting subtemplate \"" + parts[2].text + "\"" + " missing right bracket or brace");
                            }
                        } else {
                            if (parts.Count > 2 && parts[1].name == "POUND" && parts[2].name == "IDENTIFIER" && parts[2].text.Length > 0){
                                newInput += "\nERROR extracting subtemplate \"" + parts[2].text + "\"" + " invalid subtemplate syntax";
                                Debug.Write("ERROR extracting subtemplate \"" + parts[2].text + "\"" + " invalid subtemplate syntax");
                            } else {
                                newInput += "\nERROR extracting subtemplates";
                                Debug.Write("ERROR extracting subtemplates");
                            }
                        }
                        while (iToken < tokenArray.Count && (tokenArray[iToken].name == "COMMENT" || tokenArray[iToken].name == "NL" || tokenArray[iToken].name == "SPACES"))
                        {
                            iToken++;
                        }
                        if (iToken < tokenArray.Count && tokenArray[iToken].name == "LBRACE")
                        {
                            iToken--; // get ready to extract another subtemplate 
                        }
                        else
                        {
                            bExtractingSubtemplates = false;
                            if (iToken < tokenArray.Count)
                            {
                                newInput += "\nERROR extraneous input (" + tokenArray[iToken].name + ") at the end of the subtemplates";
                                Debug.Write("ERROR extraneous input (" + tokenArray[iToken].name + ") at the end of the subtemplates");
                            }
                        }
                    }
                } else if (tokenName == "LBRACE")
                {
                    iToken = findMatching(tokenName, tokenArray, iToken);
                }
            }
            processedInput = (bFound ? newInput : input);
            processedSubtemplates = subtemplates; 
            return; 
        }
        private List<TokenRepresentation> getTokensWithSymbols(string input)
        {
            AntlrInputStream chars = new AntlrInputStream(input);
            TextTemplateLexer lexer = new TextTemplateLexer(chars);
            //lexer.strictMode = false; 
            CommonTokenStream tokens = new CommonTokenStream(lexer);
            tokens.Fill();
            List<Antlr4.Runtime.IToken> treeTokens = (List<Antlr4.Runtime.IToken>)tokens.GetTokens();
            Dictionary<string, int> tokenTypeMap = (Dictionary<string, int>)new TextTemplateParser(null).TokenTypeMap;
            Dictionary<int, string> symbolicNames = new Dictionary<int, string>();
            foreach (string key in tokenTypeMap.Keys)
            {
                symbolicNames[tokenTypeMap[key]] = key;
            }
            List<TokenRepresentation> tokenArray = new List<TokenRepresentation>();
            if (input.Length == 0)
            {
                return new List<TokenRepresentation>();
            }
            foreach (var e in treeTokens)
            {
                if (e.Type != -1)
                {
                    tokenArray.Add(new TokenRepresentation(symbolicNames[e.Type], input.Substring(e.StartIndex, e.StopIndex - e.StartIndex + 1), e.StartIndex, e.StopIndex, e.Column, e.Line));
                }
            }
            return tokenArray;
        }
        public class Subtemplate
        {
            public string text;
            public int line;
            public int column;
            public int endLine; 
            public int endColumn;
            public Dictionary<string, Subtemplate> subtemplates;
            public Subtemplate(string text = "", int line = 0, int column = 0, int endLine = 0, int endColumn = 0, Dictionary<string, Subtemplate> subtemplates = null)
            {
                this.text = text;
                this.line = line;
                this.column = column;
                this.endLine = endLine;
                this.endColumn = endColumn;
                this.subtemplates = subtemplates;
            }
        }
        public class TokenRepresentation
        {
            public string name;
            public string text;
            public int start;
            public int stop;
            public int column;
            public int line;
            public TokenRepresentation(string name, string text, int start, int stop, int column, int line)
            {
                this.name = name;
                this.text = text;
                this.start = start;
                this.stop = stop;
                this.column = column;
                this.line = line;
            }
        }
        public class ComposeOutput
        {
            public List<string> lines;
            public bool skipping;
            public int mode;
            public Dictionary<string, object> bullets;
            public BulletIndent bulletIndent;
            public ComposeOutput(List<string> lines = null, bool skipping = false, int mode = 0, Dictionary<string, object> bullets = null)
            {
                this.lines = lines;
                this.skipping = skipping;
                this.mode = mode;
                this.bullets = bullets;
            }
        }
        private int findMatching(string tokenName, List<TokenRepresentation> tokenArray, int iTokenIn)
        {
            string match = "";
            switch (tokenName)
            {
                case "LBRACE":
                    match = "RBRACE";
                    break;
                case "LBRACKET":
                    match = "RBRACKET";
                    break;
                case "LP":
                    match = "RP";
                    break;
                case "APOSTROPHE":
                    match = "APOSTROPHE";
                    break;
                case "QUOTE":
                    match = "QUOTE";
                    break;
            }
            for (int iToken = iTokenIn + 1; iToken < tokenArray.Count; iToken++)
            {
                TokenRepresentation tokenObject = tokenArray[iToken];
                tokenName = tokenObject.name;
                if (tokenName == match)
                {
                    return iToken;
                }
                if (tokenName == "LBRACE" || tokenName == "LBRACKET" || tokenName == "LP" || tokenName == "APOSTROPHE" || tokenName == "QUOTE")
                {
                    iToken = findMatching(tokenName, tokenArray, iToken);
                }
            }
            return 0;
        }
        public string interpret(string input, Dictionary<string, object> options = null)
        {
            this.options = options;
            //callback({ type: 'status', status: 'parsing...'});
            ///let errors : Error[] = [];
            Dictionary<string, Subtemplate> processedSubtemplates = null;
            if (processedSubtemplates == null)
            {  // non-null implies being called again
                processSubtemplates(input, 0, out input, out processedSubtemplates);
            }
            TextTemplateParser.CompilationUnitContext tree = null;
            if (parsedTemplates.ContainsKey(input))
            {
                tree = parsedTemplates[input];
            }
            else
            {
                tree = parseTemplate(input);
                parsedTemplates[input] = tree;
                //parsedTokens[input] = tokensAsString(tree); 
            }
            //callback({ type: 'status', status: 'interpolating...'});
            ///var visitor = new TextTemplateVisitor();
            /*
            // clone to allow interpreter errors to be undone
            errors.forEach((error)=>{
                visitor.errors.push(error);
            });
            */
            this.input = input;
            ///visitor.bulletIndent = null; // start bulleting from 0,0
            // parse and cache subtemplates found by processSubtemplates and add the text to the visitor (a TextTemplateVisitor instance)
            foreach (string key in processedSubtemplates.Keys)
            {
                Subtemplate subtemplateObject = processedSubtemplates[key];
                parseSubtemplates(subtemplateObject, key, subtemplateObject.line - 1, subtemplateObject.column);
            }
            object result = VisitCompilationUnit(tree);
            if (result != null && !(result is List<object>)) 
            {
                List<object> resultList = new List<object>();
                resultList.Add(result);
            }
            if (result == null)
            {
                return null;
            }
            return (string)compose(result, 1);
            /*
            if (result != null && !Array.isArray(result) && typeof result == 'object')
            {
                result = [result];
            }
            if (Array.isArray(result))
            {
                result = visitor.compose(result, 1);
            }
            let urlsBeingLoaded = [];
            Object.keys(urls).forEach((key: string) =>{
                if (!key.startsWith('/') && (key.split('//').length != 2 || key.split('//')[1].indexOf('/') == -1))
                {
                    delete urls[key] // clean up incomplete urls
                }
                else
                {
                    if (!urls[key].data)
                    {
                        urlsBeingLoaded.push(key);
                        if (!urls[key].loading)
                        {
                            let urlPrefix = (key.startsWith('/') && options && options['urlPrefix']) ? options['urlPrefix'] : '';
                            urls[key].loading = true
                            console.debug('loading ' + urlPrefix + key);
                            callback({
                            type: 'url'
                                , path: urlPrefix + key
                                , urls: urls
                                , success: (data) => {
                                    urls[key].data = data;
                                    try
                                    {
                                        interpret(input, callback, options);
                                    }
                                    catch (e)
                                    {
                                        callback({ type: 'result', result: 'EXCEPTION ' + e.stack, errors:[]});
                                    }
                                }
                            });
                        }
                    }
                }
            });
            if (urlsBeingLoaded.length > 0)
            {
                callback({ type: 'status', status: (urlsBeingLoaded.length == 1 ? urlsBeingLoaded[0] + '...' : (':\n  ' + (urlsBeingLoaded.join('\n  '))))});
            }
            else
            {
                callback({ type: 'result', result: result, errors: visitor.errors});
                processedSubtemplates = null; // remove memory of the previous template
            }
    */        
        }

            // NOTE: the following is only necessary because of a serious performance issue in the ANTLR4 parser (at least the Javascript version)
            // It the issue is ultimately addressed, this code can be simplified by removing calls to processSubtemplates and parseSubtemplates and letting visitSubtemplates extract the subtemplates
            //
            // parseSubtemplates receives a subtemplate object provided by processSubtemplates plus the key
            // If the key is supplied, it saves the template text in the global subtemplates map.
            // The routine parses the template text, caching the resulting parse tree in the global map of parsed templates.
            // Note that the parsedTemplates map is keyed by the text, not the template names, which might be scoped and duplicated with different text
            // After parsing the subtemplate text, the routine calls itself recursively to parse any subtemplates within 
        public void parseSubtemplates(Subtemplate subtemplate, string key, int line, int column)
        {
            string input = subtemplate.text;
            this.subtemplates[key] = input; // global dictionary of loaded subtemplates 
                                            // The RelocatingCollectorErrorListener relocates errors based on where the subtemplate is positioned in the editor 
            var tree = parseTemplate(input);
            parsedTemplates[input] = tree; // cache the parsed text 
            if (subtemplate.subtemplates != null)
            {
                // recursively parse local subtemplates found in the subtemplates useing a key qualified by the template name in which it was found 
                foreach (string subtemplateKey in subtemplate.subtemplates.Keys)
                {
                    parseSubtemplates(subtemplate.subtemplates[subtemplateKey], key + "." + subtemplateKey, subtemplate.line - 1 + line, column);
                }
            }
        }

        public TextTemplateParser.CompilationUnitContext parseTemplate(string input)
        {
            AntlrInputStream inputStream = new AntlrInputStream(input);
            TextTemplateLexer lexer = new TextTemplateLexer(inputStream);
            CommonTokenStream commonTokenStream = new CommonTokenStream(lexer);
            TextTemplateParser parser = new TextTemplateParser(commonTokenStream);
            TextTemplateParser.CompilationUnitContext tree = parser.compilationUnit();
            if (Regex.IsMatch(input, @"^[ \t] *\/\/"))
            {
                // this is a HACK to remove the new line resulting from a comment at the beginning of a template 
                // it would not be necessary if ANTLR had a BOF condition like the EOF 
                tree.children = tree.children.Skip(1).ToArray(); // remove the comment element 
            }
            return tree;
        }
        /*
        function getTokens(input: String) : Token[] {
            return createLexer(input).getAllTokens()
        }

        function createParser(input) {
            const lexer = createLexer(input);

            return createParserFromLexer(lexer);
        }

        function createParserFromLexer(lexer) {
            const tokens = new CommonTokenStream(lexer);
            return new TextTemplateParser(tokens);
        }

        function parseTree(input) {
            const parser = createParser(input);

            return parser.compilationUnit();
        }

        export function parseTreeStr(input) {
            const lexer = createLexer(input);
            lexer.removeErrorListeners();
            lexer.addErrorListener(new ConsoleErrorListener());

            const parser = createParserFromLexer(lexer);
            parser.removeErrorListeners();
            parser.addErrorListener(new ConsoleErrorListener());

            const tree = parser.compilationUnit();

            return tree.toStringTree(parser.ruleNames);
        }
        function getSubtemplatePositions(positions : any[], processed, lineOffset : number, level : string){
            if (processed.subtemplates != null){
                Object.keys(processed.subtemplates).forEach((key)=>{
                    let subtemplate = processed.subtemplates[key];
                positions.push({name: level + key, line: subtemplate.line + lineOffset, column: subtemplate.column, endLine:subtemplate.endLine + lineOffset, endColumn: subtemplate.endColumn});
                    getSubtemplatePositions(positions, subtemplate, lineOffset + subtemplate.line - 1, key + '.' + level);
                });
            }
        }
        let urls = {};

        function tokensAsString(ctx){
            let treeTokens : CommonToken[] = ctx.parser.getTokenStream().getTokens(ctx.getSourceInterval().start,ctx.getSourceInterval().stop)
            let symbolicNames : string[] = ctx.parser.symbolicNames
            let parsed = '';
            try{
                for (let e of treeTokens){
                    if (e.type != -1) {
                        parsed += symbolicNames[e.type] + '(' + e.text + ') ';
                    }
                }
            } catch(err) {
                Debug.Write('Error in tokensAsString: ' + err);
                parsed = '*****ERROR*****';
            }
            return parsed.replace(/\n/g,'\\n').replace(/\t/g,'\\t');
        }
    */
    }
}
