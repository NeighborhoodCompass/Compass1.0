var CBmeta,
    NHmeta,
    activeCBRecord = {},
    activeNHRecord = {},
    //*****TimeSeries Functionality*****
    timeControl,
    year = "<strong>2013</strong>",
    yearSuffix = "_13",
    activeCBRoot = "POP",
    defaultMeasure = activeCBRoot+yearSuffix,
    activeCBMeasure = defaultMeasure,
    activeNHRoot = "RVALPSM",
    defaultNHMeasure = activeNHRoot+yearSuffix,
    activeNHMeasure = defaultNHMeasure,
    wsbase = "http://10.130.11.2/rest/",
    map,
    bgDataURL = "scripts/TSDurhamBGs_ratios.json?V=22",
    cbJSONData,
    cbgeojson,
    activeCensusBlock,
    dropdownCensusBlockName,
    censusReportSelect,
    censusSelectLabel,
    neighborhoodReportSelect,
    neighborhoodSelectLabel,
    censusReportRadio,
    neighborhoodReportRadio,
    cbReportID,
    cbReportSelector,
    nhDataURL = "scripts/TSDurhamNHs_ratios.json",
    nhJSONData,
    nhgeojson,
    nhReportID,
    nhReportSelector,
    activeNeighborhood,
    dropdownNeighborhoodName,
    dropdownCensusBlock,
    activeLayer = "census",
    bndDataURL = "scripts/DurhamBnd.json",
    bndJSONData,
    bndgeojson,
    info,
    terrainURL,
    tonerURL,
    pacURL,
    streetURL,
    aerialURL,
    zoningURL,
    fluURL,
    terrainLayer,
    tonerLayer,
    pacLayer,
    streetLayer,
    aerialLayer,
    zoningLayer,
    fluLayer,
    legend,
    basemapControl,
    userFocus,
    userFocusContent,
    marker,
    chart, 
    nhchart,
    IEBrowser = false;


