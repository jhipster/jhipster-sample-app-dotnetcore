using System.Threading.Tasks;
using MyCompany.Domain;

namespace MyCompany.Domain.Services.Interfaces {
    public interface IMailService {
        Task SendPasswordResetMail(User user);
        Task SendActivationEmail(User user);
        Task SendCreationEmail(User user);
    }
}
