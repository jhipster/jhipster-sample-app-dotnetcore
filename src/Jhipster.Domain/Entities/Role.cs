using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Jhipster.Domain.Entities;

public class Role : IdentityRole<string>
{
    public ICollection<UserRole> UserRoles { get; set; }
}
