console.log("------ datav3.q.common.js debug ------")

var map = null;
var phyTopoin =null;
var phyInterRouter =null;

// $('.mymiddle').append('<div id="map_topoin"></div>');

function init_map(){	
	var centerLatlng = [23.992992, 121.108716];  
	var mapboxUrl_url = datav_config.mapboxUrl_url;
	var defaultScale = 8;

	$('#map_topoin').addClass('active');
	$('#map_topoin').show();
	map = L.map('map_topoin',{
	  zoomControl:false,
	  closePopupOnClick:true,
	  preferCanvas: true,
	  // zoomDelta:0.5,
	  // wheelDebounceTime:60,
	  // wheelPxPerZoomLevel: 120,
	  // maxZoom: 6
	});
	map.setView(centerLatlng, defaultScale);
	L.tileLayer(mapboxUrl_url, {
	    attribution: '',
	}).addTo(map);  
	    
	zoom = L.control.zoom().addTo(map);
	zoom.setPosition("topright")
}

function clear_map(){
	map.remove();
	map = null;
	$('#map_topoin').removeClass('active');
	$('#map_topoin').hide();
}

// 清除所有图形
function removeAllMap(){
    clearRouterIn();
    removePhyTopoin();
    removephyInterRouter();
    clearDatavjs();
}

function removeRMap(){
    clearRouterIn();
    removePhyTopoin();
    removephyInterRouter();
}

function clearRouterIn(){
  if(logicRouterIn){
    logicRouterIn.clear();
    logicRouterIn = null;
  }
}

function removePhyTopoin(){
  if(phyTopoin && phyTopoin.remove){
    phyTopoin.remove();
    phyTopoin = null;
  }
}

function removephyInterRouter(){
	// console.log(phyInterRouter)
  if(phyInterRouter){
    // phyInterRouter.remove();
    map.remove();
    map = null;
    $('.inter_r_tips').hide();
    // $('#map_topoin').slideDown();
    $('#map_topoin').removeClass('active');
    // $('#map_topoin').hide();
    phyInterRouter = null;
  }
}

function clearDatavjs(){
	if(datavjs && datavjs.util_clear_geometry){
		datavjs.util_clear_geometry();
	}	
}
