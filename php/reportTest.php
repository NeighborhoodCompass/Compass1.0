<?php

// begin output buffer
ob_start();

// set content header
header('Content-type: application/pdf');
//error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

// Load Dependecies
require('fpdf17/fpdf.php');

// Get form variables
$neighborhood = $_REQUEST['n'];
$measures = $_REQUEST['m'];

// Load data JSON
$string = file_get_contents("../scripts/metricsBGsDEV.json");
$json = json_decode($string, true);

// Get complete metrics fields array
$metrics = array();
foreach ($json as $value) {
    array_push($metrics, $value["field"]);
}

// Load neighborhood information from geojson
if (count($measures) > 0) {
    $string = file_get_contents("../scripts/DurhamBGs_ratios.json");
    $npa_json = json_decode($string, true);

    foreach ($npa_json["features"] as $value) {
        if ( $value["properties"]["id"] == $neighborhood ) {
            $npadata = $value["properties"];
        }
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
        // $this->Cell(0,0,$this->Image('seals_compass_smaller.png',0,0,0));
        $this->Cell(0,0,$this->Image('seals_compass_smaller.png',0.35,10.33,0,0,'PNG', 'http://durham-vgisapps/compass/app/index.html').'Durham Neighborhood Compass - Report generated on: ' . $today['year'] . "." . $today['mon'] . "." . $today['mday'],0,0,'R', false, 'http://durham-vgisapps/compass/app/index.html');
    }
}

// Prety up the number
function prettyData($data, $themeasure) {
    global $pdf, $json, $npadata;
    if (is_null($data) || !is_numeric($data)) {
        return "N/A";
    }
    else {
        if ($data >= 10000) $data = number_format($data);
        return $json[$themeasure]["style"]["prefix"] . $data . $json[$themeasure]["style"]["units"];
    }
}

// Create PDF
$pdf = new PDF('P','in','Letter');


/************************************************************
Cover Page
************************************************************/
$pdf->AddPage();

// title page image background
$pdf->Image('report_cover_page.png',0,0,8.5);

// White text on top of title page
$pdf->SetTextColor(255,255,255);

// Title page header
$pdf->SetFont('Arial','B',40);
$pdf->Ln(0.7);
$pdf->Cell(0.3);
$pdf->Cell(0,0, "Compass Profile Area");
$pdf->SetFont('Arial','B',180);
$pdf->Ln(1.75);
$pdf->Cell(0.3);
$pdf->Cell(0, 0, $neighborhood);

// Title page main content
$pdf->Ln(3.15);
$pdf->Cell(0.43);
$pdf->SetTextColor(0,0,45);
$pdf->SetFont('Arial','B', 50);
$pdf->MultiCell(0, 0.2, "Compass Direction");


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


$extent = file_get_contents('http://10.130.11.2/rest/v1/ws_geo_getextent.php?srid=2264&table=blockgroups&format=json&geometryfield=geom&parameters=id='. $neighborhood);
$ditch = array("go[", "]", "BOX(",")");
$replace = array("","", ",");
$extent_stripped = str_replace($ditch, "", $extent);
$extent_stripped = str_replace(" ", ",", $extent_stripped);
$extentJSON = json_decode($extent_stripped, true);
$final_extent =  explode(",", str_replace($ditch, $replace,$extentJSON[extent]));


    // $pdf->Ln(0.15);
    // $pdf->SetX($x);
    // $pdf->SetFont('Arial','B',10);
    // $pdf->Write(0, $extent);



$dx = $final_extent[2] - $final_extent[0];
$dy = $final_extent[3] - $final_extent[1];
if ($dx >= $dy) {
  $delta = (($dx - $dy) / 2) * 1.12;
  $final_extent[1] = $final_extent[1] - $delta;
  $final_extent[3] = $final_extent[3] + $delta;
}
else {
  $delta = (($dy - $dx) / 2) * 0.77;
  $final_extent[0] = $final_extent[0] - $delta;
  $final_extent[2] = $final_extent[2] + $delta;
}

$final_extent[0] = $final_extent[0] - 250;
$final_extent[1] = $final_extent[1] - 250;
$final_extent[2] = $final_extent[2] + 250;
$final_extent[3] = $final_extent[3] + 250;

// put map image (WMS) on page
// $mapURL = "http://maps.co.mecklenburg.nc.us/geoserver/wms/reflect?layers=meckbase,neighborhoods&width=800&bbox=" . implode(",", $final_extent) . "&srs=EPSG:2264&CQL_FILTER=include;id=" . $neighborhood;
$mapURL = "http://localhost:8080/geoserver/wms/reflect?layers=Durham_Compass:Durham_Basemap_BG_Report,blockgroups:blockgroups&bbox=" . implode(",", $final_extent) . "&width=800&height=512&srs=EPSG:2264&format=image/png&CQL_FILTER=include;id=" . $neighborhood;
// $mapURL = "http://localhost:8080/geoserver/blockgroups/wms?service=WMS&version=1.1.0&request=GetMap&layers=blockgroups:blockgroups&styles=redOutline&bbox=" . implode(",", $final_extent) . "&width=800&height=512&srs=EPSG:2264&format=image/png&CQL_FILTER=include;id=" . $neighborhood;
$pdf->Image($mapURL,0.3,0.3,7.9, 10, "PNG");

//draw border around map
$pdf->SetLineWidth(0.05);
$pdf->rect(0.3,0.3,7.9, 10);


/************************************************************
Data Report
************************************************************/

if (strlen($measures[0]) > 0) {
    $measureCount = 0;
    $mpp = 4; // measures per page
    for ($i=0; $i < ceil(count($measures) / $mpp); $i++) {
        $pdf->AddPage();

        if ($measures[ $measureCount]) createMeasure(0.5, 0.5, $measures[$measureCount]);
        if ($measures[$measureCount + 1]) createMeasure(4.3, 0.5, $measures[$measureCount + 1]);
        if ($measures[$measureCount + 2]) createMeasure(0.5, 5.5, $measures[$measureCount + 2]);
        if ($measures[$measureCount + 3]) createMeasure(4.3, 5.5, $measures[$measureCount + 3]);

        $measureCount = $measureCount + $mpp;
    }
}

/************************************************************
Variable Report
************************************************************/
function createMeasure($x, $y, $themeasure) {
    global $pdf, $json, $npadata;

    // value and title
    $pdf->SetTextColor(0,0,0);
    $pdf->SetY($y);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',12);
    $pdf->MultiCell(3.5, 0.15, prettyData($npadata[$json[$themeasure]["field"]], $themeasure) . " " . utf8_decode($json[$themeasure][title]), 0, "L");

    // what it is
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "What is this Indicator?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure][description])), 0, "L");

    // why it's important
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Why is this Important?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure][importance])), 0, "L");

    // about the data
    $pdf->Ln(0.15);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "About the Data");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->MultiCell(3.5, 0.15, utf8_decode(strip_tags($json[$themeasure][tech_notes])) . "\n\n". utf8_decode(strip_tags($json[$themeasure][source])), 0, "L");
}



/************************************************************
Output PDF Report
************************************************************/
$pdf->Output();

ob_end_flush();

?>
