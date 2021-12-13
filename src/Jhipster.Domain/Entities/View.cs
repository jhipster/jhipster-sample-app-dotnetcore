    using System.Collections.Generic;
    using Jhipster.Domain;

    namespace Jhipster.Domain
    {
        public class View
        {
            public string query { get; set; }
            public string aggregation { get; set; }
            public string script { get; set; }
            public string categoryQuery { get; set; }
            public string field { get; set; }
            public List<Birthday> focus { get; set; }
        }
    }