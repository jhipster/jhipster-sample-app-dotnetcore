using MyCompany.Crosscutting.Constants;

namespace MyCompany.Crosscutting.Exceptions {
    public class EmailNotFoundException : BaseException {
        public EmailNotFoundException() : base(ErrorConstants.EmailNotFoundType, "Email address not registered")
        {
        }
    }
}
