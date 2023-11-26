using Microsoft.AspNetCore.Identity;

namespace Jhipster.Domain.Entities;

public class UserRole : IdentityUserRole<string>
{
    public virtual User User { get; set; }
    public virtual Role Role { get; set; }
}
