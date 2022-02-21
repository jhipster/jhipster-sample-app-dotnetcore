using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace TextTemplate
{
    class TypedData
    {
        public string type;
        public string missingValue;
        public string key;
        public List<object> list;
        public string defaultIndent;
        public object parts;
        public string bullet;
        public int? level = null;
        public int? length;
        public Regex regex;
        public string flags = null;
        public string format = null;
        public string dateString = null;
        public TypedData(string type, string missingValue = null, string key = null, List<object> list = null, string defaultIndent = null, object parts = null, string bullet = "", int? length = null, Regex regex = null, string flags = null, string dateString = null, string format = null)
        {
            this.type = type;
            this.missingValue = missingValue;
            this.key = key;
            this.list = list;
            this.defaultIndent = defaultIndent;
            this.bullet = bullet;
            this.parts = parts;
            this.length = length;
            this.regex = regex;
            this.flags = flags;
            this.format = format;
            this.dateString = dateString;
        }
    }
}
