using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface IPieceOfWorkService
    {
        Task<PieceOfWork> Save(PieceOfWork pieceOfWork);

        Task<IPage<PieceOfWork>> FindAll(IPageable pageable);

        Task<PieceOfWork> FindOne(long id);

        Task Delete(long id);
    }
}
