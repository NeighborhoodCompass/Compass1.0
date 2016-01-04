<?php

// begin output buffer
ob_start();

// set content header
header('Content-type: application/pdf');
//error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

// Load Dependecies
require('fpdf17/fpdf.php');

// Get form variables
$reportRadioValue = $_REQUEST['reportRadio'];

if($reportRadioValue == 'census') {
  $rawCensusBlock = $_REQUEST['cb'];
  $aryRawCensusBlock = explode(" - ", $rawCensusBlock);
  $censusBlock = $aryRawCensusBlock[1];
  // $censusBlock = $_REQUEST['cb'];
  $measures = $_REQUEST['cbM'];
} 
elseif($reportRadioValue == 'neighborhood') {
  $neighborhood = $_REQUEST['nh'];
  $measures = $_REQUEST['nhM'];
}


// Load data JSON
if($reportRadioValue == 'census') {
  $string = file_get_contents("../scripts/metricsBGsDEV.json");
  $json = json_decode($string, true);
    
} 
elseif($reportRadioValue == 'neighborhood') {
  $string = file_get_contents("../scripts/metricsNHsDEV.json");
  $json = json_decode($string, true);
}

// Get complete metrics fields array
$metrics = array();
foreach ($json as $value) {
    array_push($metrics, $value["field"]);
}

// Load neighborhood information from geojson
if (count($measures) > 0) {
    
  
  if($reportRadioValue == 'census') {
      $string = file_get_contents("../scripts/DurhamBGs_ratios.json");
      $npa_json = json_decode($string, true);
      foreach ($npa_json["features"] as $value) {
          if ( $value["properties"]["GEOID10"] == $censusBlock ) {
              $bgID = $value["properties"]["id"];
			  $npadata = $value["properties"];
          }
      }
	  $theID = $bgID;
	  $theLayer = 'census';
  }
  elseif($reportRadioValue == 'neighborhood') {
      $string = file_get_contents("../scripts/DurhamNHs_ratios.json");
      $npa_json = json_decode($string, true); 
      foreach ($npa_json["features"] as $value) {
        if ( $value["properties"]["Name"] == $neighborhood ) {
          $nhID = $value["properties"]["id"];
          $npadata = $value["properties"];
        }
      }
	  $theID = $nhID;
	  $theLayer = 'neighborhoods';
  }
}

