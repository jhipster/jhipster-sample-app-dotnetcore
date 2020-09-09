using MyCompany.Crosscutting.Constants;

namespace MyCompany.Crosscutting.Exceptions {
    public class InternalServerErrorException : BaseException {
        public InternalServerErrorException(string message) : base(ErrorConstants.DefaultType, message)
        {
        }
    }
}
