<?php

// begin output buffer
ob_start();

// set content header
header('Content-type: application/pdf');
//error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

// Load Dependecies
require('fpdf17/fpdf.php');

class PDF extends FPDF
{
	function WordWrap(&$text, $maxwidth)
  {
      $text = trim($text);
      if ($text==='')
          return 0;
      $space = $this->GetStringWidth(' ');
      $lines = explode("\n", $text);
      $text = '';
      $count = 0;
  
      foreach ($lines as $line)
      {
          $words = preg_split('/ +/', $line);
          $width = 0;
  
          foreach ($words as $word)
          {
              $wordwidth = $this->GetStringWidth($word);
              if ($wordwidth > $maxwidth)
              {
                  // Word is too long, we cut it
                  for($i=0; $i<strlen($word); $i++)
                  {
                      $wordwidth = $this->GetStringWidth(substr($word, $i, 1));
                      if($width + $wordwidth <= $maxwidth)
                      {
                          $width += $wordwidth;
                          $text .= substr($word, $i, 1);
                      }
                      else
                      {
                          $width = $wordwidth;
                          $text = rtrim($text)."\n".substr($word, $i, 1);
                          $count++;
                      }
                  }
              }
              elseif($width + $wordwidth <= $maxwidth)
              {
                  $width += $wordwidth + $space;
                  $text .= $word.' ';
              }
              else
              {
                  $width = $wordwidth + $space;
                  $text = rtrim($text)."\n".$word.' ';
                  $count++;
              }
          }
          $text = rtrim($text)."\n";
          $count++;
      }
      $text = rtrim($text);
      return $count;
  }
}

// Prety up the number
$pdf = new PDF('P','in','Letter');


/************************************************************
Cover Page
************************************************************/
$pdf->AddPage();

// title page image background
$pdf->Image('reportCoverPageCompass.png',0,0,8.5);

 
// White text on top of title page
$pdf->SetTextColor(255,255,255);

// Title page header
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B',40);
$pdf->Ln(5.35);
// $pdf->Cell(0.3);
$pdf->Cell(0,0, "Compass County Report");
//esri Working
//$renderer = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/dynamicLayer/generateRenderer?layer={"id":101,"source":{"type":"mapLayer","mapLayerId":3}}&classificationDef={"type":"classBreaksDef","classificationField":"POP2007","classificationMethod":"esriClassifyNaturalBreaks","breakCount":5}&where=&f=pjson';
//CoD working breaksRenderer
$renderer = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/dynamicLayer/generateRenderer?layer={"id":1,"source":{"type":"mapLayer","mapLayerId":1}}&classificationDef={"type":"classBreaksDef","classificationField":"POP","classificationMethod":"esriClassifyNaturalBreaks","breakCount":5}&where=&f=pjson';
$rendererJSON = file_get_contents($renderer);
$rendererString = str_replace(" ","",$rendererJSON);
$rendererString = preg_replace('/[ \t]+/', ' ', preg_replace('/\s*$^\s*/m', "\n", $rendererJSON));
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(1);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap($rendererString, 75));
//CoD working Manual Breaks
$rendererStringNew = '{ 	
      "type" : "classBreaks", 
      "field" : "POP", 
      "classificationMethod" : "esriClassifyManual", 
      "defaultSymbol": {
        "type": "esriSFS",
        "style": "esriSFSDiagonalCross",
        "color": [255,0,0,255],
        "outline": {
          "type": "esriSLS",
          "style": "esriSLSSolid",
          "color": [110,110,110,255],
          "width": 0.5
        }
      },
      "minValue" : 0.0, 
      "classBreakInfos" : [
        {
          "classMaxValue" : 1500, 
          "label" : "0.0 - 1500.000000", 
          "description" : "0 to 1500", 
          "symbol" : 
          {
            "type" : "esriSFS", 
            "style" : "esriSFSSolid", 
            
            "color" : [236,252,204,255], 
            "outline" : 
            {
              "type" : "esriSLS", 
              "style" : "esriSLSSolid", 
              
              "color" : [216,242,237,255], 
              "width" : 0.4
            }
          }
        }, 
        {
          "classMaxValue" : 2500, 
          "label" : "1501 - 2500", 
          "description" : "1501 to 2500", 
          "symbol" : 
          {
            "type" : "esriSFS", 
            "style" : "esriSFSSolid", 
            
            "color" : [44,167,158,255], 
            "outline" : 
            {
              "type" : "esriSLS", 
              "style" : "esriSLSSolid", 
              
              "color" : [110,110,110,255], 
              "width" : 0.4
            }
          }
        }, 
        {
          "classMaxValue" : 4164, 
          "label" : "2501 - 4164", 
          "description" : "2501 to 1000000", 
          "symbol" : 
          {
            "type" : "esriSFS", 
            "style" : "esriSFSSolid", 
            
            "color" : [21,79,74,255], 
            "outline" : 
            {
              "type" : "esriSLS", 
              "style" : "esriSLSSolid", 
              
              "color" : [110,110,110,255], 
              "width" : 0.4
            }
          }
        }
      ]
}';
$rendererStringNew = str_replace(" ","",$rendererStringNew);
$rendererStringNew = preg_replace('/[ \t]+/', ' ', preg_replace('/\s*$^\s*/m', "\n", $rendererStringNew));

// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(1);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap($rendererStringNew, 75));

// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(1);
// $pdf->Cell(0.3);
// $pdf->Cell(0,0, $rendererJSON);
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(5);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap($rendererJSON, 75));
// $testExtent = file_get_contents('http://172.16.30.251/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/1/query?where=id=4&f=json'); 
// 
// $testExtentJSON = json_decode($testExtent);
// $testString = json_encode($testExtentJSON);
// $features = $testExtentJSON->{'features'};
// $geometry = $testExtentJSON->{'spatialReference'}->{'wkid'};
// $coordPoints = $testExtentJSON->{'features'}{0}->{'geometry'}->{'rings'}{0};//{'geometry'}{'rings'}{0};
// $minX = $coordPoints{0}{0};
// $maxX = $coordPoints{0}{0};
// $minY = $coordPoints{0}{1};
// $maxY = $coordPoints{0}{1};
// $aryLength = count($coordPoints);
// 
// for ($ii=0; $ii<$aryLength; $ii++)
// {
    // $xCoord = $coordPoints[$ii][0];
    // $yCoord = $coordPoints[$ii][1];
  // if ($xCoord<$minX){$minX=$xCoord;}
  // if ($xCoord>$maxX){$maxX=$xCoord;}
  // if ($yCoord<$minY){$minY=$yCoord;}
  // if ($yCoord>$maxY){$maxY=$yCoord;}
// }
// 
// $minMaxBuffer = 250;
// $minX = $minX - $minMaxBuffer;
// $maxX = $maxX + $minMaxBuffer;
// $minY = $minY - $minMaxBuffer;
// $maxY = $maxY + $minMaxBuffer;
// 
// $myFinalExtent = array($minX,$minY,$maxX,$maxY);

$pdf->AddPage();
//Working CoD example
//$mapURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=1995169.145462,766212.599375,2088928.375462,908397.999375&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":1,"source":{"type":"mapLayer","mapLayerId":1},"drawingInfo":{"renderer":{"type":"simple","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[255,0,0,255],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,255,0,255],"width":1}}}}}]&gdbVersion=&f=image';
//working ESRI Classification
// $renderer = '{
  // "type" : "classBreaks",
  // "field" : "POP_13",
  // "classificationMethod" : "esriClassifyNaturalBreaks", 
  // "breakCount": 5
// }';
// $rendererJSON = json_encode($renderer);
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(5.35);
// $pdf->Cell(0.3);
// $pdf->Cell(0,0, "renderer = "$renderer);

