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
    public class PieceOfWorkRepository : GenericRepository<PieceOfWork>, IPieceOfWorkRepository
    {
        public PieceOfWorkRepository(IUnitOfWork context) : base(context) 
        {
        }

        public override async Task<PieceOfWork> CreateOrUpdateAsync(PieceOfWork pieceOfWork)
        {
            bool exists = await Exists(x => x.Id == pieceOfWork.Id);

            if (pieceOfWork.Id != 0 && exists) {
                Update(pieceOfWork);
            } else {
                _context.AddGraph(pieceOfWork);
            }

            return pieceOfWork;
        }
    }
}
