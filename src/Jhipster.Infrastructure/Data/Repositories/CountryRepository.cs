using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class CountryRepository : GenericRepository<Country>, ICountryRepository
    {
        public CountryRepository(IUnitOfWork context) : base(context) 
        {
        }

        public override async Task<Country> CreateOrUpdateAsync(Country country)
        {
            bool exists = await Exists(x => x.Id == country.Id);

            if (country.Id != 0 && exists) {
                Update(country);
                /* Force the reference navigation property to be in "modified" state.
                This allows to modify it with a null value (the field is nullable).
                This takes into consideration the case of removing the association between the two instances. */
                _context.SetEntityStateModified(country, country0 => country0.Region);
            } else {
                _context.AddGraph(country);
            }

            return country;
        }
    }
}
