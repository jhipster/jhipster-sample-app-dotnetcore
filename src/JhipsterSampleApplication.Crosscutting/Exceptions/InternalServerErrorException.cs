using JhipsterSampleApplication.Crosscutting.Constants;

namespace JhipsterSampleApplication.Crosscutting.Exceptions;

public class InternalServerErrorException : BaseException
{
    public InternalServerErrorException(string message) : base(ErrorConstants.DefaultType, message)
    {
    }
}
