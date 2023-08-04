//域内路由拓扑绘图模块
// 数据格式
// [ [ 
//   {id:1,ip:192.168.1.1,radius:0.1,size: 2,link: [1,2,3,4]},
//   {id:12,ip:192.168.1.1,radius:0.1,size: 2,link: [1,2,3,4]},
//   {id:31,ip:192.168.1.1,radius:0.1,size: 2,link: [1,2,3,4]}
//   ],
//   [ 
//   {id:4,ip:192.168.1.1,radius:0.2,size: 1,link: [1,2,3,4]},
//   {id:5,ip:192.168.1.1,radius:0.2,size: 1,link: [1,2,3,4]},
//   {id:13,ip:192.168.1.1,radius:0.2,size: 1,link: [1,2,3,4]}
//   ]
// ]
// 
// console.log(data)
var PARTICLE_SIZE = 10;
var INTERSECTED;
var attributes;
var info_router = $(".mymiddle .info_router");
var id_index_obj =  {};

    var TOPOIN_V = function(){
        /*
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          gl_PointSize = size * ( 300.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
        }
         */
    }.toString().match(/\/\*([^]*)\*\//)[1];

    var TOPOIN_F = function(){
        /*
          uniform sampler2D texture;
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4( vColor, 1.0 );
            gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
            if ( gl_FragColor.a < ALPHATEST ) discard;
          }
         */
    }.toString().match(/\/\*([^]*)\*\//)[1];

var LogicRouterIn = function(data) {
    // console.log('come in LogicRouterIn')
    this.pointsData = data;
    this.points = null;
    // this.routerGroup = new THREE.Object3D();
    this.routersLines = [];
    this.curRouterlinesGroup = null;
    // this.curRouterlinesGroup = curRouterlinesGroup;
    this.init();
    this.searchAllRouter()
    // this.searchRouter(['730318'])
}

LogicRouterIn.prototype = {
    init: function() {
        this.initCamera();
        this.initControler();
        this.addPoints();
    },

    initCamera: function() {
        var data = this.pointsData;
        var last_data = this.pointsData[0];
        var last_position = last_data.position;
        var maxRadius = Math.sqrt(Math.pow(last_position[0],2)+Math.pow(last_position[1],2));
        var cameraZ = 1.4*maxRadius/Math.tan(Math.PI*camera.fov/2/180);
        // var cameraZ = 1.5 * 1000 / Math.tan(Math.PI * camera.fov / 2 / 180);
        // camera = iCamera;
        camera.matrixWorldNeedsUpdate = true;
        camera.matrixWorldInverse.set(iCamera.matrixWorldInverse);
        camera.position.set(0, 0, cameraZ);
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
        // controler.update();
    },

    initControler: function() {
        controler = new THREE.TrackballControls(camera, renderer.domElement);
        controler.rotateSpeed = 1.0;
        controler.zoomSpeed = 1.0;
        controler.panSpeed = 1.0;
        // controler.noRotate = true;
        // controler.noZoom = false;
        // controler.noPan = false;
        // controler.noRoll = false;
        // controler.staticMoving = false;
        // controler.dynamicDampingFator = 0.2;
        // controler.minDistance = 0;
        // controler.MaxDistance = Infinity;
    },

    addPoints: function() {

        var pointsData = this.pointsData;
        var particles = pointsData.length;
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(particles * 3);
        var colors = new Float32Array(particles * 3);
        var sizes = new Float32Array(particles);
        var nodeId = new Int32Array(particles);
        var color = new THREE.Color();
        var _this = this;

        for (var i = 0; i < particles; i++) {

            if (pointsData[i]["type"] === 'core') {
                color.setRGB(1, 190 / 255, 15 / 255);
            } else if (pointsData[i]["type"] === "intermediate") {
                color.setRGB(237 / 255, 31 / 255, 31 / 255);
            } else if (pointsData[i]["type"] === "area") {
                color.setRGB(110 / 255, 205 / 255, 222 / 255);
            } else {
                // color.setRGB(110/255, 205/255, 222/255);
            }
            colors[3 * i] = color.r;
            colors[3 * i + 1] = color.g;
            colors[3 * i + 2] = color.b;
            sizes[i] = PARTICLE_SIZE;
            nodeId[i] = parseInt(pointsData[i].id);

            positions[i * 3] = pointsData[i]["position"][0];
            positions[i * 3 + 1] = pointsData[i]["position"][1];
            positions[i * 3 + 2] = pointsData[i]["position"][2];

            var id = pointsData[i].id;
            id_index_obj[id] = i;
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('customColor_copy', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.addAttribute('nodeId', new THREE.BufferAttribute(nodeId, 1));

        // var material = new THREE.PointsMaterial( { size: 1.0, vertexColors: THREE.VertexColors } );
        // $.get('./points.vs', function(vShader){
        //     $.get('./points.fs', function(fShader){
        var material = new THREE.ShaderMaterial({
            alphaTest: 0.2,
            uniforms: {
                texture: {
                    value: new THREE.TextureLoader().load("images/textures/light_dot.png")
                }
            },
            vertexShader: TOPOIN_V,
            fragmentShader: TOPOIN_F
            // depthTest: true
        });
        //     });
        // });
        this.points = new THREE.Points(geometry, material);
        scene.add(this.points);
    },

    clickRouters: function(raycaster, eX, eY, event) {
        // var routerGroup = this.routerGroup;
        // raycaster.linePrecision = 0.6;
        raycaster.params.Points.threshold = 5;
        var _this = this;

        // if(routerGroup.children){
        var intersects = raycaster.intersectObjects([_this.points]);
        var curRouterlinesGroup = this.curRouterlinesGroup;
        var intersects2 = curRouterlinesGroup && curRouterlinesGroup.children && raycaster.intersectObjects(curRouterlinesGroup.children);

        var geometry = this.points.geometry;
        attributes = geometry.attributes;

        if (intersects && intersects.length && intersects.length > 0) {

            if (intersects.length > 0) {

              var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
             

                if (INTERSECTED != intersects[0].index) {

                  var points_attrs = this.points.geometry.attributes;

                  for(var j=0;j<this.pointsData.length;j++){
                    points_attrs.size.array[j] = PARTICLE_SIZE;
                    points_attrs.size.needsUpdate = true;
                  }

                   this.clearRouterLines();

                 

                    // attributes.size.array[INTERSECTED] = PARTICLE_SIZE;
                    INTERSECTED = intersects[0].index;

                    attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 3;

                    attributes.size.needsUpdate = true;


                }

                // this.searchRouter([routerID]);
                 var routerID = this.pointsData[INTERSECTED].id;

            
         
               if(contentlist_btnstatus == '1'){

                  $('.search-input').val(routerID);
                  input_record.subinput_asin = routerID; 
                  fetchData.getRouterInfoWithinAS({as: currentHeaderAs,key:routerID,pageSize: '1'},true);

               }else if(contentlist_btnstatus == '2'){
                  $('.search-input').val(routerID);
                  input_record.subinput_asin = routerID; 
                  fetchData.getEdgeInfoInAS({as: currentHeaderAs,key:routerID},true);
                  this.createRouterLines(INTERSECTED);
                 }
      
               var routerIP  = this.pointsData[INTERSECTED].name;
               var description  = this.pointsData[INTERSECTED].description;
               info_router_html = '<p><span>IP:</span>'+routerIP+'</p><p><span>描述:</span>'+description+'</p>';         
               info_router.html(info_router_html);
               info_router.css({display: "block"});
           
            } 

        } else if (intersects2 && intersects2.length > 0) {

            var linked = intersects2[0].object.sourceId;
            var source = intersects2[0].object.linkedId;

            // info_router_html = '<p>'+source+' > '+linked+'</p>'; 
            function showIPlinkmsg(d){
              loading.set({show: true})
              info_router_html = '<p>起始IP:<span>'+d.startIp+'</span></p>'
                                 +'<p>目的IP:<span>'+d.endIp+'</span></p>';    
              info_router.html(info_router_html);
              info_router.css({display: "block"}); 
            } 
            
            getInterfaceRouterRelation(source,linked,showIPlinkmsg)
        } else {
            info_router.css({display: "none"});
            info_router.html('');
        }

        var rect = event.target.getBoundingClientRect();
        var top = event.y - rect.top;
        var left = event.x - rect.left;
        info_router.css({top:top,left: left}); 
    },

    createRouterLines: function(INTERSECTED) {

        var _this = this;
        var routersLines = this.routersLines;
        var curRouterlinesGroup = this.curRouterlinesGroup;

        var lineLinkRouterColor = "#66ff99";
        this.curRouterlinesGroup = new THREE.Object3D();
        this.curRouterlinesGroup.name = "routerlines";
        this.curRouterlinesGroup.id = "routerline" + INTERSECTED;
        routersLines.push(this.curRouterlinesGroup);

        var sourcePosition = this.pointsData[INTERSECTED].position;
        var links = this.pointsData[INTERSECTED].links;

        $.each(this.pointsData,
        function(i, d) {
            $.each(links,
            function(i1, d1) {
                if (d1 === d.id) {
                    var curveObject = createQuadraticBezierCurve3(sourcePosition, d.position, lineLinkRouterColor);
                    curveObject.name = 'rCurve';
                    curveObject.sourceId = _this.pointsData[INTERSECTED].id;
                    curveObject.linkedId = d1;
                    _this.curRouterlinesGroup.add(curveObject)
                }
            })
        })

        scene.remove(scene.remove(scene.getObjectByName("routerlines")));
        scene.add(this.curRouterlinesGroup)
    },

    searchRouter: function(RouterIdarr) {


        this.clearRouterLines();
        $(".mymiddle .info_router").hide();
        var points_attrs = this.points.geometry.attributes;
        // var nodeIds = points_attrs.nodeId;
        // var positions = points_attrs.position;
        // var customColors = points_attrs.customColor;
        // var customColors_copy = points_attrs.customColor_copy;
        // var size = points_attrs.size;
        // for (var i = 0; i < nodeIds.count; i++) {
        //     var nodeid_num = nodeIds.array[i];
        //     var nodeid = nodeIds.array[i].toString();
        //     if ($.inArray(nodeid, RouterIdarr) == -1) {
        //         // customColors.array[3 * i] = customColors_copy.array[3 * i];
        //         // customColors.array[3 * i + 1] = customColors_copy.array[3 * i + 1];
        //         // customColors.array[3 * i + 2] = customColors_copy.array[3 * i + 2];
        //         points_attrs.size.array[i] = PARTICLE_SIZE;
        //     } else {
        //         // customColors.array[3 * i] = customColors_copy.array[3 * i] * 0.3;
        //         // customColors.array[3 * i + 1] = customColors_copy.array[3 * i + 1] * 0.3;
        //         // customColors.array[3 * i + 2] = customColors_copy.array[3 * i + 2] * 0.3;
        //         points_attrs.size.array[i] = PARTICLE_SIZE*2;
        //     }
        // }
        for(var j=0;j<this.pointsData.length;j++){
          points_attrs.size.array[j] = PARTICLE_SIZE;
          points_attrs.size.needsUpdate = true;
        }
          
        $.each(RouterIdarr,function(i1,d1){
          var index = id_index_obj[d1];
          points_attrs.size.array[index] = PARTICLE_SIZE * 3;
          points_attrs.size.needsUpdate = true;

        })   
    },

    searchAllRouter: function() {//resetAllRouter
        this.clearRouterLines();
        $(".mymiddle .info_router").hide();
        var points_attrs = this.points.geometry.attributes;
        // var positions = points_attrs.position;
        // var customColors = points_attrs.customColor;
        // var customColors_copy = points_attrs.customColor_copy;
        // var size = points_attrs.size;
        // for (var i = 0; i < nodeIds.count; i++) {
        //     var nodeid_num = nodeIds.array[i];
        //     var nodeid = nodeIds.array[i].toString();
        //     customColors.array[3 * i] = customColors_copy.array[3 * i];
        //     customColors.array[3 * i + 1] = customColors_copy.array[3 * i + 1];
        //     customColors.array[3 * i + 2] = customColors_copy.array[3 * i + 2];
        // }
        // customColors.needsUpdate = true;
      
        for(var j=0;j< this.pointsData.length;j++){
          points_attrs.size.array[j] = PARTICLE_SIZE;
          points_attrs.size.needsUpdate = true;
        }
    },

    searchRouterBykey:function(searchValue,as){
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
         

              _this.searchRouter(data.info.markId);

            }
        });   
    },

    searchEdges: function(searchValue,as){
        var _this = this;
        var as = as || $('.logic_info_as .info_right .colum1 span').eq(1).text();
        
        jQuery.ajax({
            url: datav_config.server_url+'visual/control/vs/v3/topology/selectRouterEdgesByPicture',
            type: 'post',
            dataTyep: 'json',
            headers: {
              'Content-type': 'application/json;charset=UTF-8'
            },
            // data: JSON.stringify({"asNumber":18182,"key":"中正区"}),
            data: JSON.stringify({"asNumber":as,"key":searchValue}),
            success:function(data){

                _this.edgesGroup = new THREE.Object3D();
                _this.edgesGroup.name ="edgelines";
                _this.routersLines.push(_this.curRouterlinesGroup);

                _this.searchAllRouter();
                    $.each(data,function(i,d){

                        var sourceIndex = id_index_obj[d.routerid+''];
                        var targetIndex = id_index_obj[d.parentid+''];
                        // console.log(sourceIndex)
                        // console.log(targetIndex)
                        // console.log(_this.pointsData[sourceIndex])
                        // console.log(_this.pointsData[targetIndex])
                         var points_attrs = _this.points.geometry.attributes;
                         points_attrs.size.array[sourceIndex] = PARTICLE_SIZE * 3;
                         points_attrs.size.array[targetIndex] = PARTICLE_SIZE * 3;
                         points_attrs.size.needsUpdate = true;
                         

                       if(_this.pointsData[targetIndex] && _this.pointsData[sourceIndex]){//此处返回的parentid中有离线数据中不存在的id
                          var source = _this.pointsData[sourceIndex].position;
                          var target = _this.pointsData[targetIndex].position;
                       }
                        
                                                                                         
                        if(source && target){
                          var curveObject = createQuadraticBezierCurve3(source,target,"#66ff99");
                          _this.edgesGroup.add(curveObject)
                        }

                        source = null;
                        target = null;
                    })
                       
            
               scene.remove(scene.getObjectByName("routerlines"));
               scene.remove(scene.getObjectByName("edgelines"));
               scene.add(_this.edgesGroup)
            }
        });   
    },

    clearRouterLines: function() {

        scene.remove(scene.getObjectByName("routerlines"));
        scene.remove(scene.getObjectByName("edgelines"));
    },

    clear: function() {
        if (this.points) {
            scene.remove(this.points);
        }
        // if (this.curRouterlinesGroup) {
        //     scene.remove(this.curRouterlinesGroup)
        // }
        this. clearRouterLines();

        this.data = null;
    },

    update: function() {

},

    destory: function() {
        // this = null;
    }
}

function createQuadraticBezierCurve3(v0, v2, color) {

    var v0 = {
        x: v0[0],
        y: v0[1],
        z: 0
    };
    var v2 = {
        x: v2[0],
        y: v2[1],
        z: 0
    };

    var x = v2.x + (v0.x - v2.x) / 2;
    var y = v2.y + (v0.y - v2.y) / 2;
    // var z = camera.position.z / 5;
    var z = 0;
    var v1 = new THREE.Vector3(x, y, z);

    var curve = new THREE.QuadraticBezierCurve3(v0, v1, v2);
    var geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(200);
    var material = new THREE.LineBasicMaterial({
        color: color
    });
    var curveObject = new THREE.Line(geometry, material);

    return curveObject;
}

// 点击连线获取的两端IP信息
function getInterfaceRouterRelation(routerID1, routerID2, cb) {
    var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();

    jQuery.ajax({
        url: datav_config.server_url + 'visual/control/vs/v3/topology/getInterfaceRouterRelation',
        type: 'post',
        datatype: 'json',
        timeout: 20000,
        headers: {
            'Content-type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify({
            "id1": routerID1,
            "id2": routerID2,
            "asNumber": currentHeaderAs
        }),
        success: function(d) {
            cb(d);
        },
        error: function(err) {
            // info_router.html("出错了！");
        }
    });
}