$(document).ready(function() {
	
	if (navigator.appName == 'Netscape')
			{
			    var ua = navigator.userAgent;
			    var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
			    if (re.exec(ua) != null)
			        rv = parseFloat( RegExp.$1 );
				if(rv>=11){
					IEBrowser = true;
				}
				else{
					IEBrowser = false;
				}
	
	}
	console.log("getCookie = "+getCookie("bypassLogin"));
	if (getCookie("bypassLogin") != "true"){
		$("#modalLogin").modal('show');
	}
	userFocus = document.getElementById('focusSelect');
  	censusReportSelect = document.getElementById('report_census');
  	censusSelectLabel = document.getElementById('cbSelectLabel');
  	censusReportLabel = document.getElementById('cbReportLabel');
    neighborhoodReportSelect = document.getElementById('report_neighborhood');
  	neighborhoodSelectLabel = document.getElementById('nhSelectLabel');
    neighborhoodReportLabel = document.getElementById('nhReportLabel');
    reportForm = document.getElementById('submitPDFReport');
    censusReportRadio = document.getElementById('censusRadioReport');
    neighborhoodReportRadio = document.getElementById('neighborhoodRadioReport');
	
    $("#userFocusContent").fadeToggle("fast");
	$("#dropdownNeighborhood").fadeToggle("fast");
    $("#nhreport_metrics").fadeToggle("fast");
    $("#nhReportLabel").fadeToggle("fast");	
    	
    $('#modalReport').on('shown', function() {
    	$('#nhreport_metrics').val([]);
    	$('#cbreport_metrics').val([]);
    	
    	//*****TimeSeries Functionality*****
    	document.getElementById('report_year').selectedIndex = document.getElementById('timeSelect').selectedIndex;
    	document.getElementById('all_metrics').checked = false;
    	if(activeLayer == "census"){
			censusReportRadio.checked = true;
			neighborhoodReportRadio.checked = false;
			if(! $('#dropdownCensus').is(':visible') ) {
          	  $('#dropdownNeighborhood').hide();
          	  $('#dropdownCensus').show();
		  	}
		  	if(!$("#cbreport_metrics").is(':visible')){
		  		$("#nhreport_metrics").hide();
				$("#cbreport_metrics").show();
			}
			if(!$("#cbReportLabel").is(':visible')){
				$("#nhReportLabel").hide();
				$("#cbReportLabel").show();
			}
		  	if (cbReportID!=null){
        		censusReportSelect.value = cbReportSelector;	
	        }
	        reportFormCheck('census');
	    }
		else{
			censusReportRadio.checked = false;
			neighborhoodReportRadio.checked = true;
			if(! $('#dropdownNeighborhood').is(':visible') ) {
			  $('#dropdownCensus').hide();	
          	  $('#dropdownNeighborhood').show();
		  	}
		  	if(! $("#nhreport_metrics").is(':visible')){
		  		$("#cbreport_metrics").hide();
				$("#nhreport_metrics").show();
			}
			if(!$("#nhReportLabel").is(':visible')){
				$("#cbReportLabel").hide();
				$("#nhReportLabel").show();
			}
			if(nhReportID!=null){
    			neighborhoodReportSelect.value = nhReportSelector;
	    	}
	    	reportFormCheck('neighborhood');
		}
    });
	
	//get publish date of one of the data files
	var xmlFile = "data/CompassJSON.zip";
	$.ajaxSetup({
		cache : false
	});
	$.ajax({
		type : "GET",
		async : true,
		timeout : 5000,
		url : xmlFile,
		success :  function(data, textStatus, request){
		    var lastModified = request.getResponseHeader("Last-Modified");
			var aryLastMod = lastModified.split(" ",4);
			var strDate = aryLastMod.join(" ");
			document.getElementById('dataLastUpdated').innerHTML = "data last updated on " + strDate;
    	},
	}); 
	
	$("#nhreport_metrics_county").fadeToggle("fast");
    $("#nhReportLabel_county").fadeToggle("fast");
    // Load Block Groups metrics configuration
	$.ajax({
        url: "scripts/JohnTSmetricsBGsDEV.json?V=22",
        dataType: "json",
        async: false,
        success: function(data){
            CBmeta = data;
        }
    });
    // Load Neighborhood metrics configuration
    $.ajax({
        url: "scripts/JohnTSmetricsNHsDEV.json?V=22",
        dataType: "json",
        async: false,
        success: function(data){
            NHmeta = data;
        }
    });
    
    $.ajax({
        url: bgDataURL,
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
           cbJSONData = data;
           var cbSelect = document.getElementById("censusblockDropdown");
           var cbReportSelect = document.getElementById("report_census");
           for(var i=0; i<cbReportSelect.length; i++){
           	 option=document.createElement('OPTION');
           	 option.text = cbReportSelect.options[i].innerHTML;
           	 cbSelect.options.add(option);	
           }
           cbSelect.selectedIndex = -1;
        }
    });

    $.ajax({
        url: nhDataURL,
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
           nhJSONData = data;
           var features = nhJSONData.features;
           var select = document.getElementById("neighborhoodDropdown");
           var nhOption;
           var nhNames = [];
           
           for (var i = 0; i < features.length; i++) {
             var feature = features[i];
             var properties = feature.properties;
             var name = properties.Name;
             // select.add(option, null);
             nhNames.push(name);
           }
           nhNames.sort();
           for (var ii = 0; ii < nhNames.length; ii++){
             var nhOptionName = nhNames[ii];
             nhOption=document.createElement('OPTION');
             nhOption.text = nhOptionName;
             select.options.add(nhOption);	
           }
           select.selectedIndex = -1;
        }
    });
    
    $.ajax({
        url: bndDataURL,
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
           bndJSONData = data;
        }
    });
    // Placeholder
    $('input, textarea').placeholder();

     // Add census block metrics to sidebar and report list
    $.each(CBmeta, function(index) {
    	var testCBElement = document.getElementById("BGTOCElement_" + this.title);
    	// if (testCBElement){console.log(testCBElement.ID);}
    	//TODO - strip off "_yr" from the back of the field string to generalize the metric ID. 
    	var fieldRoot = this.field.substring(0, (this.field.length - 3));
    	console.log("fieldRoot = "+fieldRoot);
    	console.log("CBMeta + " + this.category + " : " + this.field+ " : " + this.title + " : " + testCBElement);
        if (this.style.breaks.length > 0 && !testCBElement) {
            $('.sidenav p[data-group=' + this.category + ']').append('<li><a href="javascript:void(0)" id="BGTOCElement_' + this.title + '" class="measure-link" data-measure="' + fieldRoot + '">' + this.title + ' <i></i></a></li>');
            $('#cbreport_metrics optgroup[data-group=' + this.category + ']').append('<option value="' + this.field + '">' + this.title + '</option>');
            $('#cbreport_metrics_county optgroup[data-group=' + this.category + ']').append('<option value="' + this.field + '">' + this.title + '</option>');
        }
    });
     // Add neighborhood metrics to neighborhood and report list
    $.each(NHmeta, function(index) {
        var testNHElement = document.getElementById("NHTOCElement_" + this.title);
    	// if (testNHElement){console.log(testNHElement.ID);}
    	console.log("NHMeta + " + this.category + " : " + this.field+ " : NHTOCElement_" + this.title + " : " + testNHElement);
        if (this.category == "testDG"){
        	console.log("stop");
        }
        
        if (this.style.breaks.length > 0 && !testNHElement) {
    		$('.nhSidenav p[nhdata-group=' + this.category + ']').append('<li><a href="javascript:void(0)" id="NHTOCElement_' + this.title + '" class="nhMeasure-link" data-nhmeasure="' + this.field + '">' + this.title + ' <i></i></a></li>');
            $('#nhreport_metrics optgroup[nhdata-group=' + this.category + ']').append('<option value="' + this.field + '">' + this.title + '</option>');
        	$('#nhreport_metrics_county optgroup[nhdata-group=' + this.category + ']').append('<option value="' + this.field + '">' + this.title + '</option>');
        }
    });

    $("#cbreport_metrics optgroup").each(function() {
        $("option", this).tsort();
    });
    $("#nhreport_metrics optgroup").each(function() {
        $("option", this).tsort();
    });

    //census block report optgroup click
    $("#cbreport_metrics optgroup").click(function(e) { $(this).children().prop('selected','selected'); reportFormCheck('census');});
    $("#cbreport_metrics optgroup option").click(function(e) { e.stopPropagation(); });
    $("#all_metrics").change(function () {
    	if(censusReportRadio.checked == true){
    		$(this).is(":checked") ? $("#cbreport_metrics optgroup option").prop('selected','selected') : $("#cbreport_metrics optgroup option").prop('selected', false);
    		reportFormCheck('census');
    	}
    	else if(neighborhoodReportRadio.checked == true){
    		$(this).is(":checked") ? $("#nhreport_metrics optgroup option").prop('selected','selected') : $("#nhreport_metrics optgroup option").prop('selected', false);
    		reportFormCheck('neighborhood');
    	}
    });
    //neighborhood report optgroup click
    $("#nhreport_metrics optgroup").click(function(e) { $(this).children().prop('selected','selected'); reportFormCheck('neighborhood');});
    $("#nhreport_metrics optgroup option").click(function(e) { e.stopPropagation(); });
    
    // Set default metric for census blocks
    updateCBData(CBmeta[defaultMeasure]);
    calcCBAverage(defaultMeasure);
    console.log("defaultMeasure = " + defaultMeasure);
    cbBarChart(CBmeta[defaultMeasure]);
    $('a[data-measure=' + defaultMeasure + ']').children("i").addClass("icon-chevron-right");
    $('a[data-nhmeasure=' + defaultNHMeasure + ']').children("i").addClass("icon-chevron-right");
    
    // Click events for census block sidebar
    $("a.measure-link").on("click", function(e) {
        $("a.measure-link").children("i").removeClass("icon-chevron-right");
        $(this).children("i").addClass("icon-chevron-right");
        if ( $(window).width() <= 767 ) $('html, body').animate({ scrollTop: $("#censusMeasureInfo").offset().top }, 1000);
        console.log("$(this).data(measure) = "+$(this).data("measure"));
        activeCBRoot = $(this).data("measure");
        console.log("activeCBRoot = "+activeCBRoot);
        activeCBMeasure = activeCBRoot+yearSuffix;
        console.log("activeCBMeasure = " + activeCBMeasure); 
        changeMeasure(activeCBMeasure);
        
        fireGAEvent('BlockgroupMeasure', 'Click', activeCBMeasure);
        e.stopPropagation();
    });
    $(".sidenav li p").on("click", function(e) { e.stopPropagation(); });
    $(".sidenav li.metrics-dropdown").on("click", function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).siblings().children("p").each(function(){
            
            if (!$(this).is(':hidden')) $(this).animate({ height: 'toggle' }, 250);
        });
        $(this).children("p").animate({ height: 'toggle' }, 250);
    });
    
    // Click events for neighborhood sidebar
    $("a.nhMeasure-link").on("click", function(e) {
        console.log("neighborhood this.data = "+$(this).data("nhmeasure"));
        $("a.nhMeasure-link").children("i").removeClass("icon-chevron-right");
        $(this).children("i").addClass("icon-chevron-right");
        if ( $(window).width() <= 767 ) $('html, body').animate({ scrollTop: $("#neighborhoodMeasureInfo").offset().top }, 1000);
        console.log("neighborhood $(this).data(nhmeasure) = "+$(this).data("nhmeasure"));
        activeNHRoot = $(this).data("nhmeasure").substring(0,$(this).data("nhmeasure").length - 3);
        console.log("activeNHRoot = "+activeNHRoot);
        activeNHMeasure = activeNHRoot+yearSuffix;
        console.log("activeNHMeasure = " + activeNHMeasure); 
        changeNHMeasure(activeNHMeasure);
        
        // activeNHMeasure = $(this).data("nhmeasure");
        // changeNHMeasure( $(this).data("nhmeasure") );
        fireGAEvent('NeighborhoodMeasure', 'Click', activeNHMeasure);
        e.stopPropagation();
    });
    $(".nhSidenav li p").on("click", function(e) { e.stopPropagation(); });
    $(".nhSidenav li.nhmetrics-dropdown").on("click", function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).siblings().children("p").each(function(){
            if (!$(this).is(':hidden')) $(this).animate({ height: 'toggle' }, 250);
        });
        $(this).children("p").animate({ height: 'toggle' }, 250);
    });
    $(".talkback").click(function() {
        $('#modalHelp').modal('hide');
        $('#modalTalkback').modal('show');
    });
    
    // Geolocation link click event
    $(".gps").click(function() {
        map.locate({ enableHighAccuracy: true });
    });

    $(".censusRadio").click(function() {
      
        if(activeLayer != "census"){
          // Set default metric for census blocks
          activeLayer = "census";
          updateCBData(CBmeta[activeCBMeasure]);
    	  calcCBAverage(activeCBMeasure);
    	  //*****TimeSeries Functionality*****
    	  hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.GEOID10 ? activeCBRecord.GEOID10 : "");
          //hashChange(activeLayer, activeCBMeasure, activeCBRecord.ID ? activeCBRecord.ID : "");
          map.removeLayer(nhgeojson);
          map.addLayer(cbgeojson);
          legend.update();
          info.update();
          
          cbgeojson.setStyle(cbStyle);
	      if (activeCBRecord.ID) highlightSelected( getCBLayer(activeCBRecord.ID) );
	      legend.update();
	      
          $("#neighborhoodMeasureInfo").fadeToggle("slow", function(){
             $("#censusMeasureInfo").fadeToggle("slow");
          });
          $("#nhChart").fadeToggle("slow", function(){
             $("#cbChart").fadeToggle("slow");
          	 cbBarChart(CBmeta[activeCBMeasure]);
    	  });
          $("#neighborhoodsTOC").fadeToggle("slow", function(){
             $("#censusBlocksTOC").fadeToggle("slow");
          });
          $("#neighborhoodSelection").fadeToggle("slow", function(){
          	 $("#censusBlockSelection").fadeToggle("slow");
          });
        }
    });
    $(".neighborhoodsRadio").click(function() {
        if (activeLayer!="neighborhoods"){
          activeLayer = "neighborhoods";
          updateNHData(NHmeta[activeNHMeasure]);
    	  calcNHAverage(activeNHMeasure);
    	  //*****TimeSeries Functionality*****
    	  hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
          //hashChange(activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
          map.removeLayer(cbgeojson);
          map.addLayer(nhgeojson);
          legend.update();
          info.update();
          
          nhgeojson.setStyle(nhStyle);
	      if(activeNHRecord.ID) highlightSelected(getNHLayer(activeNHRecord.ID));
	      legend.update();
	              
          $("#censusMeasureInfo").fadeToggle("slow", function(){
             $("#neighborhoodMeasureInfo").fadeToggle("slow");
          });
          $("#cbChart").fadeToggle("slow", function(){
             $("#nhChart").fadeToggle("slow");
          	 nhBarChart(NHmeta[activeNHMeasure]);
    	  });
          $("#censusBlocksTOC").fadeToggle("slow", function(){
             $("#neighborhoodsTOC").fadeToggle("slow", function(){
               var nhTOCEvent = document.createEvent('Event');
               nhTOCEvent.initEvent("nhTOCVisible", true, false);	
               document.dispatchEvent(nhTOCEvent);
             });
          });
          $("#censusBlockSelection").fadeToggle("slow", function(){
          	 $("#neighborhoodSelection").fadeToggle("slow");
          });
        }
        
    });
    

	$(".nhDropdown").change(function() {
		var nhdropdown = document.getElementById('neighborhoodDropdown');
		dropdownNeighborhoodName = nhdropdown.options[nhdropdown.selectedIndex].innerHTML;
		nhReportSelector = dropdownNeighborhoodName;
		var features = nhJSONData.features;
		var option;

		for (var i = 0; i < features.length; i++) {
			var feature = features[i];
			var properties = feature.properties;
			var name = properties.Name;

			if (name == dropdownNeighborhoodName) {
				if (lastLayer) {
					resetLastLayer();
				}
				var layer = L.geoJson(feature);
				lastLayer = layer;
				nhReportID = properties.ID;
				var coordinates = feature.geometry.coordinates.toString();
				var aryCoordinates = new Array();
				aryCoordinates = coordinates.split(',');
				var bounds = createLatLngBounds(aryCoordinates);
				zoomToFeature(bounds);
				activeNeighborhood = layer;
				highlightSelectedNeighborhood();
				changeNeighborhood(feature.properties.ID);
			}
		}
	}); 
	
	$(".cbDropdown").change(function() {
		var cbdropdown = document.getElementById('censusblockDropdown');
		dropdownCensusBlockName = cbdropdown.options[cbdropdown.selectedIndex].innerHTML;
		cbReportSelector = dropdownCensusBlockName;
		var features = cbJSONData.features;
		var option;

		for (var i = 0; i < features.length; i++) {
			var feature = features[i];
			var properties = feature.properties;
			var name = properties.PICK_GEOID;

			if (name == dropdownCensusBlockName) {
				if (lastLayer) {
					resetLastLayer();
				}
				var layer = L.geoJson(feature);
				lastLayer = layer;
				cbReportID = properties.ID;
				var coordinates = feature.geometry.coordinates.toString();
				var aryCoordinates = new Array();
				aryCoordinates = coordinates.split(',');
				var bounds = createLatLngBounds(aryCoordinates)
				zoomToFeature(bounds);
				activeCensusBlock = layer;
				highlightSelectedCensusBlock();
				//TODO
				changeCensusBlock(feature.properties.ID);
			}
		}
	}); 


    // Show the overview introduction text
    $(".show-overview").on("click", function(){ resetOverview(); });
    // activate popovers
    $('*[rel=popover]').popover();
    $(".popover-trigger").hoverIntent( function(){
            if ( $(window).width() > 979 ) $( $(this).data("popover-selector") ).popover("show");
        }, function(){
            $( $(this).data("popover-selector") ).popover("hide");
        }
    );

    // Window resize
    $(window).smartresize( function() {
        if(activeLayer=="census"){
          // charts
          if ( $("#details_chart svg").width() !== $("#censusMeasureInfo").width() ) cbBarChart(CBmeta[activeCBMeasure]);
          //popovers
        }
        else if (activeLayer=="neighborhoods"){
          // charts
          if ( $("#details_nhchart svg").width() !== $("#neighborhoodMeasureInfo").width() ) nhBarChart(NHmeta[activeNHMeasure]);
          //popovers
        }
    });
   
    $( "#opacity_slider" ).slider({ range: "min", value: 65, min: 0, max: 100, stop: function (event, ui) {
              if (activeLayer=='census'){
	              cbgeojson.setStyle(cbStyle);
	              if (activeCBRecord.ID) highlightSelected( getCBLayer(activeCBRecord.ID) );
	              legend.update();
              }
              else if(activeLayer=='neighborhoods'){
	              nhgeojson.setStyle(nhStyle);
	              if(activeNHRecord.ID) highlightSelected(getNHLayer(activeNHRecord.ID));
	              legend.update();
              }
        }
    }).sliderLabels('Map','Data');

    // Feedback from submit
    $("#talkback").submit(function(e){
        e.preventDefault();
        $('#modalTalkback').modal('hide');
        $.ajax({
            type: "POST",
            url: "php/feedback.php",
            data: { inputName: $("#inputName").val(), inputEmail: $("#inputEmail").val(), inputURL: window.location.href, inputFeedback: $("#inputFeedback").val() }
        });
    });

    // jQuery UI Autocomplete
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
            var that = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                if ( item.category != currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.responsetype + "</li>" );
                    currentCategory = item.category;
                }
                that._renderItemData( ul, item );
            });
        }
    }); 
    $(".geocodeButton").click(function(e) {
        
        var address = document.getElementById('searchbox').value.toUpperCase();
        if (address.indexOf("DURHAM NC") == -1 || address.indexOf("DURHAM, NC") == -1) {
            if (address.indexOf("DURHAM") !== -1){
                  address=address.split("DURHAM",1);
            }
            address.trim();
            address = address + " Durham, NC";
        }
        geocoder = new google.maps.Geocoder(); 
        geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
           var lat = results[0].geometry.location.lat();
           var lon = results[0].geometry.location.lng();
           addMarker(lat, lon);
           performIntersection(lat,lon);
        } else {
            $('#result').html('Geocode was not successful for the following reason: ' + status);
        }

        
      }); 
    });
});    
/*
    Window load events
 */
