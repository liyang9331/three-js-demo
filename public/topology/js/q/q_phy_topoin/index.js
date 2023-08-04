
var phyTopoin =null;
var phyInterRouter =null;
var PhyTopoin = function(as,input_subResult_record){
    $("#asoutiframe").hide();
    // $("#WebGL-output").show();
 	removeAllMap();
 	init_map();
    var ajax_data_url = datav_config.ajax_data_url;
	var imgurl = './images/';
    var jsondataurl='./data/asnumber_routerin/AS'+as+'.json';

    $('.icon-close').click(function(){
        $(this).parent().hide();
    });

    map.on('move',function(){
        $('.marker-msg').hide();
    });

	//迁徙图初始设置
	overlay = new L.echartsLayer(map, echarts);
    chartsContainer=overlay.getEchartsContainer();  
    myChart=overlay.initECharts(chartsContainer);     
    window.onresize = myChart.onresize;
    // overlay.setOption(option);
	var option = {
		title : {
			text: '',
			x:'right',
			textStyle : {
				color: '#fff'
			}
		},
		tooltip : {
			show: false,
			trigger: 'item',
			triggerOn:'none',
			formatter: function(val){          
			}
		},
		toolbox : {
				show : false,				
			},
		series : [{
					name: 'lines',
					type: 'map',
					mapType: 'none',
					itemStyle:{
						normal:{
							borderColor:'#003',
							borderWidth:0.5,
							areaStyle:{
								color: '#66ff99'
									  }
						      }
					},
					data:[],
					markLine : {
						smooth:true,
						effect : {
							show: true,
							scaleSize: 1,
							period: 30,
							color: '#fff',
							shadowBlur: 3
						},
						symbol: ['none', 'none'],  
						symbolSize : 1,
						itemStyle : {
							normal: {
								borderWidth:2,
								lineStyle: {
									color: 'rgba(102, 255, 103,1)',
									type: 'solid',
									shadowBlur: 0
								}
							}
						},
						tooltip:{
							show: false,
							triggerOn:'none',
							backgroundColor:'blue'
						},
                        // large: true,
						data : [],
					},
					geoCoord:{},
					// tooltip:{
					// 	triggerOn:'click',
					// 	backgroundColor:'blue'
					// }
				}
		]
	}; 
  
    //图标绘制
    var vertexCode = `
    attribute vec2 aCRSCoords;
    attribute vec2 aExtrudeCoords;
    uniform mat4 uTransformMatrix;
    uniform vec2 uPixelSize;

    varying vec2 vPixel;
    varying float vMaxRadius;

    attribute float labelrank;
    attribute float adm0cap;  
    attribute float sizea;                                                                     
                                                                                                    
    varying float vAdm0Cap; 
    varying vec2 vExtrudeCoords;                                                                                                                                            
                                                                                                    
    void main(void) { 
    vExtrudeCoords = aExtrudeCoords;                                                                              
              vMaxRadius = 15.0 - labelrank;                                                                                       
        vPixel = aExtrudeCoords * 15.0;                                                             
                                   
        vAdm0Cap = adm0cap;                                                                                                                                                                                                                                                                                                                                                
                                                                                                    
    	gl_Position =                                                                                
    		uTransformMatrix * vec4(aCRSCoords, 1.0, 1.0) +                                          
    		vec4(aExtrudeCoords * uPixelSize * 15.0 * sizea, 0.0, 0.0);
                                   
    }`;
    var fragCode =`
    precision highp float;
    varying vec2 vPixel;
    varying float vMaxRadius;
    varying float vAdm0Cap; 

    uniform sampler2D uTexture0;       
    varying vec2 vExtrudeCoords;                                                             
                                                                                                 
    void main(void) {  

        float radiusSquared =
                vPixel.x * vPixel.x +
                vPixel.y * vPixel.y;

            float innerRadius = vMaxRadius - 0.001;
            float alpha = smoothstep(vMaxRadius*vMaxRadius, innerRadius*innerRadius, radiusSquared);
                                                                                                                                                                                                                     
    	if (vAdm0Cap == 0.0 ) {          //核心                                                          
            gl_FragColor = vec4(244.0/255.0, 234.0/255.0, 42.0/255.0, alpha);                                            
        } else if (vAdm0Cap == 2.0) {      // 边缘  
            gl_FragColor = vec4(6.0/255.0, 163.0/255.0, 255.0/255.0, alpha);                                                          
                                                 
        }else if(vAdm0Cap == 3.0){                          // 中间                                                           
            gl_FragColor = vec4(216.0/255.0, 30.0/255.0, 6.0/255.0, alpha);                                                                                  
        }else if(vAdm0Cap == 4.0){
            gl_FragColor = vec4(0.0/255.0, 255.0/255.0, 0.0/255.0, alpha); 
        }                                                                                             
           
     	vec2 texelCoords;
        texelCoords.x = (vExtrudeCoords.x + 1.0) / 2.0;
        texelCoords.y = (1.0 - vExtrudeCoords.y) / 2.0;

        vec4 texelColour = texture2D(uTexture0, texelCoords);

        gl_FragColor = gl_FragColor *texelColour; 
     	                                                                                                                                                                              
    }`;

	var glMarkers = new L.GLMarkerGroup({
		attributes: ['nodeId', 'ip', 'linkedRouterIdList', 'adm0cap','labelrank', 'sizea'],
		textures: [imgurl+'router.png'],
		vertexShader: vertexCode,
		fragmentShader: fragCode,
	}).addTo(map);

    var glMarkers2 = new L.GLMarkerGroup({
        attributes: ['megacity', 'rank_min', 'rank_max', 'labelrank', 'adm0cap', 'pop_max', 'pop_min','sizea'],
        textures: [imgurl+'router2.png'],
        vertexShader: vertexCode,
        fragmentShader: fragCode,
    }).addTo(map);

    var routerIDListWithlatlng= [];
    var geoCoord = {};

    $.ajax({
         type: 'GET',
         dataType:'json',
         url: jsondataurl,
        }).done(function(json){
           
            // 台湾["23.760209", "120.895185"]
            // ["22.347535", "114.104982"]            
       
            if(json[0].latitude == "22.347535" && json[0].longitude == "114.104982"){//香港
                 map.setView([json[0].latitude,json[0].longitude],11);
            }else{
                map.setView([json[0].latitude,json[0].longitude],8);
            }
           
            json[0].routerInfoList.forEach(function(feature){
                if (feature.latitude && feature.longitude && feature.latitude !== 'None' && feature.longitude !== 'None') {
                    if(feature.routerType == 'core'){
                        glMarkers.addMarker( new L.GLMarker(
                            [  feature.latitude,feature.longitude ],
                            {'nodeId':feature.routerID,'ip':feature.routerIP,
                            'linkedRouterIdList':feature.linkedRouterIdList,
                         'adm0cap':0.0,'labelrank':0,'sizea': 0.5}
                        ) );
                    }else if(feature.routerType == 'area'){
                        glMarkers.addMarker( new L.GLMarker(
                            [  feature.latitude,feature.longitude ],
                            {'nodeId':feature.routerID,'ip':feature.routerIP,'linkedRouterIdList':feature.linkedRouterIdList,
                            'adm0cap':2.0,'labelrank':0,'sizea': 0.5}
                        ) );
                    }else if(feature.routerType == 'intermediate'){
                        glMarkers.addMarker( new L.GLMarker(
                            [  feature.latitude,feature.longitude ],
                            {'nodeId':feature.routerID,'ip':feature.routerIP,'linkedRouterIdList':feature.linkedRouterIdList,
                            'adm0cap':3.0,'labelrank':0,'sizea': 0.5}
                        ) );
                    } 

                    routerIDListWithlatlng.push(feature.routerID);

                    geoCoord[feature.routerID+''] = [feature.longitude,feature.latitude]; 
                    
                    // console.log(feature)
                    // if(as =='9924' && feature.routerIP && feature.routerIP.length >0){//临时添加凸显基础设计IP
                    //     feature.routerIP.forEach(function(d){
                    //        if(d=='106.1.188.35'){
                            
                    //           glMarkers.addMarker( new L.GLMarker(
                    //               [  feature.latitude,feature.longitude ],
                    //               {'nodeId':feature.routerID,'ip':feature.routerIP,'linkedRouterIdList':feature.linkedRouterIdList,
                    //               'adm0cap':4.0,'labelrank':0,'sizea': 0.5}
                    //           ) );
                    //        }
                    //     })
                    // }
                   
                }else{
                    // console.log('无经纬度')
                }
            })

            option.series[0].geoCoord = geoCoord;  
                
            function onMapClick(e) {// 点击时绘制连线，放大改图标，显示该路由提示框信息及右侧信息

                var ePoint = map.latLngToContainerPoint(e.latlng);
                var markerLength = glMarkers._markers.length;
                var mRadius = 16;
                var mClicked = null;

                while(markerLength--){
                    
                    var marker = glMarkers._markers[markerLength];
                    var mPoint = map.latLngToContainerPoint(marker._latLng);
                    
                    if(Math.abs(ePoint.x-mPoint.x)<mRadius && Math.abs(ePoint.y-mPoint.y)<mRadius){
                        var routerID = marker.options.nodeId;
                        //绘制连线
                        var allLines = [];

                        marker.options.linkedRouterIdList.forEach(function(d){
                            if(isRouterIdWithLatlng(d) && isRouterIdWithLatlng(routerID)){
                                allLines.push([{name:routerID+''},{name: d+''}])
                            }                               
                        })
                        

                      

                        //显示信息
                        var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
                        // getTopologyRouterWithinAS(routerID,currentHeaderAs,e); 
                        // $('.search-input').val(routerID);
                        // input_record.subinput_asin = routerID;
                        // contentlist_btnstatus = '1';
                        // $('.rb-btn2-1').trigger('click.animate');  
                        if(contentlist_btnstatus === '1'){
                           $('.search-input').val(routerID);
                           input_record.subinput_asin = routerID;
                           // contentlist_btnstatus = '1';
                           // $('.rb-btn2-1').trigger('click.animate');  
                           fetchData.getRouterInfoWithinAS({as: currentHeaderAs,key:routerID,pageSize: '1'},true);
                        }else if(contentlist_btnstatus === '2'){
                           $('.search-input').val(routerID);
                           input_record.subinput_asin = routerID;
                           // contentlist_btnstatus = '1';
                           // $('.rb-btn2-2').trigger('click.animate');  
                           fetchData.getEdgeInfoInAS({as: currentHeaderAs,key:routerID},true);
                           
                           option.series[0].markLine.data = allLines;
                           myChart = overlay.initECharts(chartsContainer);
                           overlay.setOption(option);
                          }
                  
                        getTopologyRouterWithinAS(routerID,currentHeaderAs,e)

                        //放大图标
                        glMarkers._markers.forEach(function(d){
                            if(d.options.nodeId == routerID){
                                glMarkers._rendering  = true;
                                d.options.labelrank =0; 
                                d.options.sizea =1.0; 
                                glMarkers2._rendering = true;
                                glMarkers2._markers.length = 0;
                                glMarkers2.addMarker(d)
                                // d.initialize(d._latLng,d.options)
                            }
                        })

                        // return false;
                        break;
                    }
                } 

               myChart.on('click', function (params) {
                   var x=params.event.offsetX;
                   var y=params.event.offsetY;
                   $('.marker-msg').css({left: x,top:y});
                   $('.search-input').val('');
                                 
                   if(params.seriesName === 'lines'){
                       var routerID = params.name.split('>');
                       getInterfaceRouterRelation2(routerID[0].trim(),routerID[1].trim());
                   }
               });
            }

           map.on('click', onMapClick);      
                                          
        }).done(function(){

            if(input_subResult_record == 'all' || input_subResult_record == ''){
                 searchAllRouter();
             }else{
                 switch(contentlist_btnstatus){
                   case "1":searchRouterBykey(input_subResult_record);break;
                   case "2":searchEdges(input_subResult_record);break;
                 }
             }      

        }).done(function(){
            // 临时添加凸显基础设计IP
            // glMarkers2._rendering = true;
            // glMarkers2._markers.length = 0;
            // glMarkers._markers.forEach(function(marker){
            //     // $.each(RouterIdarr,function(i,d){
                 
            //         if(marker.options.nodeId == '10678896'){
            //             console.log('kskksk')
            //            glMarkers._rendering  = true;
            //            marker.options.labelrank =0; 
            //            glMarkers2.addMarker(marker)
            //            $('.search-input').val('');
            //        }
            //     // })
            // })
        })
        

    // 点击连线获取的两端IP信息
    function getInterfaceRouterRelation2(routerID1,routerID2){
        var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
        $('.marker-msg').show();
        $('.marker-msg .content').html('<p class="loading">正在加载...<p>');

        jQuery.ajax({
            url:datav_config.server_url+'visual/control/vs/v3/topology/getInterfaceRouterRelation',
            // url:'http://192.168.1.99:8080/visual/control/vs/v3/topology/getInterfaceRouterRelation',
            type:'post',
            datatype:'json',
            timeout: 20000,
            headers: {'Content-type': 'application/json;charset=UTF-8'},            
            data: JSON.stringify({
                "id1":routerID1,
                "id2":routerID2,
                "asNumber":currentHeaderAs
            }), 
            success:function(d){
                 // var ip = e.target.options.ip[0];
                loading.set({show: true})

                var popupContent = '<div class = "mypopup-content"><div class="conrner conrner-lt"></div>'
                                +'<p>起始IP:<span>'+d.startIp+'</span></p>'
                                +'<p>目的IP:<span>'+d.endIp+'</span></p>'
                                +'<div class="conrner conrner-rb"></div></div>';

                 $('.marker-msg .content').html(popupContent);  
                 $('.marker-msg').fadeIn();            
            },
            error: function(err){
                $('.marker-msg .content').html('出错了!');
                // console.log(err)
            }
        });       
    }  

    // 点击路由时获取的信息
    function getTopologyRouterWithinAS(routerID,currentHeaderAs,e){
        jQuery.ajax({
            url:datav_config.server_url+'visual/control/vs/v3/topology/getTopologyRouterWithinAS',
            type:'post',
            datatype:'json',
            headers: {'Content-type': 'application/json;charset=UTF-8'},            
            data: JSON.stringify({
                "routerID":routerID,
                "asNumber":currentHeaderAs
            }), 
            success:function(d){
                // console.log('域内地理拓扑点击路由信息数据');
                // console.log(e.target)
                loading.set({show: true});

                if(d){
                    var routerType;

                    switch(d.role){
                        case 'area': routerType = '边缘路由';break;
                        case 'intermediate': routerType = '中间路由';break;
                        case 'core': routerType = '核心路由';break;
                        default: routerType = '边缘路由';
                    }
                    
                    var popupContent = '<div class = "mypopup-content"><div class="conrner conrner-lt"></div>'
                                        +'<p>ID:<span>'+d.routerID+',</span>&nbsp;IP:<span>'+ d.routerIP+',</span>&nbsp;AS编号:<span>'+d.asNumber+',</span></p>'
                                        +'<p>AS名称:<span>'+d.asName+',</span></p>'
                                        +'<p>路由类型:<span>'+routerType+',</span>&nbsp;洲:<span>'+d.continent+',</span></p>'
                                        +'<p>国家(地区):<span>'+d.country+',</span>&nbsp;省:<span>'+d.province+',</span>&nbsp;城市:<span>'+d.city+',</span>&nbsp;区:<span>'+d.district+',</span></p>'
                                        +'<p>经度:<span>'+d.longitude+',</span>&nbsp;纬度:<span>'+d.latitude+',</span></p>'
                                        +'<p>timeZone:<span>'+d.timeZone+',</span>&nbsp;zipcode:<span>'+d.zipcode+',</span>&nbsp;amount:<span>'+d.amount+',</span></p>'
                                        +'<p>coverage:<span>'+d.coverage+'</span></p>'
                                        +'<div class="conrner conrner-rb"></div></div>';    
                     
                       $('.marker-msg .content').html(popupContent);
                       var x = e.originalEvent.offsetX;
                       var y = e.originalEvent.offsetY;
                       
                       $('.marker-msg').css({left: x,top:y});
                       $('.marker-msg').fadeIn();
                }
            } 
        });
    } 

    function searchEdges(searchValue,as){
        var as = as || $('.logic_info_as .info_right .colum1 span').eq(1).text(); 

        jQuery.ajax({
            url: datav_config.server_url+'visual/control/vs/v3/topology/selectRouterEdgesByPicture',
            type: 'post',
            dataTyep: 'json',
            headers: {
              'Content-type': 'application/json;charset=UTF-8'
            },
            data: JSON.stringify({"asNumber":as,"key":searchValue}),
            success:function(data){

               var linesData = [];
               // searchAllRouter();
               
               var _RouterIdarr = [];

               $('.marker-msg').fadeOut();

                $.each(data,function(i,d){
                    if(isRouterIdWithLatlng(d.routerid) && isRouterIdWithLatlng(d.parentid)){
                        linesData.push([{name:d.routerid},{name:d.parentid}]);
                        _RouterIdarr.push(d.routerid);
                        // _RouterIdarr.push(d.parentid);
                    }
                })

                // $.each(['28570844','14621754','10457131','121'],function(i,d){
                //      linesData.push([{name:'17798386'},{name:d}]);
                // })
                searchRouter(_RouterIdarr);
                option.series[0].markLine.data = linesData;
                overlay.initECharts(chartsContainer);
                overlay.setOption(option);
                
            }
        });   
    };

    function searchRouter(RouterIdarr){
        if(typeof RouterIdarr === 'string'){
          RouterIdarr = [RouterIdarr];
        }
        // console.log('RouterIdarr')
        // console.log(RouterIdarr)
        $('.marker-msg').hide();
       overlay.initECharts(chartsContainer);
        glMarkers2._rendering = true;
        glMarkers2._markers.length = 0;
        glMarkers._markers.forEach(function(marker){
            $.each(RouterIdarr,function(i,d){
             
                if(marker.options.nodeId == d){
                   glMarkers._rendering  = true;
                   marker.options.labelrank =0; 
                   marker.options.sizea =0.7; 
                   glMarkers2.addMarker(marker)
                   // $('.search-input').val('');
               }
            })
        })
    };

    function searchRouterBykey(searchValue,as){
        var as = as || $('.logic_info_as .info_right .colum1 span').eq(1).text();
        var options = {
              asNumber: as,
              currPage: 1,
              pageSize: 10,
              role:'all',
              key:searchValue
        }

        var _this = this;
          
        jQuery.ajax({
            url: datav_config.server_url+'visual/control/vs/v3/topology/getRouterInfoWithinAS',
            type: 'post',
            dataTyep: 'json',
            headers: {
              'Content-type': 'application/json;charset=UTF-8'
            },
            data: JSON.stringify(options),
            success:function(data){
              console.log('searchRouterBykey')
              console.log(data)

              searchRouter(data.info.markId);

            }
        });   
    };

    function searchAllRouter(){
        $('.marker-msg').hide();
        overlay.initECharts(chartsContainer);
        glMarkers2._rendering = true;
        glMarkers2._markers.length = 0;
        glMarkers2.render();
    };

    function remove(){
        map.remove();
        map = null;
        $('#map_topoin').hide();
    };

    function hide(){
        $('#map').css({'width':0,'height':0})
    };

    function isRouterIdWithLatlng(id){
        for(var j=0;j<routerIDListWithlatlng.length;j++){
            if(id == routerIDListWithlatlng[j]){
                return true;
            }
        }

        return false;
    };

    return {
       remove: remove,
       searchRouter:searchRouter,
       searchAllRouter:searchAllRouter,
       searchEdges: searchEdges,
       searchRouterBykey: searchRouterBykey
    }
}
