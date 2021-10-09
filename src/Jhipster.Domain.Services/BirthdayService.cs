using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services
{
    public class BirthdayService : IBirthdayService
    {
        protected readonly IBirthdayRepository _birthdayRepository;

        public BirthdayService(IBirthdayRepository birthdayRepository)
        {
            _birthdayRepository = birthdayRepository;
        }

        public virtual async Task<Birthday> Save(Birthday birthday)
        {
            await _birthdayRepository.CreateOrUpdateAsync(birthday);
            await _birthdayRepository.SaveChangesAsync();
            return birthday;
        }

        public virtual async Task<IPage<Birthday>> FindAll(IPageable pageable, string query)
        {
            var page = await _birthdayRepository.GetPageFilteredAsync(pageable, query);
            return page;
        }

        public virtual async Task<Birthday> FindOne(string id)
        {
            var result = await _birthdayRepository
            /* .QueryHelper()
                .Include(birthday => birthday.Lname)
                .Include(birthday => birthday.Fname)
                .Include(birthday => birthday.Dob)
                .Include(birthday => birthday.Sign)
                .Include(birthday => birthday.IsAlive)
                ._birthdayRepository
            */
            .GetOneAsync(id);
            return result;
        }
        public virtual async Task<string> FindOneText(string id)
        {
            var result = await _birthdayRepository
            /* .QueryHelper()
                .Include(birthday => birthday.Lname)
                .Include(birthday => birthday.Fname)
                .Include(birthday => birthday.Dob)
                .Include(birthday => birthday.Sign)
                .Include(birthday => birthday.IsAlive)
                ._birthdayRepository
            */
            .GetOneTextAsync(id);
            return result;
        }

        public virtual async Task Delete(string id)
        {
            await _birthdayRepository.DeleteByIdAsync(id);
            await _birthdayRepository.SaveChangesAsync();
        }
    }
}
