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

        public virtual async Task<IPage<Birthday>> FindAll(IPageable pageable)
        {
            var page = await _birthdayRepository.QueryHelper()
                .Include(birthday => birthday.lname)
                .Include(birthday => birthday.fname)
                .Include(birthday => birthday.dob)
                .Include(birthday => birthday.sign)
                .Include(birthday => birthday.isAlive)
                .GetPageAsync(pageable);
            return page;
        }

        public virtual async Task<Birthday> FindOne(string id)
        {
            var result = await _birthdayRepository.QueryHelper()
                .Include(birthday => birthday.lname)
                .Include(birthday => birthday.fname)
                .Include(birthday => birthday.dob)
                .Include(birthday => birthday.sign)
                .Include(birthday => birthday.isAlive)
                .GetOneAsync(birthday => birthday.Id == id);
            return result;
        }

        public virtual async Task Delete(string id)
        {
            await _birthdayRepository.DeleteByIdAsync(id);
            await _birthdayRepository.SaveChangesAsync();
        }
    }
}