$(window).load(function(){
    // load map
    mapInit();
	hashRead();
});
function isEnter(obj, evt){
	var key= new Number;
	if (window.event){	
		key = window.event.keyCode;
	}	
	else if(evt){	
		key = evt.which;
	}	
	else{	
		return true;
	}
	if (key == 13)
	{
		evt.preventDefault();
		document.getElementById('btnSearch').click();
		return true;
	}

}
function getCookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) 
	{
	  var c = ca[i].trim();
	  if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}
function popup(){
	if (neighborhoodReportRadio.checked == true){
		fireGAEvent('Report','Generate','Neighborhoods');
		//TODO - loop over selected metrics and fire off an event for each metric. If all metrics are selected then fire off only on event for all metrics
	}
	else if(censusReportRadio.checked == true) {
		fireGAEvent('Report','Generate','Blockgroups');
		//TODO - loop over selected metrics and fire off an event for each metric. If all metrics are selected then fire off only on event for all metrics
	}
	$('#modalReport').modal('hide');
	$('.modal-backdrop').hide();
}
function checkLogin(){
	 var publicRadioChecked = document.getElementById('publicRadio').checked;
	 var cityRadioChecked = document.getElementById('cityRadio').checked;
	 var countyRadioChecked = document.getElementById('countyRadio').checked;
	 var theUserFocus = userFocus.options[userFocus.selectedIndex].value;
	 console.log("theUserFocus is = " + theUserFocus);
	 if (publicRadioChecked==true){
	 	fireGAEvent('UserType','Public',theUserFocus);
	 }
	 else if (cityRadioChecked==true){
	 	fireGAEvent('UserType','City',theUserFocus);
	 }
	 else if (countyRadioChecked==true){
	 	fireGAEvent('UserType','County',theUserFocus);
	 }	
     $('#modalLogin').modal('hide');
  	 $('.modal-backdrop').hide();
  	 //*****Update Cookie for user type
  	 document.cookie="bypassLogin=true";
  	 
  	 
  	 	var login = document.getElementById("compassLogin").value;
	    var password = document.getElementById("compassPassword").value;
	     
	    // window.location.href = "http://127.0.0.1:8020/leafletMapSelector/app/php/compassLogin.php?login=" + login + "&password=" + password;
	    // $.ajax({
	      // type: 'POST',
	      // url: 'php/compassLogin.php',
	      // data: 'login=' + login + '&password=' + password,
	      // dataType: 'json',
	      // cache: false,
	      // success: function(result) {
     	  	// if (result == "true"){
	      	// $('#modalLogin').modal('hide');
	  		// $('.modal-backdrop').hide();
	  			// document.cookie="bypassLogin=true";
	        // }
	        // else{
	      	 	// window.location.href = "http://durhamnc.gov/Pages/Home.aspx";
	        // }
	      // },   
	    // });
}

function checkUserType(){
	var publicRadioChecked = document.getElementById('publicRadio').checked;
	var cityRadioChecked = document.getElementById('cityRadio').checked;
	var countyRadioChecked = document.getElementById('countyRadio').checked;
	var aryPublicFoci;
	var opt;
	if(publicRadioChecked){
		console.log("#userFocusContent).display" + $("#userFocusContent").display);
		if ($("#userFocusContent").is(":visible")){}
		else {$("#userFocusContent").fadeToggle("slow");}
		userFocus.innerHTML = "";
		aryPublicFoci = ["Select", "Business", "Nonprofit", "Research", "Resident"];
		for(var i=0; i<aryPublicFoci.length; i++){
	    	opt = document.createElement('OPTION');
			opt.text = aryPublicFoci[i];
			opt.value = aryPublicFoci[i];
			userFocus.appendChild(opt);
    	}
    	document.getElementById("userFocus").style.color = "red";
	}
	else if(cityRadioChecked){
		if ($("#userFocusContent").is(":visible")){}
		else {$("#userFocusContent").fadeToggle("slow");}
		userFocus.innerHTML = "";
		aryPublicFoci = ["Select", "Audit Services", "Budget", "City Attorney", "City Clerk", "City Manager’s Office", "Community Development", "Durham Emergency Communications", "Elected Official", "Equal Opportunity and Equity Assurance", "Finance", "Fire", "Fleet Management", "General Services", "Human Resources", "Inspections", "Neighborhood Improvement Services", "Office of Economic and Workforce Development ", "Parks and Recreation", "Planning", "Police", "Public Affairs", "Public Works", "Solid Waste", "Technology Solutions", "Transportation", "Water Management"];
		for(var i=0; i<aryPublicFoci.length; i++){
	    	opt = document.createElement('OPTION');
			opt.text = aryPublicFoci[i];
			opt.value = aryPublicFoci[i];
			userFocus.appendChild(opt);
    	}
    	document.getElementById("userFocus").style.color = "red";	
	}
	else if(countyRadioChecked){
		if ($("#userFocusContent").is(":visible")){}
		else {$("#userFocusContent").fadeToggle("slow");}
		userFocus.innerHTML = "";
		aryPublicFoci = ["Select", "Board of Elections", "Budget and Management Services", "City/County Inspections", "Clerk of the Board", "Cooperative Extension Services", "County Attorney", "Criminal Justice Resource Center", "Deputy County Manager", "Elected Official", "Emergency Management", "Emergency Medical Services", "Engineering and Environmental Services", "Finance", "Fire Marshal", "Forest Protection", "General Services", "Human Resources", "Information Services and Technology", "Internal Audit", "Library", "Public Health", "Public Information", "Register of Deeds", "Sheriff's Office", "Social Services", "Soil and Water Conservation District", "Tax Administration", "Veteran Services", "Youth Home"];
		for(var i=0; i<aryPublicFoci.length; i++){
	    	opt = document.createElement('OPTION');
			opt.text = aryPublicFoci[i];
			opt.value = aryPublicFoci[i];
			userFocus.appendChild(opt);
    	}
    	document.getElementById("userFocus").style.color = "red";
	}
	if (publicRadioChecked == true || cityRadioChecked == true || countyRadioChecked == true){
		document.getElementById('publicLoginLabel').style.color = "black";
		document.getElementById('countyLoginLabel').style.color = "black";
		document.getElementById('cityLoginLabel').style.color = "black";
	}
	else{
		document.getElementById('countyLoginLabel').style.color = "red";
		document.getElementById('cityLoginLabel').style.color = "red";
	}
}

function checkUserFocus(){
	var publicRadioChecked = document.getElementById('publicRadio').checked;
	var cityRadioChecked = document.getElementById('cityRadio').checked;
	var countyRadioChecked = document.getElementById('countyRadio').checked;
	if (userFocus.selectedIndex > -1){document.getElementById("userFocus").style.color = "black";}
	if (publicRadioChecked == true || cityRadioChecked == true || countyRadioChecked == true){
		checkLogin();
	}
}
/*
    Hash reading and writing
*/
//****TimeSeries Functionality Hash*****
function hashChange(year, layer, measure, record) {
	var measureRoot = measure.substring(0,measure.length - 3);
    window.location.hash = "/"+year+"/"+layer+"/" + measureRoot + "/" + record;
}
// function hashChange( layer, measure, record) {
    // window.location.hash = "/"+layer+"/" + measure + "/" + record;
// }
function hashRead() {
    //This is where the hash is broken up and consumed
    if (window.location.hash.length > 1) {
        var record, measure, feature;
        if(activeLayer=="census"){
          record = activeCBRecord;
          measure = activeCBMeasure;
          feature = activeCBRecord.GEOID10;
        }
        else if(activeLayer=="neighborhoods"){
          record = activeNHRecord;
          measure = activeNHMeasure;
          feature = activeNHMeasure.Name;
        }
        
        theHash = window.location.hash.replace("#","").split("/");
         //*****TimeSeries Functionality Hash Change
         var hash1, hash2, hash3, hash4;
         hash1 = theHash[1]; 
         hash2 = theHash[2];
         hash3 = theHash[3];
         hash4 = theHash[4];
     
         console.log("hash1: "+theHash[1]);
         console.log("hash2: "+theHash[2]);
         console.log("hash3: "+theHash[3] + " hash3 length: " + theHash[3].length);
         console.log("hash4: "+theHash[4]);
         console.log("parseInt: " + parseInt(theHash[4],10));
         console.log("record.ID: "+record.ID);
         // Process the lat,lon or neighborhood number
         var hash1CheckValue = "_"+hash1;
         console.log("hash1CheckVlaue = " + hash1CheckValue);
         console.log("document.getElementById(timeSelect).value = " + document.getElementById('timeSelect').value);
 		 year = "<strong>20"+hash1+"</strong>";
	     // Process the metric
         console.log($('a[data-measure=' + hash3 +"_"+hash1+ ']').parent("li").parent("p").is(':hidden'));	
         if (hash3.length > 0 && hash3+"_"+hash1 !== measure){
         	
           if(activeLayer=="census"){
           	 if ( $('a[data-measure=' + hash3 +']').parent("li").parent("p").is(':hidden') ){
           	 		$('a[data-measure=' + hash3 +']').parent("li").parent("p").parent("li").trigger("click");
             }
             $("a.measure-link").children("i").removeClass("icon-chevron-right");
             $('a[data-measure=' + hash3 +']').children("i").addClass("icon-chevron-right");
             console.log(hash3+"_"+hash1);
             activeCBRoot = hash3;
             changeMeasure(hash3+"_"+hash1);
           }
           else if(activeLayer=="neighborhoods"){
             if ( $('a[data-nhmeasure=' + hash3 +"_"+hash1+ ']').parent("li").parent("p").is(':hidden') ) $('a[data-nhmeasure=' + hash3 +"_"+hash1+ ']').parent("li").parent("p").parent("li").trigger("click");
             $("a.nhMeasure-link").children("i").removeClass("icon-chevron-right");
             $('a[data-nhmeasure=' + hash3 +"_"+hash1+ ']').children("i").addClass("icon-chevron-right");
             console.log(hash3+"_"+hash1);
             activeNHRoot = hash3;
             changeNHMeasure(hash3+"_"+hash1);
             // if ( $('a[data-nhmeasure=' + theHash[2] + ']').parent("li").parent("p").is(':hidden') ) $('a[data-nhmeasure=' + theHash[2] + ']').parent("li").parent("p").parent("li").trigger("click");
               // $("a.nhMeasure-link").children("i").removeClass("icon-chevron-right");
               // $('a[data-nhmeasure=' + theHash[2] + ']').children("i").addClass("icon-chevron-right");
               // changeNHMeasure(theHash[2]);
           }
         }
         if (hash1.length > 0 && hash1CheckValue !== document.getElementById('timeSelect').value){
        	 //id = "timeSelect" name = "timeselect"	
        	 document.getElementById('timeSelect').value = hash1CheckValue;
        	 yearSuffix = hash1CheckValue;
	    	 if(activeLayer == "census"){changeMeasure(hash3+"_"+hash1);}
	    	 else if (activeLayer == "neighborhoods"){changeNHMeasure(hash3+"_"+hash1);}
         }
         if (hash2.length > 0 && hash2 !== activeLayer) {
           if (hash2 =="census"){
             document.getElementById('censusRadio').checked = true;
             $('.censusRadio').triggerHandler('click');
           }
           else if (hash2 =="neighborhoods"){
             document.getElementById('neighborhoodsRadio').checked = true;
             //TODO custom event
             $('.neighborhoodsRadio').triggerHandler('click');
             document.addEventListener('nhTOCVisible', function(e){
               if ( $('a[data-nhmeasure=' + hash3+"_"+hash1 + ']').parent("li").parent("p").is(':hidden') ) $('a[data-nhmeasure=' + hash3+"_"+hash1 + ']').parent("li").parent("p").parent("li").trigger("click");
               $("a.nhMeasure-link").children("i").removeClass("icon-chevron-right");
               $('a[data-nhmeasure=' + hash3+"_"+hash1+ ']').children("i").addClass("icon-chevron-right");
               changeNHMeasure(hash3+"_"+hash1);
               document.removeEventListener('nhTOCVisible', this, true);
             });
           }
   		 }
         if (hash4 && hash4.length > 0 && parseInt(hash4,10) !== record.ID) {
             if (hash4.indexOf(",") == -1) {
                 //
                 if(activeLayer=="census"){
                   changeCensusBlock(hash4, true);
                   var layer = getCBLayer(hash4, true);
                   
                   cbReportID = hash4;
    			   dropdownCensusBlockName = layer.feature.properties.PICK_GEOID;
                   cbReportSelector = dropdownCensusBlockName;
				   var element = document.getElementById('censusblockDropdown');
    			   element.value = dropdownCensusBlockName;
		         }
                 else if(activeLayer=="neighborhoods"){
                   changeNeighborhood(hash4, true);
                   var layer = getNHLayer(hash4, true);
                   nhReportID = hash4;
    			   dropdownNeighborhoodName = layer.feature.properties.Name;
    			   nhReportSelector = dropdownNeighborhoodName;
                   var element = document.getElementById('neighborhoodDropdown');
    			   element.value = dropdownNeighborhoodName;
				 }
                 console.log(layer.getBounds());
                 zoomToFeature(layer.getBounds());
             }
             else {
                 coords = hash4.split(",");
                 performIntersection(coords[0], coords[1]);
             }
         }

        
         // if (theHash[2].length > 0 && theHash[2] !== measure) {
             // if(activeLayer=="census"){
               // if ( $('a[data-measure=' + theHash[2] + ']').parent("li").parent("p").is(':hidden') ) $('a[data-measure=' + theHash[2] + ']').parent("li").parent("p").parent("li").trigger("click");
               // $("a.measure-link").children("i").removeClass("icon-chevron-right");
               // $('a[data-measure=' + theHash[2] + ']').children("i").addClass("icon-chevron-right");
               // changeMeasure(theHash[2]);
             // }
             // else if(activeLayer=="neighborhoods"){
               // if ( $('a[data-nhmeasure=' + theHash[2] + ']').parent("li").parent("p").is(':hidden') ) $('a[data-nhmeasure=' + theHash[2] + ']').parent("li").parent("p").parent("li").trigger("click");
               // $("a.nhMeasure-link").children("i").removeClass("icon-chevron-right");
               // $('a[data-nhmeasure=' + theHash[2] + ']').children("i").addClass("icon-chevron-right");
               // changeNHMeasure(theHash[2]);
             // }
         // }
		         
    }
    else{
    	$('a[data-measure=' + activeCBRoot +']').children("i").addClass("icon-chevron-right");
    }
}

