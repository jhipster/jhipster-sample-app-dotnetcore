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
using System.Linq.Expressions;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Query;


namespace Jhipster.Infrastructure.Data.Repositories
{
    public class BirthdayRepository : GenericRepository<Birthday>, IBirthdayRepository
    {
        private static Uri node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");
        private static Nest.ConnectionSettings setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9","4cdkz0o14").DefaultIndex("birthdays");
        private static ElasticClient elastic = new ElasticClient(setting);
        public BirthdayRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Birthday> CreateOrUpdateAsync(Birthday birthday){
            List<string> categoryStrings = new List<string>();
            birthday.Categories.ForEach(c=>{
                categoryStrings.Add(c.CategoryName);
            });
            ElasticBirthday  elasticBirthday = new ElasticBirthday{
                dob = birthday.Dob,
                fname = birthday.Fname,
                Id = birthday.Id,
                lname = birthday.Lname,
                sign = birthday.Sign,
                isAlive = birthday.IsAlive,
                categories = categoryStrings.ToArray<string>()
            };
            await elastic.UpdateAsync<ElasticBirthday>(new DocumentPath<ElasticBirthday>(elasticBirthday.Id), u => 
                u.Index("birthdays").Doc(elasticBirthday)
            );
            if (categoryStrings.Count == 0){
                await elastic.UpdateAsync<ElasticBirthday>(new DocumentPath<ElasticBirthday>(elasticBirthday.Id), u => 
                    u.Script(s => s.Source("ctx._source.remove('categories')"))
                );                
            }
            return birthday; 
        }
        public override async Task<IPage<Birthday>> GetPageAsync(IPageable pageable){
            return await GetPageFilteredAsync(pageable, "");
        }
        public override async Task<IPage<Birthday>> GetPageFilteredAsync(IPageable pageable, string queryJson){
            if (!queryJson.StartsWith("{")){
                // backwards compatibility
                Dictionary<string,object> queryObject = new Dictionary<string, object>();
                queryObject["query"] = queryJson;
                queryObject["view"] = null;
                queryJson = JsonConvert.SerializeObject(queryObject);
            }
            var birthdayRequest = JsonConvert.DeserializeObject<Dictionary<string,object>>(queryJson);
            Dictionary<string, string> view = new Dictionary<string, string>();
            string query = birthdayRequest.ContainsKey("query") ? (string)birthdayRequest["query"] : "";
            if (birthdayRequest["view"] != null){
                view = JsonConvert.DeserializeObject<Dictionary<string,string>>(birthdayRequest["view"].ToString());
            }
            string categoryClause = "";
            if (birthdayRequest.ContainsKey("category") && view.ContainsKey("field")){
                if (view.ContainsKey("categoryQuery")){
                    categoryClause = view["categoryQuery"].Replace("{}", (string)birthdayRequest["category"]);
                } else {
                    categoryClause = (string)birthdayRequest["category"] == "-" ? "-" + view["field"] + ":*" : view["field"] + ":\"" + birthdayRequest["category"]  + "\"";
                }
                query = categoryClause + (query != "" ? " AND (" + query + ")" : "");
            }
            ISearchResponse<ElasticBirthday> searchResponse = null;
            if (query == "" || query == "()"){
                searchResponse = await elastic.SearchAsync<ElasticBirthday>(s => s
                    .Size(10000)
                    .Query(q => q
                        .MatchAll()
                    )
                );
            } else {
                searchResponse = await elastic.SearchAsync<ElasticBirthday>(x => x	// use search method
                    .Index("birthdays")
                    .QueryOnQueryString(query)
                    .Size(10000)
                );				// limit to page size
            }
            List<Birthday> content = new List<Birthday>();
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            foreach (var hit in searchResponse.Hits)
            {
                List<Category> listCategory = new List<Category>();
                if (hit.Source.categories != null){
                    hit.Source.categories.ToList().ForEach(c=>{
                        listCategory.Add(new Category{
                            CategoryName = c
                        });
                    });
                }
                content.Add(new Birthday{
                    Id = hit.Id,
                    Lname = hit.Source.lname,
                    Fname = hit.Source.fname,
                    Dob = hit.Source.dob,
                    Sign = hit.Source.sign,
                    IsAlive = hit.Source.isAlive,
                    Categories = listCategory
                });
            }
            content = content.OrderBy(b => b.Dob).ToList();
            return new Page<Birthday>(content, pageable, content.Count);
        }
        private class ElasticBirthday
        {
            public string Id { get; set; }
            public string lname { get; set; }
            public string fname { get; set; }
            public DateTime dob{ get; set; }
            public string sign { get; set; }
            public bool isAlive { get; set; }
            public string[] categories {get; set; }
            public string wikipedia {get; set; } 
        }

        public override async Task<Birthday> GetOneAsync(object id)
        {
            var hit = await elastic.GetAsync<ElasticBirthday>((string)id);
            Birthday birthday = new Birthday{
                Id = hit.Id,
                Lname = hit.Source.lname,
                Fname = hit.Source.fname,
                Dob = hit.Source.dob,
                Sign = hit.Source.sign,
                IsAlive = hit.Source.isAlive 
            };
            return birthday;
        }
        public async Task<string> GetOneTextAsync(object id){
            var hit = await elastic.GetAsync<ElasticBirthday>((string)id);
            return hit.Source.wikipedia;
        }
    }
}
