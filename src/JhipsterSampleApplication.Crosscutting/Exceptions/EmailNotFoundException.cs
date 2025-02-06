using JhipsterSampleApplication.Crosscutting.Constants;

namespace JhipsterSampleApplication.Crosscutting.Exceptions;

public class EmailNotFoundException : BaseException
{
    public EmailNotFoundException() : base(ErrorConstants.EmailNotFoundType, "Email address not registered")
    {
    }
}
