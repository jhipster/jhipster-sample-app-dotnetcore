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
using Jhipster.Dto;
using System.Collections.Generic;
using System.Linq.Expressions;
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

        public override async Task<Birthday> CreateOrUpdateAsync(Birthday birthday)
        {
            bool exists = await Exists(x => x.Id == birthday.Id);

            if (birthday.Id != "" && exists)
            {
                Update(birthday);
            }
            else
            {
                _context.AddOrUpdateGraph(birthday);
            }
            return birthday;
        }

        public override async Task<IPage<Birthday>> GetPageAsync(IPageable pageable){
            return await GetPageFilteredAsync(pageable, "");
        }
        public override async Task<IPage<Birthday>> GetPageFilteredAsync(IPageable pageable, string query){
            ISearchResponse<birthday> searchResponse = null;
            if (query == "" || query == "()"){
                searchResponse = await elastic.SearchAsync<birthday>(s => s
                    .Size(10000)
                    .Query(q => q
                        .MatchAll()
                    )
                );
            } else {
                searchResponse = await elastic.SearchAsync<birthday>(x => x	// use search method
                    .Index("birthdays")
                    .QueryOnQueryString(query)
                    .Size(10000)
                );				// limit to page size
            }
            List<Birthday> content = new List<Birthday>();
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            foreach (var hit in searchResponse.Hits)
            {
                content.Add(new Birthday{
                    Id = hit.Id,
                    Lname = hit.Source.lname,
                    Fname = hit.Source.fname,
                    Dob = hit.Source.dob,
                    Sign = hit.Source.sign,
                    IsAlive = hit.Source.isAlive 
                });
            }
            return new Page<Birthday>(content, pageable, content.Count);
        }
        // the lower-case birthday class is needed to characterize the elastic data, which should be changed
        private class birthday
        {
            public string Id { get; set; }
            public string lname { get; set; }
            public string fname { get; set; }
            public DateTime dob{ get; set; }
            public string sign { get; set; }
            public bool isAlive { get; set; }
        }

        public override async Task<Birthday> GetOneAsync(object id)
        {
            var hit = await elastic.GetAsync<birthday>((string)id);
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
    }
}
