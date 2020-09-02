/*
 ***********************************************************
 ** ZStringFunct - Gestione delle stringhe
 ** Versione 1.6  21 Luglio 2020
 **               - FIX: Nella funzione xSQL non si considerava il 
 **                 carattere ". Infatti veniva tramutato in %20 e poi 
 **                 non veniva gestito da json.stringify
 **               - FIX: Errore nella gestione del \
 ** Versione 1.5  23 Giugno 2020
 **               - NEW: Introdotta CountSubString
 ** Versione 1.4  13 Maggio 2020
 **               NON RETROCOMPATIBILE
 **               - NEW: xSQL non introduce più gli apici
 ** Versione 1.3  11 Giugno 2019
 **               - NEW: Aggiunta xSQL
 ** Versione 1.2  31 Gennaio 2019
 **               - NEW: Aggiunta countChar
 ** Versione 1.1  28 Settembre 2018
 **               - NEW: Aggiunta OnlyDigit
 ** Versione 1.0  18 Agosto 2017
 **               - Prima versione
 ***********************************************************/
 
String.prototype.OnlyDigit = function() 
{
    return this.replace(/\D/g,'')
}; 
 
String.prototype.xSQL = function() 
{
    var Result = this;
    Result = Result.replace(/\\/g,"\\\\");
    Result = Result.replace(/\n/g,"\\n");
    Result = Result.replace(/"/g,'\\"');
    return encodeURIComponent(Result);
};   

String.prototype.replaceAll = function(search, replacement) 
{
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.countChar = function(character) 
{
  var Result = 0;
  for(var i = 0; i < this.length; i++)
      if(this[i] == character) 
        Result++;
  return Result;
};

String.prototype.CountSubString = function(RegExpression)
{
    var Counter = this.match(RegExpression);
    if (Counter == null) return (0);
    else return (Counter.length + 1);
};

