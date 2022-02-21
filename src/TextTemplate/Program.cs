using System;
using System.IO;
using System.Text;
using Antlr4.Runtime;
using System.Diagnostics;
using System.Collections.Generic;
using System.Reflection;

namespace TextTemplate
{
	internal static class Program
	{
		private static void Main(string[] args)
		{
			//try
			//{
			string input;
			//input = @"{'{""hello"":""world""}':[{""hello""} {hello}]}";

         input = @"{'{
  ""condition"": ""and"",
  ""rules"": [
    {
      ""field"": ""age"",
      ""operator"": "">="",
      ""entity"": ""physical"",
      ""value"": 18
    },
    {
      ""field"": ""birthday"",
      ""operator"": ""<"",
      ""value"": ""2018-11-20"",
      ""entity"": ""nonphysical""
    },
    {
      ""condition"": ""or"",
      ""rules"": [
        {
          ""field"": ""gender"",
          ""operator"": ""="",
          ""entity"": ""physical"",
          ""value"": ""m""
        },
        {
          ""field"": ""school"",
          ""operator"": ""is null"",
          ""entity"": ""nonphysical""
        },
        {
          ""field"": ""notes"",
          ""operator"": ""="",
          ""entity"": ""nonphysical"",
          ""value"": ""Hi""
        }
      ]
    },
    {
      ""field"": ""age"",
      ""operator"": ""=""
    }
  ]
}':#build}
Subtemplates:
{#build:[{#condition}].@MissingValue('')}
{#and:[{rules:[{field=>#operator,#condition}].Join( ' AND ')}]}
{#or:[{rules:[{field=>#operator,#condition}].Join(' OR ')}]}
{#operator:[{operator.Case('=',#equals,'>=',#gte,'<=',#lte,'>',#gt,'<',#lt,[{field} {operator} {value}])}]}
{#condition:[({condition.Case('and',#and,'or',#or)})]}
{#conditional:[>>{condition}<<]}
{#equals:[{field}:{'""'}{value}{'""'}]}
{#gte:[{field}:{'[""'}{value}{'""'} TO *{']'}]}
{#lte:[{field}:{'['}* TO {'""'}{value}{'""]'}]}
{#gt:[{field}:{'{""'}{value}{'""'} TO *{'}'}]}
{#lt:[{field}:{'{'}* TO {'""'}{value}{'""}'}]}
";
			input = input.Replace("\r", "");
			AntlrInputStream inputStream = new AntlrInputStream(input);
			TextTemplateLexer textTemplateLexer = new TextTemplateLexer(inputStream);
			CommonTokenStream commonTokenStream = new CommonTokenStream(textTemplateLexer);
			TextTemplateParser textTemplateParser = new TextTemplateParser(commonTokenStream);
			TextTemplateParser.CompilationUnitContext compilationUnitContext = textTemplateParser.compilationUnit();
			TextTemplateVisitor visitor = new TextTemplateVisitor();
			Func<string, string> urlCallback = url =>
			{
				string ret = "Bad Url";
				switch (url)
				{
					case "/data/people":
						ret = @"[
	{
	   ""firstName"": ""Doris""
	   ,""lastName"": ""Johnson""
		   ,""pets"": [
			  {
			 ""type"": ""dog""
			 ,""name"": ""Buddy""
		  },{
			 ""type"": ""lion""
			 ,""name"": ""Ralph""
		  },{
			 ""type"": ""tiger""
			 ,""name"": ""Stripes""
		  }
	   ]
	},
	{
	   ""firstName"": ""John""
	   ,""lastName"": ""Smith""
	   ,""pets"": [
		  {
			 ""type"": ""dog""
			 ,""name"": ""Toto""
		  },{
			 ""type"": ""cat""
			 ,""name"": ""Dolly""
		  },{
			 ""type"": ""zebra""
			 ,""name"": ""Stripes""
		  }
	   ]
	}
]";
						break;
					case "/data/events":
						ret = @"[
	{""start"": ""2020-05-20T19:00:00"", ""end"": ""2020-05-20T22:30:00"",""summary"": ""Dinner with Mom"", ""description"":""Dresscode: Elegant and ironed!"", ""location"": ""800 Howard St., San Francisco, CA 94103""}, 
	{""start"": ""2020-06-20T15:00:00"", ""end"": ""2020-06-22T15:30:00"",""summary"": ""Hotdog eating competition"", ""location"": ""43 Chapel Ave, Jersey City, NJ 07305""}, 
	{""start"": ""2020-05-28T10:00:00"", ""end"": ""2020-05-28T12:15:00"",""summary"": ""Vet"", ""description"":""Brush the dog's teeth"", ""location"": ""3771 Van Dyke Ave San Diego, CA 92105""}, 
	{""start"": ""2020-05-28T08:30:00"", ""end"": ""2020-05-28T10:00:00"",""summary"": ""Meet with Paul"", ""description"":""Discussion of future plans"", ""location"": ""1200 Railing St., Brunswick, Md.""}, 
	{""start"": ""2020-06-30T10:00:00"", ""end"": ""2020-06-30T11:30:00"",""summary"": ""Jogging class"", ""description"":""Bring your inhaler"", ""location"": ""3014 Rosalinda San Clemente, CA 92673""}
]";
						break;
				}
				return ret;
			};
            Dictionary<string, object> options = new Dictionary<string, object>();
            options["urlCallback"] = urlCallback;
			string result = visitor.interpret(input, options);
			Debug.Write(result + "\n");
			Console.Write(result + "\n");
		}
   }
   public static class Runner {
   
      public static string Interpolate(string templateName, string data){
         var assembly = typeof(TextTemplate.Runner).GetTypeInfo().Assembly;
         string[] names = assembly.GetManifestResourceNames();
         var stream = assembly.GetManifestResourceStream("TestTextTemplate.Resources.Templates." + templateName + ".template");
         using var sr = new StreamReader(stream);
         string input = sr.ReadToEnd();
         input = input.Replace("\r", "");
			Func<string, string> urlCallback = url =>
			{
				string ret = "Bad Url";
            if (url == "/data"){
               ret = data;
            }
            return ret;
			};
         Dictionary<string, object> options = new Dictionary<string, object>();
         options["urlCallback"] = urlCallback;         
         AntlrInputStream inputStream = new AntlrInputStream(input);
         TextTemplateLexer textTemplateLexer = new TextTemplateLexer(inputStream);
         CommonTokenStream commonTokenStream = new CommonTokenStream(textTemplateLexer);
         TextTemplateParser textTemplateParser = new TextTemplateParser(commonTokenStream);
         TextTemplateParser.CompilationUnitContext compilationUnitContext = textTemplateParser.compilationUnit();
         TextTemplateVisitor visitor = new TextTemplateVisitor();
         return visitor.interpret(input, options);
      }
	}
}
