/*
 ***********************************************************
 ** ZArrayFunct - Gestione degli array
 ** Versione 1.2  24 Giugno 2020 
 **               - NEW: Introdotta funzione che convert un vettore di interi in esadecimale
 ** Versione 1.1  13 Giugno 2019
 **               - NEW: Aggiunta grep 
 ** Versione 1.0  08 Novembre 2017
 **               - Prima versione
 ***********************************************************/
 
Array.prototype.Contains = function(obj) 
{
    var i = this.length;
    while (i--) 
    {
     if (this[i] == obj) 
         return true;
    }
    return false;
}

Array.prototype.grep = function(callback) 
{
    var filtered = [],
        len = this.length,
        i = 0;
    for (i; i < len; i++) 
    {
        var item = this[i];
        var cond = callback(item);
        if (cond) 
        {
            filtered.push(item);
        }
    }

    return filtered;
};

Array.prototype.IntToHex = function()
{
  var Result = ''; 
  for(let i = 0; i < this.length; i++)
  {  
     if(this[i] < 0)
        this[i] = this[i] + 128 * 2; 
     let Value = this[i].toString(16);
     if(Value.length > 2) 
        Value = Value.substr(0,2)
     else 
     {
       if(Value.length == 1)
         Value = '0' + Value;
     }
     Result += Value;
  }
  return(Result.toUpperCase());
}