/* reset to overview */
function resetOverview() {
    $(".measure-info").hide();
    $(".overview").show();
    if(activeLayer=="census"){
	    activeCBRecord = {};
	    cbBarChart(CBmeta[activeCBMeasure]);
	    cbgeojson.setStyle(cbStyle);
	    map.setView([35.99, -78.9], 10);
	    //*****TimeSeries Functionality Hash*****
	    hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, "");
        //hashChange(activeLayer, activeCBMeasure, "");
    }
    else if (activeLayer=="neighborhoods"){
    	activeNHRecord = {};
	    nhBarChart(NHmeta[activeNHMeasure]);
	    nhgeojson.setStyle(nhStyle);
	    map.setView([35.99, -78.9], 10);
	    //*****TimeSeries Functionality Hash*****
	    hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, "");
	    //hashChange(activeLayer, activeNHMeasure, "");
    }
}

function changeMeasure(measure) {
    activeCBMeasure = measure;
    
    // get average if haven't already
    if (!CBmeta[activeCBMeasure].style.avg) calcCBAverage(activeCBMeasure);
    cbgeojson.setStyle(cbStyle);
    legend.update();
    info.update();
    //TODO - why is activeCBRecord null after link to compass?
    var layer = getCBLayer(activeCBRecord.ID);
    updateCBData(CBmeta[activeCBMeasure]);
    if (activeCBRecord.ID) highlightSelected(layer);
    //*****TimeSeries Functionality Hash*****
	hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.GEOID10 ? activeCBRecord.GEOID10 : "");
    // hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.ID ? activeCBRecord.ID : "");
    //hashChange(activeLayer, activeCBMeasure, activeCBRecord.GEOID10 ? activeCBRecord.GEOID10 : "");
}
function changeNHMeasure(measure) {
    activeNHMeasure = measure;
    // get average if haven't already
    if (!NHmeta[activeNHMeasure].style.avg) calcNHAverage(activeNHMeasure);
    nhgeojson.setStyle(nhStyle);
    legend.update();
    info.update();
    var layer = getNHLayer(activeNHRecord.ID);
    updateNHData(NHmeta[activeNHMeasure]);
    if (activeNHRecord.ID) highlightSelectedNH(layer);
    //*****TimeSeries Functionality Hash*****
	hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, activeNHRecord.Name ? activeNHRecord.Name : "");
	// hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
    //hashChange(activeLayer, activeNHMeasure, activeNHRecord.Name ? activeNHRecord.Name : "");
}

function changeCensusBlock(nhid, byName) {
    if(byName != true){
    	var layer = getCBLayer(nhid);
    }
    else{
    	var layer = getCBLayer(nhid, true);
    }
    assignCBData(layer.feature.properties);
    //$(".overview").hide();
    $(".measure-info").show();
    updateCBData(CBmeta[activeCBMeasure]);
    highlightSelected(layer);
    //*****TimeSeries Functionality Hash*****
	hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.GEOID10 ? activeCBRecord.GEOID10 : "");
    // hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.ID ? activeCBRecord.ID : "");
    //hashChange(activeLayer, activeCBMeasure, activeCBRecord.GEOID10 ? activeCBRecord.GEOID10 : "");
}
function changeNeighborhood(nhid, byName) {
    if(byName != true){
    	var layer = getNHLayer(nhid);
    }
    else{
    	var layer = getNHLayer(nhid, true);
    }
    assignNHData(layer.feature.properties);
    $(".measure-info").show();
    updateNHData(NHmeta[activeNHMeasure]);
    highlightSelectedNH(layer);
	//*****TimeSeries Functionality Hash*****
	hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, activeNHRecord.Name ? activeNHRecord.Name : "");
    // hashChange(yearSuffix.substr(1,3), activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
    //hashChange(activeLayer, activeNHMeasure, activeNHRecord.Name ? activeNHRecord.Name : "");
}
/*
    Assign data to active record
 */
function assignCBData(data) {
	$.each(data, function(key, value){
        activeCBRecord[key] = value;
    });

    // Select neighborhood in report
    $("#report_census option[selected]").removeAttr("selected");
    console.log("#report_census option[value=" + activeCBRecord.ID + "]");
    $("#report_census option[value=" + activeCBRecord.ID + "]").attr('selected', 'selected');
}

function assignNHData(data) {
    $.each(data, function(key, value){
        activeNHRecord[key] = value;
    });

    // Select neighborhood in report
    $("#report_neighborhood option[selected]").removeAttr("selected");
    $("#report_neighborhood option[value=" + activeNHRecord.ID + "]").attr('selected', 'selected');
}


/*
    Update detailed data
*/
function updateCBData(measure) {
	if (activeCBRecord.ID) {
        $("#selectedCensusBlock").html("Blockgroup: " + activeCBRecord.BGTITLE);
        $("#selectedCBValue").html( prettyCBMetric(activeCBRecord[measure.field], activeCBMeasure) );
    }
    cbBarChart(measure);
    // set neighborhood overview
    
    document.getElementById('censusYear').innerHTML = year;
    $("#selectedCBMeasure").html(measure.title +": ");
    $("#cbindicator_description").html(measure.description);

    // set details info

    $("#indicator_why").html(measure.importance);
    $("#indicator_technical").empty();
    if (measure.tech_notes && measure.tech_notes.length > 0) $("#indicator_technical").append('<p>' + measure.tech_notes + '</p>');
    if (measure.source && measure.source.length > 0) $("#indicator_technical").append('<p>' + measure.source + '</p>');
    $("#indicator_resources").empty();

    // Quick links
    if (measure.quicklinks) {
        quicklinks = [];
        $.each(measure.quicklinks, function(index, value) {
            quicklinks[index] = '<a href="javascript:void(0)" class="quickLink" onclick="changeMeasure(\'' + value + '\')">' + CBmeta[value]["title"] + '</a>';
        });
        $("#indicator_resources").append("<h5>Related Variables</h5><p>" + quicklinks.join(", ") + "</p>");
    }

    // Links
    if (measure.links) {
        $("#indicator_resources").append(measure.links);
    }

    // Show stuff
    $("#welcome").hide();
    $("#selected-summary").show();
}

function updateNHData(measure) {
	console.log("updateNHData measure = "+measure);
    if (activeNHRecord.ID) {
        
        $("#selectedNeighborhood").html("Neighborhood: " + activeNHRecord.Name);
        
        $("#selectedNHValue").html( prettyNHMetric(activeNHRecord[measure.field], activeNHMeasure) );
    }
    
    nhBarChart(measure);
    
    // set neighborhood overview
    document.getElementById('neighborhoodYear').innerHTML = year;
    $("#selectedNHMeasure").html(measure.title + ": ");
    
    $("#nhindicator_description").html(measure.description);
    
    // set details info

    $("#indicator_why").html(measure.importance);
    $("#indicator_technical").empty();
    if (measure.tech_notes && measure.tech_notes.length > 0) $("#indicator_technical").append('<p>' + measure.tech_notes + '</p>');
    if (measure.source && measure.source.length > 0) $("#indicator_technical").append('<p>' + measure.source + '</p>');
    $("#indicator_resources").empty();

    // Quick links
    if (measure.quicklinks) {
        quicklinks = [];
        $.each(measure.quicklinks, function(index, value) {
            quicklinks[index] = '<a href="javascript:void(0)" class="quickLink" onclick="changeMeasure(\'' + value + '\')">' + CBmeta[value]["title"] + '</a>';
        });
        $("#indicator_resources").append("<h5>Related Variables</h5><p>" + quicklinks.join(", ") + "</p>");
    }

    // Links
    if (measure.links) {
        $("#indicator_resources").append(measure.links);
    }

    // Show stuff
    $("#welcome").hide();
    $("#selected-summary").show();
}

