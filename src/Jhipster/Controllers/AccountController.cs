using AutoMapper;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
using MyCompany.Domain;
using MyCompany.Dto;
using MyCompany.Web.Extensions;
using MyCompany.Web.Filters;
using MyCompany.Web.Rest.Problems;
using MyCompany.Configuration;
using MyCompany.Crosscutting.Constants;
using MyCompany.Crosscutting.Exceptions;
using Microsoft.AspNetCore.Mvc;
using MyCompany.Domain.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace MyCompany.Controllers {

    [Route("api")]
    [ApiController]
    public class AccountController : ControllerBase {

        private readonly ILogger<AccountController> _log;
        private readonly IMailService _mailService;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _userMapper;
        private readonly IUserService _userService;

        public AccountController(ILogger<AccountController> log, UserManager<User> userManager, IUserService userService,
            IMapper userMapper, IMailService mailService)
        {
            _log = log;
            _userManager = userManager;
            _userService = userService;
            _userMapper = userMapper;
            _mailService = mailService;
        }

        [HttpPost("register")]
        [ValidateModel]
        public async Task<IActionResult> RegisterAccount([FromBody] ManagedUserDto managedUserDto)
        {
            if (!CheckPasswordLength(managedUserDto.Password)) throw new InvalidPasswordException();

            var user = await _userService.RegisterUser(_userMapper.Map<User>(managedUserDto), managedUserDto.Password);
            await _mailService.SendActivationEmail(user);
            return CreatedAtAction(nameof(GetAccount), user);
        }

        [HttpGet("activate")]
        [ValidateModel]
        public async Task ActivateAccount([FromQuery(Name = "key")] string key)
        {
            var user = await _userService.ActivateRegistration(key);
            if (user == null) throw new InternalServerErrorException("Not user was found for this activation key");
        }

        [HttpGet("authenticate")]
        public string IsAuthenticated()
        {
            _log.LogDebug("REST request to check if the current user is authenticated");
            return _userManager.GetUserName(User);
        }

        [Authorize]
        [HttpGet("account")]
        public async Task<ActionResult<UserDto>> GetAccount()
        {
            var user = await _userService.GetUserWithUserRoles();
            if (user == null) throw new InternalServerErrorException("User could not be found");
            var userDto = _userMapper.Map<UserDto>(user);
            return Ok(userDto);
        }

        [Authorize]
        [HttpPost("account")]
        [ValidateModel]
        public async Task<ActionResult> SaveAccount([FromBody] UserDto userDto)
        {
            var userName = _userManager.GetUserName(User);
            if (userName == null) throw new InternalServerErrorException("Current user login not found");

            var existingUser = await _userManager.FindByEmailAsync(userDto.Email);
            if (existingUser != null &&
                !string.Equals(existingUser.Login, userName, StringComparison.InvariantCultureIgnoreCase))
                throw new EmailAlreadyUsedException();

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null) throw new InternalServerErrorException("User could not be found");

            await _userService.UpdateUser(userDto.FirstName, userDto.LastName, userDto.Email, userDto.LangKey,
                userDto.ImageUrl);
            return Ok();
        }

        [Authorize]
        [HttpPost("account/change-password")]
        [ValidateModel]
        public async Task<ActionResult> ChangePassword([FromBody] PasswordChangeDto passwordChangeDto)
        {
            if (!CheckPasswordLength(passwordChangeDto.NewPassword)) throw new InvalidPasswordException();

            await _userService.ChangePassword(passwordChangeDto.CurrentPassword, passwordChangeDto.NewPassword);
            return Ok();
        }

        [HttpPost("account/reset-password/init")]
        public async Task<ActionResult> RequestPasswordReset()
        {
            var mail = await Request.BodyAsStringAsync();
            var user = await _userService.RequestPasswordReset(mail);
            if (user == null) throw new EmailNotFoundException();

            await _mailService.SendPasswordResetMail(user);
            return Ok();
        }

        [HttpPost("account/reset-password/finish")]
        [ValidateModel]
        public async Task RequestPasswordReset([FromBody] KeyAndPasswordDto keyAndPasswordDto)
        {
            if (!CheckPasswordLength(keyAndPasswordDto.NewPassword)) throw new InvalidPasswordException();

            var user = await _userService.CompletePasswordReset(keyAndPasswordDto.NewPassword, keyAndPasswordDto.Key);

            if (user == null) throw new InternalServerErrorException("No user was found for this reset key");
        }

        private static bool CheckPasswordLength(string password)
        {
            return !string.IsNullOrEmpty(password) &&
                   password.Length >= ManagedUserDto.PasswordMinLength &&
                   password.Length <= ManagedUserDto.PasswordMaxLength;
        }
    }
}