//test COD Classifications
// $mapURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=1995169.145462,766212.599375,2088928.375462,908397.999375&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":1,"source":{"type":"mapLayer","mapLayerId":1},"drawingInfo":{"renderer":{"type":"simple","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[255,0,0,255],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,255,0,255],"width":1}}}}}]&gdbVersion=&f=image';
//working ESRI Example
//ESRI working simple renderer
// $mapURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=1995169.145462,766212.599375,2088928.375462,908397.999375&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":1,"source":{"type":"mapLayer","mapLayerId":1},"drawingInfo":{"renderer":{"type":"classBreaks","field":"POP2007","classificationMethod":"esriClassifyNaturalBreaks","minValue":523174,"classBreakInfos":[{"classMaxValue":1993495,"label":"523174-1993495","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,0,255]}},{"classMaxValue":4663715,"label":"1993496-4663715","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,128,255]}},{"classMaxValue":7862029,"label":"4663716-7862029","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,255,255]}},{"classMaxValue":13122246,"label":"7862030-13122246","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,128,255,255]}},{"classMaxValue":37483448,"label":"13122247-37483448","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,0,255,255]}}]}}}]&gdbVersion=&f=image';
//CoD working classBreaks renderer
// $URL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=1995169.145462,766212.599375,2088928.375462,908397.999375&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":1,"source":{"type":"mapLayer","mapLayerId":1},"drawingInfo":{"renderer":'.$rendererString.'}}]&gdbVersion=&f=image';

// //ESRI working simple renderer
// $mapURL = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/export?bbox=-183.78001472868405,16.300709121618663,-61.406854669684265,74.03030803096895&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":101,"source":{"type":"mapLayer","mapLayerId":3},"drawingInfo":{"renderer":{"type":"classBreaks","field":"POP2007","classificationMethod":"esriClassifyNaturalBreaks","minValue":523174,"classBreakInfos":[{"classMaxValue":1993495,"label":"523174-1993495","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,0,255]}},{"classMaxValue":4663715,"label":"1993496-4663715","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,128,255]}},{"classMaxValue":7862029,"label":"4663716-7862029","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,255,255,255]}},{"classMaxValue":13122246,"label":"7862030-13122246","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,128,255,255]}},{"classMaxValue":37483448,"label":"13122247-37483448","description":"","symbol":{"type":"esriSFS","style":"esriSFSSolid","outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,255],"width":1},"color":[0,0,255,255]}}]}}}]&gdbVersion=&f=image';
// //ESRI working classBreaks renderer 
// $URL = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/export?bbox=-183.78001472868405,16.300709121618663,-61.406854669684265,74.03030803096895&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":101,"source":{"type":"mapLayer","mapLayerId":3},"drawingInfo":{"renderer":'.$rendererString.'}}]&gdbVersion=&f=image';
// $URL = trim(preg_replace('/\s+/', '', $URL));
// $URL = str_replace(" ","",$URL);
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(5);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap($URL, 75));

$URLNew = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=1995169.145462,766212.599375,2088928.375462,908397.999375&bboxSR=&layers=&layerDefs=&size=&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=[{"id":1,"source":{"type":"mapLayer","mapLayerId":1},"drawingInfo":{"renderer":'.$rendererStringNew.'}}]&gdbVersion=&f=image';
$URLNew = trim(preg_replace('/\s+/', '', $URLNew));
$URLNew = str_replace(" ","",$URLNew);
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(5);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap($URLNew, 75));


$pdf->Image($URLNew,0.3,1.3,7.9, 7.9, "PNG");

//draw border around map
// $pdf->SetLineWidth(0.05);
// $pdf->rect(0.3,1.3,7.9, 7.9);

//************************************************************
//Output PDF Report
//************************************************************/
$pdf->Output();

ob_end_flush();

?>