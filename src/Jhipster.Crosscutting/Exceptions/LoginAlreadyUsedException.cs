using MyCompany.Crosscutting.Constants;

namespace MyCompany.Crosscutting.Exceptions {
    public class LoginAlreadyUsedException : BadRequestAlertException {
        public LoginAlreadyUsedException() : base(ErrorConstants.EmailAlreadyUsedType, "Login name is already in use!",
            "userManagement", "userexists")
        {
        }
    }
}
