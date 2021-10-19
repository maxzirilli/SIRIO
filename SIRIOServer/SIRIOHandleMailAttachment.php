
<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQueryHandleMailAttachment.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST"); 
      
      $SIRIOConnection = new TAdvQueryHandleMailAttachment();
      
      switch($_POST['SIRIOAttachmentMethod'])
      {
        case 'ADD' :  $SIRIOConnection->AddMailAttachment();
                      break;
        case 'GET' :  $SIRIOConnection->GetMailAttachment();
                      break;
        case 'DEL' :  $SIRIOConnection->DeleteMailAttachment();
                      break;
        default    :  break;
      }
     

?>
