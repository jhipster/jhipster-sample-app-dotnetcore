using System.Threading.Tasks;
using Jhipster.Domain;
using Jhipster.Domain.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace Jhipster.Domain.Services {
    public class MailService : IMailService {
        public MailService()
        {
        }

        // private readonly JHipsterSettings _jhipsterSettings;
        
        // public MailService(IOptions<JHipsterSettings> jhipsterSettings)
        // {
        //     _jhipsterSettings = jhipsterSettings.Value;
        // }

        public virtual Task SendPasswordResetMail(User user)
        {
            //TODO send reset Email
            return Task.FromResult(Task.CompletedTask);
        }

        public virtual Task SendActivationEmail(User user)
        {
            //TODO Activation Email
            return Task.FromResult(Task.CompletedTask);
        }

        public virtual Task SendCreationEmail(User user)
        {
            //TODO Creation Email
            return Task.FromResult(Task.CompletedTask);
        }
    }
}
