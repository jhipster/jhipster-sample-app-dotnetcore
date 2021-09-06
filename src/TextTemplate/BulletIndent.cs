using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace TextTemplate
{
    public class BulletIndent
    {
		public int? level;
		public int index;
		public string indent;
		public BulletIndent parent;
		public string lastBullet = "";
		public List<string> bulletStyles = null;
		// the next is used to indicate that we've returned from a level where we could have honored a style 
		// initializer (e.g., "I:IV") so don't do that the next time we visit levels above this one 
		public int? styleInitializerLevel;
		public BulletIndent(string indent = null, BulletIndent currentBulletIndent = null, int? level = null, List<string> bulletStyles = null)
		{
			if (indent == null)
			{
				// indicates an empty BulletIndent 
				return;
			}
			this.bulletStyles = bulletStyles;
			string currentIndent = currentBulletIndent == null ? "" : currentBulletIndent.indent;
			this.indent = indent;
			if (currentBulletIndent == null)
			{
				// establish the first level 
				this.level = level == null ? 0 : level;
				this.index = 0;
				this.parent = null;
			}
			else if (this.level == level || indent == currentIndent)
			{
				// staying on the same level 
				this.level = currentBulletIndent.level;
				this.index = currentBulletIndent.index + 1;
				this.parent = currentBulletIndent.parent;
				this.styleInitializerLevel = currentBulletIndent.styleInitializerLevel;
			}
			else
			{
				// search for the same level 
				BulletIndent matchingLevel = currentBulletIndent.parent; // used to find a previous level 
				while (matchingLevel != null)
				{
					if ((level != null && matchingLevel.level == level) || indent == matchingLevel.indent)
					{
						// found a matching level, so this one is a continuation 
						this.level = matchingLevel.level;
						this.index = matchingLevel.index + 1;
						this.parent = matchingLevel.parent;
						this.styleInitializerLevel = this.level; // don't honor style initializers above this level 
						break;
					}
					else
					{
						matchingLevel = matchingLevel.parent;
					}
				}
				if (matchingLevel == null)
				{
					// create a new level 
					this.level = level == null ? (currentBulletIndent.level + 1) : level;
					this.index = 0;
					this.parent = currentBulletIndent;
					this.styleInitializerLevel = currentBulletIndent.styleInitializerLevel;
				}
			}
		}
		public BulletIndent clone()
		{
			// clone a BulletIndent that reflects the state 
			BulletIndent cloneBulletIndent = new BulletIndent();
			cloneBulletIndent.level = this.level;
			cloneBulletIndent.index = this.index;
			cloneBulletIndent.indent = this.indent;
			cloneBulletIndent.parent = this.parent;
			cloneBulletIndent.lastBullet = this.lastBullet;
			cloneBulletIndent.bulletStyles = this.bulletStyles;
			cloneBulletIndent.styleInitializerLevel = this.styleInitializerLevel;
			return cloneBulletIndent;
		}
		public string getBullet()
		{
			string bullet;
			List<string> bulletStyles = this.bulletStyles;
			if (bulletStyles == null || bulletStyles.Count == 0)
			{
				bullet = "(" + this.level + "." + this.index + ")"; // TODO: default bullet style 
			}
			else
			{
				string bulletStyleText = bulletStyles[(int)(this.level < bulletStyles.Count ? this.level : bulletStyles.Count - 1)];
				// support multiple numbers at one level by creating an array of styles that contain 0 or 1 number/letter/roman 
				string concatenatedBullet = "";
				string[] styleArray = Regex.Replace(bulletStyleText, @"(.*?(i\:[ivxldcm]+|i|I\:[IVXLDCM]+|I|1\:\d+|1|a\:[a-z]+|a|A\:[A-Z]+|A).\S*?)", "$1").Split('\x02');
				BulletIndent currentBulletLevel = this;
				for (int i = styleArray.Length - 1; i >= 0 && currentBulletLevel != null; i--)
				{
					string bulletStyle = styleArray[i];
					string padding = "";
					if (new Regex(@"^ +").IsMatch(bulletStyle))
					{
						padding = Regex.Replace(bulletStyle, @"^( +).*$", "$1");
						bulletStyle = bulletStyle.Substring(padding.Length);
					}
					string prefix = ""; 
					string postfix = "";
					string bulletType = "";
					// TODO: support styles like 'I.a.1.i', '1.1.1.1' or even '1:10.1.1.1' 
					// TODO: consider allowing \: and \\ for legitimate: 
					// support styles like 'i', 'i:iv', 'I', 'I:LV', '1', '1:13', 'a', 'a:d', 'A', 'A:AF' 
					if (new Regex(@"^.*(i\:[ivxldcm]+|i|I\:[IVXLDCM]+|I|1\:\d+|1|a\:[a-z]+|a|A\:[A-Z]+|A).*$", RegexOptions.Singleline).IsMatch(bulletStyle))
					{
						prefix = Regex.Replace(bulletStyle, @"^(.*?)(i\:[ivxldcm]+|i|I\:[IVXLDCM]+|I|1\:\d+|1|a\:[a-z]+|a|A\:[A-Z]+|A).*$", "$1");
						postfix = Regex.Replace(bulletStyle, @"^.*?(i\:[ivxldcm]+|i|I\:[IVXLDCM]+|I|1\:\d+|1|a\:[a-z]+|a|A\:[A-Z]+|A)(.*)$", "$2"); 
						bulletStyle = Regex.Replace(bulletStyle, @"^.*?(i\:[ivxldcm]+|i|I\:[IVXLDCM]+|I|1\:\d+|1|a\:[a-z]+|a|A\:[A-Z]+|A).*$", "$1");
						bulletType = bulletStyle.Substring(0, 1);
						if (bulletStyle.Contains(":"))
						{
							if (this.styleInitializerLevel != null && currentBulletLevel.level > this.styleInitializerLevel)
							{
								// ignore the style initializer because we've already popped back to a level above this 
								bulletStyle = bulletType;
							}
							else
							{
								// capture the style initializer, which is the value after the ":" 
								bulletStyle = bulletStyle.Substring(bulletStyle.IndexOf(":") + 1);
							}
						}
					}
					else if (bulletStyle.Length > 1)
					{
						if ("(<#$%*.-=+`~[{_=+|'\"".Contains(bulletStyle.Substring(0, 1))) 
						{
							prefix = bulletStyle.Substring(0, 1);
							bulletStyle = bulletStyle.Substring(1);
						}
						if (")>*]}.`~*-_=+|:'\"".Contains(bulletStyle.Substring(bulletStyle.Length - 1, 1))) 
						{
							postfix = bulletStyle.Substring(bulletStyle.Length - 1, 1);
							bulletStyle = bulletStyle.Substring(0, bulletStyle.Length - 1);
						}
					}
					bullet = bulletStyle;
					if (bulletType.Length == 1)
					{
						switch (bulletType)
						{
							case "I":
								bullet = this.numberToRoman(currentBulletLevel.index + (bulletStyle != "I" ? this.romanToNumber(bulletStyle) : 1));
								break;

							case "i":
								bullet = this.numberToRoman(currentBulletLevel.index + (bulletStyle != "i" ? this.romanToNumber(bulletStyle) : 1)).ToLower(); 
								break;

							case "1":
								bullet = (currentBulletLevel.index + (bulletStyle != "1" ? Int32.Parse(bulletStyle) : 1)).ToString();
								break;

							case "A":
							case "a":
								bullet = this.numberToAlphabet(currentBulletLevel.index + (bulletStyle.ToLower() != "a" ? this.alphabetToNumber(bulletStyle) : 1));
								if (bulletType == "a")
								{
									bullet = bullet.ToLower();
								}
								break;
						}
						if (padding.Length > 0 && bullet.Length < (padding.Length + 1))
						{
							prefix = padding.Substring(0, padding.Length - bullet.Length + 1) + prefix;
						}
						bullet = prefix + bullet + postfix;
						currentBulletLevel = currentBulletLevel.parent;
					}
					concatenatedBullet = bullet + concatenatedBullet;
				}
				bullet = concatenatedBullet;
			}
			this.lastBullet = this.indent + bullet.Replace("\x01", "");
			return bullet;
		}
		public string numberToRoman(int n)
		{
			// from vetalperko via Brendon Shaw 
			int b = 0;
			string s = "";
			for (int a = 5; n != 0; b++, a ^= 7)
			{
				int o = n % a;
				for (n = n / a ^ 0; o-- > 0;)
				{
					s = "IVXLCDM"[o > 2 ? b + n - (n &= -2) + (o = 1) : b] + s;
				}
			}
			return s;
		}
		public int romanToNumber(string romanNumeral)
		{
			Dictionary<char, int> DIGIT_VALUES = new Dictionary<char, int>();
			DIGIT_VALUES['I'] = 1;
			DIGIT_VALUES['V'] = 5;
			DIGIT_VALUES['X'] = 10;
			DIGIT_VALUES['L'] = 50;
			DIGIT_VALUES['C'] = 100;
			DIGIT_VALUES['D'] = 500;
			DIGIT_VALUES['M'] = 1000;
			int result = 0;
			var input = romanNumeral.ToUpper().ToCharArray();
			for (int i = 0; i < input.Length; i++)
			{
				if (!DIGIT_VALUES.ContainsKey(input[i]))
				{
					return -1;
				}
				int currentLetter = DIGIT_VALUES[input[i]];
				int nextLetter = DIGIT_VALUES[input[i + 1]];
				if (currentLetter < nextLetter)
				{
					result += nextLetter - currentLetter;
					i++;
				}
				else
				{
					result += currentLetter;
				}
			}
			return result;
		}
		public string numberToAlphabet(int num)
		{
			// from Chris West's routine to convert spreadsheet columns to numbers and back 
			string ret = "";
			int b = 26;
			for (int a = 1; (num - a) >= 0; b *= 26)
			{
				num -= a;
				ret = Convert.ToChar(((num % b) / a) + 65).ToString() + ret;
				a = b;
			} 
			return ret; 
		}
		public int alphabetToNumber(string alpha)
		{
			int number = 0;
			for (int i = alpha.Length, j = 0; i-- > 0; j++)
			{
				number += (int)Math.Pow(26, i) * (char.Parse(alpha.ToUpper().Substring(j, 1)) - 64);
			}
			return number;
		}

	}
}
