/*
 ***********************************************************
 ** ZStringConvFunct - Gestione delle conversioni stringhe
 ** Versione 1.0  12 Agosto 2020
 **               - Prima versione
 ***********************************************************/
 
String.prototype.SplitCSVWithDoublequotes = function (Delimiter = ',') 
{  
   const QUOTES = '"';  
   var Elemento = '';
   var InString = false;
   var Result = [];
   for (var i = 0; i < this.length; ++i) 
   {  
     if(InString)
     {
       if(this.charAt(i) == QUOTES)
          InString = false;
       else Elemento += this.charAt(i);
     }
     else       
     {
      if(this.charAt(i) == QUOTES)
         InString = true;
      else 
      {
         if(this.charAt(i) == Delimiter)
         {
            Result.push(Elemento);
            Elemento = '';
         }
         else Elemento += this.charAt(i);
      }
     }
   }
   if (Elemento != '') 
       Result.push(Elemento);       
   
   return Result;  
}
