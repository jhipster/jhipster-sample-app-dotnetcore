using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Security.Authentication;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using Jhipster.Domain;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Crosscutting.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;

namespace Jhipster.Domain.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly ILogger<AuthenticationService> _log;

        private readonly UserManager<User> _userManager;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthenticationService(ILogger<AuthenticationService> log, UserManager<User> userManager, IHttpContextAccessor httpContextAccessor)
        {
            _log = log;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
        }

        public virtual async Task<IPrincipal> Authenticate(string username, string password)
        {
            //https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.signinmanager-1.passwordsigninasync?view=aspnetcore-2.2
            // => not use because cookie
            //=> https://stackoverflow.com/questions/53854051/usermanager-checkpasswordasync-vs-signinmanager-passwordsigninasync
            //https://github.com/openiddict/openiddict-core/issues/578


            var certSubject = _httpContextAccessor.HttpContext.Connection.ClientCertificate.Subject;
            Jhipster.Domain.User jdu = new Jhipster.Domain.User{
                FirstName = certSubject.ToLower().Contains("joan") ? "joan" : "Bill",
                LastName = "Eisner",
                Activated = true,
                Id = "eisnerw",
                Login = certSubject.ToLower().Contains("joan") ? "Joan Eisner" : "Bill Eisner",
                LangKey = "en",
                CreatedBy = "System",
                CreatedDate = new System.DateTime()
            };
            if (certSubject != null){
                return await CreatePrincipal(jdu);
            }
            var user = await LoadUserByUsername(username);

            if (!user.Activated) throw new UserNotActivatedException($"User {user.UserName} was not activated.");

            if (await _userManager.CheckPasswordAsync(user, password)) return await CreatePrincipal(user);

            _log.LogDebug("Authentication failed: password does not match stored value");
            throw new InvalidCredentialException("Authentication failed: password does not match stored value");
        }

        private async Task<User> LoadUserByUsername(string username)
        {
            _log.LogDebug($"Authenticating {username}");

            if (new EmailAddressAttribute().IsValid(username))
            {
                var userByEmail = await _userManager.FindByEmailAsync(username);
                if (userByEmail == null)
                    throw new UsernameNotFoundException(
                        $"User with email {username} was not found in the database");
                return userByEmail;
            }

            var lowerCaseLogin = username.ToLower(CultureInfo.GetCultureInfo("en-US"));
            var userByLogin = await _userManager.FindByNameAsync(username);
            if (userByLogin == null)
                throw new UsernameNotFoundException($"User {lowerCaseLogin} was not found in the database");
            return userByLogin;
        }

        private async Task<IPrincipal> CreatePrincipal(User user)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.Name, user.UserName)
            };
            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            var identity = new ClaimsIdentity(claims);
            return new ClaimsPrincipal(identity);
        }
    }
}
