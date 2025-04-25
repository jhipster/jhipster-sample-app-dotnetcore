using System.Threading.Tasks;

namespace JhipsterSampleApplication.Domain.Services.Interfaces;

public interface IMailService
{
    Task SendPasswordResetMail(string email, string name, string resetKey);
    Task SendActivationEmail(string email, string name, string activationKey);
    Task SendCreationEmail(string email, string name);
}
