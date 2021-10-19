/*
 ***********************************************************
 ** ZStringConvFunct - Gestione delle conversioni stringhe
 ** Versione 1.1  19 Ottobre 2021
 **               - NEW: Aggiunta funzione che converte una stringa in un blob
 ** Versione 1.0  12 Agosto 2020
 **               - Prima versione
 ***********************************************************/
 
 function Base64AsBlob(Base64)
 {
   var binary = atob(Base64);
   var array = new Uint8Array(binary.length);
   for( var i = 0; i < binary.length; i++ )
      array[i] = binary.charCodeAt(i);
   return(new Blob([array]));
}
 
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
