using JhipsterSampleApplication.Crosscutting.Constants;

namespace JhipsterSampleApplication.Crosscutting.Exceptions;

public class InvalidPasswordException : BaseException
{
    public InvalidPasswordException() : base(ErrorConstants.InvalidPasswordType, "Incorrect Password")
    {
        //Status = StatusCodes.Status400BadRequest
    }
}
