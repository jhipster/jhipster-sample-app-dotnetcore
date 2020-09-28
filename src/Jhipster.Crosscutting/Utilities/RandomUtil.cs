using System;
using System.Linq;

namespace MyCompany.Service.Utilities {
    public static class RandomUtil {
        private const int DefCount = 20;
        private static readonly Random random = new Random();

        public static string GeneratePassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return new string(Enumerable.Repeat(chars, DefCount)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private static string RandomNumeric(int length)
        {
            const string chars = "0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public static string GenerateActivationKey()
        {
            return RandomNumeric(DefCount);
        }

        public static string GenerateResetKey()
        {
            return RandomNumeric(DefCount);
        }
    }
}
