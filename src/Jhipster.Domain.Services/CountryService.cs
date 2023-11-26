using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services;

public class CountryService : ICountryService
{
    protected readonly ICountryRepository _countryRepository;

    public CountryService(ICountryRepository countryRepository)
    {
        _countryRepository = countryRepository;
    }

    public virtual async Task<Country> Save(Country country)
    {
        await _countryRepository.CreateOrUpdateAsync(country);
        await _countryRepository.SaveChangesAsync();
        return country;
    }

    public virtual async Task<IPage<Country>> FindAll(IPageable pageable)
    {
        var page = await _countryRepository.QueryHelper()
            .Include(country => country.Region)
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<Country> FindOne(long id)
    {
        var result = await _countryRepository.QueryHelper()
            .Include(country => country.Region)
            .GetOneAsync(country => country.Id == id);
        return result;
    }

    public virtual async Task Delete(long id)
    {
        await _countryRepository.DeleteByIdAsync(id);
        await _countryRepository.SaveChangesAsync();
    }
}
