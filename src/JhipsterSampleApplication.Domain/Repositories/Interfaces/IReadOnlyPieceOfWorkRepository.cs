
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyPieceOfWorkRepository : IReadOnlyGenericRepository<PieceOfWork, long?>
    {
    }

}
