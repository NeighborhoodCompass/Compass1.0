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
// $year = $_REQUEST['reportYear'];
// $substrYear = substr($year, -2,2);
// $yearSuffix = "_".$substrYear;
$censusBlocks = array();
$neighborhoods = array();
$OIDs = array();
$Names = array();
$npadataset = array();

if($reportRadioValue == 'census') {
  $targetLayer = 'Blockgroup';
  $featureUniverse = 'County';		
  $rawCensusBlock = $_REQUEST['cb'];
  foreach($rawCensusBlock as $block){
  	$aryRawCensusBlock = explode(" - ", $block);
  	$censusBlock = $aryRawCensusBlock[1];
	array_push($censusBlocks, $censusBlock);
  }
  // $censusBlock = $_REQUEST['cb'];
  $measures = $_REQUEST['cbM'];
} 
elseif($reportRadioValue == 'neighborhood') {
  $targetLayer = 'Neighborhood';
  $featureUniverse = 'Sample';	
  $rawNeighborhoods = $_REQUEST['nh'];
  foreach($rawNeighborhoods as $nbrhood){
  	array_push($neighborhoods, $nbrhood);
  }
  // $neighborhood = $_REQUEST['nh'];
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
      	  foreach($censusBlocks as $block){
      	  	if ( $value["properties"]["GEOID10"] == $block ) {
              $OID = $value["properties"]["id"];
			  $Name = $value["properties"]["GEOID10_1"];
			  array_push($Names,$Name);
			  array_push($OIDs, $OID);
			  $npadata = $value["properties"];
			  array_push($npadataset, $npadata);
          	}	
      	  }
      }
	  // $theFeature = $OID;
	  $theLayer = 'census';
  }
  elseif($reportRadioValue == 'neighborhood') {
      $string = file_get_contents("../scripts/DurhamNHs_ratios.json");
      $npa_json = json_decode($string, true); 
      foreach ($npa_json["features"] as $value) {
          foreach($neighborhoods as $nbrhood){	
	        if ( $value["properties"]["Name"] == $nbrhood ) {
	          $OID = $value["properties"]["id"];
			  $Name = $value["properties"]["Name"];
			  array_push($Names,$Name);
	          array_push($OIDs, $OID);
			  $npadata = $value["properties"];
	          array_push($npadataset, $npadata);
          	}
		  }
      }
	  // $theFeature = $OID;
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
        $this->Cell(0,0,$this->Image('Compass_ReportFooterNoCo.png',0.35,10.33,0,0,'PNG', 'http://compass.durhamnc.gov').'Page '.$this->PageNo().'                 Durham Neighborhood Compass - Report generated on: ' . $today['year'] . "." . $today['mon'] . "." . $today['mday'],0,0,'R', false, 'http://compass.durhamnc.gov');
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
function getCountyAverage($themeasure){
    global $npa_json, $json;//, $yearSuffix;
    $count = 0;
	$measureSum = 0;
    foreach ($npa_json["features"] as $value) {
       	$measure = $value["properties"][$themeasure];//.$yearSuffix];
  		$measureSum = $measureSum + $measure;
  		$count = $count + 1;
    }
	$prefix = "";
	$suffix = "";
    if(array_key_exists("units",$json[$themeasure]['style'])){
	   	$suffix = $json[$themeasure]['style']['units'];
	}
	if(array_key_exists("prefix",$json[$themeasure]['style'])){
       	$prefix = $json[$themeasure]['style']['prefix'];
	}
    $average = round($measureSum/$count, 0, PHP_ROUND_HALF_UP);
	// return $average;
	return $prefix . $average . $suffix;
	
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
$pdf->SetTextColor(255,255,255);

if($reportRadioValue == 'census') {
	$features = $censusBlocks;
} elseif($reportRadioValue == 'neighborhood') {
	$features = $neighborhoods;
}

foreach($features as $key =>$feature){
	
	// $key = array_search('green', $array);
	$theOID = $OIDs[$key];
	$theName = $Names[$key];
	$theNPAData = $npadataset[$key];
	
	if($key == 0){
		// Title page header
		$pdf->SetTextColor(0,0,45);
		$pdf->SetFont('Arial','B',40);
		$pdf->Ln(5.35);
		// $pdf->Cell(0.3);
		$pdf->Cell(0,0, "Compass Profile Areas:");
		$pdf->SetFont('Arial','B',30);
		$pdf->Ln(.2);	
		
		//Lists feature names:
		// foreach($features as $fkey => $featurename){
			// $pdf->Ln(.4);	
			// $pdf->Cell(0.3);$pdf->Cell(0, 0, $featurename);
		// }
		
		//wordwraps the feature names:
		$pdf->Ln(.2);
		$featurestring = "";
		foreach($features as $fkey => $featurename){
			if ($fkey == 0){
				$featurestring = $featurename;
			}	
			else{
				$featurestring = $featurestring.", ".$featurename;
			}
		}
		$pdf->Write(.4,WordWrap($featurestring, 75));
		$pdf->Ln(.2);
		
		$pdf->SetFont('Arial','B',20);
		$pdf->Ln(.5);
		// $pdf->Cell(0.3);
		// $pdf->Cell(0, 0, "Report Timeframe: ".$year);
	}
	
	 
	// // //this block wordwraps
	// $pdf->SetTextColor(0,0,45);
	// $pdf->SetFont('Arial','B',10);
	// $pdf->Ln(5);
	// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap("theOID = ".array_search($feature, $features), 75));
// 	
	// $pdf->SetTextColor(0,0,45);
	// $pdf->SetFont('Arial','B',10);
	// $pdf->Ln(5);
	// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap("rawCensusBlock = ".implode(",",$features), 75));
	// 
	
	if($reportRadioValue == 'census') {
		$testExtent = file_get_contents('http://172.16.30.251/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/1/query?where=id='.$theOID.'&f=json'); 
	} elseif($reportRadioValue == 'neighborhood') {
		$testExtent = file_get_contents('http://172.16.30.251/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/2/query?where=id='.$theOID.'&f=json'); 
	}
	
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
	$pdf->SetFont('Arial','B',20);
	$pdf->Ln(.5);
	// $pdf->Cell(0.3);
	$pdf->Cell(0, 0, "Profile Area: ".$feature);
	
	if($reportRadioValue == 'census') {
		$mapURL = "http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=" . implode(",", $myFinalExtent) . "&layerDefs=1:id=" . $theOID . "&layers=hide:2&width=800&height=512&dpi=150&format=png&f=image";
	} elseif($reportRadioValue == 'neighborhood') {
		$mapURL = "http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/export?bbox=" . implode(",", $myFinalExtent) . "&layerDefs=2:id=" . $theOID . "&layers=hide:1&width=800&height=512&dpi=150&format=png&f=image";
	}
	
	// Title page main content
	// $pdf->Ln(0.25);
	// $pdf->Cell(0.43);
	// $pdf->SetTextColor(0,0,45);
	// $pdf->SetFont('Arial','B', 40);
	// $pdf->MultiCell(0, 0.2, "Site Map");
	
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
			
	        if (!empty($measures[$measureCount])) createMeasure(0.5, 0.5, $theLayer, $measures[$measureCount],$theNPAData,$theName);
	        if (!empty($measures[$measureCount + 1])) createMeasure(4.3, 0.5, $theLayer, $measures[$measureCount + 1],$theNPAData,$theName);
	        if (!empty($measures[$measureCount + 2])) createMeasure(0.5, 5.5, $theLayer, $measures[$measureCount + 2],$theNPAData,$theName);
	        if (!empty($measures[$measureCount + 3])) createMeasure(4.3, 5.5, $theLayer, $measures[$measureCount + 3],$theNPAData,$theName);
	
	        $measureCount = $measureCount + $mpp;
	    }
	}
	//*****Add Closing Page - Start*****
}

