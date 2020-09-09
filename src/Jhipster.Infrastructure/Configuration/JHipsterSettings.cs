namespace MyCompany.Infrastructure.Configuration {
    public class JHipsterSettings {
        public Security Security { get; set; }

        public Cors Cors { get; set; }
    }

    public class Security {
        public Authentication Authentication { get; set; }
    }

    public class Authentication {
        public Jwt Jwt { get; set; }
    }

    public class Jwt {
        public string Secret { get; set; }
        public string Base64Secret { get; set; }
        public int TokenValidityInSeconds { get; set; }
        public int TokenValidityInSecondsForRememberMe { get; set; }
    }


    public class Cors {
        public string AllowedOrigins { get; set; }
        public string AllowedMethods { get; set; }
        public string AllowedHeaders { get; set; }
        public string ExposedHeaders { get; set; }
        public bool AllowCredentials { get; set; }
        public int MaxAge {get; set; }
    }
}