using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace TextTemplate
{
    class JsonSupport
    {
        public static object Deserialize(string json)
        {
			JsonElement je = JsonSerializer.Deserialize<JsonElement>((string)json);
			return ConvertToDictionaryOrList(je);
		}
        public static string Serialize(object obj)
        {
			return JsonSerializer.Serialize(obj);
		}
        public static object ConvertToDictionaryOrList(object obj)
        {
			if (obj is JsonElement)
            {
				if (((JsonElement)obj).ValueKind.ToString() == "Array")
				{
					List<object> arrayList = new List<object>();
					var arrayProps = ((JsonElement)obj).EnumerateArray();
					while (arrayProps.MoveNext())
					{
						var arrayValue = arrayProps.Current;
						if (arrayValue is JsonElement)
						{
							arrayList.Add(ConvertToDictionaryOrList(arrayValue));
						}
						else
						{
							arrayList.Add(arrayValue);
						}
					}
					return arrayList;
				}
				Dictionary<string, object> jsonDict = new Dictionary<string, object>();
				var objectProps = ((JsonElement)obj).EnumerateObject();
				while (objectProps.MoveNext())
				{
					var prop = objectProps.Current;
					JsonElement objectValue = prop.Value;
					switch (objectValue.ValueKind.ToString())
                    {
						case "Array":
						case "Object":
							jsonDict[prop.Name] = ConvertToDictionaryOrList(objectValue);
							break;

						case "String":
							jsonDict[prop.Name] = objectValue.GetString();
							break;

						case "True":
						case "False":
							jsonDict[prop.Name] = objectValue.GetBoolean();
							break;

						case "Null":
							jsonDict[prop.Name] = null;
							break;

						case "Number":
							jsonDict[prop.Name] = objectValue.GetInt32();
							break;
					}
				}
				return jsonDict;
            }
			if (obj is List<object> || obj is Dictionary<string, object>)
			{
				return obj;
			}
			return null; // error
		}
	}
}