$pdf->AddPage();
$pdf->SetTextColor(0,0,45);

$pdf->SetFont('Arial','B',16);
$pdf->Ln(1);
$pdf->Cell(0,0, "Report Note");
$pdf->SetFont('Arial','',10);
$pdf->Ln(0.1);
// $pdf->Cell(0.3);
$pdf->Cell(0);$pdf->Write(0.2,WordWrap("This report was generated by the Neighborhood Compass, an application created by the City of Durham. To learn more about the Compass visit compass.durhamnc.gov. 

General inquiries about the Compass and making it work for the Durham community should contact John Killeen at 919.560.1647 or john.killeen@durhamnc.gov.

Inquiries related to the Compass web application and its functionality should contact Tyler Waring at 919.560.4122 or tyler.waring@durhamnc.gov
", 100));
//*****Add Closing Page - Stop*****


// /************************************************************
// Variable Report
// ************************************************************/
function createMeasure($x, $y, $theLayer, $themeasure, $npadata, $theFeature) {
    global $pdf, $json, $bgdata, $targetLayer, $featureUniverse;//, $substrYear, $yearSuffix;
	
	
	// // //this block wordwraps
	// $pdf->SetTextColor(0,0,45);
	// $pdf->SetFont('Arial','B',10);
	// $pdf->Ln(5);
	// $pdf->Cell(0.3);$pdf->Write(0.2,WordWrap("themeasure = ".$npadata[$themeasure.$theDate], 75));
    
    // //value and title
    $pdf->SetTextColor(10,0,128);
    $pdf->SetY($y);
    $pdf->SetX($x);
	$pdf->Link($x, $y, 3.5, 0.22, 'http://compass.durhamnc.gov/index.html#/'.$theLayer.'/'.$themeasure.'/'.$theFeature);//.$substrYear.'/'.$theLayer.'/'.$themeasure.'/'.$theFeature);
    $pdf->SetFont('Arial','BU',12);
    $pdf->MultiCell(3.5, 0.22, utf8_decode($json[$themeasure]['title']), 0, "L");
    
    // $pdf->MultiCell(3.5, 0.15, $npadata[$json[$themeasure]['field']] . " " . utf8_decode($json[$themeasure]['title']), 0, "L");
	$pdf->SetTextColor(0,0,0);
    $pdf->Ln(0.07);
	$pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->MultiCell(3.5, 0.15, $targetLayer." Value: ".prettyData($npadata[$themeasure], $themeasure), 0, "L");//.$yearSuffix], $themeasure), 0, "L");
    
	$pdf->Ln(0.04);
	$pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->MultiCell(3.5, 0.15, $featureUniverse." Average: ".getCountyAverage($themeasure), 0, "L");
    // $pdf->MultiCell(3.5, 0.15, $npadata[$json[$themeasure]['field']] . " " . utf8_decode($json[$themeasure]['title']), 0, "L");
    // what it is
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',9);
    $pdf->Write(0, "What is this Indicator?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',8);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['description'])), 0, "L");

    // // why it's important
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',9);
    $pdf->Write(0, "Why is this Important?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',8);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['importance'])), 0, "L");

    // about the data
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',9);
    $pdf->Write(0, "About the Data");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',8);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure]['tech_notes'])) . "\n\n". utf8_decode(strip_tags($json[$themeasure]['source'])), 0, "L");
}

/************************************************************
Output PDF Report
************************************************************/
$pdf->Output();

ob_end_flush();

?>