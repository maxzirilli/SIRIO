SIRIOApp.controller("loginController",['$scope','SystemInformation','$state','$rootScope',
function($scope,SystemInformation,$state,$rootScope)
{
  $scope.HTTPError = SystemInformation.HTTPError;
  $scope.SubHTTPError = SystemInformation.SubHTTPError;

  $scope.Invia = function()
  {
   SystemInformation.Login($scope.Account,$scope.Password,
        function()
        {
          SystemInformation.GetInformation(
          function()
          { 
            $rootScope.ActualTheme = STATE_LOGGED;
            $state.go('startPage');
          },
          function()
          {
            $scope.HTTPError = SystemInformation.HTTPError;
            $scope.SubHTTPError = SystemInformation.SubHTTPError;
            $rootScope.ActualTheme = STATE_NOT_LOGGED;
          });
        },
        function(Errore)
        {
          $scope.HTTPError = Errore;
          $scope.SubHTTPError = SystemInformation.SubHTTPError;
        });
  }

  /*$scope.OggettoFattura = 
  {
    DatiDitta : 
    {
      RagioneSociale : "Pawalike",
      Indirizzo      : "Via Roma",
      Citta          : "Roma",
      Provincia      : "RM",
      Cap            : "16100",
      PartitaIva     : "PI57590093753"
    },

    Intestatario : 
    {
      RagioneSociale : "Gino Pino",
      Indirizzo      : "Via Donaver",
      Citta          : "Domodossola",
      Provincia      : "DM",
      Cap            : "16245",
      CodiceFiscale  : "GNPN0987654321A",
      PartitaIva     : "PI25364748959" 
    },

    Varie : 
    {
      ImmagineLogo    : "img/Pagina43Logo.jpg",
      TipoDocumento   : "Fattura - Copia di cortesia",
      NumeroDocumento : "1",
      DataDocumento   : new Date(1993, 2, 10),
      Iva             : 22
    },

    Voci : 
    {
      Voce_Ivata : 
      {
        Descrizione : "Assicurazione",
        Iva         : 22,
        Prezzo      : 100,
      },

      Voce_Non_Ivata : 
      {
        Descrizione : "Sergvizi",
        Iva         : 0,
        Prezzo      : 50
      },

    },

    GetTotaleImponibile()
    {
      return (((100 * this.Voci.Voce_Ivata.Prezzo) / (this.Varie.Iva + 100)) + this.Voci.Voce_Non_Ivata.Prezzo).toFixed(2);
    },

    GetTotaleImposta()
    {
      return ((this.Voci.Voce_Ivata.Prezzo * this.Voci.Voce_Ivata.Iva) / 100).toFixed(2)
    },

    GetTotaleDocumento()
    {
      return (this.Voci.Voce_Ivata.Prezzo + this.Voci.Voce_Non_Ivata.Prezzo).toFixed(2);
    }
  }

  $scope.StampaFatturaPawalike = function(datiFattura)
  {
    var Data        = new Date();
    var DataAnno    = Data.getFullYear();
    var DataMese    = Data.getMonth()+1; 
    var DataGiorno  = Data.getDate();
    var DataFattura = DataGiorno.toString() + '_' + DataMese.toString() +  '_' + DataAnno.toString();

    var Documento = new jsPDF();
    Documento.setProperties({title: 'FATTURA ' + DataFattura});

    Documento.addImage(SystemInformation.LogoImmagine, 'JPEG', 10, 10, 30, 28);

    Documento.setFontSize(10); 
    Documento.setFontType('bold');
    var CoordY = 25;

    Documento.setLineWidth(0.2);
    Documento.line(8,CoordY + 20,200,CoordY + 20);
    Documento.line(200,CoordY + 20,200,CoordY + 50);
    Documento.line(8,CoordY + 50,200,CoordY + 50);
    Documento.line(8,CoordY + 20,8,CoordY + 50);

    Documento.text(150,CoordY + 25, 'MITTENTE DOCUMENTO');  
    Documento.setFontType('normal');
    Documento.text(150,CoordY + 30, datiFattura.DatiDitta.RagioneSociale);
    Documento.text(150,CoordY + 35, datiFattura.DatiDitta.Indirizzo);
    Documento.text(150,CoordY + 40, datiFattura.DatiDitta.Citta + ' (' + datiFattura.DatiDitta.Provincia + ') - ' + datiFattura.DatiDitta.Cap);
    Documento.text(150,CoordY + 45, datiFattura.DatiDitta.PartitaIva);

    Documento.setFontType('bold');
    Documento.text(10,CoordY + 25, 'INTESTATARIO DOCUMENTO');   
    Documento.setFontType('normal');
    Documento.text(10,CoordY + 30, 'Spett.' + datiFattura.Intestatario.RagioneSociale);
    Documento.text(10,CoordY + 35, datiFattura.Intestatario.Indirizzo);
    Documento.text(10,CoordY + 40, datiFattura.Intestatario.Citta + ' (' + datiFattura.DatiDitta.Provincia + ') - ' + datiFattura.DatiDitta.Cap);
    Documento.text(10,CoordY + 45, 'P.IVA : CF : ' + datiFattura.Intestatario.PartitaIva);

    Documento.setLineWidth(0.2);
    Documento.line(8,CoordY + 51,200,CoordY + 51);
    Documento.line(200,CoordY + 51,200,CoordY + 65);
    Documento.line(8,CoordY + 51,8,CoordY + 65);
    Documento.line(8,CoordY + 65,200,CoordY + 65);

    Documento.setFontType('bold');
    Documento.text(10,CoordY + 55, 'TIPO DOCUMENTO');
    Documento.text(100,CoordY + 55, 'NR° DOCUMENTO');
    Documento.text(150,CoordY + 55, 'DATA DOCUMENTO');

    Documento.setFontType('normal');
    Documento.text(10,CoordY + 60, datiFattura.Varie.TipoDocumento);
    Documento.text(100,CoordY + 60, datiFattura.Varie.NumeroDocumento);
    Documento.text(150,CoordY + 60, datiFattura.Varie.DataDocumento.getDate() + '/' + (datiFattura.Varie.DataDocumento.getMonth() + 1)  + '/' + datiFattura.Varie.DataDocumento.getFullYear());
    
    Documento.setFontType('bold');
    Documento.text(10,CoordY + 70, 'DESCRIZIONE');
    Documento.text(150,CoordY + 70, 'IVA');
    Documento.text(180,CoordY + 70, 'PREZZO');
    Documento.setFontType('normal');
    
    Documento.text(10,CoordY + 75, datiFattura.Voci.Voce_Ivata.Descrizione);
    var Q  = Documento.getTextWidth('IVA');
    var Qt = Documento.getTextWidth(datiFattura.Voci.Voce_Ivata.Iva.toString() + '%');
    Documento.text(150 + Q + 1 - Qt,CoordY + 75,datiFattura.Voci.Voce_Ivata.Iva.toString() + '%');
    Q  = Documento.getTextWidth('PREZZO');
    Qt = Documento.getTextWidth(datiFattura.Voci.Voce_Ivata.Prezzo.toString() + ' €');
    Documento.text(180 + Q + 1 - Qt,CoordY + 75,datiFattura.Voci.Voce_Ivata.Prezzo.toString() + ' €');

    Documento.text(10,CoordY + 80, datiFattura.Voci.Voce_Non_Ivata.Descrizione);
    var Q  = Documento.getTextWidth('IVA');
    var Qt = Documento.getTextWidth(datiFattura.Voci.Voce_Non_Ivata.Iva.toString() + '%');
    Documento.text(150 + Q + 1 - Qt,CoordY + 80,datiFattura.Voci.Voce_Non_Ivata.Iva.toString() + '%');
    Q  = Documento.getTextWidth('PREZZO');
    Qt = Documento.getTextWidth(datiFattura.Voci.Voce_Non_Ivata.Prezzo.toString() + ' €');
    Documento.text(180 + Q + 1 - Qt,CoordY + 80,datiFattura.Voci.Voce_Non_Ivata.Prezzo.toString() + ' €');

    CoordY += 20;
    Documento.setLineWidth(0.2);
    Documento.line(150,CoordY + 200,200,CoordY + 200);
    Documento.line(150,CoordY + 245,200,CoordY + 245);

    Documento.line(150,CoordY + 200,150,CoordY + 245);
    Documento.line(200,CoordY + 200,200,CoordY + 245);
    
    Documento.line(150,CoordY + 215,200,CoordY + 215);
    Documento.line(150,CoordY + 230,200,CoordY + 230);
    
    Documento.setFontType('bold');
    Documento.text(167,CoordY + 205, 'TOT. IMPONIBILE');
    Documento.text(172,CoordY + 220, 'TOT. IMPOSTA');
    Documento.text(166,CoordY + 235, 'TOT. DOCUMENTO');

    Documento.setFontType('normal');

    var TotImponibile = datiFattura.GetTotaleImponibile().toString() + ' €';
    Q  = Documento.getTextWidth('TOT. IMPONIBILE');
    Qt = Documento.getTextWidth(TotImponibile);
    Documento.text(167 + Q + 1 - Qt,CoordY + 210,TotImponibile);

    var TotImposta = datiFattura.GetTotaleImposta().toString() + ' €';
    Q  = Documento.getTextWidth('TOT. IMPOSTA');
    Qt = Documento.getTextWidth(TotImposta);
    Documento.text(172 + Q + 1 - Qt,CoordY + 225,TotImposta);

    var TotDocumento = datiFattura.GetTotaleDocumento().toString() + ' €';
    Q  = Documento.getTextWidth('TOT. DOCUMENTO');
    Qt = Documento.getTextWidth(TotDocumento);
    Documento.text(166 + Q + 1 - Qt,CoordY + 240,TotDocumento);

    Documento.save('FATTURA ' + DataFattura + '.pdf',{});
  }

    SystemInformation.Init();*/

}]);

