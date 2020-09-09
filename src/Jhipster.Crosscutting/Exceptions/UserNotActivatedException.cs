using System.Security.Authentication;

namespace MyCompany.Crosscutting.Exceptions {
    public class UserNotActivatedException : AuthenticationException {
        public UserNotActivatedException(string message) : base(message)
        {
        }
    }
}
