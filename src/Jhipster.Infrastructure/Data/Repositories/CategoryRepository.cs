using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;
using System;
using Nest;
using AutoMapper;
using Jhipster.Infrastructure.Data;

using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Dto;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        private static Uri node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");
        private static Nest.ConnectionSettings setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9", "4cdkz0o14").DefaultIndex("birthdays");
        private static ElasticClient elastic = new ElasticClient(setting);
        protected readonly IBirthdayService _birthdayService;
        private readonly IRulesetService _rulesetService;
        private readonly IMapper _mapper;
        public CategoryRepository(IUnitOfWork context, IBirthdayService birthdayService, IRulesetService rulesetService, IMapper mapper) : base(context)
        {
            _birthdayService = birthdayService;
            _rulesetService = rulesetService;
            _mapper = mapper;
        }


        public override async Task<Category> CreateOrUpdateAsync(Category category)
        {
            bool exists = await Exists(x => x.Id == category.Id);

            if (category.Id != 0 && exists)
            {
                Update(category);
            }
            else
            {
                _context.AddOrUpdateGraph(category);
            }
            return category;
        }
        public override async Task<IPage<Category>> GetPageFilteredAsync(IPageable pageable, string queryJson)
        {
            long id = 0;
            List<Category> content = new List<Category>();
            if (!queryJson.StartsWith("{"))
            {
                var result = await elastic.SearchAsync<Aggregation>(q => q
                    .Size(0).Index("birthdays").Aggregations(agg => agg.Terms(
                        "distinct", e =>
                            e.Field("categories.keyword").Size(10000)
                        )
                    )
                );
                Dictionary<string, Category> allCategories = new Dictionary<string, Category>();
                ((BucketAggregate)result.Aggregations.ToList()[0].Value).Items.ToList().ForEach(it =>
                {
                    KeyedBucket<Object> kb = (KeyedBucket<Object>)it;
                    string categoryName = kb.KeyAsString != null ? kb.KeyAsString : (string)kb.Key;
                    allCategories.Add(categoryName, new Category
                    {
                        CategoryName = categoryName,
                        Id = ++id
                    });
                });
                Birthday birthday = await _birthdayService.FindOne(queryJson);
                if (birthday.Categories != null)
                {
                    birthday.Categories.ForEach(c =>
                    {
                        allCategories[c.CategoryName].selected = true;
                    });
                }
                allCategories.Keys.ToList().OrderBy(k => k).ToList().ForEach(k =>
                {
                    content.Add(allCategories[k]);
                });
                return new Page<Category>(content, pageable, content.Count);
            }
            var categoryRequest = JsonConvert.DeserializeObject<Dictionary<string, object>>(queryJson);
            View view = new View();
            string aggregationKey = "";
            string query = "";
            if (categoryRequest["view"] == null)
            {
                // default
                content.Add(new Category
                {
                    CategoryName = "(Uncategorized)",
                    selected = false,
                    notCategorized = true,
                    Id = ++id
                });
            }
            else
            {
                view = JsonConvert.DeserializeObject<View>(categoryRequest["view"].ToString());
                if (view.focus != null){
                    if (view.topLevelView != null){
                        List<Birthday> topLevelFocus = view.topLevelView.focus;
                        foreach(var bday in topLevelFocus){
                            if ((bday.Fname + " " + bday.Lname) == view.topLevelCategory){
                                content.Add(new Category
                                {
                                    CategoryName = "The " + bday.Fname + " " + bday.Lname + " article",
                                    focusId = bday.Id,
                                    focusType = FocusType.FOCUS,
                                    Id = ++id
                                });                                
                                content.Add(new Category
                                {
                                    CategoryName = "References IN the " + bday.Fname + " " + bday.Lname + " article",
                                    focusId = bday.Id,
                                    focusType = FocusType.REFERENCESFROM,
                                    Id = ++id
                                });
                                List<Birthday> referencesTo = await _birthdayService.GetReferencesTo(bday.Id);
                                if (referencesTo.Count > 0){
                                    content.Add(new Category
                                    {
                                        CategoryName = "References TO the " + bday.Fname + " " + bday.Lname + " article",
                                        focusId = bday.Id,
                                        focusType = FocusType.REFERENCESTO,
                                        Id = ++id                      
                                    });
                                }
                            }
                        }
                    } else {
                        foreach (Birthday bday in view.focus){
                            content.Add(new Category
                            {
                                CategoryName = bday.Fname + " " + bday.Lname,
                                focusId = bday.Id,
                                Id = ++id
                            });
                        }
                    }
                } else if (view.field.StartsWith("ruleset")){
                    // special view of rulesets
                    var result = await _rulesetService.FindAll(pageable);{}
                    List<RulesetDto> lstRuleset = result.Content.Select(entity => _mapper.Map<RulesetDto>(entity)).ToList();
                    SortedDictionary<string, RulesetDto> dictRuleset = new SortedDictionary<string, RulesetDto>();
                    lstRuleset.ForEach((r)=>{
                        dictRuleset.Add(r.Name, r);
                    });
                    if (view.field == "ruleset"){
                        dictRuleset.Keys.ToList().ForEach((k)=>{
                            Dictionary<string, object> dictCategory = JsonConvert.DeserializeObject<Dictionary<string, object>>(dictRuleset[k].JsonString);
                            content.Add(new Category
                            {
                                CategoryName = dictRuleset[k].Name,
                                description = queryAsString(dictCategory),
                                jsonString = dictRuleset[k].JsonString,
                                Id = ++id
                            });
                        });
                    } else {
                        // ruleset2
                        List<object> usedBy = new List<object>();
                        List<object> uses = new List<object>();
                        lstRuleset.ForEach((r)=>{
                            Dictionary<string, object> categoryRequest = JsonConvert.DeserializeObject<Dictionary<string, object>>(r.JsonString);
                            SortedDictionary<string, object> dictRulesetUses = new SortedDictionary<string, object>();
                            RulesetUses(categoryRequest, dictRulesetUses);                            
                            if (r.Name == view.topLevelCategory){
                                content.Add(new Category
                                {
                                    CategoryName = "Query " + view.topLevelCategory,
                                    description = queryAsString(categoryRequest),
                                    jsonString = r.JsonString,
                                    Id = ++id
                                });
                                dictRulesetUses.Keys.ToList().ForEach((k=>{
                                    uses.Add(dictRulesetUses[k]);
                                }));
                            } else {
                                if (dictRulesetUses.ContainsKey(view.topLevelCategory)){
                                    usedBy.Add(categoryRequest);
                                }
                            }
                        });
                        uses.ForEach((u)=>{
                            Dictionary<string, object> ruleset = (Dictionary<string, object>)u;
                            content.Add(new Category
                            {
                                CategoryName = "Query " + (string)ruleset["name"] + ", which is used by " + "query " + view.topLevelCategory,
                                description = queryAsString(ruleset),
                                jsonString = JsonConvert.SerializeObject(ruleset),
                                Id = ++id
                            });                            
                        });
                        usedBy.ForEach((u)=>{
                            Dictionary<string, object> ruleset = (Dictionary<string, object>)u;
                            content.Add(new Category
                            {
                                CategoryName = "Query " + (string)ruleset["name"] + ", which uses " + "query " + view.topLevelCategory,
                                description = queryAsString(ruleset),
                                jsonString = JsonConvert.SerializeObject(ruleset),
                                Id = ++id
                            });                            
                        });                        
                    }
                } else {
                    aggregationKey = view.aggregation;
                    query = view.query + ((string)categoryRequest["query"] != "" ? " AND " + categoryRequest["query"] : "");
                    if (view.topLevelView != null){
                        View topLevelView = view.topLevelView;
                        string categoryClause = "";
                        if (view.topLevelCategory != null && topLevelView.field != null){
                            if (topLevelView.categoryQuery != null){
                                categoryClause = view.categoryQuery.Replace("{}", view.topLevelCategory);
                            } else {
                                categoryClause = view.topLevelCategory == "-" ? "-" + topLevelView.field + ":*" : topLevelView.field + ":\"" + view.topLevelCategory + "\"";
                            }
                            query = categoryClause + " AND (" + query + ")";
                        }
                    }                    
                    var result = await elastic.SearchAsync<Aggregation>(q => q
                        .Size(0)
                        .Index("birthdays")
                        .Aggregations(agg => agg.Terms(
                            "distinct", e =>
                                (view != null && view.script != null
                                    ? e.Script(view.script)
                                    : e.Field(aggregationKey)
                                )
                                .Size(10000)
                            )
                        )
                        .QueryOnQueryString(query)
                    );
                    ((BucketAggregate)result.Aggregations.ToList()[0].Value).Items.ToList().ForEach(it =>
                    {
                        KeyedBucket<Object> kb = (KeyedBucket<Object>)it;
                        string categoryName = kb.KeyAsString != null ? kb.KeyAsString : (string)kb.Key;
                        if (Regex.IsMatch(categoryName, @"\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z"))
                        {
                            categoryName = Regex.Replace(categoryName, @"(\d{4,4})-(\d{2,2})-(\d{2,2})T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z", "$1-$2-$3");
                        }
                        content.Add(new Category
                        {
                            CategoryName = categoryName,
                            Id = ++id
                        });

                        var x = kb.Key;
                    });
                    content = content.OrderBy(cat => cat.CategoryName).ToList();
                    result = await elastic.SearchAsync<Aggregation>(q => q
                        .Size(0)
                        .Index("birthdays")
                        .QueryOnQueryString("-" + view.query)
                    );
                    if (result.Total > 0)
                    {
                        content.Add(new Category
                        {
                            CategoryName = "(Uncategorized)",
                            selected = false,
                            notCategorized = true
                        });
                    }
                }
            }
            return new Page<Category>(content, pageable, content.Count);
        }

        private void RulesetUses(Dictionary<string, object> dictRuleset, SortedDictionary<string, object> dictRulesetUses){
            if (dictRuleset.ContainsKey("rules")){
                List<Dictionary<string, object>> rules = ((Newtonsoft.Json.Linq.JArray)dictRuleset["rules"]).ToObject<List<Dictionary<string, object>>>();
                rules.ForEach((r)=>{
                    if (r.ContainsKey("name") && !dictRulesetUses.ContainsKey((string)r["name"])){
                        dictRulesetUses.Add((string)r["name"], (Dictionary<string, object>) r);
                    }
                    if (r.ContainsKey("rules")){
                        RulesetUses(r, dictRulesetUses);
                    }
                });
            }
        }

        private string queryAsString(Dictionary<string, object> query, bool bRecurse = false){
            string result = "";
            bool multipleConditions = false;
            Newtonsoft.Json.Linq.JArray ja = null;
            List<Dictionary<string, object>> rules = ((Newtonsoft.Json.Linq.JArray)query["rules"]).ToObject<List<Dictionary<string, object>>>();
            rules.ForEach((r)=>{
                if (result.Length > 0){
                    result += (' ' + ((string)query["condition"] == "and" ? "&" : "|") + ' ');
                    multipleConditions = true;
                }
                if (r.ContainsKey("condition")){
                    if (r.ContainsKey("name")){
                        result += (string)r["name"];
                    } else {
                        result += this.queryAsString((Dictionary<string, object>)r, rules.Count > 1); // note: if only one rule, treat it as a top level
                    }
                } else if (r.ContainsKey("field") && (string)r["field"] == "document" && r.ContainsKey("value")) { 
                    result += (string)r["value"];
                } else {
                    result += (string)r["field"];
                    result += (" " +  (string)r["operator"] + " ");
                    if (r.ContainsKey("value")) {
                        result += (string)r["value"];
                    }
                }
            });
            if (query.ContainsKey("not") && ((bool)query["not"])){
                result = "!(" + result + ")";
            } else if (bRecurse && multipleConditions){
                result = "(" + result + ")";
            }
            return result;            
        }
        class Aggregation
        {
            string key { get; set; }
            int doc_count { get; set; }
            object[] distinct { get; set; }
        }
    }
}
