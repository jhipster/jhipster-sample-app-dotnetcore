using JhipsterSampleApplication.Crosscutting.Constants;

namespace JhipsterSampleApplication.Crosscutting.Exceptions;

public class LoginAlreadyUsedException : BadRequestAlertException
{
    public LoginAlreadyUsedException() : base(ErrorConstants.LoginAlreadyUsedType, "Login name is already in use!",
        "userManagement", "userexists")
    {
    }
}
