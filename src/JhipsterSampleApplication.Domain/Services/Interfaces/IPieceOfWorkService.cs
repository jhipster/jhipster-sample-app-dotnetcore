using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface IPieceOfWorkService
    {
        Task<PieceOfWork> Save(PieceOfWork pieceOfWork);

        Task<IPage<PieceOfWork>> FindAll(IPageable pageable);

        Task<PieceOfWork> FindOne(long? id);

        Task Delete(long? id);
    }
}