// extend FPDF for footer
class PDF extends FPDF
{
    function Footer()
    {
        $today = getdate();
        //$this->Image('seals_compass_smaller.png',0,0,0);
        $this->SetY(-0.32);
    $this->SetX(-0.5);
        $this->SetFont('Arial','I',8);
        $this->SetTextColor(0,0,0);
        $this->Cell(0,0,$this->Image('seals_compass_smaller.png',0.35,10.33,0,0,'PNG', 'http://durham-vgisapps/compass/app/index.html').'Durham Neighborhood Compass - Report generated on: ' . $today['year'] . "." . $today['mon'] . "." . $today['mday'],0,0,'R', false, 'http://durham-vgisapps/compass/app/index.html');
  }
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
function prettyData($data, $themeasure) {
    global $pdf, $json, $npadata, $bgdata;
	$prefix = "";
	$suffix = "";
    if (is_null($data) || !is_numeric($data)) {
        return "N/A";
    }
    else {
        if ($data >= 10000) $data = number_format($data);
        if(array_key_exists("units",$json[$themeasure]['style'])){
        	$suffix = $json[$themeasure]['style']['units'];
		}
		if(array_key_exists("prefix",$json[$themeasure]['style'])){
        	$prefix = $json[$themeasure]['style']['prefix'];
		}
        return $prefix . $data . $suffix;
    	// return "test" . $data . "test2";
    }
}

// Create PDF
$pdf = new PDF('P','in','Letter');


/************************************************************
Cover Page
************************************************************/
$pdf->AddPage();

// title page image background
$pdf->Image('reportCoverPageCompass.png',0,0,8.5);

// White text on top of title page
// $pdf->SetTextColor(255,255,255);

// Title page header
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B',50);
$pdf->Ln(5.35);
$pdf->Cell(0.3);
$pdf->Cell(0,0, "Compass Profile Area");


if($reportRadioValue == 'census') {
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B',40);
$pdf->Ln(1);
$pdf->Cell(0.3);$pdf->Cell(0, 0, $censusBlock);
} elseif($reportRadioValue == 'neighborhood') {
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B',40);
$pdf->Ln(1);
$pdf->Cell(0.3);$pdf->Cell(0, 0, $neighborhood);
}

if($reportRadioValue == 'census') {
$testExtent = file_get_contents('http://172.16.30.251/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/1/query?where=id='.$bgID.'&f=json'); 
} elseif($reportRadioValue == 'neighborhood') {
$testExtent = file_get_contents('http://172.16.30.251/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/2/query?where=id='.$nhID.'&f=json'); 
}


//this block wordwraps
// $pdf->SetTextColor(0,0,45);
// $pdf->SetFont('Arial','B',10);
// $pdf->Ln(1);
// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap("testExtent = ".$testExtent, 75));
$testExtentJSON = json_decode($testExtent);
$testString = json_encode($testExtentJSON);
$features = $testExtentJSON->{'features'};
$geometry = $testExtentJSON->{'spatialReference'}->{'wkid'};
$coordPoints = $testExtentJSON->{'features'}{0}->{'geometry'}->{'rings'}{0};//{'geometry'}{'rings'}{0};
$minX = $coordPoints{0}{0};
$maxX = $coordPoints{0}{0};
$minY = $coordPoints{0}{1};
$maxY = $coordPoints{0}{1};
$aryLength = count($coordPoints);

for ($ii=0; $ii<$aryLength; $ii++)
{
    $xCoord = $coordPoints[$ii][0];
    $yCoord = $coordPoints[$ii][1];
  if ($xCoord<$minX){$minX=$xCoord;}
  if ($xCoord>$maxX){$maxX=$xCoord;}
  if ($yCoord<$minY){$minY=$yCoord;}
  if ($yCoord>$maxY){$maxY=$yCoord;}
}

$minMaxBuffer = 250;
$minX = $minX - $minMaxBuffer;
$maxX = $maxX + $minMaxBuffer;
$minY = $minY - $minMaxBuffer;
$maxY = $maxY + $minMaxBuffer;

$myFinalExtent = array($minX,$minY,$maxX,$maxY);

/************************************************************/
/*                 Create Map Page                          */
/************************************************************/
$pdf->AddPage();

// Get map extent - seriously crappy math here
//*****TODO***** 
//Need to create a PHP file to get the extent for a neighborhood. 
//$extent = file_get_contents('http://maps.co.mecklenburg.nc.us/rest/v1/ws_geo_getextent.php?srid=2264&geotable=neighborhoods&format=json&parameters=id=' . $neighborhood);
// $extentJSON = json_decode($extent, true);
// $ditch = array("BOX(",")", " ");
// $replace = array("","", ",");
// $final_extent =  explode(",", str_replace($ditch, $replace,$extentJSON[rows][0][row][extent]));

if($reportRadioValue == 'census') {
$mapURL = "http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=" . implode(",", $myFinalExtent) . "&layerDefs=1:id=" . $bgID . "&layers=hide:2&width=800&height=512&format=png&f=image";
} elseif($reportRadioValue == 'neighborhood') {
$mapURL = "http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=" . implode(",", $myFinalExtent) . "&layerDefs=2:id=" . $nhID . "&layers=hide:1&width=800&height=512&format=png&f=image";
}

// Title page main content
$pdf->Ln(0.25);
$pdf->Cell(0.43);
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B', 40);
$pdf->MultiCell(0, 0.2, "Site Map");

$pdf->Image($mapURL,0.3,1.3,7.9, 7.9, "PNG");

//draw border around map
$pdf->SetLineWidth(0.05);
$pdf->rect(0.3,1.3,7.9, 7.9);




/************************************************************
Data Report
************************************************************/

if (strlen($measures[0]) > 0) {
    $measureCount = 0;
    $mpp = 4; // measures per page
    for ($i=0; $i < ceil(count($measures) / $mpp); $i++) {
        $pdf->AddPage();
		
        if (!empty($measures[$measureCount])) createMeasure(0.5, 0.5, $theLayer, $measures[$measureCount],$theID);
        if (!empty($measures[$measureCount + 1])) createMeasure(4.3, 0.5, $theLayer, $measures[$measureCount + 1],$theID);
        if (!empty($measures[$measureCount + 2])) createMeasure(0.5, 5.5, $theLayer, $measures[$measureCount + 2],$theID);
        if (!empty($measures[$measureCount + 3])) createMeasure(4.3, 5.5, $theLayer, $measures[$measureCount + 3],$theID);

        $measureCount = $measureCount + $mpp;
    }
}

// /************************************************************
// Variable Report
// ************************************************************/
function createMeasure($x, $y, $theLayer, $themeasure, $theID) {
    global $pdf, $json, $npadata, $bgdata;
	
    // value and title
    $pdf->SetTextColor(0,0,0);
    $pdf->SetY($y);
    $pdf->SetX($x);
	$pdf->Link($x, $y, 3.5, 0.15, 'http://compass.durhamnc.gov/compass/app/index.html#/'.$theLayer.'/'.$themeasure.'/'.$theID);
    $pdf->SetFont('Arial','B',12);
        $pdf->MultiCell(3.5, 0.15, prettyData($npadata[$json[$themeasure]['field']], $themeasure) . " " . utf8_decode($json[$themeasure]['title']), 0, "L");
    // $pdf->MultiCell(3.5, 0.15, $npadata[$json[$themeasure]['field']] . " " . utf8_decode($json[$themeasure]['title']), 0, "L");
	
    // what it is
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "What is this Indicator?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['description'])), 0, "L");

    // why it's important
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Why is this Important?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['importance'])), 0, "L");

    // about the data
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "About the Data");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['tech_notes'])) . "\n\n". utf8_decode(strip_tags($json[$themeasure]['source'])), 0, "L");
}



/************************************************************
Output PDF Report
************************************************************/
$pdf->Output();

ob_end_flush();

?>