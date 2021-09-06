using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Collections;

namespace TextTemplate
{
    class TemplateData
    {
		public Dictionary<string, object> dictionary = new Dictionary<string, object>();
		public List<TemplateData> list = new List<TemplateData>();
		public TemplateData parent;
		public string type;
		static List<object> foundObjects; // used to protect against ToJson loops
		public TemplateData(object jsonData, TemplateData parent = null)
		{
			object json;
			if (jsonData is string)
			{
				json = JsonSupport.Deserialize((string)jsonData);
				// TemplateData supports arrays of strings by making them lists of dictionaries with a single element
				///json = JsonSerializer.Deserialize<dynamic>("{\"_\": \"" + ((string)jsonData).Replace("\"", "\\\"") + "\"}");
			}
			else if (jsonData is List<object> || jsonData is Object[] || jsonData is ArrayList)
            {
				this.type = "list";
				if (jsonData is ArrayList)
                {
					jsonData = ((ArrayList)jsonData).ToArray().ToList();
                } else if (jsonData is Object[])
                {
					jsonData = ((Object[])jsonData).ToList();
                }
				((IList<object>)jsonData).ToList().ForEach((item) => {
					this.list.Add(new TemplateData(item, this));
				});
				this.parent = parent;
				return;
            }
			else if (jsonData is TemplateData)
			{
				// filter or clone
				if (((TemplateData)jsonData).type == "list")
				{
					this.type = "list";
					((TemplateData)jsonData).list.ForEach((item) =>
					{
						this.list.Add(new TemplateData(item, parent));
					});
					return;
				}
				else
				{
					json = JsonSupport.Deserialize(((TemplateData)jsonData).toJson()); // clone by converting to Json and back
				}
			}
			else
			{
				json = jsonData;
			}
			if (json is List<object>)
			{
				this.type = "list";
				((List<object>)json).ForEach(item =>
				{
					this.list.Add(new TemplateData(item is TemplateData || item is Dictionary<string, object> ? item : item.ToString(), this));
				}) ;
			}
			else
			{
				object converted = JsonSupport.ConvertToDictionaryOrList(json);
				if (converted is Dictionary<string, object>)
				{
					this.type = "dictionary";
					Dictionary<string, object> dict = new Dictionary<string, object>();
					foreach (string key in ((Dictionary<string, object>)converted).Keys)
					{
						object keyItem = ((Dictionary<string, object>)converted)[key];
						if (keyItem is List<object> || keyItem is Dictionary<string, object> || keyItem is Object[] || keyItem is ArrayList)
						{
							dict.Add(key, new TemplateData(((Dictionary<string, object>)converted)[key], this));
						} else
						{
							dict.Add(key, ((Dictionary<string, object>)converted)[key]);

						}
					}
					this.dictionary = dict;
				}
				else
                {
					this.type = "list";
					foreach(object itm in (List<object>)converted)
                    {
						this.list.Add(new TemplateData(itm));
                    }
                }
			}
			if (parent != null)
			{
				this.parent = parent;
			}
		}
		public List<string> getKeys()
		{
			return this.dictionary.Keys.ToList<string>();
		}
		public void Remove(string key)
        {
			if (type == "dictionary" && dictionary.ContainsKey(key))
			{
				dictionary.Remove(key);
            }
        }
		public object getValue(string key)
		{
			string[] keySplit = key.Split('.');
			object value = null;
			if (this.dictionary.ContainsKey(keySplit[0]))
			{
				value = this.dictionary[keySplit[0]];
			}
			else if (keySplit[0] == "^")
			{
				value = this.parent != null ? this.parent : this;
			}
			else if (keySplit[0] == "*")
            {
				value = this;
            }
			if (keySplit.Length == 1 || value == null) 
{
				return value;
			}
			if (value is TemplateData)
			{
				return ((TemplateData)value).getValue(string.Join(".", keySplit.Skip(1).ToArray<string>()));
			}
			return value;
		}
		public void IterateList(Action<TemplateData> fn)
		{
			foreach (TemplateData item in list)
			{
				fn(item);
			}
		}
		public long Count()
		{
			return this.list.Count();
		}

		public TemplateData asList()
		{
			if (this.type == "list")
			{
				// already a list, so just clone it 
				return new TemplateData(this);
			}
			Dictionary<string, object> dict = (Dictionary<string, object>)JsonSupport.Deserialize(this.toJson());
			List<object> list = new List<object>();
			list.Add(dict);
			return new TemplateData(list);
		}
		public string toJson(int? indentLevel = null)
		{
			string result = "";
			bool bComma = false;
			if (indentLevel == null)
			{
				indentLevel = 0;
				foundObjects = new List<object>();
			}
			foundObjects.Add(this);
			if (this.type == "list")
			{
				result += "[\n";
				this.list.ForEach(dict =>
				{
					result = Regex.Replace(result + ((bComma ? "," : this.indent(indentLevel + 1)) + dict.toJson(indentLevel + 1)), @"\n\s*\n", "\n");
					bComma = true;
				});
				result += ("\n" + this.indent(indentLevel) + "]");
			} else
			{
				List<string> keys = this.dictionary.Keys.ToList<string>();
				if (keys.Count == 1 && keys[0] == "_")
				{
					result += ("\n" + this.indent(indentLevel) + "\"" + Regex.Replace((this.dictionary[keys[0]].ToString()), @"[""]", "\\\"") + "\"");
				}
				else
				{
					result += "{\n";
					keys.ForEach(keyname =>
					{
						object value = this.dictionary[keyname];
						result += (this.indent(indentLevel + 1) + (bComma ? "," : "") + "\"" + keyname + "\": ");
						if (value is TemplateData)
						{
							if (TemplateData.foundObjects.Contains(value))
                            {
								result += "null";
                            }
							else
							{
								result += ((TemplateData)value).toJson(indentLevel + 1);
							}
						}
						else if (value == null)
						{
							result += "null";
						}
						else if (value is string)
						{
							value = Regex.Replace(Regex.Replace(value.ToString(),@"\n ", "\\n"),@"\r ", "\\r");
							result += ("\"" + Regex.Replace(Regex.Replace(value.ToString(), @"\\", "\\"), @" ""","\\\"") + "\"");
						}
						else
						{
							result += value.ToString();
						}
						result += '\n';
						bComma = true;
					});
					result += (this.indent(indentLevel) + '}');
				}
			}
			return result;
		}
		private string indent(int? indentLevel)
		{
			string result = "";
			for (int i = 0; i < indentLevel; i++)
			{
				result += "   ";
			}
			return result;
		} 
		public void add(string name, object value)
		{
			this.dictionary[name] = value;
		}
        public override string ToString()
        {
			return this.toJson();
        }
    }
}