/*
    Bar Chart
*/
function cbBarChart(measure){
	
	console.log("updateCBData measure = "+measure);
    var data, theTitle, theColors;
    console.log("measure average = "+Math.round(CBmeta[measure.field].style.avg));
    if (jQuery.isEmptyObject(activeCBRecord) || activeCBRecord[activeCBMeasure] === null) {
        data = google.visualization.arrayToDataTable([
            ['', 'County Average'],
            ['',  Math.round(CBmeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyCBMetric(Math.round(CBmeta[measure.field].style.avg), activeCBMeasure);
        theColors = ["#DC3912"];
    }
    else {
        data = google.visualization.arrayToDataTable([
            ['', 'Blockgroup ' + activeCBRecord.BGTITLE, 'County Average'],
            ['',  parseFloat(activeCBRecord[measure.field]), Math.round(CBmeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyCBMetric(activeCBRecord[measure.field], activeCBMeasure);
        theColors = ["#0283D5", "#DC3912"];
    }

	//TODO if activeCBRoot = "R_AVGYR"
	if (activeCBMeasure.substring(0, 6) != "RAVGYR"){
    	var options = {
	      	title: theTitle,
	      	titlePosition: 'out',
	      	titleTextStyle: { fontSize: 14 },
	      	hAxis: { format: "#", minValue: CBmeta[measure.field].style.breaks[0] },
	      	width: "95%",
	      	height: 150,
	      	legend: 'bottom',
	      	colors: theColors,
	      	chartArea: { left: 20, right: 20, width: '100%' }
    	};
    }
    else{
    	var options = {
	      	title: theTitle,
	      	titlePosition: 'out',
	      	titleTextStyle: { fontSize: 14 },
	      	hAxis: { format: "#", viewWindowMode:'explicit', viewWindow:{min:'1869'}, ticks: [1869, 1900, 1930, 1960]},
	      	width: "95%",
	      	height: 150,
	      	legend: 'bottom',
	      	colors: theColors,
	      	chartArea: { left: 20, right: 20, width: '100%' }
    	};	
    }
    if (!chart) chart = new google.visualization.BarChart(document.getElementById('details_chart'));
    chart.draw(data, options);
}

function nhBarChart(measure){
    var data, theTitle, theColors;
    if (jQuery.isEmptyObject(activeNHRecord) || activeNHRecord[activeNHMeasure] === null) {
        data = google.visualization.arrayToDataTable([
            ['', 'County Average'],
            ['',  Math.round(NHmeta[measure.field].style.avg) ]
        ]);
        
        theTitle = prettyNHMetric(Math.round(NHmeta[measure.field].style.avg), activeNHMeasure);
        theColors = ["#DC3912"];
    }
    else {
        data = google.visualization.arrayToDataTable([
            ['', 'Neighborhood ' + activeNHRecord.ID, 'County Average'],
        	['',  parseFloat(activeNHRecord[measure.field]), Math.round(NHmeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyNHMetric(activeNHRecord[measure.field], activeNHMeasure);
        theColors = ["#0283D5", "#DC3912"];
    }
    //TODO if activeNHRoot != R_AVGYR
    if (activeNHMeasure.substring(0, 6) != "RAVGYR"){
    	var options = {
	      	title: theTitle,
	      	titlePosition: 'out',
	      	titleTextStyle: { fontSize: 14 },
	      	hAxis: { format: "#", minValue: NHmeta[measure.field].style.breaks[0] },
	      	width: "95%",
	      	height: 150,
	      	legend: 'bottom',
	      	colors: theColors,
	      	chartArea: { left: 20, right: 20, width: '100%' }
    	};
    }
    else{
    	var options = {
	      	title: theTitle,
	      	titlePosition: 'out',
	      	titleTextStyle: { fontSize: 14 },
	      	hAxis: { format: "#", viewWindowMode:'explicit', viewWindow:{min:'1869'}, ticks: [1869, 1900, 1930, 1960]},
	      	width: "95%",
	      	height: 150,
	      	legend: 'bottom',
	      	colors: theColors,
	      	chartArea: { left: 20, right: 20, width: '100%' }
    	};
    }
    
    if (!nhchart) nhchart = new google.visualization.BarChart(document.getElementById('details_nhchart'));
    nhchart.draw(data, options);    
}


/********************************************


    Map Stuff


********************************************/
function mapInit() {
    map = new L.Map('map', {
        center: [35.99, -78.9],
        zoomControl: false,
        zoom: 10,
        minZoom: 9
    });
    pacURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/DurhamMaps/PACDistricts/MapServer';
    
    var jqxhr = $.get( pacURL, function() {
	    terrainURL = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
	    terrainLayer = L.tileLayer(terrainURL).addTo( map );
		terrainLayer.on("load", function(e) {
			terrainLayer.bringToBack();
		});
	    // tonerURL = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png';
	    streetURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/DurhamCompass/AerialStreets/MapServer';
	    aerialURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/BaseMaps/Ortho_2010/MapServer';
	    zoningURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/DurhamCompass/zoningWRoads/MapServer';
	    fluURL = 'http://gisweb2.durhamnc.gov/arcgis/rest/services/DurhamCompass/FLUWRoads/MapServer';
	})
	.fail(function() {
		var url = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
	    var attrib = 'Data, imagery and map information provided by <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
   		otherStreets = L.tileLayer(url, {maxZoom: 18, attribution: attrib}).addTo( map );
    	document.getElementById('basemapSelect').style.display = 'none';
    })
	.always(function() {
	});
	jqxhr.always(function() {
	});
    var bndStyle = {
          "color": "#330000",
          "weight": 5,
          fillOpacity: 0,
    };
    bndgeojson = L.geoJson(bndJSONData, { style: bndStyle});
    map.addLayer(bndgeojson);
    
    // Add geojson data
    cbgeojson = L.geoJson(cbJSONData, { style: cbStyle, onEachFeature: onEachCensusBlock });
    map.addLayer(cbgeojson);

    nhgeojson = L.geoJson(nhJSONData, { style: nhStyle, onEachFeature: onEachNeighborhood});
    
    // Locate user position via GeoLocation API
    if (!Modernizr.geolocation) $(".gpsarea").hide();
    map.on('locationfound', function(e) {
        var radius = e.accuracy / 2;
        var lat = e.latlng.lat, lon = e.latlng.lng;
        addMarker(lat, lon);
        performIntersection(lat, lon);
    });
    info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    info.update = function (props) {
    	if (activeLayer == "census"){
          console.log("CBMeta "+ CBmeta[activeCBMeasure].style.avg);
          //*****TimeSeries Functionality*****
	      this._div.innerHTML = '<h4>' + CBmeta[activeCBMeasure].title + '</h4>' +  (props && props[activeCBMeasure] != undefined ?
          //this._div.innerHTML = '<h4>' + CBmeta[activeCBMeasure].title + '</h4>' +  (props && props[activeCBMeasure] != undefined ?
              'Blockgroup ' + props.GEOID10 + ': ' + prettyCBMetric(props[activeCBMeasure], activeCBMeasure) + '<br>County Average: ' + prettyCBMetric(CBmeta[activeCBMeasure].style.avg, activeCBMeasure) :
              props && props[activeCBMeasure] == undefined ? 'Blockgroup ' + props.GEOID10 + '<br />No data available.' :
          '');
        }
        else if (activeLayer =="neighborhoods"){
          this._div.innerHTML = '<h4>' + NHmeta[activeNHMeasure].title + '</h4>' +  (props && props[activeNHMeasure] != undefined ?
              'Neighborhood ' + props.Name + ': ' + prettyNHMetric(props[activeNHMeasure], activeNHMeasure) + '<br>County Average: ' + prettyNHMetric(NHmeta[activeNHMeasure].style.avg, activeNHMeasure) :
              props && props[activeNHMeasure] == undefined ? 'Neighborhood ' + props.Name + '<br />No data available.' :
          '');
        }    
    };
    info.addTo(map);
	
	basemapControl = L.Control.extend({
	    options: {
	        position: 'bottomleft'
	    },
		
	    onAdd: function (map) {
	        // create the control container with a particular class name
	        this._initLayout();
	        return this._container;
	    },
	    _initLayout: function(){
	    	var basemapClassName = 'basemapControl';
	    	var container = this._container = L.DomUtil.create('div', basemapClassName);
	    	// var form = this._form = L.DomUtil.create('form', basemapClassName + '-list');
	        this._baseLayersList = L.DomUtil.create('div', basemapClassName + '-base');
	        container.appendChild(this._baseLayersList);
			
	        this._baseLayerDropDown = L.DomUtil.create('div', 'basemapDropDown', this._baseLayersList);
	        								  // <select name="nhdropdown" class="nhDropdown" id="neighborhoodDropdown" style="visibility: visible; width: 200px; margin-right: 25px">
	        this._baseLayerDropDown.innerHTML = '<select id = "basemapSelect" name = "basemapselect" style="width: 100px"><option value = "Terrain">Terrain</option><option value = "Streets">PAC Districts</option><option value = "Aerials">Aerials</option><option value = "Zoning">Zoning</option><option value = "FLU">Future Land Use</option></select>';
			//TODO - change onmousedown event to something that is touch complient. 
			this._baseLayerDropDown.firstChild.onmousedown = this._baseLayerDropDown.firstChild.ondblclick = L.DomEvent.stopPropagation;
			this._baseLayerDropDown.firstChild.ontouchstart = L.DomEvent.stopPropagation;
			
			L.DomEvent.on(this._baseLayerDropDown, 'change', this._onBaseLayerChange,this);
		},
	    _onBaseLayerChange: function(e){
	    	var baseLayer = e.target.value;
	    	if(baseLayer == 'Terrain'){
	    		terrainLayer = terrainLayer ? map.removeLayer(terrainLayer) : null;
			    terrainLayer = L.tileLayer(terrainURL).addTo( map );
			    terrainLayer.on("load", function(e) {
			        terrainLayer.bringToBack();
			    });
	    		if(pacLayer){map.removeLayer(pacLayer);}
	    		if(streetLayer){map.removeLayer(streetLayer);}
	    		if(aerialLayer){map.removeLayer(aerialLayer);}
	    		if(zoningLayer){map.removeLayer(zoningLayer);}
	    		if(fluLayer){map.removeLayer(fluLayer);}
	    	}
	    	else if(baseLayer == 'Streets'){
	    		pacLayer = pacLayer ? map.removeLayer(pacLayer) : null;
			    pacLayer = new L.esri.dynamicMapLayer(pacURL, {}).addTo(map);
			    pacLayer.on("load", function(e) {
			        pacLayer.bringToBack();
			    });
	    		map.addLayer(pacLayer);
	    		if(streetLayer){map.removeLayer(streetLayer);}
	    		if (aerialLayer){map.removeLayer(aerialLayer);}
	    		if(zoningLayer){map.removeLayer(zoningLayer);}
	    		if(fluLayer){map.removeLayer(fluLayer);}
	    	}
	    	else if (baseLayer == 'Aerials'){
	    		streetLayer = streetLayer ? map.removeLayer(streetLayer) : null;
			    streetLayer = new L.esri.dynamicMapLayer(streetURL, {opacity: 0.6});
			    streetLayer.on("load", function(e) {
			        streetLayer.bringToBack();
			     	aerialLayer = aerialLayer ? map.removeLayer(aerialLayer) : null;
				    aerialLayer = new L.esri.dynamicMapLayer(aerialURL, {});
				    aerialLayer.on("load", function(e) {
				        aerialLayer.bringToBack();
				    });
				    map.addLayer(aerialLayer);
			    });
			    
			    map.addLayer(streetLayer);
	    		if (zoningLayer){map.removeLayer(zoningLayer);}
	    		if(fluLayer){map.removeLayer(fluLayer);}
	    	}
	    	else if (baseLayer == 'Zoning'){
	    		
	    		zoningLayer = zoningLayer ? map.removeLayer(zoningLayer) : null;
			    zoningLayer = new L.esri.dynamicMapLayer(zoningURL, {});
			    zoningLayer.on("load", function(e) {
			        zoningLayer.bringToBack();
			    });
	    		map.addLayer(zoningLayer);
	    		if(pacLayer){map.removeLayer(pacLayer);}
	    		if(aerialLayer){map.removeLayer(aerialLayer);}
	    		if(streetLayer){map.removeLayer(streetLayer);}
	    		if(fluLayer){map.removeLayer(fluLayer);}
	    	}
	    	else if (baseLayer == 'FLU'){
	    		
	    		fluLayer = fluLayer ? map.removeLayer(fluLayer) : null;
			    fluLayer = new L.esri.dynamicMapLayer(fluURL, {});
			    fluLayer.on("load", function(e) {
			        fluLayer.bringToBack();
			    });
	    		map.addLayer(fluLayer);
	    		if(pacLayer){map.removeLayer(pacLayer);}
	    		if(aerialLayer){map.removeLayer(aerialLayer);}
	    		if(streetLayer){map.removeLayer(streetLayer);}
	    		if(zoningLayer){map.removeLayer(zoningLayer);}
	    	}
	    	
	    },
	    _createRadioButton: function(label, checked){
	    	var tr = L.DomUtil.create('tr', label+'-tr', this._radioTable);
			
			var tdLabel = L.DomUtil.create('td', label+'-label', tr);
			var labelHTML = '<td  style="vertical-align: middle">'+label+' </td>';
			tdLabel.innerHTML = labelHTML;
			var tdRadio = L.DomUtil.create('td', label+'-radioTD', tr);
			var tdRadioHTML = '<td  height="40" style="vertical-align: middle"></td>';
			tdRadio.innerHTML = tdRadioHTML;
			var radioInput = L.DomUtil.create('input', label+'input', tdRadio);
			radioInput.setAttribute("type","radio");
			radioInput.setAttribute("id",label+'input');
			radioInput.setAttribute("class","leaflet-control-layers-selector"); 
			radioInput.setAttribute("style","text-align: left");
			radioInput.setAttribute("name",label+"Radio");
			if (checked) {
				radioInput.setAttribute("checked",checked);
			}
			L.DomEvent.on(radioInput, 'click', this._onInputClick,this);
			
	   },
	   _onInputClick: function(e){
	   		var targetName = e.target.name;
	   		if (targetName == 'NeighborhoodsRadio'){
	   			if (activeLayer!="neighborhoods"){
		          L.DomUtil.get('Blockgroupsinput').checked = false;
	   			  activeLayer = "neighborhoods";
		          updateNHData(NHmeta[activeNHMeasure]);
		    	  calcNHAverage(activeNHMeasure);
		    	  nhBarChart(NHmeta[activeNHMeasure]);
		    	  //*****TimeSeries Functionality*****
		    	  hashChange(yearSuffix.substr(1,3),activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
		          //hashChange(activeLayer, activeNHMeasure, activeNHRecord.ID ? activeNHRecord.ID : "");
		          map.removeLayer(cbgeojson);
		          map.addLayer(nhgeojson);
		          legend.update();
		          info.update();
		          $("#censusMeasureInfo").fadeToggle("slow", function(){
		             $("#neighborhoodMeasureInfo").fadeToggle("slow"); //Here is a callback
		          });
		          $("#cbChart").fadeToggle("slow", function(){
		             $("#nhChart").fadeToggle("slow"); //Here is a callback
		          });
		          $("#censusBlocksTOC").fadeToggle("slow", function(){
		             $("#neighborhoodsTOC").fadeToggle("slow", function(){
		               var nhTOCEvent = document.createEvent('Event');
 		               nhTOCEvent.initEvent("nhTOCVisible", true, false);	
		               document.dispatchEvent(nhTOCEvent);
		             });
		          });
		          $("#censusBlockSelection").fadeToggle("slow", function(){
		          	 $("#neighborhoodSelection").fadeToggle("slow");
		          });
		        }
	   		}
	   		else if(targetName == 'BlockgroupsRadio'){
	   			if(activeLayer != "census"){
		          L.DomUtil.get('Neighborhoodsinput').checked = false;
	   			  activeLayer = "census";
		          updateCBData(CBmeta[activeCBMeasure]);
		    	  calcCBAverage(activeCBMeasure);
		    	  cbBarChart(CBmeta[activeCBMeasure]);
		    	  //*****TimeSeries Functionality*****
		    	  hashChange(yearSuffix.substr(1,3), activeLayer, activeCBMeasure, activeCBRecord.ID ? activeCBRecord.ID : "");
		          //hashChange(activeLayer, activeCBMeasure, activeCBRecord.Name ? activeCBRecord.Name : "");
		          map.removeLayer(nhgeojson);
		          map.addLayer(cbgeojson);
		          legend.update();
		          info.update();
		          
		          $("#neighborhoodMeasureInfo").fadeToggle("slow", function(){
		             $("#censusMeasureInfo").fadeToggle("slow");
		          });
		          $("#nhChart").fadeToggle("slow", function(){
		             $("#cbChart").fadeToggle("slow");
		          });
		          $("#neighborhoodsTOC").fadeToggle("slow", function(){
		             $("#censusBlocksTOC").fadeToggle("slow");
		          });
		          $("#neighborhoodSelection").fadeToggle("slow", function(){
		          	 $("#censusBlockSelection").fadeToggle("slow");
		          });
		        }
	   		}
	   }

	    
	});
	
	map.addControl(new basemapControl());
	//*****TimeSeries Functinality*****
	timeControl = L.Control.extend({
	    options: {
	        position: 'topleft'
	    },
		
	    onAdd: function (map) {
	        // create the control container with a particular class name
	        this._initLayout();
	        return this._container;
	    },
	    _initLayout: function(){
	    	var timeClassName = 'timeControl';
			var container = this._container = L.DomUtil.create('div', timeClassName);
			this._timeList = L.DomUtil.create('div', timeClassName + '-base');
			container.appendChild(this._timeList);
			this._timeDropDown = L.DomUtil.create('div', 'timeFrameDropDown', this._timeList);
	        this._timeDropDown.innerHTML = '<select id = "timeSelect" name = "timeselect" style="width: 100px"><option value = "_13">2013</option><option value = "_14">2014</option></select>';
			//TODO - change onmousedown event to something that is touch complient. 
			this._timeDropDown.firstChild.onmousedown = this._timeDropDown.firstChild.ondblclick = L.DomEvent.stopPropagation;
			this._timeDropDown.firstChild.ontouchstart = L.DomEvent.stopPropagation;
			L.DomEvent.on(this._timeDropDown, 'change', this._onTimeChange,this);
		},
	    _onTimeChange: function(e){
	    	yearSuffix = e.target.value;
	    	//TODO change activeCBMeasure to corespond with the new year
	    	year = "<strong>20"+yearSuffix.substring(1,3)+"</strong>";
	    	if(activeLayer == "census"){
	    		console.log ("onTimeChange yearSuffix = " + yearSuffix);
	    		console.log(activeCBRoot);
	    		activeCBMeasure = activeCBRoot + yearSuffix;
	    		console.log("timechange activeCBMeasure = "+activeCBMeasure);
	    		changeMeasure(activeCBMeasure);
	    	}
	    	else if (activeLayer == "neighborhoods"){
	    		console.log ("onTimeChange yearSuffix = " + yearSuffix);
	    		console.log(activeNHRoot);
	    		activeNHMeasure = activeNHRoot + yearSuffix;
	    		console.log("timechange activeNHMeasure = "+activeNHMeasure);
	    		changeNHMeasure(activeNHMeasure);
	    	}
	    } 
	});
	
	map.addControl(new timeControl());
	
	new L.Control.Zoom({ position: 'topleft' }).addTo(map);
	legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info legend');
        this.update();
        return this._div;
    };
    legend.update = function() {
        if (activeLayer == "census"){
          var theLegend = '<i style="background: #666666; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-">N/A</span><br>';
          var cbBreaksLength = CBmeta[activeCBMeasure].style.breaks.length;
          console.log("cbBreaksLength = "+cbBreaksLength);
          $.each(CBmeta[activeCBMeasure].style.breaks, function(index, value) {
              //TODO if activeCBRoot == R_AVGYR;
              console.log("CBLegendIndex = " + index);
              if (activeCBMeasure.substring(0, 6) == "RAVGYR"){
		          if(index != (cbBreaksLength - 1)){
		              var thisYear = new Date().getFullYear();
		              console.log("forEachLoop value:index = " + value +" "+ index);
		              if(value=='0'&&index==0){
		              	theLegend += '<i style="background:' + CBmeta[activeCBMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + "index" + '">' +
		                '1869' + '&ndash;' + prettyCBMetric(CBmeta[activeCBMeasure].style.breaks[index + 1], activeCBMeasure) + '</span><br>';
		              }
		              else{
		              	console.log("elsePrettyMetric value = " + value);
		              	theLegend += '<i style="background:' + CBmeta[activeCBMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + "index" + '">' +
		                prettyCBMetric(value, activeCBMeasure)  + (CBmeta[activeCBMeasure].style.colors[index + 1] ? '&ndash;' + prettyCBMetric(CBmeta[activeCBMeasure].style.breaks[index + 1], activeCBMeasure) + '</span><br>' : '-'+thisYear+'</span>');
	          	  	  }
	          	  }
	          }
              else{
              	  if(index != (cbBreaksLength - 1)){
	          	  	  theLegend += '<i style="background:' + CBmeta[activeCBMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + index + '">' +
		                  prettyCBMetric(value, activeCBMeasure)  + (CBmeta[activeCBMeasure].style.colors[index + 1] ? '&ndash;' + prettyCBMetric(CBmeta[activeCBMeasure].style.breaks[index + 1], activeCBMeasure) + '</span><br>' : '+</span>');
          	  	  }	
          	  }	
          });
          this._div.innerHTML = theLegend;  
        }
        else if (activeLayer == "neighborhoods"){
          var theLegend = '<i style="background: #666666; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-">N/A</span><br>';
          var nhBreaksLength = NHmeta[activeNHMeasure].style.breaks.length;
          console.log("nhBreaksLength = "+nhBreaksLength);
          $.each(NHmeta[activeNHMeasure].style.breaks, function(index, value) {
              console.log("NHLegendIndex = " + index);
              if (activeNHMeasure.substring(0, 6) == "RAVGYR"){
	          	  if(index != (nhBreaksLength - 1)){
			          var thisYear = new Date().getFullYear();
		              console.log("forEachLoop value:index = " + value +" "+ index);
		              if(value=='0'&&index==0){
		              	theLegend += '<i style="background:' + NHmeta[activeNHMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + "index" + '">' +
		              	'1869' + '&ndash;' + prettyNHMetric(NHmeta[activeNHMeasure].style.breaks[index + 1], activeNHMeasure) + '</span><br>';
		              }
		          	  else{
	                  	theLegend += '<i style="background:' + NHmeta[activeNHMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + index + '">' +
		              	prettyNHMetric(value, activeNHMeasure)  + (NHmeta[activeNHMeasure].style.colors[index + 1] ? '&ndash;' + prettyNHMetric(NHmeta[activeNHMeasure].style.breaks[index + 1], activeNHMeasure) + '</span><br>' : '-'+thisYear+'</span>');
          	      	  }	
		          }
	              // else{
		              	// console.log("elsePrettyMetric value = " + value);
		              	// theLegend += '<i style="background:' + CBmeta[activeCBMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + "index" + '">' +
		                // prettyCBMetric(value, activeCBMeasure)  + (CBmeta[activeCBMeasure].style.colors[index + 1] ? '&ndash;' + prettyCBMetric(CBmeta[activeCBMeasure].style.breaks[index + 1], activeCBMeasure) + '</span><br>' : '-'+thisYear+'</span>');
	          	  // }
	             
	          }
	          else{ 
	          	  if(index != (nhBreaksLength - 1)){
				      theLegend += '<i style="background:' + NHmeta[activeNHMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + index + '">' +
                      prettyNHMetric(value, activeNHMeasure)  + (NHmeta[activeNHMeasure].style.colors[index + 1] ? '&ndash;' + prettyNHMetric(NHmeta[activeNHMeasure].style.breaks[index + 1], activeNHMeasure) + '</span><br>' : '+</span>');
          	  	  }	
          	  }
          });
          this._div.innerHTML = theLegend;  
        }
    };
    legend.addTo(map);
}

function firePopover(){
	$("#example").popover();
}
/* zoom to bounds */
function zoomToFeature(bounds) {
    map.fitBounds(bounds);
}

//create latLngBounds from geojson coordinates
function createLatLngBounds(coordinates){
  var coord, xmin, xmax, ymin, ymax;
  for (var i = 0; i < coordinates.length; i++) {
    coord = coordinates[i];
    if (coord.toString().indexOf("-")==-1&&coord!=0){
      //positive number = y coordinate
      var y = coord
      if (!ymin || y < ymin){
        ymin = y;
      }
      else if(!ymax||y>ymax){
        ymax = y;
      }
    }
    else if (coord.toString().indexOf("-")!=-1&&coord!=0){
      //negative number = x coordinate
      var x = coord
      if (!xmin || x < xmin){
        xmin = x;
      }
      else if(!xmax||x>xmax){
        xmax = x;
      }
    }
  }
  var southWest = new L.LatLng (ymin, xmax);
  var northEast = new L.LatLng(ymax, xmin);
  var bounds = new L.LatLngBounds(southWest, northEast);
  return bounds;
}
/*
    Add marker
*/
function addMarker(lat, lng) {
    if (marker) {
        try { map.removeLayer(marker); }
        catch(err) {}
    }
    marker = L.marker([lat, lng]).addTo(map);
}

/*
    Get xy NPA intersection via web service
*/
function performIntersection(lat, lon) {
    var overlayTable,overlayTableIndex;
	if (activeLayer=="neighborhoods"){
		overlayTable = "neighborhoods";
		overlayTableIndex = 1;
	}
	else if(activeLayer=="census"){
		overlayTable = "blockgroups";
		overlayTableIndex = 2;
	}
	
	var xWGS, yWGS;
	$.ajax({
	    type: "GET",
	    url: 'http://gisweb2.durhamnc.gov/arcgis/rest/services/CoreTasks/Geometry/GeometryServer/project?inSR=4326&outSR=2264&geometries={"geometryType":"esriGeometryPoint","geometries":[{"x":'+lon+',"y":'+lat+'}]}&f=json',
	    dataType: "text",
	    success: function success(strXY) {
	    	console.log("XY return = " + strXY);
	    	var jsonXY = eval("("+ strXY + ")");
	    	xWGS = jsonXY.geometries[0].x;
			yWGS = jsonXY.geometries[0].y;
			console.log("x = "+xWGS+"y = " + yWGS);
	    	$.ajax({
			    type: "GET",
			    url: 'http://gisweb2.durhamnc.gov/arcgis/rest/services/SharedMaps/CompassBaseMap/MapServer/identify?geometryType=esriGeometryPoint&geometry={x:'+xWGS+', y:'+yWGS+'}&layers=all:'+overlayTableIndex+'&tolerance=0&mapExtent=-121841899.99,-93659000,5629377692313.13,5629405875213.12&imageDisplay=400,300,96&f=json',
			    dataType: "text",
			    success: function success(strOverlay) {
			    	console.log("XY overlay = " + strOverlay);
			    	
					var jsonOverlay = eval("(" + strOverlay + ")");
					console.log("jsonOverlay = "+jsonOverlay);
					var id;
					var layer;
					if (activeLayer=="neighborhoods"){
						id = jsonOverlay.results[0].attributes.ID;
						layer = getNHLayer(id);
						zoomToFeature(layer.getBounds());
						selectNeighborhood(layer);;	
					}
					else if(activeLayer=="census"){
						id = jsonOverlay.results[0].attributes.id;
						layer = getCBLayer(id);
						zoomToFeature(layer.getBounds());
						selectCensusBlock(layer);;
					}
			    },
			    error: function(error, status, desc) {
			        alert("XY Error = " +error + " " + status + " " + desc);
			    }
			});
	    },
	    error: function(error, status, desc) {
	        alert("XY Error = " +error + " " + status + " " + desc);
	    }
	});
	    
}
/*
    Get NPA feature
*/
function getCBLayer(idvalue, byName) {
    var layer;
    if (cbgeojson == null){
    	console.log("cbgeojson is null");
    }
    if (cbgeojson._layers == null){
	   	console.log("cbgeojson._layers is null");
    }
    if (byName != true){
	    $.each(cbgeojson._layers, function() {
	        if (this.feature.properties.ID == idvalue) layer = this;
	    });
    }
    else{
    	$.each(cbgeojson._layers, function() {
    		if (this.feature.properties.GEOID10 == idvalue) layer = this;
	    });
    }
    return layer;
}

function getNHLayer(idvalue, byName) {
    var layer;
    if (byName != true){
    	$.each(nhgeojson._layers, function() {
	        if (this.feature.properties.ID == idvalue) layer = this;
	    });
    }
    else{
    	$.each(nhgeojson._layers, function() {
	        if (this.feature.properties.Name == idvalue) layer = this;
	    });
    }
    return layer;
}
/*
    Find locations
*/
function locationFinder(data) {
    performIntersection(data.lat, data.lng);
}

/*
    Map NPA geojson decoration functions
*/
//TODO
function onEachCensusBlock(feature, layer) {
    layer.on({
        mouseover: highlightCensusBlock,
        mouseout: resetCensusBlock,
        click: clickCensusBlock
    });
}
function highlightCensusBlock(e) {
    var layer = e.target;
    console.log(activeCBRecord+" "+dropdownCensusBlockName+" "+activeCBRecord.ID+" "+e.target.feature.properties.ID+" "+layer.feature.properties.GEOID10);
    if (!activeCBRecord && !dropdownCensusBlockName || (activeCBRecord && activeCBRecord.ID != e.target.feature.properties.ID && dropdownCensusBlockName != layer.feature.properties.GEOID10)) layer.setStyle({
        weight: 3,
        color: '#ffcc00'
    });
    if (IEBrowser!=true) {
        layer.bringToFront();
        console.log('bringtofront');
    }
    info.update(layer.feature.properties);
}
function resetCensusBlock(e) {
    var layer = e.target;
    console.log('reset census block');
    if (!activeCBRecord && !dropdownCensusBlockName || (activeCBRecord && activeCBRecord.ID != layer.feature.properties.ID && dropdownCensusBlockName != layer.feature.properties.GEOID10)) layer.setStyle({
        weight: 1,
        color: '#565656'
    });
    info.update();
}

function clickCensusBlock(e) {
    var layer = e.target;
    selectCensusBlock(layer);
}
function selectCensusBlock(layer){
	resetLastLayer();
    lastLayer = layer;
    dropdownCensusBlockName = layer.feature.properties.PICK_GEOID;
    var element = document.getElementById('censusblockDropdown');
    element.value = dropdownCensusBlockName;
    activecensusBlock = layer;
    highlightClickedCensusBlock(layer);
    
    cbReportID = layer.feature.properties.ID;
    console.log("layer.feature.properties.ID = " + layer.feature.properties.POP_13);
    cbReportSelector = layer.feature.properties.PICK_GEOID;
    changeCensusBlock(layer.feature.properties.ID);
    zoomToFeature(layer.getBounds());
}
function highlightClickedCensusBlock(layer) {
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function highlightSelected(layer) {
    cbgeojson.setStyle(cbStyle);
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (IEBrowser!=true) {
        layer.bringToFront();
    }
}
function cbStyle(feature) {
    return {
        fillColor: getColor(feature.properties[activeCBMeasure]),
        weight: 1,
        opacity: 1,
        color: '#565656',
        fillOpacity: $("#opacity_slider").slider("value") / 100
    };
}
function getColor(d) {
    var color = "";
    var colors = CBmeta[activeCBMeasure].style.colors;
    var breaks = CBmeta[activeCBMeasure].style.breaks;
    $.each(breaks, function(index, value) {
        if (value <= d && d !== null) {
            color = colors[index];
            return;
        }
    });
    if (color.length > 0) return color;
    else return "#666666";
}
function nhStyle(feature) {
    return {
        fillColor: getNHColor(feature.properties[activeNHMeasure]),
        weight: 1,
        opacity: 1,
        color: '#565656',
        fillOpacity: $("#opacity_slider").slider("value") / 100
    };
}
function getNHColor(d) {
    var color = "";
    var colors = NHmeta[activeNHMeasure].style.colors;
    var breaks = NHmeta[activeNHMeasure].style.breaks;
    $.each(breaks, function(index, value) {
        if (value <= d && d !== null) {
            color = colors[index];
            return;
        }
    });
    if (color.length > 0) return color;
    else return "#666666";
}
function highlightSelectedNH(layer) {
    nhgeojson.setStyle(nhStyle);
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (IEBrowser!=true) {
        layer.bringToFront();
    }
}
function onEachNeighborhood(feature, layer) {
    layer.on({
        mouseover: highlightNeighborhood,
        mouseout: resetNeighborhood,
        click: clickNeighborhood
    });
}
function highlightNeighborhood(e) {
    var layer = e.target;
    console.log(activeNHRecord+" "+dropdownNeighborhoodName+" "+activeNHRecord.ID+" "+e.target.feature.properties.ID+" "+layer.feature.properties.Name);
    if (!activeNHRecord && !dropdownNeighborhoodName || (activeNHRecord && activeNHRecord.ID != e.target.feature.properties.ID && dropdownNeighborhoodName != layer.feature.properties.Name))layer.setStyle({
        weight: 3,
        color: '#ffcc00'
    });
    if (IEBrowser!=true) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetNeighborhood(e) {
    var layer = e.target;
    if (!activeNHRecord && !dropdownNeighborhoodName || (activeNHRecord && activeNHRecord.ID != layer.feature.properties.Name && dropdownNeighborhoodName != layer.feature.properties.Name))layer.setStyle({
        weight: 1,
        color: '#565656'
    });
    info.update();
}
function clickNeighborhood(e) {
    resetLastLayer();
    var layer = e.target;
    selectNeighborhood(layer);
}
function selectNeighborhood(layer){
	lastLayer = layer;
    dropdownNeighborhoodName = layer.feature.properties.Name;
    var element = document.getElementById('neighborhoodDropdown');
    element.value = dropdownNeighborhoodName;
    zoomToFeature(layer.getBounds());
    activeNeighborhood = layer;
    highlightClickedNeighborhood(layer);
    nhReportID = layer.feature.properties.ID;
    nhReportSelector = dropdownNeighborhoodName;
    changeNeighborhood(nhReportID);
}
function highlightClickedNeighborhood(layer) {
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (IEBrowser!=true) {
        layer.bringToFront();
    }
}
var blSelectedCensusBlock;
function highlightSelectedCensusBlock() {
    resetLastLayer();
     cbgeojson.setStyle(selectedStyle);
    if (!L.Browser.ie && !L.Browser.opera) {
        cbgeojson.bringToFront();
    }   
    blSelectedCensusBlock = true;
}
var blSelectedNeighborhood;
function highlightSelectedNeighborhood() {
    resetLastLayer();
    nhgeojson.setStyle(selectedStyle);
    if (!L.Browser.ie && !L.Browser.opera) {
        nhgeojson.bringToFront();
    }   
    blSelectedNeighborhood = true;
}
function selectedStyle(feature) {
      
      if (dropdownNeighborhoodName==feature.properties.Name){
        return {
          "weight": 7,
          "color": '#0283D5',
          "dashArray": ''
        };
      }
      else{
        return {
          weight: 1,
          color: '#999999'
        };
      }
}
var lastLayer;
function resetLastLayer(){
    if(lastLayer){
        lastLayer.setStyle({
          weight: 1,
          color: '#565656'
        });
    }
    if (blSelectedNeighborhood){
          nhgeojson.setStyle({
            weight: 1,
            color: '#565656'
          }); 
          blSelectedNeighborhood=false;  
    }
}

function clickReport(reportRadio) { 
    if(reportRadio == 'census'){
		$("#dropdownNeighborhood").fadeToggle("slow", function() {
			$("#dropdownCensus").fadeToggle("slow");
		});
		$("#nhreport_metrics").fadeToggle("slow", function() {
			$("#cbreport_metrics").fadeToggle("slow");
		});
		$("#nhReportLabel").fadeToggle("slow", function() {
			$("#cbReportLabel").fadeToggle("slow");
		});
		$("#useCtrlLabel").fadeToggle("slow", function() {
			$("#useCtrlLabel").fadeToggle("slow");
		});
		$("#all_metrics").fadeToggle("slow", function() {
			$("#all_metrics").fadeToggle("slow");
		});
		$("#all_metricsLabel").fadeToggle("slow", function() {
			$("#all_metricsLabel").fadeToggle("slow");
		});
		$("#submitPDFReport").fadeToggle("slow", function() {
			$("#submitPDFReport").fadeToggle("slow");
		});
		reportFormCheck('census');
	}
	else if(reportRadio == 'neighborhood'){
		$("#dropdownCensus").fadeToggle("slow", function() {
			$("#dropdownNeighborhood").fadeToggle("slow");
		});
		$("#cbreport_metrics").fadeToggle("slow", function() {
			$("#nhreport_metrics").fadeToggle("slow");
		});
		$("#cbReportLabel").fadeToggle("slow", function() {
			$("#nhReportLabel").fadeToggle("slow");
		});
		$("#useCtrlLabel").fadeToggle("slow", function() {
			$("#useCtrlLabel").fadeToggle("slow");
		});
		$("#all_metrics").fadeToggle("slow", function() {
			$("#all_metrics").fadeToggle("slow");
		});
		$("#all_metricsLabel").fadeToggle("slow", function() {
			$("#all_metricsLabel").fadeToggle("slow");
		});
		$("#submitPDFReport").fadeToggle("slow", function() {
			$("#submitPDFReport").fadeToggle("slow");
		});
		reportFormCheck('neighborhood');
	}
}
function clickReport_county(reportRadio) { 
    if(reportRadio == 'census'){
		$("#nhreport_metrics_county").fadeToggle("slow", function() {
			$("#cbreport_metrics_county").fadeToggle("slow");
		});
		$("#nhReportLabel_county").fadeToggle("slow", function() {
			$("#cbReportLabel_county").fadeToggle("slow");
		});
		$("#submitPDFReport").fadeToggle("slow", function() {
			$("#submitPDFReport").fadeToggle("slow");
		});
		reportFormCheck('census');
	}
	else if(reportRadio == 'neighborhood'){
		$("#dropdownCensus").fadeToggle("slow", function() {
			$("#dropdownNeighborhood").fadeToggle("slow");
		});
		$("#cbreport_metrics").fadeToggle("slow", function() {
			$("#nhreport_metrics").fadeToggle("slow");
		});
		$("#cbReportLabel").fadeToggle("slow", function() {
			$("#nhReportLabel").fadeToggle("slow");
		});
		$("#useCtrlLabel").fadeToggle("slow", function() {
			$("#useCtrlLabel").fadeToggle("slow");
		});
		$("#all_metrics").fadeToggle("slow", function() {
			$("#all_metrics").fadeToggle("slow");
		});
		$("#all_metricsLabel").fadeToggle("slow", function() {
			$("#all_metricsLabel").fadeToggle("slow");
		});
		$("#submitPDFReport").fadeToggle("slow", function() {
			$("#submitPDFReport").fadeToggle("slow");
		});
		reportFormCheck('neighborhood');
	}
}

function reportFormCheck(layer){
	if (layer=='census'){
		var selectedCensusFeatures = $('#report_census option:selected').length;
		var censusFeatureCount = document.getElementById('censusFeatureCount');
		if (!censusReportSelect.value||selectedCensusFeatures>10){
	    	censusSelectLabel.style.color="red";
	    	censusReportSelect.style.borderColor='red';
	    	document.getElementById('submitPDFReport').disabled = true;
	    	if(!censusReportSelect.value){
	    		document.getElementById('censusFeatureLabel').innerHTML = '';
	    	}
	    	else{
	    		document.getElementById('censusFeatureLabel').innerHTML = 'Selected Blockgroups: ';
	    		censusFeatureCount.innerHTML = $('#report_census option:selected').length;
	    		censusFeatureCount.style.color="red";
	    		censusFeatureCount.style.fontWeight = "bold";
	    	}
	    }
	    else if (censusReportSelect.value&&selectedCensusFeatures<=10){
	      	censusSelectLabel.style.color="black";
	      	censusReportSelect.style.borderColor='#c1c1c1';
	      	document.getElementById('censusFeatureLabel').innerHTML = 'Selected Blockgroups: ';
	    	censusFeatureCount.innerHTML = $('#report_census option:selected').length;
	    	censusFeatureCount.style.color="black";
	    	censusFeatureCount.style.fontWeight = "normal";
	    }
	    if(!$('#cbreport_metrics').val()) {
	    	censusReportLabel.style.color='red';
	    	document.getElementById("cbreport_metrics").style.borderColor='red';
			document.getElementById('submitPDFReport').disabled = true;
	    	document.getElementById('metricCount').innerHTML = '';
	    }
	    else{
	    	censusReportLabel.style.color='black';
			document.getElementById("cbreport_metrics").style.borderColor='#c1c1c1';
			document.getElementById('metricCount').innerHTML = 'Selected Metrics:' + $('#cbreport_metrics option:selected').length;
		}
		if(censusReportSelect.value && $('#cbreport_metrics').val()&&selectedCensusFeatures<=10){
			document.getElementById('submitPDFReport').disabled = false;
		}	 
	}
	else if(layer=='neighborhood'){
		var selectedNeighborhoodFeatures = $('#report_neighborhood option:selected').length;
		console.log('selectedNeighborhoodFeatures '+selectedNeighborhoodFeatures);
		var neighborhoodFeatureCount = document.getElementById('neighborhoodFeatureCount');
		if (!neighborhoodReportSelect.value||selectedNeighborhoodFeatures>10){
	    	neighborhoodSelectLabel.style.color="red";
	    	neighborhoodReportSelect.style.borderColor='red';
	    	document.getElementById('submitPDFReport').disabled = true;
	    	if(!neighborhoodReportSelect.value){
	    		document.getElementById('neighborhoodFeatureLabel').innerHTML = '';
	    	}
	    	else{
	    		document.getElementById('neighborhoodFeatureLabel').innerHTML = 'Selected Neighborhoods: ';
	    		neighborhoodFeatureCount.innerHTML = $('#report_neighborhood option:selected').length;
	    		neighborhoodFeatureCount.style.color="red";
	    		neighborhoodFeatureCount.style.fontWeight = "bold";
	    	}
	    }
	    else if (neighborhoodReportSelect.value&&selectedNeighborhoodFeatures<=10){
	      	neighborhoodSelectLabel.style.color="black";
	    	neighborhoodReportSelect.style.borderColor='#c1c1c1';
	   		document.getElementById('neighborhoodFeatureLabel').innerHTML = 'Selected Neighborhoods: ';
	    	neighborhoodFeatureCount.innerHTML = $('#report_neighborhood option:selected').length;
	    	neighborhoodFeatureCount.style.color="black";
	    	neighborhoodFeatureCount.style.fontWeight = "normal";
	    }
	    if( !$('#nhreport_metrics').val() ) {
	    	neighborhoodReportLabel.style.color='red';
			document.getElementById("nhreport_metrics").style.borderColor='red';
			document.getElementById('submitPDFReport').disabled = true;
	    	document.getElementById('metricCount').innerHTML = '';
	    }
	    else{
	    	neighborhoodReportLabel.style.color='black';
	    	document.getElementById("nhreport_metrics").style.borderColor='#c1c1c1';
	    	document.getElementById('metricCount').innerHTML = 'Selected Metrics:' + $('#nhreport_metrics option:selected').length;
		}
		if(neighborhoodReportSelect.value && $('#nhreport_metrics').val()&&selectedNeighborhoodFeatures<=10){
			document.getElementById('submitPDFReport').disabled = false;
		}
	}
	checkSelectCheckbox(layer);
}
function checkSelectCheckbox(layer){
// console.log('selected ='+$('#cbreport_metrics option:selected').length);
// console.log('count ='+$('#cbreport_metrics option').length);
	if (layer=='census'&& document.getElementById('all_metrics').checked == true && $('#cbreport_metrics option').length!=$('#cbreport_metrics option:selected').length){
		document.getElementById('all_metrics').checked = false;
	}	
	else if(layer=='neighborhood'&& document.getElementById('all_metrics').checked == true && $('#nhreport_metrics option').length!=$('#nhreport_metrics option:selected').length){
		document.getElementById('all_metrics').checked = false;
	}
}
function numberWithCommas(yourNumber) {
    var n= yourNumber.toString().split(".");
    n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return n.join(".");
}
function testMapService(url){
	var valid;
	var jqxhr = $.get( url, function() {
		valid = true;
	})
	.done(function() {
	})
	.fail(function() {
		valid = false;
	})
	.always(function() {
	});
	jqxhr.always(function() {
	});
	return valid;
}

function fireGAEvent(category, action, name){
	_gaq.push(['_trackEvent',
	 		category,    
	    	action,
	    	name,
	    	1,
	    	true
	 	]);
}
function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
