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
using System.Text.Json;
using System.Security.Cryptography.X509Certificates;
using System.Net.Http;
using System;

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
            Jhipster.Domain.User user = await GetAuthenticatedUser(certSubject);
            if (certSubject != null){
                return await CreatePrincipal(user);
            }
            user = await LoadUserByUsername(username);

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
        public virtual async Task<Jhipster.Domain.User> GetAuthenticatedUser(string certDN)
        {
            var cert = new X509Certificate2("C:\\OpenSSL\\client.p12", "pass");
            var handler = new HttpClientHandler();
            handler.ClientCertificates.Add(cert);
            var client = new HttpClient(handler);
            Dictionary<string, string> dict = new Dictionary<string, string>(){
                {"DistinguishedName", certDN}
            };
            
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(@"https://serversite.com/GetUserInfo"),
                Method = HttpMethod.Post,
               
            };
            request.Content = new StringContent(JsonSerializer.Serialize(dict),
                System.Text.Encoding.UTF8, "application/json");
            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                JsonDocument jsonDocument = JsonDocument.Parse(responseContent);
                var userRoot = jsonDocument.RootElement;
                Jhipster.Domain.User user = new Jhipster.Domain.User{
                    FirstName = userRoot.GetProperty("FirstName").GetString(),
                    LastName = userRoot.GetProperty("LastName").GetString(),
                    Activated = true,
                    Id = "1",
                    Login = userRoot.GetProperty("Login").GetString(),
                    LangKey = "en",
                    CreatedBy = "System",
                    CreatedDate = new System.DateTime()
                };
                List<Role> roles = new List<Role> {
                    new Role {Id = "role_admin", Name = "ROLE_ADMIN"},
                    new Role {Id = "role_user",Name = "ROLE_USER"}
                };
                user.UserRoles = new List<UserRole>();
                UserRole ur = new UserRole();
                ur.User = user;
                ur.Role = new Role {Id = "role_user",Name = "ROLE_USER"};
                user.UserRoles.Add(ur);
                if (userRoot.GetProperty("IsAdministrator").GetBoolean()){
                    ur = new UserRole();
                    ur.User = user;
                    ur.Role = new Role {Id = "role_admin", Name = "ROLE_ADMIN"};
                    user.UserRoles.Add(ur);
                }                
                return user;
            }
            throw new ApplicationException($"Status code: {response.StatusCode}, Error: {response.ReasonPhrase}");
        }        
    }
    
}
