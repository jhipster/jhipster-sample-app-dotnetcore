using System.Security.Authentication;

namespace MyCompany.Crosscutting.Exceptions {
    public class UsernameNotFoundException : AuthenticationException {
        public UsernameNotFoundException(string message) : base(message)
        {
        }
    }
}
