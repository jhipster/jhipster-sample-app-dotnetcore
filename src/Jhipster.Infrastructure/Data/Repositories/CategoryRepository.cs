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
using Jhipster.Infrastructure.Data;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        private static Uri node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");
        private static Nest.ConnectionSettings setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9","4cdkz0o14").DefaultIndex("birthdays");
        private static ElasticClient elastic = new ElasticClient(setting);        
        protected readonly IBirthdayRepository _birthdayRepository;   
        public CategoryRepository(IUnitOfWork context, IBirthdayRepository birthdayRepository) : base(context)
        {
            _birthdayRepository = birthdayRepository;
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
        public override async Task<IPage<Category>> GetPageFilteredAsync(IPageable pageable, string queryJson){
            var categoryRequest = JsonConvert.DeserializeObject<Dictionary<string,object>>(queryJson);
            Dictionary<string, string> view = new Dictionary<string, string>();
            string aggregationKey = "";
            string query = "";  
            if (categoryRequest["view"] == null){
                // default
                view["aggregation"] = "categories.keyword";
                view["query"] = "categories:*";
                view["field"] = "categories";
            } else {
                view = JsonConvert.DeserializeObject<Dictionary<string,string>>(categoryRequest["view"].ToString());
            }
            aggregationKey = view["aggregation" ];
            query = view["query"] + ((string)categoryRequest["query"] != "" ? " AND " + categoryRequest["query"] : "");
            var result = await elastic.SearchAsync<Aggregation>(q => q
                .Size(0)
                .Index("birthdays")
                .Aggregations(agg => agg.Terms(
                    "distinct", e =>
                        (view != null && view.Keys.Contains("script") 
                            ? e.Script(view["script"]) 
                            : e.Field(aggregationKey)
                        )                   
                        .Size(10000)
                    )
                )
                .QueryOnQueryString(query)
            );
            long id = 0;
            List<Category> content = new List<Category>();            
            ((BucketAggregate)result.Aggregations.ToList()[0].Value).Items.ToList().ForEach(it=>{
                KeyedBucket<Object> kb = (KeyedBucket<Object>)it;
                string categoryName = kb.KeyAsString != null ? kb.KeyAsString : (string)kb.Key;
                if (Regex.IsMatch(categoryName, @"\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z")){
                    categoryName = Regex.Replace(categoryName, @"(\d{4,4})-(\d{2,2})-(\d{2,2})T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z","$1-$2-$3");
                }
                content.Add(new Category{
                    CategoryName = categoryName,
                    Id = ++id
                });

                var x = kb.Key;
            });
            /*
            IPage<Birthday> birthdayPage = await _birthdayRepository.GetPageFilteredAsync(pageable, query);

            Dictionary<string, bool> encountered = new Dictionary<string, bool>();
            ((List<Birthday>)birthdayPage.Content).ForEach(b=>{
                if (b.Categories != null){
                    b.Categories.ForEach(c =>{
                        if (!encountered.ContainsKey(c.CategoryName)){
                            content.Add(new Category{
                                CategoryName = c.CategoryName,
                                selected = b.Id == query,
                                Id = ++id // arbitrary id to distinguish rows
                            });
                            encountered[c.CategoryName] = true;
                        }
                    });
                }
            });
            */
            content = content.OrderBy(cat => cat.CategoryName).ToList();
            result = await elastic.SearchAsync<Aggregation>(q => q
                .Size(0)
                .Index("birthdays")
                .QueryOnQueryString("-" + view["query"])
            );
            if (result.Total > 0){
                content.Add(new Category{
                    CategoryName = "(Uncategorized)",
                    selected = false,
                    notCategorized = true
                });
            }
            return new Page<Category>(content, pageable, content.Count);
        }
        class Aggregation{
            string key {get; set;}
            int doc_count {get; set;}
            object[] distinct {get; set;}
        }
    }
}
