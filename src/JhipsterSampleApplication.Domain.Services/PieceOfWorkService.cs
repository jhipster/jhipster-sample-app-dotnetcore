using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JhipsterSampleApplication.Domain.Services;

public class PieceOfWorkService : IPieceOfWorkService
{
    protected readonly IPieceOfWorkRepository _pieceOfWorkRepository;

    public PieceOfWorkService(IPieceOfWorkRepository pieceOfWorkRepository)
    {
        _pieceOfWorkRepository = pieceOfWorkRepository;
    }

    public virtual async Task<PieceOfWork> Save(PieceOfWork pieceOfWork)
    {
        await _pieceOfWorkRepository.CreateOrUpdateAsync(pieceOfWork);
        await _pieceOfWorkRepository.SaveChangesAsync();
        return pieceOfWork;
    }

    public virtual async Task<IPage<PieceOfWork>> FindAll(IPageable pageable)
    {
        var page = await _pieceOfWorkRepository.QueryHelper()
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<PieceOfWork> FindOne(long? id)
    {
        var result = await _pieceOfWorkRepository.QueryHelper()
            .GetOneAsync(pieceOfWork => pieceOfWork.Id == id);
        return result;
    }

    public virtual async Task Delete(long? id)
    {
        await _pieceOfWorkRepository.DeleteByIdAsync(id);
        await _pieceOfWorkRepository.SaveChangesAsync();
    }
}
