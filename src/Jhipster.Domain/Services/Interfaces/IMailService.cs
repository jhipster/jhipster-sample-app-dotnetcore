using System.Threading.Tasks;
using Jhipster.Domain.Entities;

namespace Jhipster.Domain.Services.Interfaces;

public interface IMailService
{
    Task SendPasswordResetMail(User user);
    Task SendActivationEmail(User user);
    Task SendCreationEmail(User user);
}
