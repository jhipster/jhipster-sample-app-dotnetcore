using System;

namespace MyCompany.Crosscutting.Exceptions {
    public abstract class BaseException : Exception
    {
        protected BaseException(string type, string detail) : this(type, detail, null, null)
        {
        }

        protected BaseException(string type, string detail, string entityName) : this(type, detail, entityName, null)
        {
        }

        protected BaseException(string type, string detail, string entityName, string errorKey) : base(detail)
        {
            this.Type = type;
            this.Detail = detail;
            this.EntityName = entityName;
            this.ErrorKey = errorKey;
        }

        public string Type { get; set; }
        public string Detail { get; set; }
        public string EntityName { get; set; }
        public string ErrorKey { get; set; }
    }
}
