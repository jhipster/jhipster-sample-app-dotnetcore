using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace MyCompany.Domain {
    public class Role : IdentityRole<string> {
        public ICollection<UserRole> UserRoles { get; set; }
    }
}
