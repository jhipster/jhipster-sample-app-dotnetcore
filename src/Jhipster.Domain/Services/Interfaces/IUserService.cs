using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyCompany.Crosscutting.Constants;
using MyCompany.Crosscutting.Exceptions;
using MyCompany.Domain;

namespace MyCompany.Domain.Services.Interfaces {
    public interface IUserService {
        Task<User> CreateUser(User userToCreate);
        IEnumerable<string> GetAuthorities();
        Task DeleteUser(string login);
        Task<User> UpdateUser(User userToUpdate);
        Task<User> CompletePasswordReset(string newPassword, string key);
        Task<User> RequestPasswordReset(string mail);
        Task ChangePassword(string currentPassword, string newPassword);
        Task<User> ActivateRegistration(string key);
        Task<User> RegisterUser(User user, string password);
        Task UpdateUser(string firstName, string lastName, string email, string langKey, string imageUrl);
        Task<User> GetUserWithUserRoles();
    }
}
