//自动执行函数
(function () {
  console.log("------ datav3.q.map debug ------");
  // 公共鼠标拾取变量
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  renderer.sortObjects = false;

  // 公共离线Json文件
  var jsonfile_ASPostion; // AS位置缓存数据
  var jsonfile_staticLogicAsInfo; // AS基础信息
  var jsonfile_world_countries; // GEOjson缓存数据
  var jsonfile_staticLogicEdgeInfo; // AS边关系缓存数据

  ////////////////////////////////////////// 地理图全局变量 ////////////////////////////////////////////

  var country_center_points = {}; // 国家Path中心点
  var map_amount = 400; // 地图的厚度
  var vertical_length = 10000; // 垂线高度
  var min_dis_level = 10; // AS球状布局原始数据的离散程度
  var vertical_doshline_group; // 垂线物体
  var Land_points_group; // 地图上国家中心的点
  var direction_light; // 光线1
  var direction_light_2; // 光线2
  var country_geomap_map; // 地图
  var ASpoints_group; // AS点
  var ASlinks_group_out; // 国外AS线条
  var ASlinks_group_in; // 国内AS线条
  var ASlinks_group_both; // 全有AS线条
  var ASlinks_group_neither; // 全无AS线条
  var AS_pos_map; // AS位置对照表
  var AS_color_map; // AS颜色对照表
  var AS_type_map; // AS类型对照表
  var AS_links_map; // 该AS对应的links对照表
  var AS_links_color_map; // AS连接颜色对照表
  var AS_links_color_pccp_map; // AS连接颜色对照表（PC\CP颜色合并）
  var AS_atcountry_map; // 该AS所在的国家
  var phy_init_done = false; // 初始化完成标记
  var search_ASlinks_group; // 搜索中的连线
  var search_points_group; // 搜索中的点
  var valid_country_names; // 实际有效绘图国家列表
  var map_color_list = [0x264c9b, 0x687c18];
  var cp_color = new THREE.Color(0xed2f3d);
  var pc_color = new THREE.Color(0x6bcaf2);
  var pccp_color = new THREE.Color((0xed2f3d + 0x6bcaf2) / 2);
  var pp_color = new THREE.Color(0x009900);
  var ss_color = new THREE.Color(0xffff00);
  var df_color = new THREE.Color(0xffffff);

  var type_num_map = { "网络内容服务商型AS": 1, "大型组织机构型AS": 2, "网络传输/接入服务商型AS": 3 }; // AS类型转数字，传入着色器。
  var color_factory = d3
    .scaleLinear()
    .domain([5000, 1200, 50, 0])
    .range([
      "rgb(253, 190, 18)",
      "rgb(238, 31, 36)",
      "rgb(83, 104, 216)",
      "rgb(0, 207, 255)",
    ]); // 颜色
  var country_textpos_scale = d3
    .scaleLinear()
    .domain([200, 142, 101, 71, 50, 0])
    .range([1.0, 1.1, 1.1, 1.15, 1.15, 1.2]); // 国家文本位置比例尺
  var country_text_scale = d3
    .scaleLinear()
    .domain([200, 142, 101, 71, 50, 0])
    .range([5000, 8000, 10000, 12000, 15000, 15000]); // 国家文本大小比例尺
  var country_circle_scale = d3
    .scaleLinear()
    .domain([200, 142, 101, 71, 50, 0])
    .range([1500, 2000, 2500, 3000, 3500, 4000]); // 圈大小比例尺
  var projection = d3
    .geoEquirectangular()
    .rotate([-150, 0, 0])
    .center([0, 45])
    .scale(10000); // 地图设置自定义投影方式

  // 地理图点着色器的使用
  var PHY_VSHADER_SOURCE = function () {
    /*
          attribute vec3 custom_color;
          attribute float type;

          varying vec4 vColor;
          varying float vtype;       

          void main() {

        vColor = vec4(custom_color, 1.0);
        vtype = type;
        gl_PointSize = 10000.0 / distance(cameraPosition, position);
        if (gl_PointSize > 20.0){
          gl_PointSize = 20.0;
        }else if (gl_PointSize < 4.0){
          gl_PointSize = 4.0;
        }else {
          ;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var PHY_FSHADER_SOURCE = function () {
    /*
          varying vec4 vColor;
          varying float vtype;

          void main() {
        if (abs(vtype - 1.0)<0.001){
          if (gl_PointCoord.x * 2.0 + gl_PointCoord.y < 1.0 || gl_PointCoord.x * 2.0 - gl_PointCoord.y > 1.0 ){
              discard;
          }else{
              gl_FragColor = vColor;
          }
        }else if (abs(vtype - 2.0)<0.001){
          gl_FragColor = vColor;
        }else if (abs(vtype - 3.0)<0.001){
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          if(d > 0.5) {
            discard;
          } else {
              gl_FragColor = vColor;
          }
        }else{
          discard;
        }
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  // 地理图线着色器的使用
  var PHY_VSHADER_SOURCE_LINE = function () {
    /*
          attribute vec3 custom_color;
          varying vec4 vColor;

          void main() {

        vColor = vec4(custom_color, 0.8);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var PHY_FSHADER_SOURCE_LINE = function () {
    /*
          varying vec4 vColor;

          void main() {
            gl_FragColor = vColor;
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  ///////////////////////////////////////// 逻辑图全局变量 ///////////////////////////////////////////

  var custom_scale_level = 30000;
  var max_ASdegree = 4809;
  var current_graph_type;

  // 全球级别
  var world_ASpoints_group; // 国家AS粒子系统
  var world_countrytext_group; // 国家标签
  var world_search_ASlink_group;
  var world_boundry_circle; // 轮廓外圆
  var world_countryAS_info; // 存储全球AS位置等信息, 按照{国家:{AS:{key:valus,...},...}...}的级别
  var AS_atcountry_map = {}; // 存储全球AS所属国家
  var world_index_ASpoint_map; // 全球索引与AS对照表(分国家)，供拾取使用
  var world_ASpoint_index_map; // 全球AS与索引对照表(分国家)，供拾取使用
  var world_init_done; // 全球初始化完毕标记, reset缓存使用
  var log_ASlinks_group_out;
  var log_ASlinks_group_in;
  var log_ASlinks_group_both;
  var log_ASlinks_group_neither;
  // 国家内
  var countryin_topoinsquare_group; // 有域内拓扑的方框组
  var countryin_countrytext_group; // 国家标签组
  var countryin_countrylink_group; // 其它国家的抽象连线
  var countryin_countryothers_group; // 其它国家的AS抽象圆圈
  var countryin_current_circle; // 当前国家的轮廓圆圈
  var countryin_ASpoints_group; // 国家内的点
  var countryin_ASlink_group;
  var countryin_search_ASlink_group;
  var countryin_init_done = false;
  var countryin_current_country; // 当前国家标记
  var countryin_ASpoint_index_map;
  var countryin_index_ASpoint_map;

  // AS间
  var ASout_ASpoints_group; // 域间的AS点集合
  var ASout_topoinsquare_group; // 域间的方框集合
  var ASout_countrytext_group; // 域间的国家标签集合
  var ASout_countrylink_group; // 域间links集合
  var ASout_countryothers_group; // 域间其它国家的AS抽象圆圈
  var ASout_ASlink_group; // 域间AS连线集合
  var ASout_boundry_circle; // AS范围圈
  var ASout_init_done = false;
  var ASout_ASpoints = {}; // 存储域内的位置
  var ASout_current_AS;
  var ASout_index_ASpoint_map = {};
  var ASout_ASpoint_index_map = {};
  var ASout_index_ASlink_map = {};

  // 国家间
  var countryout_ASpoints_group; // 国家间的AS点集合
  var countryout_center_countrytext_group; // 中心点国家文本
  var countryout_boundry_circle_group; // 国家的轮廓圈
  var countryout_link_country_group; // 主体国家与主体国家的连接线
  var countryout_ASlinks_group; // AS连线
  var countryout_ASpoints;
  var countryout_country_centers = {}; // 国家中心
  var countryout_index_ASpoint_map = {};
  var countryout_ASpoint_index_map = {};
  var countryout_current_countrylist = [];
  var countryout_init_done = false; // 国家间初始化完毕标记, reset缓存使用

  // AS interface.
  var plane_first;
  var plane_second;
  var firstboundry_obj;
  var secondboundry_obj;
  var first_points;
  var ASinterface_line_group;
  var ASinterface_text_group;
  var second_points;
  var ASinterface_init_done = false;
  var ASinterface_current = "";

  // click handle var
  var timer_seted = false;
  var timer_target_type;
  var timer_target_value;
  var sleep_function;

  // 逻辑图点着色器的使用
  var VSHADER_SOURCE = function () {
    /*
          attribute float size;
          attribute vec3 custom_color;
          attribute float opacity;
          attribute float type;

          varying vec4 vColor;
          varying float vtype;
          varying float vopacity;        

          void main() {

        vColor = vec4(custom_color, opacity);
        vtype = type;
          
        gl_PointSize = size * (600000.0 / cameraPosition.z);

        if (gl_PointSize < 4.0){
          gl_PointSize = 4.0;
        }else if (gl_PointSize > 20.0){
          gl_PointSize = 20.0;
        }else{
          ;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var FSHADER_SOURCE = function () {
    /*
          varying vec4 vColor;
          varying float vtype;

          void main() {
        if (abs(vtype - 1.0)<0.001){
          if (gl_PointCoord.x * 2.0 + gl_PointCoord.y < 1.0 || gl_PointCoord.x * 2.0 - gl_PointCoord.y > 1.0 ){
              discard;
          }else{
              gl_FragColor = vColor;
          }
        }else if (abs(vtype - 2.0)<0.001){
          gl_FragColor = vColor;
        }else if (abs(vtype - 3.0)<0.001){
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          if(d > 0.45) {
            discard;
          } else {
              gl_FragColor = vColor;
          }
        }else{
          discard;
        }
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var VSHADER_SOURCE_GLOBAL = function () {
    /*
          attribute float size;
          attribute vec3 custom_color;
          attribute float opacity;
          attribute float type;

          varying vec4 vColor;
          varying float vtype;
          varying float vopacity;        

          void main() {

        vColor = vec4(custom_color, opacity);
        vtype = type;
        vopacity = opacity;
          
        gl_PointSize = size * (400000.0 / cameraPosition.z);

        if (gl_PointSize < 2.0){
          gl_PointSize = 2.0;
        }else if (gl_PointSize > 20.0){
          gl_PointSize = 20.0;
        }else{
          ;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var FSHADER_SOURCE_GLOBAL = function () {
    /*
          varying vec4 vColor;
          varying float vtype;
          varying float vopacity;

          void main() {
        if (abs(vtype - 1.0)<0.001){
          if (gl_PointCoord.x * 2.0 + gl_PointCoord.y < 1.0 || gl_PointCoord.x * 2.0 - gl_PointCoord.y > 1.0 ){
              discard;
          }else{
              gl_FragColor = vColor;
          }
        }else if (abs(vtype - 2.0)<0.001){
          gl_FragColor = vColor;
        }else if (abs(vtype - 3.0)<0.001){
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          if(d > 0.45) {
            discard;
          } else {
              gl_FragColor = vColor;
          }
        }else{
          discard;
        }
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  // 逻辑图线着色器的使用
  var LOG_VSHADER_SOURCE_LINE = function () {
    /*
          attribute vec3 custom_color;
          varying vec4 vColor;

          void main() {

        vColor = vec4(custom_color, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var LOG_FSHADER_SOURCE_LINE = function () {
    /*
          varying vec4 vColor;

          void main() {
            gl_FragColor = vColor;
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var LOG_VSHADER_SOURCE_LINE_GLOBAL = function () {
    /*
          attribute vec3 custom_color;
          varying vec4 vColor;

          void main() {

        vColor = vec4(custom_color, 0.4);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];

  var LOG_FSHADER_SOURCE_LINE_GLOBAL = function () {
    /*
          varying vec4 vColor;

          void main() {
            gl_FragColor = vColor;
          }
         */
  }
    .toString()
    .match(/\/\*([^]*)\*\//)[1];
  ///////////////////////////////////////// 函数定义 ///////////////////////////////////////////

  // 地理图函数定义
  function phy_init_data() {
    console.log("地理图函数定义");
    var dtd = $.Deferred();
    if (phy_init_done == true) {
      // console.log("using phy cache.");
      dtd.resolve();
    } else {
      loading.start();
      requirejs(
        [
          "json!" + datav_config.ajax_data_url + "world-countries.json",
          "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
          "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
          "json!" + datav_config.ajax_data_url + "staticLogicEdgeInfo.json",
        ],
        function (a, b, c, d) {
          jsonfile_world_countries = a;
          jsonfile_ASPostion = b;
          jsonfile_staticLogicAsInfo = c;
          jsonfile_staticLogicEdgeInfo = d;
          data_processing();
          phy_init_done = true;
          loading.done();
          dtd.resolve();
        }
      );
    }
    return dtd.promise();

    function _init_light_data() {
      console.log("phy_init_data() _init_light_data() running");
      // 增加光照，使得地图表面变色
      direction_light = new THREE.DirectionalLight(0x0e4d72, 0.6);
      direction_light.position.set(0, 1, 0);

      direction_light_2 = new THREE.DirectionalLight(0x87cefa, 1);
      direction_light_2.position.set(0, 0, -1);
    }

    function _init_map_data() {
      console.log("phy_init_data() _init_map_data() running");
      // 国家地理边界数据可能不全，需要每次检查补充。
      var extrudeSettings = {
        amount: map_amount,
        bevelSegments: 0,
        bevelSize: 0,
        bevelThickness: 0,
      };
      var path = d3.geoPath(projection); // geo路径生成器
      var features = jsonfile_world_countries.features;
      country_geomap_map = new THREE.Group();
      for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var country_code = feature["properties"]["iso_a2"];
        if (country_code == "AQ") {
          // 过滤处理，去除南极洲
          continue;
        } else {
          var map_mesh = new THREE.Mesh(
            new THREE.ExtrudeGeometry(
              transformSVGPathExposed(path(feature)),
              extrudeSettings
            ),
            new THREE.MeshLambertMaterial({
              color: 0xffffff,
              depthTest: true,
            })
          );
          map_mesh.name = "map_" + country_code;
          country_geomap_map.add(map_mesh);
          country_center_points[country_code] = path.centroid(feature);
        }
      }
    }

    function _init_json2topo() {
      console.log("phy_init_data() _init_json2topo() running");
      AS_type_map = {};
      AS_pos_map = {};
      AS_color_map = {};
      AS_links_map = {};
      AS_atcountry_map = {};
      ASpoints_group = new THREE.Group();
      ASlinks_group_out = new THREE.Group();
      ASlinks_group_in = new THREE.Group();
      ASlinks_group_both = new THREE.Group();
      ASlinks_group_neither = new THREE.Group();
      vertical_doshline_group = new THREE.Group();

      var allAS_points = new THREE.BufferGeometry();
      var points_geometry_vertices = [];
      var points_geometry_colors = [];
      var points_geometry_types = [];
      // 统计AS数量最多的国家，依此计算不同国家的中心点高度
      var country_AScount_list = [];
      for (var country_code in jsonfile_ASPostion) {
        var country_ASes = jsonfile_ASPostion[country_code];
        country_AScount_list.push(_.size(country_ASes));
      }
      var country_AScount_max = _.max(country_AScount_list);
      // console.log("------------");
      // 点处理
      var Land_points = new THREE.Geometry();
      valid_country_names = []; // 实际有效的绘图国家列表
      _.forEach(jsonfile_staticLogicAsInfo, function (country_AS) {
        var country_code = country_AS["countryCode"];
        var ASInfoList = country_AS["ASInfoList"];
        if (ASInfoList.length == 0) {
          // console.log(country_code+" country has no ASes in jsonfile_staticLogicAsInfo.");
          return;
        } else {
        }

        var country_ASpos = jsonfile_ASPostion[country_code];
        if (country_ASpos == undefined) {
          console.log(
            country_code +
              " country in jsonfile_staticLogicAsInfo but not in jsonfile_ASPostion."
          );
          return;
        } else {
        }

        var path_center = country_center_points[country_code]; // 国家中心
        if (path_center == undefined) {
          console.log(country_code + " has no geomap data");
          return;
        } else {
        }
        valid_country_names.push(country_code);

        var country_AS_count = _.size(country_ASpos); // 国家有位置的AS数量
        var country_center_hight =
          -vertical_length * 2.0 +
          (1 -
            Math.log((country_AS_count + 1) / (country_AScount_max + 1)) /
              Math.LN10) *
            2000; //根据国家AS数量生成AS国家中心高度的变量            // 垂线和地理中心点处理
        // 垂线和国家地图中心点处理
        var vertical_doshline_points = new THREE.Geometry();
        vertical_doshline_points.vertices.push(
          new THREE.Vector3(
            path_center[0],
            path_center[1],
            country_center_hight
          ),
          new THREE.Vector3(path_center[0], path_center[1], 0)
        );
        vertical_doshline_points.computeLineDistances();
        var doshline_material = new THREE.LineDashedMaterial({
          color: 0x359960,
          dashSize: 200,
          gapSize: 200,
          opacity: 0.5,
          depthTest: true,
          transparent: true,
        });
        var line_dosh = new THREE.Line(
          vertical_doshline_points,
          doshline_material
        );
        line_dosh.name = "doshline_" + country_code;
        vertical_doshline_group.add(line_dosh);
        Land_points.vertices.push(
          new THREE.Vector3(path_center[0], path_center[1], -100)
        );

        // AS点处理
        _.forEach(ASInfoList, function (ASInfo, ASindex) {
          var AS_num = ASInfo["ASNumber"];
          if (country_ASpos[AS_num] == undefined) {
            console.log(
              AS_num +
                " in jsonfile_staticLogicAsInfo has no position in jsonfile_ASPostion."
            );
          } else {
            // 度数0与1合并，从而缩小外圈。
            var AS_Degree =
              ASInfo["ASDegrees"] == 0
                ? ASInfo["ASDegrees"] + 2
                : ASInfo["ASDegrees"] + 1;
            var color = new THREE.Color(color_factory(AS_Degree));
            var AS_type = type_num_map[ASInfo["ASType"]];
            var AS_links = country_ASpos[AS_num][3];
            var x = country_ASpos[AS_num][2] * min_dis_level + path_center[0];
            var y = country_ASpos[AS_num][1] * min_dis_level + path_center[1];
            var z =
              country_ASpos[AS_num][0] * min_dis_level + country_center_hight;
            points_geometry_vertices.push(x);
            points_geometry_vertices.push(y);
            points_geometry_vertices.push(z);
            points_geometry_colors.push(color.r);
            points_geometry_colors.push(color.g);
            points_geometry_colors.push(color.b);
            points_geometry_types.push(AS_type);
            AS_type_map[AS_num] = AS_type;
            AS_pos_map[AS_num] = new THREE.Vector3(x, y, z);
            AS_color_map[AS_num] = color;
            AS_links_map[AS_num] = AS_links;
            AS_atcountry_map[AS_num] = country_code;
          }
        });
      });
      // 地图中心点标记材料
      var land_point_material = new THREE.PointsMaterial({
        size: 100,
        color: 0xcf841e,
        depthTest: true,
      });
      Land_points_group = new THREE.Points(Land_points, land_point_material);
      // AS点继续处理
      allAS_points.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(points_geometry_vertices), 3)
      );
      allAS_points.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(points_geometry_colors), 3)
      );
      allAS_points.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(points_geometry_types), 1)
      );
      var AS_points_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE,
        fragmentShader: PHY_FSHADER_SOURCE,
        transparent: true,
        depthTest: true,
      });
      ASpoints_group = new THREE.Points(allAS_points, AS_points_material);

      // AS link处理
      AS_links_color_map = {}; // 正常颜色对应（查询AS使用，区分PC\CP）
      AS_links_color_pccp_map = {}; // 合并颜色对应（查询国家使用，不区分PC\CP）
      // 直接建立如下4个对象，加快4种状态图的切换速度
      ASlinks_out_geom = new THREE.BufferGeometry(); // 国外
      ASlinks_in_geom = new THREE.BufferGeometry(); // 国内
      ASlinks_both_geom = new THREE.BufferGeometry(); // 全有
      ASlinks_neither_geom = new THREE.BufferGeometry(); // 全无

      var ASlinks_out_geom_vertices = [];
      var ASlinks_in_geom_vertices = [];
      var ASlinks_both_geom_vertices = [];
      var ASlinks_neither_geom_vertices = [];

      var ASlinks_out_geom_colors = [];
      var ASlinks_in_geom_colors = [];
      var ASlinks_both_geom_colors = [];
      var ASlinks_neither_geom_colors = [];
      // 线条双向变单向处理
      var ASlinks_out_flag = {}; // 国外单向线标记
      var ASlinks_in_flag = {}; // 国内单向线标记
      var ASlinks_both_flag = {}; // 全有单向线标记
      var ASlinks_neither_flag = {}; // 全无单向线标记

      for (var i = 0; i < valid_country_names.length; i++) {
        var country_code = valid_country_names[i];
        var country_ASes = jsonfile_ASPostion[country_code];
        for (var AS_num in country_ASes) {
          var AS_pos = AS_pos_map[AS_num];
          if (AS_pos == undefined) {
            console.log(
              AS_num +
                "@" +
                country_code +
                " has no info in staticLogicAsInfo.json"
            );
            continue;
          } else {
            var link_ASes = AS_links_map[AS_num];
            for (
              var link_index = 0;
              link_index < link_ASes.length;
              link_index++
            ) {
              var linkAS = link_ASes[link_index];
              var linkAS_pos = AS_pos_map[linkAS];
              if (linkAS_pos == undefined) {
                // AS只出现在别的AS边关系中，并没有自己的位置
                // console.log(linkAS + " (linkAS) have no as info, need add!");
                continue;
              } else {
                var link_type =
                  jsonfile_staticLogicEdgeInfo[AS_num + "-" + linkAS];
                if (!ASlinks_both_flag[linkAS + "-" + AS_num]) {
                  // 如果没有添加反向的AS-linkAS，则添加当前的正向AS-linkAS，及其保留边颜色信息
                  ASlinks_both_geom_vertices.push(AS_pos.x);
                  ASlinks_both_geom_vertices.push(AS_pos.y);
                  ASlinks_both_geom_vertices.push(AS_pos.z);
                  ASlinks_both_geom_vertices.push(linkAS_pos.x);
                  ASlinks_both_geom_vertices.push(linkAS_pos.y);
                  ASlinks_both_geom_vertices.push(linkAS_pos.z);
                  if (link_type[0] == "P" && link_type[1] == "C") {
                    ASlinks_both_geom_colors.push(pccp_color.r);
                    ASlinks_both_geom_colors.push(pccp_color.g);
                    ASlinks_both_geom_colors.push(pccp_color.b);
                    ASlinks_both_geom_colors.push(pccp_color.r);
                    ASlinks_both_geom_colors.push(pccp_color.g);
                    ASlinks_both_geom_colors.push(pccp_color.b);
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                    AS_links_color_map[AS_num + "-" + linkAS] = pc_color;
                  } else if (link_type[0] == "P" && link_type[1] == "P") {
                    ASlinks_both_geom_colors.push(pp_color.r);
                    ASlinks_both_geom_colors.push(pp_color.g);
                    ASlinks_both_geom_colors.push(pp_color.b);
                    ASlinks_both_geom_colors.push(pp_color.r);
                    ASlinks_both_geom_colors.push(pp_color.g);
                    ASlinks_both_geom_colors.push(pp_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = pp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pp_color;
                  } else if (link_type[0] == "C" && link_type[1] == "P") {
                    ASlinks_both_geom_colors.push(pccp_color.r);
                    ASlinks_both_geom_colors.push(pccp_color.g);
                    ASlinks_both_geom_colors.push(pccp_color.b);
                    ASlinks_both_geom_colors.push(pccp_color.r);
                    ASlinks_both_geom_colors.push(pccp_color.g);
                    ASlinks_both_geom_colors.push(pccp_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = cp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                  } else if (link_type[0] == "S" && link_type[1] == "S") {
                    ASlinks_both_geom_colors.push(ss_color.r);
                    ASlinks_both_geom_colors.push(ss_color.g);
                    ASlinks_both_geom_colors.push(ss_color.b);
                    ASlinks_both_geom_colors.push(ss_color.r);
                    ASlinks_both_geom_colors.push(ss_color.g);
                    ASlinks_both_geom_colors.push(ss_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = ss_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = ss_color;
                  } else {
                    ASlinks_both_geom_colors.push(df_color.r);
                    ASlinks_both_geom_colors.push(df_color.g);
                    ASlinks_both_geom_colors.push(df_color.b);
                    ASlinks_both_geom_colors.push(df_color.r);
                    ASlinks_both_geom_colors.push(df_color.g);
                    ASlinks_both_geom_colors.push(df_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = df_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = df_color;
                  }
                  ASlinks_both_flag[AS_num + "-" + linkAS] = true;
                } else {
                  // 如果添加过反向的AS-linkAS，则不添加当前的正向AS-linkAS，但保留边颜色信息(供查询接口使用)
                  if (link_type[0] == "P" && link_type[1] == "C") {
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                    AS_links_color_map[AS_num + "-" + linkAS] = pc_color;
                  } else if (link_type[0] == "P" && link_type[1] == "P") {
                    AS_links_color_map[AS_num + "-" + linkAS] = pp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pp_color;
                  } else if (link_type[0] == "C" && link_type[1] == "P") {
                    AS_links_color_map[AS_num + "-" + linkAS] = cp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                  } else if (link_type[0] == "S" && link_type[1] == "S") {
                    AS_links_color_map[AS_num + "-" + linkAS] = ss_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = ss_color;
                  } else {
                    AS_links_color_map[AS_num + "-" + linkAS] = df_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = df_color;
                  }
                }
                // 区分国内国外
                if (AS_atcountry_map[linkAS] == country_code) {
                  // 国内
                  if (!ASlinks_in_flag[linkAS + "-" + AS_num]) {
                    ASlinks_in_geom_vertices.push(AS_pos.x);
                    ASlinks_in_geom_vertices.push(AS_pos.y);
                    ASlinks_in_geom_vertices.push(AS_pos.z);
                    ASlinks_in_geom_vertices.push(linkAS_pos.x);
                    ASlinks_in_geom_vertices.push(linkAS_pos.y);
                    ASlinks_in_geom_vertices.push(linkAS_pos.z);
                    if (link_type[0] == "P" && link_type[1] == "C") {
                      ASlinks_in_geom_colors.push(pccp_color.r);
                      ASlinks_in_geom_colors.push(pccp_color.g);
                      ASlinks_in_geom_colors.push(pccp_color.b);
                      ASlinks_in_geom_colors.push(pccp_color.r);
                      ASlinks_in_geom_colors.push(pccp_color.g);
                      ASlinks_in_geom_colors.push(pccp_color.b);
                    } else if (link_type[0] == "P" && link_type[1] == "P") {
                      ASlinks_in_geom_colors.push(pp_color.r);
                      ASlinks_in_geom_colors.push(pp_color.g);
                      ASlinks_in_geom_colors.push(pp_color.b);
                      ASlinks_in_geom_colors.push(pp_color.r);
                      ASlinks_in_geom_colors.push(pp_color.g);
                      ASlinks_in_geom_colors.push(pp_color.b);
                    } else if (link_type[0] == "C" && link_type[1] == "P") {
                      ASlinks_in_geom_colors.push(pccp_color.r);
                      ASlinks_in_geom_colors.push(pccp_color.g);
                      ASlinks_in_geom_colors.push(pccp_color.b);
                      ASlinks_in_geom_colors.push(pccp_color.r);
                      ASlinks_in_geom_colors.push(pccp_color.g);
                      ASlinks_in_geom_colors.push(pccp_color.b);
                    } else if (link_type[0] == "S" && link_type[1] == "S") {
                      ASlinks_in_geom_colors.push(ss_color.r);
                      ASlinks_in_geom_colors.push(ss_color.g);
                      ASlinks_in_geom_colors.push(ss_color.b);
                      ASlinks_in_geom_colors.push(ss_color.r);
                      ASlinks_in_geom_colors.push(ss_color.g);
                      ASlinks_in_geom_colors.push(ss_color.b);
                    } else {
                      ASlinks_in_geom_colors.push(df_color.r);
                      ASlinks_in_geom_colors.push(df_color.g);
                      ASlinks_in_geom_colors.push(df_color.b);
                      ASlinks_in_geom_colors.push(df_color.r);
                      ASlinks_in_geom_colors.push(df_color.g);
                      ASlinks_in_geom_colors.push(df_color.b);
                    }
                    ASlinks_in_flag[AS_num + "-" + linkAS] = true;
                  } else {
                  }
                } else {
                  // 国外
                  if (!ASlinks_out_flag[linkAS + "-" + AS_num]) {
                    ASlinks_out_geom_vertices.push(AS_pos.x);
                    ASlinks_out_geom_vertices.push(AS_pos.y);
                    ASlinks_out_geom_vertices.push(AS_pos.z);
                    ASlinks_out_geom_vertices.push(linkAS_pos.x);
                    ASlinks_out_geom_vertices.push(linkAS_pos.y);
                    ASlinks_out_geom_vertices.push(linkAS_pos.z);
                    if (link_type[0] == "P" && link_type[1] == "C") {
                      ASlinks_out_geom_colors.push(pccp_color.r);
                      ASlinks_out_geom_colors.push(pccp_color.g);
                      ASlinks_out_geom_colors.push(pccp_color.b);
                      ASlinks_out_geom_colors.push(pccp_color.r);
                      ASlinks_out_geom_colors.push(pccp_color.g);
                      ASlinks_out_geom_colors.push(pccp_color.b);
                    } else if (link_type[0] == "P" && link_type[1] == "P") {
                      ASlinks_out_geom_colors.push(pp_color.r);
                      ASlinks_out_geom_colors.push(pp_color.g);
                      ASlinks_out_geom_colors.push(pp_color.b);
                      ASlinks_out_geom_colors.push(pp_color.r);
                      ASlinks_out_geom_colors.push(pp_color.g);
                      ASlinks_out_geom_colors.push(pp_color.b);
                    } else if (link_type[0] == "C" && link_type[1] == "P") {
                      ASlinks_out_geom_colors.push(pccp_color.r);
                      ASlinks_out_geom_colors.push(pccp_color.g);
                      ASlinks_out_geom_colors.push(pccp_color.b);
                      ASlinks_out_geom_colors.push(pccp_color.r);
                      ASlinks_out_geom_colors.push(pccp_color.g);
                      ASlinks_out_geom_colors.push(pccp_color.b);
                    } else if (link_type[0] == "S" && link_type[1] == "S") {
                      ASlinks_out_geom_colors.push(ss_color.r);
                      ASlinks_out_geom_colors.push(ss_color.g);
                      ASlinks_out_geom_colors.push(ss_color.b);
                      ASlinks_out_geom_colors.push(ss_color.r);
                      ASlinks_out_geom_colors.push(ss_color.g);
                      ASlinks_out_geom_colors.push(ss_color.b);
                    } else {
                      ASlinks_out_geom_colors.push(df_color.r);
                      ASlinks_out_geom_colors.push(df_color.g);
                      ASlinks_out_geom_colors.push(df_color.b);
                      ASlinks_out_geom_colors.push(df_color.r);
                      ASlinks_out_geom_colors.push(df_color.g);
                      ASlinks_out_geom_colors.push(df_color.b);
                    }
                    ASlinks_out_flag[AS_num + "-" + linkAS] = true;
                  } else {
                  }
                }
              }
            }
          }
        }
      }

      ASlinks_out_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_out_geom_vertices),
          3
        )
      );
      ASlinks_in_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(ASlinks_in_geom_vertices), 3)
      );
      ASlinks_both_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_both_geom_vertices),
          3
        )
      );
      ASlinks_neither_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_neither_geom_vertices),
          3
        )
      );

      ASlinks_out_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_out_geom_colors), 3)
      );
      ASlinks_in_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_in_geom_colors), 3)
      );
      ASlinks_both_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_both_geom_colors), 3)
      );
      ASlinks_neither_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_neither_geom_colors),
          3
        )
      );

      var ASlinks_out_geom_flag = undefined; // 清除国外单向线标记变量
      var ASlinks_in_flag = undefined; // 清除国内单向线标记变量
      var ASlinks_both_flag = undefined; // 清除全有单向线标记变量
      var ASlinks_neither_flag = undefined; // 清除全无单向线标记变量

      var ASlink_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE_LINE,
        fragmentShader: PHY_FSHADER_SOURCE_LINE,
        transparent: true,
        depthTest: true,
      });

      ASlinks_group_out = new THREE.LineSegments(
        ASlinks_out_geom,
        ASlink_material
      );
      ASlinks_group_in = new THREE.LineSegments(
        ASlinks_in_geom,
        ASlink_material
      );
      ASlinks_group_both = new THREE.LineSegments(
        ASlinks_both_geom,
        ASlink_material
      );
      ASlinks_group_neither = new THREE.LineSegments(
        ASlinks_neither_geom,
        ASlink_material
      );
    }

    function _init_json2topo_2() {
      console.log("phy_init_data() _init_json2topo_2() running");
      AS_type_map = {};
      AS_pos_map = {};
      AS_color_map = {};
      AS_links_map = {};
      AS_atcountry_map = {};
      ASpoints_group = new THREE.Group();
      ASlinks_group_out = new THREE.Group();
      ASlinks_group_in = new THREE.Group();
      ASlinks_group_both = new THREE.Group();
      ASlinks_group_neither = new THREE.Group();
      vertical_doshline_group = new THREE.Group();

      var allAS_points = new THREE.BufferGeometry();
      var points_geometry_vertices = [];
      var points_geometry_colors = [];
      var points_geometry_types = [];
      // 统计AS数量最多的国家，依此计算不同国家的中心点高度
      var country_AScount_list = [];
      for (var country_code in jsonfile_ASPostion) {
        var country_ASes = jsonfile_ASPostion[country_code];
        country_AScount_list.push(_.size(country_ASes));
      }
      var country_AScount_max = _.max(country_AScount_list);
      // 点处理
      var Land_points = new THREE.Geometry();
      valid_country_names = []; // 实际有效的绘图国家列表
      _.forEach(jsonfile_staticLogicAsInfo, function (country_AS) {
        var country_code = country_AS["countryCode"];
        var ASInfoList = country_AS["ASInfoList"];
        if (ASInfoList.length == 0) {
          // console.log(country_code+" country has no ASes in jsonfile_staticLogicAsInfo.");
          return;
        } else {
        }

        var country_ASpos = jsonfile_ASPostion[country_code];
        if (country_ASpos == undefined) {
          console.log(
            country_code +
              " country in jsonfile_staticLogicAsInfo but not in jsonfile_ASPostion."
          );
          return;
        } else {
        }

        var path_center = country_center_points[country_code]; // 国家中心
        if (path_center == undefined) {
          console.log(country_code + " has no geomap data");
          return;
        } else {
        }
        valid_country_names.push(country_code);

        var country_AS_count = _.size(country_ASpos); // 国家有位置的AS数量
        var country_center_hight =
          -vertical_length * 2.0 +
          (1 -
            Math.log((country_AS_count + 1) / (country_AScount_max + 1)) /
              Math.LN10) *
            2000; //根据国家AS数量生成AS国家中心高度的变量            // 垂线和地理中心点处理
        // 垂线和国家地图中心点处理
        var vertical_doshline_points = new THREE.Geometry();
        vertical_doshline_points.vertices.push(
          new THREE.Vector3(
            path_center[0],
            path_center[1],
            country_center_hight
          ),
          new THREE.Vector3(path_center[0], path_center[1], 0)
        );
        vertical_doshline_points.computeLineDistances();
        var doshline_material = new THREE.LineDashedMaterial({
          color: 0x359960,
          dashSize: 200,
          gapSize: 200,
          opacity: 0.5,
          depthTest: true,
          transparent: true,
        });
        var line_dosh = new THREE.Line(
          vertical_doshline_points,
          doshline_material
        );
        line_dosh.name = "doshline_" + country_code;
        vertical_doshline_group.add(line_dosh);
        Land_points.vertices.push(
          new THREE.Vector3(path_center[0], path_center[1], -100)
        );

        // AS点处理
        _.forEach(ASInfoList, function (ASInfo, ASindex) {
          var AS_num = ASInfo["ASNumber"];
          if (country_ASpos[AS_num] == undefined) {
            console.log(
              AS_num +
                " in jsonfile_staticLogicAsInfo has no position in jsonfile_ASPostion."
            );
          } else {
            // 度数0与1合并，从而缩小外圈。
            var AS_Degree =
              ASInfo["ASDegrees"] == 0
                ? ASInfo["ASDegrees"] + 2
                : ASInfo["ASDegrees"] + 1;
            var color = new THREE.Color(color_factory(AS_Degree));
            var AS_type = type_num_map[ASInfo["ASType"]];
            var AS_links = country_ASpos[AS_num][3];
            var x = country_ASpos[AS_num][2] * min_dis_level + path_center[0];
            var y = country_ASpos[AS_num][1] * min_dis_level + path_center[1];
            var z =
              country_ASpos[AS_num][0] * min_dis_level + country_center_hight;
            points_geometry_vertices.push(x);
            points_geometry_vertices.push(y);
            points_geometry_vertices.push(z);
            points_geometry_colors.push(color.r);
            points_geometry_colors.push(color.g);
            points_geometry_colors.push(color.b);
            points_geometry_types.push(AS_type);
            AS_type_map[AS_num] = AS_type;
            AS_pos_map[AS_num] = new THREE.Vector3(x, y, z);
            AS_color_map[AS_num] = color;
            AS_links_map[AS_num] = AS_links;
            AS_atcountry_map[AS_num] = country_code;
          }
        });
      });
      // 地图中心点标记材料
      var land_point_material = new THREE.PointsMaterial({
        size: 100,
        color: 0xcf841e,
        depthTest: true,
      });
      Land_points_group = new THREE.Points(Land_points, land_point_material);
      // AS点继续处理
      allAS_points.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(points_geometry_vertices), 3)
      );
      allAS_points.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(points_geometry_colors), 3)
      );
      allAS_points.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(points_geometry_types), 1)
      );
      var AS_points_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE,
        fragmentShader: PHY_FSHADER_SOURCE,
        transparent: true,
        depthTest: true,
      });
      ASpoints_group = new THREE.Points(allAS_points, AS_points_material);
    }

    function data_processing() {
      console.log("phy_init_data() data_processing() running")
      _init_light_data();
      _init_map_data();
      _init_json2topo();
    }
  }

  // world
  function phy_world_init(topo_flag) {
    // topo_flag : "both"(连线全有) "out"(仅国外)  "in"(仅国内)  "neither"(连线全无)
    $.when(phy_init_data())
      .done(function () {
        // console.log("data processing done");
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        // console.log("data processing error");
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if (topo_flag == "both") {
        scene.add(ASlinks_group_both);
      } else if (topo_flag == "in") {
        scene.add(ASlinks_group_in);
      } else if (topo_flag == "out") {
        scene.add(ASlinks_group_out);
      } else if (topo_flag == "neither") {
        scene.add(ASlinks_group_neither);
      } else {
        console.log("Argument Error.");
        return;
      }
      for (
        var vertical_doshline_index = 0;
        vertical_doshline_index < vertical_doshline_group["children"].length;
        vertical_doshline_index++
      ) {
        vertical_doshline_group["children"][
          vertical_doshline_index
        ].visible = true;
      }
      for (
        var geomap_map_index = 0;
        geomap_map_index < country_geomap_map["children"].length;
        geomap_map_index++
      ) {
        country_geomap_map["children"][geomap_map_index].material.color.setHex(
          0xffffff
        );
      }
      scene.add(vertical_doshline_group);
      scene.add(Land_points_group);
      scene.add(direction_light);
      scene.add(direction_light_2);
      scene.add(ASpoints_group);
      scene.add(country_geomap_map);
    }
  }

  function phy_world_search_AS(AS_num, topo_flag) {
    // AS_num : 1
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      var AS_pos = AS_pos_map[AS_num];
      if (AS_pos == undefined) {
        console.log("no this AS! " + AS_num);
        return;
      } else {
        var search_points = new THREE.BufferGeometry();
        var search_ASlink = new THREE.BufferGeometry();

        var search_points_vertices = [];
        var search_points_types = [];
        var search_points_colors = [];
        var search_links_vertices = [];
        var search_links_colors = [];
        var AS_country = AS_atcountry_map[AS_num];
        var map_children = country_geomap_map["children"];
        for (var i = 0; i < map_children.length; i++) {
          var map_child = map_children[i];
          if (
            "map_" + AS_country == map_child.name ||
            (AS_country == "CN" && map_child.name == "map_" + "TW") ||
            (AS_country == "CN" && map_child.name == "map_" + "HK")
          ) {
            map_child.material.color.setHex(map_color_list[0]);
          } else {
            map_child.material.color.setHex(0xffffff);
          }
        }
        var doshline_children = vertical_doshline_group["children"];
        for (var j = 0; j < doshline_children.length; j++) {
          doshline_children[j].visible = false;
        }
        search_points_vertices.push(AS_pos.x);
        search_points_vertices.push(AS_pos.y);
        search_points_vertices.push(AS_pos.z);
        search_points_types.push(AS_type_map[AS_num]);
        var AS_color = AS_color_map[AS_num];
        search_points_colors.push(AS_color.r);
        search_points_colors.push(AS_color.g);
        search_points_colors.push(AS_color.b);
        var AS_links = AS_links_map[AS_num];
        for (var link_index = 0; link_index < AS_links.length; link_index++) {
          var linkAS_num = AS_links[link_index];
          var linkAS_pos = AS_pos_map[linkAS_num];
          if (linkAS_pos == undefined) {
            console.log(AS_links[link_index] + " no this linked AS info");
            continue;
          } else {
            var link_country = AS_atcountry_map[linkAS_num];
            var link_country_doshline = vertical_doshline_group.getObjectByName(
              "doshline_" + link_country
            );
            link_country_doshline.visible = true;

            if (link_country != AS_country) {
              country_geomap_map
                .getObjectByName("map_" + link_country)
                .material.color.setHex(map_color_list[1]);
              if (link_country == "CN") {
                country_geomap_map
                  .getObjectByName("map_" + "HK")
                  .material.color.setHex(map_color_list[1]);
                country_geomap_map
                  .getObjectByName("map_" + "TW")
                  .material.color.setHex(map_color_list[1]);
              } else {
              }
            } else {
            }
            search_points_vertices.push(linkAS_pos.x);
            search_points_vertices.push(linkAS_pos.y);
            search_points_vertices.push(linkAS_pos.z);
            var linkAS_color = AS_color_map[linkAS_num];
            search_points_colors.push(linkAS_color.r);
            search_points_colors.push(linkAS_color.g);
            search_points_colors.push(linkAS_color.b);
            search_points_types.push(AS_type_map[linkAS_num]);
            var linkAS_color = AS_links_color_map[AS_num + "-" + linkAS_num];
            if (linkAS_color) {
              if (
                (topo_flag == "in" && AS_country == link_country) ||
                (topo_flag == "out" && AS_country != link_country) ||
                topo_flag == "both"
              ) {
                search_links_vertices.push(AS_pos.x);
                search_links_vertices.push(AS_pos.y);
                search_links_vertices.push(AS_pos.z);
                search_links_vertices.push(linkAS_pos.x);
                search_links_vertices.push(linkAS_pos.y);
                search_links_vertices.push(linkAS_pos.z);
                search_links_colors.push(linkAS_color.r);
                search_links_colors.push(linkAS_color.g);
                search_links_colors.push(linkAS_color.b);
                search_links_colors.push(linkAS_color.r);
                search_links_colors.push(linkAS_color.g);
                search_links_colors.push(linkAS_color.b);
              } else {
              }
            } else {
              console.log("no link color" + AS_num + "-" + linkAS_num);
            }
          }
        }

        search_points.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_points.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_points.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_points,
          AS_points_material
        );

        search_ASlink.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
        );
        search_ASlink.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE_LINE,
          fragmentShader: PHY_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: true,
        });
        search_ASlinks_group = new THREE.LineSegments(
          search_ASlink,
          ASlink_material
        );

        if (topo_flag == "both") {
          scene.add(search_ASlinks_group);
        } else if (topo_flag == "in") {
          scene.add(search_ASlinks_group);
        } else if (topo_flag == "out") {
          scene.add(search_ASlinks_group);
        } else if (topo_flag == "neither") {
        } else {
          console.log("Argument Error.");
          return;
        }
        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  function phy_world_search_country(country_code, topo_flag) {
    // remark : 线条未去重
    // country_code : "CN"
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.inArray(country_code, valid_country_names) < 0) {
        console.log("no this country." + country_code);
        return;
      } else {
        var doshline_children = vertical_doshline_group["children"];
        for (var i = 0; i < doshline_children.length; i++) {
          doshline_children[i].visible = false;
        }
        var map_children = country_geomap_map["children"];
        for (var j = 0; j < map_children.length; j++) {
          map_children[j].material.color.setHex(0xffffff);
        }
        country_ASes = jsonfile_ASPostion[country_code];
        var search_ASpoints = new THREE.BufferGeometry();
        var search_ASlink = new THREE.BufferGeometry();

        var search_points_vertices = [];
        var search_points_types = [];
        var search_points_colors = [];

        var search_links_vertices = [];
        var search_links_colors = [];

        for (var AS_num in country_ASes) {
          var AS_pos = AS_pos_map[AS_num];
          if (AS_pos == undefined) {
            // console.log(AS_num+" no this AS position, need add.");
            continue;
          } else {
            search_points_vertices.push(AS_pos.x);
            search_points_vertices.push(AS_pos.y);
            search_points_vertices.push(AS_pos.z);
            search_points_types.push(AS_type_map[AS_num]);
            search_points_colors.push(AS_color_map[AS_num].r);
            search_points_colors.push(AS_color_map[AS_num].g);
            search_points_colors.push(AS_color_map[AS_num].b);
            var AS_links = AS_links_map[AS_num];
            for (var k = 0; k < AS_links.length; k++) {
              var linkAS_num = AS_links[k];
              var linkAS_pos = AS_pos_map[linkAS_num];
              var link_country = AS_atcountry_map[linkAS_num];
              if (linkAS_pos == undefined) {
                // console.log(linkAS_num+" no this linked AS position, need add.");
                continue;
              } else {
                var link_color =
                  AS_links_color_pccp_map[AS_num + "-" + linkAS_num];
                if (link_color) {
                  search_points_vertices.push(linkAS_pos.x);
                  search_points_vertices.push(linkAS_pos.y);
                  search_points_vertices.push(linkAS_pos.z);
                  search_points_types.push(AS_type_map[linkAS_num]);
                  search_points_colors.push(AS_color_map[linkAS_num].r);
                  search_points_colors.push(AS_color_map[linkAS_num].g);
                  search_points_colors.push(AS_color_map[linkAS_num].b);
                  if (
                    (topo_flag == "in" && country_code == link_country) ||
                    (topo_flag == "out" && country_code != link_country) ||
                    topo_flag == "both"
                  ) {
                    search_links_vertices.push(linkAS_pos.x);
                    search_links_vertices.push(linkAS_pos.y);
                    search_links_vertices.push(linkAS_pos.z);
                    search_links_vertices.push(AS_pos.x);
                    search_links_vertices.push(AS_pos.y);
                    search_links_vertices.push(AS_pos.z);

                    search_links_colors.push(link_color.r);
                    search_links_colors.push(link_color.g);
                    search_links_colors.push(link_color.b);
                    search_links_colors.push(link_color.r);
                    search_links_colors.push(link_color.g);
                    search_links_colors.push(link_color.b);
                  } else {
                  }

                  // 只高亮有连接关系的垂线
                  var link_country = AS_atcountry_map[linkAS_num];
                  var link_country_doshline =
                    vertical_doshline_group.getObjectByName(
                      "doshline_" + link_country
                    );
                  link_country_doshline.visible = true;

                  if (link_country != country_code) {
                    country_geomap_map
                      .getObjectByName("map_" + link_country)
                      .material.color.setHex(map_color_list[1]);
                    if (link_country == "CN") {
                      country_geomap_map
                        .getObjectByName("map_" + "HK")
                        .material.color.setHex(map_color_list[1]);
                      country_geomap_map
                        .getObjectByName("map_" + "TW")
                        .material.color.setHex(map_color_list[1]);
                    } else {
                    }
                  } else {
                  }
                } else {
                }
              }
            }
          }
        }

        search_ASpoints.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_ASpoints.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_ASpoints.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_ASpoints,
          AS_points_material
        );

        if (country_geomap_map.getObjectByName("map_" + country_code)) {
          country_geomap_map
            .getObjectByName("map_" + country_code)
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[0]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[0]);
        } else {
        }

        if (topo_flag == "both" || topo_flag == "in" || topo_flag == "out") {
          search_ASlink.addAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(search_links_vertices),
              3
            )
          );
          search_ASlink.addAttribute(
            "custom_color",
            new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
          );
          var ASlink_material = new THREE.ShaderMaterial({
            vertexShader: PHY_VSHADER_SOURCE_LINE,
            fragmentShader: PHY_FSHADER_SOURCE_LINE,
            transparent: true,
            depthTest: true,
          });
          search_ASlinks_group = new THREE.LineSegments(
            search_ASlink,
            ASlink_material
          );
          scene.add(search_ASlinks_group);
        } else if (topo_flag == "neither") {
        } else {
          console.log("Argument Error.");
          return;
        }
        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  // country in
  function phy_countryin_init(country_code, topo_flag) {
    // remark : 线条未去重
    // country_code : "US"
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.inArray(country_code, valid_country_names) < 0) {
        console.log("no this country." + country_code);
        return;
      } else {
        var doshline_children = vertical_doshline_group["children"];
        for (var i = 0; i < doshline_children.length; i++) {
          doshline_children[i].visible = false;
        }
        var map_children = country_geomap_map["children"];
        for (var j = 0; j < map_children.length; j++) {
          map_children[j].material.color.setHex(0xffffff);
        }
        var country_ASes = jsonfile_ASPostion[country_code];
        var search_ASpoints = new THREE.BufferGeometry();
        var search_ASlink = new THREE.BufferGeometry();

        var search_points_vertices = [];
        var search_points_types = [];
        var search_points_colors = [];

        var search_links_vertices = [];
        var search_links_colors = [];

        for (var AS_num in country_ASes) {
          var AS_pos = AS_pos_map[AS_num];
          if (AS_pos == undefined) {
            // console.log(AS_num+" no this AS position, need add.");
            continue;
          } else {
            search_points_vertices.push(AS_pos.x);
            search_points_vertices.push(AS_pos.y);
            search_points_vertices.push(AS_pos.z);
            search_points_types.push(AS_type_map[AS_num]);
            search_points_colors.push(AS_color_map[AS_num].r);
            search_points_colors.push(AS_color_map[AS_num].g);
            search_points_colors.push(AS_color_map[AS_num].b);

            for (
              var link_index = 0;
              link_index < AS_links_map[AS_num].length;
              link_index++
            ) {
              var linkAS_num = AS_links_map[AS_num][link_index];
              var linkAS_pos = AS_pos_map[linkAS_num];
              if (linkAS_pos == undefined) {
                // console.log(linkAS_num+" no this linked AS position, need add.");
                continue;
              } else {
                var link_color =
                  AS_links_color_pccp_map[AS_num + "-" + linkAS_num];
                var is_add_flag =
                  AS_atcountry_map[AS_num] == AS_atcountry_map[linkAS_num];
                var link_country = AS_atcountry_map[linkAS_num];
                if (link_color && is_add_flag) {
                  search_points_vertices.push(linkAS_pos.x);
                  search_points_vertices.push(linkAS_pos.y);
                  search_points_vertices.push(linkAS_pos.z);
                  search_points_types.push(AS_type_map[linkAS_num]);
                  search_points_colors.push(AS_color_map[linkAS_num].r);
                  search_points_colors.push(AS_color_map[linkAS_num].g);
                  search_points_colors.push(AS_color_map[linkAS_num].b);

                  search_links_vertices.push(linkAS_pos.x);
                  search_links_vertices.push(linkAS_pos.y);
                  search_links_vertices.push(linkAS_pos.z);
                  search_links_vertices.push(AS_pos.x);
                  search_links_vertices.push(AS_pos.y);
                  search_links_vertices.push(AS_pos.z);

                  search_links_colors.push(link_color.r);
                  search_links_colors.push(link_color.g);
                  search_links_colors.push(link_color.b);
                  search_links_colors.push(link_color.r);
                  search_links_colors.push(link_color.g);
                  search_links_colors.push(link_color.b);
                } else {
                }
                // 只高亮有连接关系的垂线
                var link_country_doshline =
                  vertical_doshline_group.getObjectByName(
                    "doshline_" + link_country
                  );
                link_country_doshline.visible = true;

                if (country_geomap_map.getObjectByName("map_" + link_country)) {
                  country_geomap_map
                    .getObjectByName("map_" + link_country)
                    .material.color.setHex(map_color_list[1]);
                } else {
                }
                if (link_country == "CN") {
                  country_geomap_map
                    .getObjectByName("map_" + "HK")
                    .material.color.setHex(map_color_list[1]);
                  country_geomap_map
                    .getObjectByName("map_" + "TW")
                    .material.color.setHex(map_color_list[1]);
                } else {
                }
              }
            }
          }
        }

        search_ASpoints.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_ASpoints.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_ASpoints.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_ASpoints,
          AS_points_material
        );

        search_ASlink.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
        );
        search_ASlink.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE_LINE,
          fragmentShader: PHY_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: true,
        });
        search_ASlinks_group = new THREE.LineSegments(
          search_ASlink,
          ASlink_material
        );

        if (country_geomap_map.getObjectByName("map_" + country_code)) {
          country_geomap_map
            .getObjectByName("map_" + country_code)
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[0]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[0]);
        } else {
        }

        if (topo_flag == true) {
          scene.add(search_ASlinks_group);
        } else {
        }
        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  function phy_countryin_search_AS(ASnum_searched, country_code, topo_flag) {
    // ASnum_searched: 3356
    // country_code : "US"
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.inArray(country_code, valid_country_names) < 0) {
        console.log("no this country." + country_code);
        return;
      } else {
        var AS_pos = AS_pos_map[ASnum_searched];
        if (AS_pos == undefined) {
          console.log(ASnum_searched + " no this AS");
          return;
        } else {
          var ASnum_searched_country = AS_atcountry_map[ASnum_searched];
          if (ASnum_searched_country != country_code) {
            console.log(
              ASnum_searched +
                " in " +
                ASnum_searched_country +
                ", not in" +
                country_code
            );
            return;
          } else {
            var doshline_children = vertical_doshline_group["children"];
            for (var i = 0; i < doshline_children.length; i++) {
              doshline_children[i].visible = false;
            }
            var map_children = country_geomap_map["children"];
            for (var j = 0; j < map_children.length; j++) {
              map_children[j].material.color.setHex(0xffffff);
            }
            var search_ASpoints = new THREE.BufferGeometry();
            var search_ASlink = new THREE.BufferGeometry();
            var search_points_vertices = [];
            var search_points_types = [];
            var search_points_colors = [];
            var search_links_vertices = [];
            var search_links_colors = [];
            search_points_vertices.push(AS_pos.x);
            search_points_vertices.push(AS_pos.y);
            search_points_vertices.push(AS_pos.z);
            search_points_types.push(AS_type_map[ASnum_searched]);
            search_points_colors.push(AS_color_map[ASnum_searched].r);
            search_points_colors.push(AS_color_map[ASnum_searched].g);
            search_points_colors.push(AS_color_map[ASnum_searched].b);
            var AS_links = AS_links_map[ASnum_searched];
            for (var k = 0; k < AS_links.length; k++) {
              var linkAS_num = AS_links[k];
              var linkAS_pos = AS_pos_map[linkAS_num];
              if (linkAS_pos == undefined) {
                // console.log(linkAS_num+" no this linked AS position, need add.");
                continue;
              } else {
                var link_color =
                  AS_links_color_map[ASnum_searched + "-" + linkAS_num];
                var is_add_flag =
                  AS_atcountry_map[ASnum_searched] ==
                  AS_atcountry_map[linkAS_num];
                var link_country = AS_atcountry_map[linkAS_num];
                if (link_color && is_add_flag) {
                  search_points_vertices.push(linkAS_pos.x);
                  search_points_vertices.push(linkAS_pos.y);
                  search_points_vertices.push(linkAS_pos.z);
                  search_points_types.push(AS_type_map[linkAS_num]);
                  search_points_colors.push(AS_color_map[linkAS_num].r);
                  search_points_colors.push(AS_color_map[linkAS_num].g);
                  search_points_colors.push(AS_color_map[linkAS_num].b);

                  search_links_vertices.push(linkAS_pos.x);
                  search_links_vertices.push(linkAS_pos.y);
                  search_links_vertices.push(linkAS_pos.z);
                  search_links_vertices.push(AS_pos.x);
                  search_links_vertices.push(AS_pos.y);
                  search_links_vertices.push(AS_pos.z);

                  search_links_colors.push(link_color.r);
                  search_links_colors.push(link_color.g);
                  search_links_colors.push(link_color.b);
                  search_links_colors.push(link_color.r);
                  search_links_colors.push(link_color.g);
                  search_links_colors.push(link_color.b);
                } else {
                }
                // 只高亮有连接关系的垂线
                var link_country_doshline =
                  vertical_doshline_group.getObjectByName(
                    "doshline_" + link_country
                  );
                link_country_doshline.visible = true;
                if (country_geomap_map.getObjectByName("map_" + link_country)) {
                  country_geomap_map
                    .getObjectByName("map_" + link_country)
                    .material.color.setHex(map_color_list[1]);
                } else {
                }
                if (link_country == "CN") {
                  country_geomap_map
                    .getObjectByName("map_" + "HK")
                    .material.color.setHex(map_color_list[1]);
                  country_geomap_map
                    .getObjectByName("map_" + "TW")
                    .material.color.setHex(map_color_list[1]);
                } else {
                }
              }
            }
          }
        }

        search_ASpoints.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_ASpoints.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_ASpoints.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_ASpoints,
          AS_points_material
        );

        search_ASlink.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
        );
        search_ASlink.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE_LINE,
          fragmentShader: PHY_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: true,
        });
        search_ASlinks_group = new THREE.LineSegments(
          search_ASlink,
          ASlink_material
        );

        if (country_geomap_map.getObjectByName("map_" + country_code)) {
          country_geomap_map
            .getObjectByName("map_" + country_code)
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[0]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (topo_flag == true) {
          scene.add(search_ASlinks_group);
        } else {
        }
        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  function phy_countryin_search_country(country_searched, country_code) {
    // country_searched: "CN"
    // country_code : "US"
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if (
        $.inArray(country_code, valid_country_names) < 0 ||
        $.inArray(country_searched, valid_country_names) < 0
      ) {
        console.log(
          "Either of the two countrys is not valid: " +
            country_code +
            "-" +
            country_searched
        );
        return;
      } else {
        var country_ASes = jsonfile_ASPostion[country_code];
        var doshline_children = vertical_doshline_group["children"];
        for (var i = 0; i < doshline_children.length; i++) {
          doshline_children[i].visible = false;
        }
        var map_children = country_geomap_map["children"];
        for (var j = 0; j < map_children.length; j++) {
          map_children[j].material.color.setHex(0xffffff);
        }
        var search_ASpoints = new THREE.BufferGeometry();
        var search_points_vertices = [];
        var search_points_types = [];
        var search_points_colors = [];
        var search_links_vertices = [];
        var search_links_colors = [];
        var country_link_flag = false;
        for (var AS_num in country_ASes) {
          var AS_pos = AS_pos_map[AS_num];
          if (AS_pos == undefined) {
            // console.log(AS_num+" no this AS position, need add.");
            continue;
          } else {
            var AS_links = AS_links_map[AS_num];
            for (var k = 0; k < AS_links.length; k++) {
              var linkAS_num = AS_links[k];
              var linkAS_pos = AS_pos_map[linkAS_num];
              if (linkAS_pos == undefined) {
                // console.log(linkAS_num+" no this linked AS position, need add.");
                continue;
              } else {
                var link_color =
                  AS_links_color_pccp_map[AS_num + "-" + linkAS_num];
                var is_add_flag =
                  AS_atcountry_map[linkAS_num] == country_searched;
                if (link_color && is_add_flag) {
                  search_points_vertices.push(AS_pos.x);
                  search_points_vertices.push(AS_pos.y);
                  search_points_vertices.push(AS_pos.z);
                  search_points_types.push(AS_type_map[AS_num]);
                  search_points_colors.push(AS_color_map[AS_num].r);
                  search_points_colors.push(AS_color_map[AS_num].g);
                  search_points_colors.push(AS_color_map[AS_num].b);
                  country_link_flag = true;
                } else {
                }
              }
            }
          }
        }
        if (country_link_flag == false) {
          console.log(
            country_searched +
              " country_searched not linked with country_code " +
              country_code
          );
          return;
        } else {
          search_ASpoints.addAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(search_points_vertices),
              3
            )
          );
          search_ASpoints.addAttribute(
            "custom_color",
            new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
          );
          search_ASpoints.addAttribute(
            "type",
            new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
          );
          var AS_points_material = new THREE.ShaderMaterial({
            vertexShader: PHY_VSHADER_SOURCE,
            fragmentShader: PHY_FSHADER_SOURCE,
            transparent: true,
            depthTest: true,
          });
          search_points_group = new THREE.Points(
            search_ASpoints,
            AS_points_material
          );
          search_ASlinks_group = undefined;

          var country_doshline = vertical_doshline_group.getObjectByName(
            "doshline_" + country_searched
          );
          country_doshline.visible = true;

          var country_doshline = vertical_doshline_group.getObjectByName(
            "doshline_" + country_code
          );
          country_doshline.visible = true;

          if (country_geomap_map.getObjectByName("map_" + country_code)) {
            country_geomap_map
              .getObjectByName("map_" + country_code)
              .material.color.setHex(map_color_list[0]);
          } else {
          }
          if (country_code == "CN") {
            country_geomap_map
              .getObjectByName("map_" + "HK")
              .material.color.setHex(map_color_list[0]);
            country_geomap_map
              .getObjectByName("map_" + "TW")
              .material.color.setHex(map_color_list[0]);
          } else {
          }

          if (country_geomap_map.getObjectByName("map_" + country_searched)) {
            country_geomap_map
              .getObjectByName("map_" + country_searched)
              .material.color.setHex(map_color_list[1]);
          } else {
          }
          if (country_searched == "CN") {
            country_geomap_map
              .getObjectByName("map_" + "HK")
              .material.color.setHex(map_color_list[1]);
            country_geomap_map
              .getObjectByName("map_" + "TW")
              .material.color.setHex(map_color_list[1]);
          } else {
          }
          scene.add(search_points_group);
          scene.add(vertical_doshline_group);
          scene.add(Land_points_group);
          scene.add(direction_light);
          scene.add(direction_light_2);
          scene.add(country_geomap_map);
        }
      }
    }
  }

  function phy_countryin_search_linkcountry(country_searched, country_code) {
    phy_countryin_search_country(country_searched, country_code);
  }

  // country out
  function phy_countryout_init(country_code_list, topo_flag) {
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.isArray(country_code_list)) {
        if (
          country_code_list.length != 2 ||
          country_code_list[0] == country_code_list[1]
        ) {
          console.log("must be 2 countrys' array.");
          return;
        } else {
          if (
            $.inArray(country_code_list[0], valid_country_names) < 0 ||
            $.inArray(country_code_list[1], valid_country_names) < 0
          ) {
            console.log(
              "Either of the two countrys is not valid." +
                country_code_list[0] +
                "-" +
                country_code_list[1]
            );
            return;
          } else {
          }
        }
      } else {
        console.log("Argument must be a array.");
        return;
      }

      var doshline_children = vertical_doshline_group["children"];
      for (var i = 0; i < doshline_children.length; i++) {
        doshline_children[i].visible = false;
      }
      var map_children = country_geomap_map["children"];
      for (var j = 0; j < map_children.length; j++) {
        map_children[j].material.color.setHex(0xffffff);
      }
      for (var i = 0; i < country_code_list.length; i++) {
        var country_code = country_code_list[i];
        var country_doshline = vertical_doshline_group.getObjectByName(
          "doshline_" + country_code
        );
        country_doshline.visible = true;
        country_geomap_map
          .getObjectByName("map_" + country_code)
          .material.color.setHex(map_color_list[i]);
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[i]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[i]);
        } else {
        }
      }

      var country_code = country_code_list[0]; // 单向处理即可
      country_ASes = jsonfile_ASPostion[country_code];
      search_points_group = new THREE.Group();
      search_ASlinks_group = new THREE.Group();
      var search_allAS_points = new THREE.BufferGeometry();
      var search_ASlink = new THREE.BufferGeometry();
      var search_points_vertices = [];
      var search_points_types = [];
      var search_points_colors = [];
      var search_links_vertices = [];
      var search_links_colors = [];
      for (var AS_num in country_ASes) {
        var AS_pos = AS_pos_map[AS_num];
        if (AS_pos == undefined) {
          // console.log(AS_num+" no this AS info, need add.");
          continue;
        } else {
          for (
            var link_index = 0;
            link_index < AS_links_map[AS_num].length;
            link_index++
          ) {
            var linkAS_num = AS_links_map[AS_num][link_index];
            var linkAS_pos = AS_pos_map[linkAS_num];
            if (linkAS_pos == undefined) {
              // console.log(linkAS_num+" no this linked AS info, need add.");
              continue;
            } else {
              var link_color = AS_links_color_map[linkAS_num + "-" + AS_num];
              var AS_in_countrylist = $.inArray(
                AS_atcountry_map[AS_num],
                country_code_list
              );
              var ASlink_in_countrylist = $.inArray(
                AS_atcountry_map[linkAS_num],
                country_code_list
              );
              var is_add_flag =
                (AS_in_countrylist == 0 && ASlink_in_countrylist == 1) ||
                (AS_in_countrylist == 1 && ASlink_in_countrylist == 0);
              if (link_color && is_add_flag) {
                search_points_vertices.push(AS_pos.x);
                search_points_vertices.push(AS_pos.y);
                search_points_vertices.push(AS_pos.z);
                search_points_types.push(AS_type_map[AS_num]);
                search_points_colors.push(AS_color_map[AS_num].r);
                search_points_colors.push(AS_color_map[AS_num].g);
                search_points_colors.push(AS_color_map[AS_num].b);

                search_points_vertices.push(linkAS_pos.x);
                search_points_vertices.push(linkAS_pos.y);
                search_points_vertices.push(linkAS_pos.z);
                search_points_types.push(AS_type_map[linkAS_num]);
                search_points_colors.push(AS_color_map[linkAS_num].r);
                search_points_colors.push(AS_color_map[linkAS_num].g);
                search_points_colors.push(AS_color_map[linkAS_num].b);

                search_links_vertices.push(linkAS_pos.x);
                search_links_vertices.push(linkAS_pos.y);
                search_links_vertices.push(linkAS_pos.z);
                search_links_vertices.push(AS_pos.x);
                search_links_vertices.push(AS_pos.y);
                search_links_vertices.push(AS_pos.z);

                search_links_colors.push(link_color.r);
                search_links_colors.push(link_color.g);
                search_links_colors.push(link_color.b);
                search_links_colors.push(link_color.r);
                search_links_colors.push(link_color.g);
                search_links_colors.push(link_color.b);
              } else {
              }
            }
          }
        }
      }
      search_allAS_points.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
      );
      search_allAS_points.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
      );
      search_allAS_points.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
      );
      var AS_points_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE,
        fragmentShader: PHY_FSHADER_SOURCE,
        transparent: true,
        depthTest: true,
      });
      search_points = new THREE.Points(search_allAS_points, AS_points_material);

      search_ASlink.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
      );
      search_ASlink.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
      );
      var ASlink_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE_LINE,
        fragmentShader: PHY_FSHADER_SOURCE_LINE,
        transparent: true,
        depthTest: true,
      });
      search_ASlinks = new THREE.LineSegments(search_ASlink, ASlink_material);
      search_ASlinks_group.add(search_ASlinks);
      search_points_group.add(search_points);
      if (topo_flag == true) {
        scene.add(search_ASlinks_group);
      } else {
      }
      scene.add(search_points_group);
      scene.add(Land_points_group);
      scene.add(vertical_doshline_group);
      scene.add(direction_light);
      scene.add(direction_light_2);
      scene.add(country_geomap_map);
    }
  }

  function phy_countryout_search_AS(
    ASnum_searched,
    country_code_list,
    topo_flag
  ) {
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.isArray(country_code_list)) {
        if (
          country_code_list.length != 2 ||
          country_code_list[0] == country_code_list[1]
        ) {
          console.log("must be 2 countrys' array.");
          return;
        } else {
          if (
            $.inArray(country_code_list[0], valid_country_names) < 0 ||
            $.inArray(country_code_list[1], valid_country_names) < 0
          ) {
            console.log(
              "Either of the two countrys is not valid." +
                country_code_list[0] +
                "-" +
                country_code_list[1]
            );
            return;
          } else {
          }
        }
      } else {
        console.log("Argument must be a array.");
        return;
      }

      var country_searched = AS_atcountry_map[ASnum_searched];
      var left_or_right = country_searched == country_code_list[0] ? 0 : 1;
      if (
        country_searched == undefined ||
        $.inArray(country_searched, country_code_list) < 0
      ) {
        console.log(
          "searched AS's country" + country_searched + " is not in countrylist."
        );
        return;
      } else {
        var doshline_children = vertical_doshline_group["children"];
        for (var i = 0; i < doshline_children.length; i++) {
          doshline_children[i].visible = false;
        }
        var map_children = country_geomap_map["children"];
        for (var j = 0; j < map_children.length; j++) {
          map_children[j].material.color.setHex(0xffffff);
        }
        search_points_group = new THREE.Group();
        search_ASlinks_group = new THREE.Group();
        for (var i = 0; i < country_code_list.length; i++) {
          var country_doshline = vertical_doshline_group.getObjectByName(
            "doshline_" + country_code_list[i]
          );
          country_doshline.visible = true;

          country_geomap_map
            .getObjectByName("map_" + country_code_list[i])
            .material.color.setHex(map_color_list[i]);
          if (country_code_list[i] == "CN") {
            country_geomap_map
              .getObjectByName("map_" + "HK")
              .material.color.setHex(map_color_list[i]);
            country_geomap_map
              .getObjectByName("map_" + "TW")
              .material.color.setHex(map_color_list[i]);
          } else {
          }

          if (country_searched != country_code_list[i]) {
          } else {
            var country_code = country_code_list[i];
            var country_ASes = jsonfile_ASPostion[country_code];
            if (country_ASes == undefined) {
              // console.log(country_code + "jsonfile_ASPostion file has no this country ASes.");
              return;
            } else {
              var search_allAS_points = new THREE.BufferGeometry();
              var search_ASlink = new THREE.BufferGeometry();
              var search_points_vertices = [];
              var search_points_types = [];
              var search_points_colors = [];
              var search_links_vertices = [];
              var search_links_colors = [];
              for (var AS_num in country_ASes) {
                var AS_pos = AS_pos_map[AS_num];
                if (AS_pos == undefined || AS_num != ASnum_searched) {
                  continue;
                } else {
                  for (
                    var link_index = 0;
                    link_index < AS_links_map[AS_num].length;
                    link_index++
                  ) {
                    var linkAS_num = AS_links_map[AS_num][link_index];
                    var linkAS_pos = AS_pos_map[linkAS_num];
                    if (linkAS_pos == undefined) {
                      // console.log(linkAS_num+" no this linked AS info, need add.");
                      continue;
                    } else {
                      if (left_or_right == 0) {
                        var link_color =
                          AS_links_color_map[AS_num + "-" + linkAS_num];
                      } else {
                        var link_color =
                          AS_links_color_map[linkAS_num + "-" + AS_num];
                      }

                      var AS_in_countrylist = $.inArray(
                        AS_atcountry_map[AS_num],
                        country_code_list
                      );
                      var ASlink_in_countrylist = $.inArray(
                        AS_atcountry_map[linkAS_num],
                        country_code_list
                      );
                      var is_add_flag =
                        (AS_in_countrylist == 0 &&
                          ASlink_in_countrylist == 1) ||
                        (AS_in_countrylist == 1 && ASlink_in_countrylist == 0);
                      if (link_color && is_add_flag) {
                        search_points_vertices.push(AS_pos.x);
                        search_points_vertices.push(AS_pos.y);
                        search_points_vertices.push(AS_pos.z);
                        search_points_types.push(AS_type_map[AS_num]);
                        search_points_colors.push(AS_color_map[AS_num].r);
                        search_points_colors.push(AS_color_map[AS_num].g);
                        search_points_colors.push(AS_color_map[AS_num].b);

                        search_points_vertices.push(linkAS_pos.x);
                        search_points_vertices.push(linkAS_pos.y);
                        search_points_vertices.push(linkAS_pos.z);
                        search_points_types.push(AS_type_map[linkAS_num]);
                        search_points_colors.push(AS_color_map[linkAS_num].r);
                        search_points_colors.push(AS_color_map[linkAS_num].g);
                        search_points_colors.push(AS_color_map[linkAS_num].b);

                        search_links_vertices.push(linkAS_pos.x);
                        search_links_vertices.push(linkAS_pos.y);
                        search_links_vertices.push(linkAS_pos.z);
                        search_links_vertices.push(AS_pos.x);
                        search_links_vertices.push(AS_pos.y);
                        search_links_vertices.push(AS_pos.z);

                        search_links_colors.push(link_color.r);
                        search_links_colors.push(link_color.g);
                        search_links_colors.push(link_color.b);
                        search_links_colors.push(link_color.r);
                        search_links_colors.push(link_color.g);
                        search_links_colors.push(link_color.b);
                      } else {
                      }
                    }
                  }
                }
              }
            }

            search_allAS_points.addAttribute(
              "position",
              new THREE.BufferAttribute(
                new Float32Array(search_points_vertices),
                3
              )
            );
            search_allAS_points.addAttribute(
              "custom_color",
              new THREE.BufferAttribute(
                new Float32Array(search_points_colors),
                3
              )
            );
            search_allAS_points.addAttribute(
              "type",
              new THREE.BufferAttribute(
                new Float32Array(search_points_types),
                1
              )
            );
            var AS_points_material = new THREE.ShaderMaterial({
              vertexShader: PHY_VSHADER_SOURCE,
              fragmentShader: PHY_FSHADER_SOURCE,
              transparent: true,
              depthTest: true,
            });
            search_points = new THREE.Points(
              search_allAS_points,
              AS_points_material
            );

            search_ASlink.addAttribute(
              "position",
              new THREE.BufferAttribute(
                new Float32Array(search_links_vertices),
                3
              )
            );
            search_ASlink.addAttribute(
              "custom_color",
              new THREE.BufferAttribute(
                new Float32Array(search_links_colors),
                3
              )
            );
            var ASlink_material = new THREE.ShaderMaterial({
              vertexShader: PHY_VSHADER_SOURCE_LINE,
              fragmentShader: PHY_FSHADER_SOURCE_LINE,
              transparent: true,
              depthTest: true,
            });
            search_ASlinks = new THREE.LineSegments(
              search_ASlink,
              ASlink_material
            );

            search_ASlinks_group.add(search_ASlinks);
            search_points_group.add(search_points);
          }
        }
      }
      if (topo_flag == true) {
        scene.add(search_ASlinks_group);
      } else {
      }
      scene.add(search_points_group);
      scene.add(Land_points_group);
      scene.add(vertical_doshline_group);
      scene.add(direction_light);
      scene.add(direction_light_2);
      scene.add(country_geomap_map);
    }
  }

  function phy_countryout_search_country(country_searched, country_code_list) {
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      if ($.isArray(country_code_list)) {
        if (
          country_code_list.length != 2 ||
          country_code_list[0] == country_code_list[1]
        ) {
          console.log("must be 2 countrys' array.");
          return;
        } else {
          if (
            $.inArray(country_code_list[0], valid_country_names) < 0 ||
            $.inArray(country_code_list[1], valid_country_names) < 0
          ) {
            console.log(
              "Either of the two countrys is not valid." +
                country_code_list[0] +
                "-" +
                country_code_list[1]
            );
            return;
          } else {
          }
        }
      } else {
        console.log("Argument must be a array.");
        return;
      }
      if (
        country_searched == undefined ||
        $.inArray(country_searched, country_code_list) < 0
      ) {
        console.log(
          "searched AS's country " +
            country_searched +
            " is not in countrylist."
        );
        return;
      } else {
      }
      var doshline_children = vertical_doshline_group["children"];
      for (var i = 0; i < doshline_children.length; i++) {
        doshline_children[i].visible = false;
      }
      var map_children = country_geomap_map["children"];
      for (var j = 0; j < map_children.length; j++) {
        map_children[j].material.color.setHex(0xffffff);
      }
      search_points_group = new THREE.Group();
      for (var i = 0; i < country_code_list.length; i++) {
        var country_code = country_code_list[i];
        var country_doshline = vertical_doshline_group.getObjectByName(
          "doshline_" + country_code_list[i]
        );
        country_doshline.visible = true;
        country_geomap_map
          .getObjectByName("map_" + country_code)
          .material.color.setHex(map_color_list[i]);
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[i]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[i]);
        } else {
        }
        if (country_searched != country_code_list[i]) {
        } else {
          var country_ASes = jsonfile_ASPostion[country_code];
          if (country_ASes == undefined) {
            // console.log(country_code + "jsonfile_ASPostion file has no this country ASes.");
            return;
          } else {
            var search_allAS_points = new THREE.BufferGeometry();

            var search_points_vertices = [];
            var search_points_types = [];
            var search_points_colors = [];

            for (var AS_num in country_ASes) {
              var AS_pos = AS_pos_map[AS_num];
              if (AS_pos == undefined) {
                // console.log(AS_num+" no this AS info, need add.");
                continue;
              } else {
                for (
                  var link_index = 0;
                  link_index < AS_links_map[AS_num].length;
                  link_index++
                ) {
                  var linkAS_num = AS_links_map[AS_num][link_index];
                  var linkAS_pos = AS_pos_map[linkAS_num];
                  if (linkAS_pos == undefined) {
                    // console.log(linkAS_num+" no this linked AS info, need add.");
                    continue;
                  } else {
                    var link_color =
                      AS_links_color_pccp_map[AS_num + "-" + linkAS_num];
                    var AS_in_countrylist = $.inArray(
                      AS_atcountry_map[AS_num],
                      country_code_list
                    );
                    var ASlink_in_countrylist = $.inArray(
                      AS_atcountry_map[linkAS_num],
                      country_code_list
                    );
                    var is_add_flag =
                      (AS_in_countrylist == 0 && ASlink_in_countrylist == 1) ||
                      (AS_in_countrylist == 1 && ASlink_in_countrylist == 0);
                    if (link_color && is_add_flag) {
                      search_points_vertices.push(AS_pos.x);
                      search_points_vertices.push(AS_pos.y);
                      search_points_vertices.push(AS_pos.z);
                      search_points_types.push(AS_type_map[AS_num]);
                      search_points_colors.push(AS_color_map[AS_num].r);
                      search_points_colors.push(AS_color_map[AS_num].g);
                      search_points_colors.push(AS_color_map[AS_num].b);
                    } else {
                    }
                  }
                }
              }
            }

            search_allAS_points.addAttribute(
              "position",
              new THREE.BufferAttribute(
                new Float32Array(search_points_vertices),
                3
              )
            );
            search_allAS_points.addAttribute(
              "custom_color",
              new THREE.BufferAttribute(
                new Float32Array(search_points_colors),
                3
              )
            );
            search_allAS_points.addAttribute(
              "type",
              new THREE.BufferAttribute(
                new Float32Array(search_points_types),
                1
              )
            );
            var AS_points_material = new THREE.ShaderMaterial({
              vertexShader: PHY_VSHADER_SOURCE,
              fragmentShader: PHY_FSHADER_SOURCE,
              transparent: true,
              depthTest: true,
            });
            search_points = new THREE.Points(
              search_allAS_points,
              AS_points_material
            );

            search_points_group.add(search_points);
          }
        }
      }

      scene.add(search_points_group);
      scene.add(Land_points_group);
      scene.add(vertical_doshline_group);
      scene.add(direction_light);
      scene.add(direction_light_2);
      scene.add(country_geomap_map);
    }
  }

  // ASout
  function phy_ASout_init(AS_num, topo_flag) {
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      var AS_pos = AS_pos_map[AS_num];
      if (AS_pos == undefined) {
        console.log(AS_num + " no this AS");
        return;
      } else {
        var doshline_children = vertical_doshline_group["children"];
        for (var i = 0; i < doshline_children.length; i++) {
          doshline_children[i].visible = false;
        }
        var map_children = country_geomap_map["children"];
        for (var j = 0; j < map_children.length; j++) {
          map_children[j].material.color.setHex(0xffffff);
        }
        var ASnum_searched_country = AS_atcountry_map[AS_num];
        var searched_country_doshline = vertical_doshline_group.getObjectByName(
          "doshline_" + ASnum_searched_country
        );
        searched_country_doshline.visible = true;
        if (
          country_geomap_map.getObjectByName("map_" + ASnum_searched_country)
        ) {
          country_geomap_map
            .getObjectByName("map_" + ASnum_searched_country)
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (ASnum_searched_country == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[0]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        var search_ASpoints = new THREE.BufferGeometry();
        var search_ASlink = new THREE.BufferGeometry();
        var search_points_vertices = [];
        var search_points_types = [];
        var search_points_colors = [];
        var search_links_vertices = [];
        var search_links_colors = [];
        search_points_vertices.push(AS_pos.x);
        search_points_vertices.push(AS_pos.y);
        search_points_vertices.push(AS_pos.z);
        search_points_types.push(AS_type_map[AS_num]);
        search_points_colors.push(AS_color_map[AS_num].r);
        search_points_colors.push(AS_color_map[AS_num].g);
        search_points_colors.push(AS_color_map[AS_num].b);
        var AS_links = AS_links_map[AS_num];
        for (var k = 0; k < AS_links.length; k++) {
          var linkAS_num = AS_links[k];
          var linkAS_pos = AS_pos_map[linkAS_num];
          if (linkAS_pos == undefined) {
            // console.log(linkAS_num+" no this linked AS position, need add.");
            continue;
          } else {
            var link_color = AS_links_color_map[AS_num + "-" + linkAS_num];
            var is_add_flag =
              AS_atcountry_map[AS_num] == AS_atcountry_map[linkAS_num];
            if (link_color && is_add_flag) {
              search_points_vertices.push(linkAS_pos.x);
              search_points_vertices.push(linkAS_pos.y);
              search_points_vertices.push(linkAS_pos.z);
              search_points_types.push(AS_type_map[linkAS_num]);
              search_points_colors.push(AS_color_map[linkAS_num].r);
              search_points_colors.push(AS_color_map[linkAS_num].g);
              search_points_colors.push(AS_color_map[linkAS_num].b);

              search_links_vertices.push(linkAS_pos.x);
              search_links_vertices.push(linkAS_pos.y);
              search_links_vertices.push(linkAS_pos.z);
              search_links_vertices.push(AS_pos.x);
              search_links_vertices.push(AS_pos.y);
              search_links_vertices.push(AS_pos.z);

              search_links_colors.push(link_color.r);
              search_links_colors.push(link_color.g);
              search_links_colors.push(link_color.b);
              search_links_colors.push(link_color.r);
              search_links_colors.push(link_color.g);
              search_links_colors.push(link_color.b);
            } else {
              // 只高亮有连接关系的垂线
              var link_country = AS_atcountry_map[linkAS_num];
              var link_country_doshline =
                vertical_doshline_group.getObjectByName(
                  "doshline_" + link_country
                );
              link_country_doshline.visible = true;
              if (country_geomap_map.getObjectByName("map_" + link_country)) {
                country_geomap_map
                  .getObjectByName("map_" + link_country)
                  .material.color.setHex(map_color_list[1]);
              } else {
              }
              if (link_country == "CN") {
                country_geomap_map
                  .getObjectByName("map_" + "HK")
                  .material.color.setHex(map_color_list[1]);
                country_geomap_map
                  .getObjectByName("map_" + "TW")
                  .material.color.setHex(map_color_list[1]);
              } else {
              }
            }
          }
        }
        search_ASpoints.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_ASpoints.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_ASpoints.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_ASpoints,
          AS_points_material
        );

        search_ASlink.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
        );
        search_ASlink.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE_LINE,
          fragmentShader: PHY_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: true,
        });
        search_ASlinks_group = new THREE.LineSegments(
          search_ASlink,
          ASlink_material
        );
        if (topo_flag == true) {
          scene.add(search_ASlinks_group);
        } else {
        }
        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  function phy_ASout_search_AS(ASnum_searched, ASnum_init, topo_flag) {
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      var AS_pos = AS_pos_map[ASnum_init];
      if (AS_pos == undefined) {
        console.log(ASnum_init + " no this AS");
        return;
      } else {
        var searched_AS_pos = AS_pos_map[ASnum_searched];
        if (searched_AS_pos == undefined) {
          console.log(ASnum_searched + " no this AS");
        } else {
          if (
            $.inArray(parseInt(ASnum_searched), AS_links_map[ASnum_init]) < 0
          ) {
            console.log(ASnum_searched + "-" + ASnum_init + " no linked.");
            return;
          } else {
            if (
              AS_atcountry_map[ASnum_searched] != AS_atcountry_map[ASnum_init]
            ) {
              console.log(
                ASnum_searched +
                  "-" +
                  ASnum_init +
                  " linked not in same country."
              );
              return;
            } else {
            }
          }
        }
      }

      var doshline_children = vertical_doshline_group["children"];
      for (var i = 0; i < doshline_children.length; i++) {
        doshline_children[i].visible = false;
      }
      var map_children = country_geomap_map["children"];
      for (var j = 0; j < map_children.length; j++) {
        map_children[j].material.color.setHex(0xffffff);
      }
      var country_code = AS_atcountry_map[ASnum_init];
      var country_ASes = jsonfile_ASPostion[country_code];
      var country_doshline = vertical_doshline_group.getObjectByName(
        "doshline_" + country_code
      );
      country_doshline.visible = true;
      if (country_geomap_map.getObjectByName("map_" + country_code)) {
        country_geomap_map
          .getObjectByName("map_" + country_code)
          .material.color.setHex(map_color_list[0]);
      } else {
      }
      if (country_code == "CN") {
        country_geomap_map
          .getObjectByName("map_" + "HK")
          .material.color.setHex(map_color_list[0]);
        country_geomap_map
          .getObjectByName("map_" + "TW")
          .material.color.setHex(map_color_list[0]);
      } else {
      }
      var search_ASpoints = new THREE.BufferGeometry();
      var search_ASlink = new THREE.BufferGeometry();

      var search_points_vertices = [];
      var search_points_types = [];
      var search_points_colors = [];

      var search_links_vertices = [];
      var search_links_colors = [];

      for (var AS_num in country_ASes) {
        if (ASnum_init != AS_num) {
          continue;
        } else {
        }
        var AS_pos = AS_pos_map[AS_num];
        if (AS_pos == undefined) {
          // console.log(AS_num+" no this AS position, need add.");
          continue;
        } else {
          search_points_vertices.push(AS_pos.x);
          search_points_vertices.push(AS_pos.y);
          search_points_vertices.push(AS_pos.z);
          search_points_types.push(AS_type_map[AS_num]);
          search_points_colors.push(AS_color_map[AS_num].r);
          search_points_colors.push(AS_color_map[AS_num].g);
          search_points_colors.push(AS_color_map[AS_num].b);

          for (
            var link_index = 0;
            link_index < AS_links_map[AS_num].length;
            link_index++
          ) {
            var linkAS_num = AS_links_map[AS_num][link_index];
            var linkAS_pos = AS_pos_map[linkAS_num];
            if (linkAS_pos == undefined) {
              // console.log(linkAS_num+" no this linked AS position, need add.");
              continue;
            } else {
              var link_color = AS_links_color_map[AS_num + "-" + linkAS_num];
              var is_add_flag =
                linkAS_num == ASnum_searched &&
                country_code == AS_atcountry_map[linkAS_num];
              if (link_color && is_add_flag) {
                search_points_vertices.push(linkAS_pos.x);
                search_points_vertices.push(linkAS_pos.y);
                search_points_vertices.push(linkAS_pos.z);
                search_points_types.push(AS_type_map[linkAS_num]);
                search_points_colors.push(AS_color_map[linkAS_num].r);
                search_points_colors.push(AS_color_map[linkAS_num].g);
                search_points_colors.push(AS_color_map[linkAS_num].b);

                search_links_vertices.push(linkAS_pos.x);
                search_links_vertices.push(linkAS_pos.y);
                search_links_vertices.push(linkAS_pos.z);
                search_links_vertices.push(AS_pos.x);
                search_links_vertices.push(AS_pos.y);
                search_links_vertices.push(AS_pos.z);

                search_links_colors.push(link_color.r);
                search_links_colors.push(link_color.g);
                search_links_colors.push(link_color.b);
                search_links_colors.push(link_color.r);
                search_links_colors.push(link_color.g);
                search_links_colors.push(link_color.b);
              } else {
              }
            }
          }
        }
      }

      search_ASpoints.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
      );
      search_ASpoints.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
      );
      search_ASpoints.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
      );
      var AS_points_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE,
        fragmentShader: PHY_FSHADER_SOURCE,
        transparent: true,
        depthTest: true,
      });
      search_points_group = new THREE.Points(
        search_ASpoints,
        AS_points_material
      );

      search_ASlink.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(search_links_vertices), 3)
      );
      search_ASlink.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(search_links_colors), 3)
      );
      var ASlink_material = new THREE.ShaderMaterial({
        vertexShader: PHY_VSHADER_SOURCE_LINE,
        fragmentShader: PHY_FSHADER_SOURCE_LINE,
        transparent: true,
        depthTest: true,
      });
      search_ASlinks_group = new THREE.LineSegments(
        search_ASlink,
        ASlink_material
      );
      if (topo_flag == true) {
        scene.add(search_ASlinks_group);
      } else {
      }
      scene.add(search_points_group);
      scene.add(vertical_doshline_group);
      scene.add(Land_points_group);
      scene.add(direction_light);
      scene.add(direction_light_2);
      scene.add(country_geomap_map);
    }
  }

  function phy_ASout_search_country(country_searched, ASnum_init) {
    // country_code : "US"
    $.when(phy_init_data())
      .done(function () {
        util_clear_geometry();
        phy_scene_reset();
        callback();
      })
      .fail(function () {
        util_clear_geometry();
        phy_scene_reset();
      });

    function callback() {
      var AS_pos = AS_pos_map[ASnum_init];
      if (AS_pos == undefined) {
        console.log(ASnum_init + " no this AS");
        return;
      } else {
        if ($.inArray(country_searched, valid_country_names) < 0) {
          console.log(country_searched + " is not in valid_country_names");
          return;
        } else {
        }
      }
      var doshline_children = vertical_doshline_group["children"];
      for (var i = 0; i < doshline_children.length; i++) {
        doshline_children[i].visible = false;
      }
      var map_children = country_geomap_map["children"];
      for (var j = 0; j < map_children.length; j++) {
        map_children[j].material.color.setHex(0xffffff);
      }
      var country_code = AS_atcountry_map[ASnum_init];
      var country_ASes = jsonfile_ASPostion[country_code];

      var search_ASpoints = new THREE.BufferGeometry();

      var search_points_vertices = [];
      var search_points_types = [];
      var search_points_colors = [];

      var AS_searchedcountry_flag = false;
      var for_go_out = false;
      for (var AS_num in country_ASes) {
        if (for_go_out == true) {
          break;
        } else {
          if (ASnum_init != AS_num) {
            continue;
          } else {
          }
        }
        var AS_links = AS_links_map[AS_num];
        for (var link_index = 0; link_index < AS_links.length; link_index++) {
          var linkAS_num = AS_links[link_index];
          if (AS_atcountry_map[linkAS_num] == country_searched) {
            AS_searchedcountry_flag = true;
            for_go_out = true;
            break;
          }
        }
      }
      if (AS_searchedcountry_flag == false) {
        console.log(
          ASnum_init +
            " AS not outer linked country_searched " +
            country_searched
        );
        return;
      } else {
        search_points_vertices.push(AS_pos.x);
        search_points_vertices.push(AS_pos.y);
        search_points_vertices.push(AS_pos.z);
        search_points_types.push(AS_type_map[AS_num]);
        search_points_colors.push(AS_color_map[AS_num].r);
        search_points_colors.push(AS_color_map[AS_num].g);
        search_points_colors.push(AS_color_map[AS_num].b);
        search_ASpoints.addAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(search_points_vertices), 3)
        );
        search_ASpoints.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(search_points_colors), 3)
        );
        search_ASpoints.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(search_points_types), 1)
        );
        var AS_points_material = new THREE.ShaderMaterial({
          vertexShader: PHY_VSHADER_SOURCE,
          fragmentShader: PHY_FSHADER_SOURCE,
          transparent: true,
          depthTest: true,
        });
        search_points_group = new THREE.Points(
          search_ASpoints,
          AS_points_material
        );

        var country_doshline = vertical_doshline_group.getObjectByName(
          "doshline_" + country_code
        );
        country_doshline.visible = true;
        var country_doshline = vertical_doshline_group.getObjectByName(
          "doshline_" + country_searched
        );
        country_doshline.visible = true;
        if (country_geomap_map.getObjectByName("map_" + country_code)) {
          country_geomap_map
            .getObjectByName("map_" + country_code)
            .material.color.setHex(map_color_list[0]);
        } else {
        }
        if (country_code == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[0]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[0]);
        } else {
        }

        if (country_geomap_map.getObjectByName("map_" + country_searched)) {
          country_geomap_map
            .getObjectByName("map_" + country_searched)
            .material.color.setHex(map_color_list[1]);
        } else {
        }
        if (country_searched == "CN") {
          country_geomap_map
            .getObjectByName("map_" + "HK")
            .material.color.setHex(map_color_list[1]);
          country_geomap_map
            .getObjectByName("map_" + "TW")
            .material.color.setHex(map_color_list[1]);
        } else {
        }

        scene.add(search_points_group);
        scene.add(vertical_doshline_group);
        scene.add(Land_points_group);
        scene.add(direction_light);
        scene.add(direction_light_2);
        scene.add(country_geomap_map);
      }
    }
  }

  function phy_scene_reset() {
    // 还原地理图的场景参数
    camera = iCamera.clone();
    camera.position.x = 0;
    camera.position.y = 30000;
    camera.position.z = -30000;
    camera.up.set(0, -1, 0);
    controler = new THREE.TrackballControls(camera, renderer.domElement);
  }

  // 逻辑图函数定义
  function log_init_world_data(init_flag) {
    var dtd = $.Deferred();
    // 全球初始化数据完毕,直接使用缓存,
    if (world_init_done == true) {
      // console.log("using world data cache.");
      current_graph_type = "world";
      dtd.resolve();
    } else {
      loading.start();

      // 文件可能已从别的视图加载,比如国家间接口
      if (init_flag == true) {
        requirejs(
          [
            "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
            "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
          ],
          function (a, b, c) {
            jsonfile_staticLogicAsInfo = a;
            jsonfile_ASPostion = b;
            data_processing_2();
            dtd.resolve();
          }
        );
      } else {
        requirejs(
          [
            "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
            "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
            "json!" + datav_config.ajax_data_url + "staticLogicEdgeInfo.json",
          ],
          function (a, b, c) {
            jsonfile_staticLogicAsInfo = a;
            jsonfile_ASPostion = b;
            jsonfile_staticLogicEdgeInfo = c;
            data_processing();
            dtd.resolve();
          }
        );
      }
    }

    return dtd.promise();

    function data_processing() {
      world_ASpoints_group = new THREE.Group();
      world_boundry_circle = new THREE.Group();
      world_countrytext_group = new THREE.Group();
      world_countryAS_info = {}; // 存储全球AS位置等信息, 按照[国家-[AS]]的级别
      world_index_ASpoint_map = {}; // 全球索引与AS对照表(分国家)，供拾取使用
      world_ASpoint_index_map = {};
      world_init_done = false; // 全球初始化完毕标记, reset缓存使用
      current_graph_type = "";
      AS_atcountry_map = {};
      var countryAS_count = {}; // 国家AS数量对照表,用于国家根据数量布局
      var country_arcs = {}; // 国家弧度范围对照表,用于国家内部的扇形布局,和国家标签的位置确定
      var countrys_equal_degree_ASes = {}; // 所有国家相同度数的AS集合,为了均分
      valid_country_names = [];
      // 建立同度数ASes映射表
      _.forEach(jsonfile_staticLogicAsInfo, function (country_AS, index) {
        var country_code = country_AS["countryCode"];
        var ASInfoList = country_AS["ASInfoList"];
        if (ASInfoList.length == 0) {
          // 某些国家的AS列表为空, 不再展示.
          // console.log(country_code+" has no ASes, not be shown in graph.")
          return;
        }
        valid_country_names.push(country_code);
        var equal_degree_AS = {}; // 每个国家相同度数的AS集合
        countryAS_count[country_code] = ASInfoList.length;
        _.forEach(ASInfoList, function (ASInfo, ASindex) {
          var AS_num = ASInfo["ASNumber"];
          var AS_Degree =
            ASInfo["ASDegrees"] == 0
              ? ASInfo["ASDegrees"] + 2
              : ASInfo["ASDegrees"] + 1;
          var AS_Type = ASInfo["ASType"];
          AS_atcountry_map[AS_num] = country_code;
          if (equal_degree_AS[AS_Degree] == undefined) {
            equal_degree_AS[AS_Degree] = [[AS_num, AS_Type]];
          } else {
            equal_degree_AS[AS_Degree].push([AS_num, AS_Type]);
          }
        });
        countrys_equal_degree_ASes[country_code] = equal_degree_AS;
      });

      // AS全球布局,根据AS数量
      var sorted_array = _.sortBy(_.toPairs(countryAS_count), [
        function (o) {
          return o[1];
        },
      ]);
      var array_reverse = _.reverse(sorted_array);
      var arcs = d3.pie().value(function (d) {
        return d[1];
      })(array_reverse);
      _.forEach(arcs, function (obj) {
        country_arcs[obj["data"][0]] = [obj["startAngle"], obj["endAngle"]];
      });
      _.forEach(
        countrys_equal_degree_ASes,
        function (equal_degree_AS, country_code) {
          var country_arc = country_arcs[country_code];
          _.forEach(equal_degree_AS, function (AS_num_list, AS_Degree) {
            var each_arc_factory = d3
              .scaleLinear()
              .domain([-1, AS_num_list.length])
              .range([country_arc[0], country_arc[1]]);
            _.forEach(AS_num_list, function (AS_num, AS_index) {
              var AS_arc = each_arc_factory(AS_index);
              var AS_radius =
                1 - Math.log((AS_Degree + 1) / (max_ASdegree + 1)) / Math.LN10;
              var x = Math.sin(AS_arc) * AS_radius;
              var y = Math.cos(AS_arc) * AS_radius;
              var ASsize =
                1 - Math.log(1 / (max_ASdegree + 1)) / Math.LN10 - AS_radius;
              var ASnum = AS_num[0];
              var AStype = AS_num[1];
              world_countryAS_info[ASnum] = [
                x,
                y,
                color_factory(AS_Degree),
                AS_arc,
                ASsize,
                AStype,
              ];
            });
          });
        }
      );
      // var points_material = new THREE.PointsMaterial( { vertexColors: true, size:600, opacity: 1.0, transparent:true} )
      // 着色器的使用

      // 建立国家AS点集合物体
      var country_index_AS = {}; // 每个国家的index和AS点位置对应关系。
      var country_AS_index = {};
      var index_counter = 0;
      var points_geometry = new THREE.BufferGeometry();

      var points_geometry_vertices = [];
      var points_geometry_colors = [];
      var points_geometry_opacitys = [];
      var points_geometry_sizes = [];
      var points_geometry_types = [];
      var points_geometry_ASnums = [];

      _.forEach(world_countryAS_info, function (obj, Asnum) {
        points_geometry_vertices.push(obj[0] * custom_scale_level);
        points_geometry_vertices.push(obj[1] * custom_scale_level);
        points_geometry_vertices.push(0);
        var color = new THREE.Color(obj[2]);
        points_geometry_colors.push(color["r"]);
        points_geometry_colors.push(color["g"]);
        points_geometry_colors.push(color["b"]);
        points_geometry_opacitys.push(1.0);
        points_geometry_sizes.push(obj[4]);
        points_geometry_types.push(type_num_map[obj[5]]);
        points_geometry_ASnums.push(Asnum);
        world_index_ASpoint_map[index_counter] = Asnum;
        world_ASpoint_index_map[Asnum] = index_counter;
        index_counter += 1;
      });

      points_geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(points_geometry_vertices), 3)
      );
      points_geometry.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(points_geometry_colors), 3)
      );
      points_geometry.addAttribute(
        "opacity",
        new THREE.BufferAttribute(new Float32Array(points_geometry_opacitys), 1)
      );
      points_geometry.addAttribute(
        "size",
        new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
      );
      points_geometry.addAttribute(
        "size_copy",
        new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
      );
      points_geometry.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(points_geometry_types), 1)
      );
      points_geometry.addAttribute(
        "ASnum",
        new THREE.BufferAttribute(new Float32Array(points_geometry_ASnums), 1)
      );

      var points_material = new THREE.ShaderMaterial({
        vertexShader: VSHADER_SOURCE_GLOBAL,
        fragmentShader: FSHADER_SOURCE_GLOBAL,
        transparent: true,
        depthTest: false,
      });

      var AS_Points = new THREE.Points(points_geometry, points_material);
      world_ASpoints_group.add(AS_Points);

      // AS线处理
      AS_links_color_pccp_map = {};
      AS_links_color_map = {};

      var ASlinks_out_geom = new THREE.BufferGeometry(); // 国外
      var ASlinks_in_geom = new THREE.BufferGeometry(); // 国内
      var ASlinks_both_geom = new THREE.BufferGeometry(); // 全有
      var ASlinks_neither_geom = new THREE.BufferGeometry(); // 全无

      var ASlinks_both_geom_vertices = [];
      var ASlinks_both_geom_vertices_pp = [];
      var ASlinks_both_geom_vertices_pccp = [];
      var ASlinks_both_geom_vertices_ss = [];
      var ASlinks_both_geom_colors = [];
      var ASlinks_both_geom_colors_pp = [];
      var ASlinks_both_geom_colors_pccp = [];
      var ASlinks_both_geom_colors_ss = [];

      var ASlinks_in_geom_vertices = [];
      var ASlinks_in_geom_vertices_pp = [];
      var ASlinks_in_geom_vertices_pccp = [];
      var ASlinks_in_geom_vertices_ss = [];
      var ASlinks_in_geom_colors = [];
      var ASlinks_in_geom_colors_pp = [];
      var ASlinks_in_geom_colors_pccp = [];
      var ASlinks_in_geom_colors_ss = [];

      var ASlinks_out_geom_vertices = [];
      var ASlinks_out_geom_vertices_pp = [];
      var ASlinks_out_geom_vertices_pccp = [];
      var ASlinks_out_geom_vertices_ss = [];
      var ASlinks_out_geom_colors = [];
      var ASlinks_out_geom_colors_pp = [];
      var ASlinks_out_geom_colors_pccp = [];
      var ASlinks_out_geom_colors_ss = [];

      var ASlinks_neither_geom_vertices = [];
      var ASlinks_neither_geom_colors = [];

      // 线条双向变单向处理
      var ASlinks_out_flag = {}; // 国外单向线标记
      var ASlinks_in_flag = {}; // 国内单向线标记
      var ASlinks_both_flag = {}; // 全有单向线标记
      var ASlinks_neither_flag = {}; // 全无单向线标记

      for (var i = 0; i < valid_country_names.length; i++) {
        var country_code = valid_country_names[i];
        var country_ASes = jsonfile_ASPostion[country_code];
        for (var AS_num in country_ASes) {
          var AS_info = world_countryAS_info[AS_num];
          if (AS_info == undefined) {
            console.log(
              AS_num +
                "@" +
                country_code +
                " has no info in staticLogicAsInfo.json"
            );
            continue;
          } else {
            var link_ASes = country_ASes[AS_num][3];
            for (
              var link_index = 0;
              link_index < link_ASes.length;
              link_index++
            ) {
              var linkAS = link_ASes[link_index];
              var linkAS_info = world_countryAS_info[linkAS];
              if (linkAS_info == undefined) {
                // AS只出现在别的AS边关系中，并没有自己的位置
                // console.log(linkAS + " (linkAS) have no as info, need add!");
                continue;
              } else {
                var link_type =
                  jsonfile_staticLogicEdgeInfo[AS_num + "-" + linkAS];
                if (!ASlinks_both_flag[linkAS + "-" + AS_num]) {
                  // 如果没有添加反向的AS-linkAS，则添加当前的正向AS-linkAS，及其保留边颜色信息
                  if (link_type[0] == "P" && link_type[1] == "C") {
                    ASlinks_both_geom_vertices_pccp.push(
                      AS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(
                      AS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(0);
                    ASlinks_both_geom_vertices_pccp.push(
                      linkAS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(
                      linkAS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(0);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.r);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.g);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.b);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.r);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.g);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.b);
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                    AS_links_color_map[AS_num + "-" + linkAS] = pc_color;
                  } else if (link_type[0] == "P" && link_type[1] == "P") {
                    ASlinks_both_geom_vertices_pp.push(
                      AS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pp.push(
                      AS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pp.push(0);
                    ASlinks_both_geom_vertices_pp.push(
                      linkAS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pp.push(
                      linkAS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pp.push(0);
                    ASlinks_both_geom_colors_pp.push(pp_color.r);
                    ASlinks_both_geom_colors_pp.push(pp_color.g);
                    ASlinks_both_geom_colors_pp.push(pp_color.b);
                    ASlinks_both_geom_colors_pp.push(pp_color.r);
                    ASlinks_both_geom_colors_pp.push(pp_color.g);
                    ASlinks_both_geom_colors_pp.push(pp_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = pp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pp_color;
                  } else if (link_type[0] == "C" && link_type[1] == "P") {
                    ASlinks_both_geom_vertices_pccp.push(
                      AS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(
                      AS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(0);
                    ASlinks_both_geom_vertices_pccp.push(
                      linkAS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(
                      linkAS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_pccp.push(0);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.r);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.g);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.b);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.r);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.g);
                    ASlinks_both_geom_colors_pccp.push(pccp_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = cp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                  } else if (link_type[0] == "S" && link_type[1] == "S") {
                    ASlinks_both_geom_vertices_ss.push(
                      AS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_ss.push(
                      AS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_ss.push(0);
                    ASlinks_both_geom_vertices_ss.push(
                      linkAS_info[0] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_ss.push(
                      linkAS_info[1] * custom_scale_level
                    );
                    ASlinks_both_geom_vertices_ss.push(0);
                    ASlinks_both_geom_colors_ss.push(ss_color.r);
                    ASlinks_both_geom_colors_ss.push(ss_color.g);
                    ASlinks_both_geom_colors_ss.push(ss_color.b);
                    ASlinks_both_geom_colors_ss.push(ss_color.r);
                    ASlinks_both_geom_colors_ss.push(ss_color.g);
                    ASlinks_both_geom_colors_ss.push(ss_color.b);
                    AS_links_color_map[AS_num + "-" + linkAS] = ss_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = ss_color;
                  } else {
                  }
                  ASlinks_both_flag[AS_num + "-" + linkAS] = true;
                } else {
                  // 如果添加过反向的AS-linkAS，则不添加当前的正向AS-linkAS，但保留边颜色信息(供查询接口使用)
                  if (link_type[0] == "P" && link_type[1] == "C") {
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                    AS_links_color_map[AS_num + "-" + linkAS] = pc_color;
                  } else if (link_type[0] == "P" && link_type[1] == "P") {
                    AS_links_color_map[AS_num + "-" + linkAS] = pp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pp_color;
                  } else if (link_type[0] == "C" && link_type[1] == "P") {
                    AS_links_color_map[AS_num + "-" + linkAS] = cp_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = pccp_color;
                  } else if (link_type[0] == "S" && link_type[1] == "S") {
                    AS_links_color_map[AS_num + "-" + linkAS] = ss_color;
                    AS_links_color_pccp_map[AS_num + "-" + linkAS] = ss_color;
                  } else {
                  }
                }
                // 区分国内国外
                if (AS_atcountry_map[linkAS] == country_code) {
                  // 国内
                  if (!ASlinks_in_flag[linkAS + "-" + AS_num]) {
                    if (link_type[0] == "P" && link_type[1] == "C") {
                      ASlinks_in_geom_vertices_pccp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(0);
                      ASlinks_in_geom_vertices_pccp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(0);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.b);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.b);
                    } else if (link_type[0] == "P" && link_type[1] == "P") {
                      ASlinks_in_geom_vertices_pp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pp.push(0);
                      ASlinks_in_geom_vertices_pp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pp.push(0);
                      ASlinks_in_geom_colors_pp.push(pp_color.r);
                      ASlinks_in_geom_colors_pp.push(pp_color.g);
                      ASlinks_in_geom_colors_pp.push(pp_color.b);
                      ASlinks_in_geom_colors_pp.push(pp_color.r);
                      ASlinks_in_geom_colors_pp.push(pp_color.g);
                      ASlinks_in_geom_colors_pp.push(pp_color.b);
                    } else if (link_type[0] == "C" && link_type[1] == "P") {
                      ASlinks_in_geom_vertices_pccp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(0);
                      ASlinks_in_geom_vertices_pccp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_pccp.push(0);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.b);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_in_geom_colors_pccp.push(pccp_color.b);
                    } else if (link_type[0] == "S" && link_type[1] == "S") {
                      ASlinks_in_geom_vertices_ss.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_ss.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_ss.push(0);
                      ASlinks_in_geom_vertices_ss.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_ss.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_in_geom_vertices_ss.push(0);
                      ASlinks_in_geom_colors_ss.push(ss_color.r);
                      ASlinks_in_geom_colors_ss.push(ss_color.g);
                      ASlinks_in_geom_colors_ss.push(ss_color.b);
                      ASlinks_in_geom_colors_ss.push(ss_color.r);
                      ASlinks_in_geom_colors_ss.push(ss_color.g);
                      ASlinks_in_geom_colors_ss.push(ss_color.b);
                    } else {
                    }
                    ASlinks_in_flag[AS_num + "-" + linkAS] = true;
                  } else {
                  }
                } else {
                  // 国外
                  if (!ASlinks_out_flag[linkAS + "-" + AS_num]) {
                    if (link_type[0] == "P" && link_type[1] == "C") {
                      ASlinks_out_geom_vertices_pccp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(0);
                      ASlinks_out_geom_vertices_pccp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(0);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.b);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.b);
                    } else if (link_type[0] == "P" && link_type[1] == "P") {
                      ASlinks_out_geom_vertices_pp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pp.push(0);
                      ASlinks_out_geom_vertices_pp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pp.push(0);
                      ASlinks_out_geom_colors_pp.push(pp_color.r);
                      ASlinks_out_geom_colors_pp.push(pp_color.g);
                      ASlinks_out_geom_colors_pp.push(pp_color.b);
                      ASlinks_out_geom_colors_pp.push(pp_color.r);
                      ASlinks_out_geom_colors_pp.push(pp_color.g);
                      ASlinks_out_geom_colors_pp.push(pp_color.b);
                    } else if (link_type[0] == "C" && link_type[1] == "P") {
                      ASlinks_out_geom_vertices_pccp.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(0);
                      ASlinks_out_geom_vertices_pccp.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_pccp.push(0);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.b);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.r);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.g);
                      ASlinks_out_geom_colors_pccp.push(pccp_color.b);
                    } else if (link_type[0] == "S" && link_type[1] == "S") {
                      ASlinks_out_geom_vertices_ss.push(
                        AS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_ss.push(
                        AS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_ss.push(0);
                      ASlinks_out_geom_vertices_ss.push(
                        linkAS_info[0] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_ss.push(
                        linkAS_info[1] * custom_scale_level
                      );
                      ASlinks_out_geom_vertices_ss.push(0);
                      ASlinks_out_geom_colors_ss.push(ss_color.r);
                      ASlinks_out_geom_colors_ss.push(ss_color.g);
                      ASlinks_out_geom_colors_ss.push(ss_color.b);
                      ASlinks_out_geom_colors_ss.push(ss_color.r);
                      ASlinks_out_geom_colors_ss.push(ss_color.g);
                      ASlinks_out_geom_colors_ss.push(ss_color.b);
                    } else {
                    }
                    ASlinks_out_flag[AS_num + "-" + linkAS] = true;
                  } else {
                  }
                }
              }
            }
          }
        }
      }

      $.merge(ASlinks_both_geom_colors, ASlinks_both_geom_colors_pp);
      $.merge(ASlinks_both_geom_colors, ASlinks_both_geom_colors_pccp);
      $.merge(ASlinks_both_geom_colors, ASlinks_both_geom_colors_ss);

      $.merge(ASlinks_both_geom_vertices, ASlinks_both_geom_vertices_pp);
      $.merge(ASlinks_both_geom_vertices, ASlinks_both_geom_vertices_pccp);
      $.merge(ASlinks_both_geom_vertices, ASlinks_both_geom_vertices_ss);

      $.merge(ASlinks_in_geom_colors, ASlinks_in_geom_colors_pp);
      $.merge(ASlinks_in_geom_colors, ASlinks_in_geom_colors_pccp);
      $.merge(ASlinks_in_geom_colors, ASlinks_in_geom_colors_ss);

      $.merge(ASlinks_in_geom_vertices, ASlinks_in_geom_vertices_pp);
      $.merge(ASlinks_in_geom_vertices, ASlinks_in_geom_vertices_pccp);
      $.merge(ASlinks_in_geom_vertices, ASlinks_in_geom_vertices_ss);

      $.merge(ASlinks_out_geom_colors, ASlinks_out_geom_colors_pp);
      $.merge(ASlinks_out_geom_colors, ASlinks_out_geom_colors_pccp);
      $.merge(ASlinks_out_geom_colors, ASlinks_out_geom_colors_ss);

      $.merge(ASlinks_out_geom_vertices, ASlinks_out_geom_vertices_pp);
      $.merge(ASlinks_out_geom_vertices, ASlinks_out_geom_vertices_pccp);
      $.merge(ASlinks_out_geom_vertices, ASlinks_out_geom_vertices_ss);

      ASlinks_out_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_out_geom_vertices),
          3
        )
      );
      ASlinks_in_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(ASlinks_in_geom_vertices), 3)
      );
      ASlinks_both_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_both_geom_vertices),
          3
        )
      );
      ASlinks_neither_geom.addAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_neither_geom_vertices),
          3
        )
      );

      ASlinks_out_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_out_geom_colors), 3)
      );
      ASlinks_in_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_in_geom_colors), 3)
      );
      ASlinks_both_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(ASlinks_both_geom_colors), 3)
      );
      ASlinks_neither_geom.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(
          new Float32Array(ASlinks_neither_geom_colors),
          3
        )
      );

      var ASlinks_out_geom_flag = undefined; // 清除国外单向线标记变量
      var ASlinks_in_flag = undefined; // 清除国内单向线标记变量
      var ASlinks_both_flag = undefined; // 清除全有单向线标记变量
      var ASlinks_neither_flag = undefined; // 清除全无单向线标记变量
      var ASlink_material = new THREE.ShaderMaterial({
        vertexShader: LOG_VSHADER_SOURCE_LINE_GLOBAL,
        fragmentShader: LOG_FSHADER_SOURCE_LINE_GLOBAL,
        // blending : THREE.CustomBlending,
        // blendEquation : THREE.AddEquation, //default
        // blendSrc : THREE.SrcAlphaFactor, //default
        // blendDst : THREE.OneMinusDstAlphaFactor, //default
        transparent: true,
        depthTest: false,
      });

      log_ASlinks_group_out = new THREE.LineSegments(
        ASlinks_out_geom,
        ASlink_material
      );
      log_ASlinks_group_in = new THREE.LineSegments(
        ASlinks_in_geom,
        ASlink_material
      );
      log_ASlinks_group_both = new THREE.LineSegments(
        ASlinks_both_geom,
        ASlink_material
      );
      log_ASlinks_group_neither = new THREE.LineSegments(
        ASlinks_neither_geom,
        ASlink_material
      );

      // 全球边界外圈
      var curve = new THREE.EllipseCurve(
        0,
        0, // ax, aY
        custom_scale_level *
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10),
        custom_scale_level *
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10), // xRadius, yRadius
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      );
      var path = new THREE.Path(curve.getPoints(200));
      var geometry_circle = path.createPointsGeometry(200);

      var material_circle = new THREE.LineBasicMaterial({
        color: 0x176089,
        transparent: true,
      });
      world_boundry_circle.add(
        new THREE.Line(geometry_circle, material_circle)
      );

      // 国家字体

      var fontsize_factory = d3
        .scaleLinear()
        .domain([2, 0.1, 0.025, 0.005, 0])
        .range([8000, 5000, 1000, 100, 2]);
      _.forEach(country_arcs, function (arc_range, country_code) {
        // return false
        var country_texture = document.createElement("canvas");
        country_texture.height = 256;
        country_texture.width = 256;
        var ctx = country_texture.getContext("2d");
        ctx.font = "128px arival";
        ctx.fillStyle = "white";
        ctx.fillText(country_code, 32, 128 + 32);

        var geometry = new THREE.PlaneGeometry(
          fontsize_factory(arc_range[1] - arc_range[0]) * 2,
          fontsize_factory(arc_range[1] - arc_range[0]) * 2
        );
        var material = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(country_texture),
          transparent: true,
          opacity: 1.0,
        });
        var textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.x =
          Math.sin((arc_range[0] + arc_range[1]) / 2) *
          1 *
          (custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.4));
        textMesh.position.y =
          Math.cos((arc_range[0] + arc_range[1]) / 2) *
          1 *
          (custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.4));
        textMesh.name = country_code; // 将来直接通过name拼接,然后就可以用系统自带的查询方式,性能较好.
        textMesh.custom_1 = "countrytext";
        world_countrytext_group.add(textMesh);
      });

      world_init_done = true;
      loading.done();
      current_graph_type = "world";
    }

    function data_processing_2() {
      world_ASpoints_group = new THREE.Group();
      world_boundry_circle = new THREE.Group();
      world_countrytext_group = new THREE.Group();
      world_countryAS_info = {}; // 存储全球AS位置等信息, 按照[国家-[AS]]的级别
      world_index_ASpoint_map = {}; // 全球索引与AS对照表(分国家)，供拾取使用
      world_ASpoint_index_map = {};
      world_init_done = false; // 全球初始化完毕标记, reset缓存使用
      current_graph_type = "";
      AS_atcountry_map = {};
      var countryAS_count = {}; // 国家AS数量对照表,用于国家根据数量布局
      var country_arcs = {}; // 国家弧度范围对照表,用于国家内部的扇形布局,和国家标签的位置确定
      var countrys_equal_degree_ASes = {}; // 所有国家相同度数的AS集合,为了均分
      valid_country_names = [];
      // 建立同度数ASes映射表
      _.forEach(jsonfile_staticLogicAsInfo, function (country_AS, index) {
        var country_code = country_AS["countryCode"];
        var ASInfoList = country_AS["ASInfoList"];
        if (ASInfoList.length == 0) {
          // 某些国家的AS列表为空, 不再展示.
          // console.log(country_code+" has no ASes, not be shown in graph.")
          return;
        }
        valid_country_names.push(country_code);
        var equal_degree_AS = {}; // 每个国家相同度数的AS集合
        countryAS_count[country_code] = ASInfoList.length;
        _.forEach(ASInfoList, function (ASInfo, ASindex) {
          var AS_num = ASInfo["ASNumber"];
          var AS_Degree =
            ASInfo["ASDegrees"] == 0
              ? ASInfo["ASDegrees"] + 2
              : ASInfo["ASDegrees"] + 1;
          var AS_Type = ASInfo["ASType"];
          AS_atcountry_map[AS_num] = country_code;
          if (equal_degree_AS[AS_Degree] == undefined) {
            equal_degree_AS[AS_Degree] = [[AS_num, AS_Type]];
          } else {
            equal_degree_AS[AS_Degree].push([AS_num, AS_Type]);
          }
        });
        countrys_equal_degree_ASes[country_code] = equal_degree_AS;
      });

      // AS全球布局,根据AS数量
      var sorted_array = _.sortBy(_.toPairs(countryAS_count), [
        function (o) {
          return o[1];
        },
      ]);
      var array_reverse = _.reverse(sorted_array);
      var arcs = d3.pie().value(function (d) {
        return d[1];
      })(array_reverse);
      _.forEach(arcs, function (obj) {
        country_arcs[obj["data"][0]] = [obj["startAngle"], obj["endAngle"]];
      });
      _.forEach(
        countrys_equal_degree_ASes,
        function (equal_degree_AS, country_code) {
          var country_arc = country_arcs[country_code];
          _.forEach(equal_degree_AS, function (AS_num_list, AS_Degree) {
            var each_arc_factory = d3
              .scaleLinear()
              .domain([-1, AS_num_list.length])
              .range([country_arc[0], country_arc[1]]);
            _.forEach(AS_num_list, function (AS_num, AS_index) {
              var AS_arc = each_arc_factory(AS_index);
              var AS_radius =
                1 - Math.log((AS_Degree + 1) / (max_ASdegree + 1)) / Math.LN10;
              var x = Math.sin(AS_arc) * AS_radius;
              var y = Math.cos(AS_arc) * AS_radius;
              var ASsize =
                1 - Math.log(1 / (max_ASdegree + 1)) / Math.LN10 - AS_radius;
              var ASnum = AS_num[0];
              var AStype = AS_num[1];
              world_countryAS_info[ASnum] = [
                x,
                y,
                color_factory(AS_Degree),
                AS_arc,
                ASsize,
                AStype,
              ];
            });
          });
        }
      );
      // var points_material = new THREE.PointsMaterial( { vertexColors: true, size:600, opacity: 1.0, transparent:true} )
      // 着色器的使用

      // 建立国家AS点集合物体
      var country_index_AS = {}; // 每个国家的index和AS点位置对应关系。
      var country_AS_index = {};
      var index_counter = 0;
      var points_geometry = new THREE.BufferGeometry();

      var points_geometry_vertices = [];
      var points_geometry_colors = [];
      var points_geometry_opacitys = [];
      var points_geometry_sizes = [];
      var points_geometry_types = [];
      var points_geometry_ASnums = [];

      _.forEach(world_countryAS_info, function (obj, Asnum) {
        points_geometry_vertices.push(obj[0] * custom_scale_level);
        points_geometry_vertices.push(obj[1] * custom_scale_level);
        points_geometry_vertices.push(0);
        var color = new THREE.Color(obj[2]);
        points_geometry_colors.push(color["r"]);
        points_geometry_colors.push(color["g"]);
        points_geometry_colors.push(color["b"]);
        points_geometry_opacitys.push(1.0);
        points_geometry_sizes.push(obj[4]);
        points_geometry_types.push(type_num_map[obj[5]]);
        points_geometry_ASnums.push(Asnum);
        world_index_ASpoint_map[index_counter] = Asnum;
        world_ASpoint_index_map[Asnum] = index_counter;
        index_counter += 1;
      });

      points_geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(points_geometry_vertices), 3)
      );
      points_geometry.addAttribute(
        "custom_color",
        new THREE.BufferAttribute(new Float32Array(points_geometry_colors), 3)
      );
      points_geometry.addAttribute(
        "opacity",
        new THREE.BufferAttribute(new Float32Array(points_geometry_opacitys), 1)
      );
      points_geometry.addAttribute(
        "size",
        new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
      );
      points_geometry.addAttribute(
        "size_copy",
        new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
      );
      points_geometry.addAttribute(
        "type",
        new THREE.BufferAttribute(new Float32Array(points_geometry_types), 1)
      );
      points_geometry.addAttribute(
        "ASnum",
        new THREE.BufferAttribute(new Float32Array(points_geometry_ASnums), 1)
      );

      var points_material = new THREE.ShaderMaterial({
        vertexShader: VSHADER_SOURCE_GLOBAL,
        fragmentShader: FSHADER_SOURCE_GLOBAL,
        transparent: true,
        depthTest: false,
      });

      var AS_Points = new THREE.Points(points_geometry, points_material);
      world_ASpoints_group.add(AS_Points);

      // AS线处理

      // 全球边界外圈
      var curve = new THREE.EllipseCurve(
        0,
        0, // ax, aY
        custom_scale_level *
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10),
        custom_scale_level *
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10), // xRadius, yRadius
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      );
      var path = new THREE.Path(curve.getPoints(200));
      var geometry_circle = path.createPointsGeometry(200);

      var material_circle = new THREE.LineBasicMaterial({
        color: 0x176089,
        transparent: true,
      });
      world_boundry_circle.add(
        new THREE.Line(geometry_circle, material_circle)
      );

      // 国家字体

      var fontsize_factory = d3
        .scaleLinear()
        .domain([2, 0.1, 0.025, 0.005, 0])
        .range([8000, 5000, 1000, 100, 2]);
      _.forEach(country_arcs, function (arc_range, country_code) {
        var country_texture = document.createElement("canvas");
        country_texture.height = 256;
        country_texture.width = 256;
        var ctx = country_texture.getContext("2d");
        ctx.font = "128px arival";
        ctx.fillStyle = "white";
        ctx.fillText(country_code, 32, 128 + 32);

        var geometry = new THREE.PlaneGeometry(
          fontsize_factory(arc_range[1] - arc_range[0]) * 2,
          fontsize_factory(arc_range[1] - arc_range[0]) * 2
        );
        var material = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(country_texture),
          transparent: true,
          opacity: 1.0,
        });
        var textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.x =
          Math.sin((arc_range[0] + arc_range[1]) / 2) *
          1 *
          (custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.4));
        textMesh.position.y =
          Math.cos((arc_range[0] + arc_range[1]) / 2) *
          1 *
          (custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.4));
        textMesh.name = country_code; // 将来直接通过name拼接,然后就可以用系统自带的查询方式,性能较好.
        textMesh.custom_1 = "countrytext";
        world_countrytext_group.add(textMesh);
      });

      world_init_done = false;
      loading.done();
      current_graph_type = "world";
    }
  }

  // 初始化全球逻辑图
  function log_world_init(topo_flag, init_flag) {
    input_record.input_value_plus_type = "";
    input_record.input_value_plus_value = "";
    util_clear_geometry();
    log_scene_reset();
    // 在jQuery中，$.when()是一个用于处理异步任务的方法
    $.when(log_init_world_data(init_flag))
      .done(callback_done)
      .fail(callback_fail);

    function callback_done() {
      input_record.input_value_plus_type = "";
      input_record.input_value_plus_value = "";
      // console.log("world data processing done");
      for (var index in world_countrytext_group.children) {
        world_countrytext_group.children[index].visible = true;
      }
      for (var i = 0; i < world_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          world_ASpoints_group.children[i].geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
          AStarget_attr.opacity.array[j] = 1.0;
        }
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
        world_ASpoints_group.children[i]["visible"] = true;
      }
      if (topo_flag == "both") {
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
        scene.add(log_ASlinks_group_both);
      } else if (topo_flag == "in") {
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
        scene.add(log_ASlinks_group_in);
      } else if (topo_flag == "out") {
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
        scene.add(log_ASlinks_group_out);
      } else if (topo_flag == "neither") {
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
        if (init_flag == false) {
          scene.add(log_ASlinks_group_neither);
        }
      } else {
        console.log("Argument Error.");
        return;
      }
    }

    function callback_fail() {
      // console.log("world data processing error");
      world_ASpoints_group = undefined;
      world_countrytext_group = undefined;
      world_point_target = undefined;
      world_boundry_circle = undefined;
      world_countryAS_info = {};
      world_index_ASpoint_map = {};
      world_init_done = false;
      current_graph_type = "";
    }
  }

  function log_world_search_AS(ASnum_searched, is_picking, topo_flag) {
    showTags([0, 1, 2, 4, 5, 6, 7]);
    util_clear_geometry();
    // 拾取的话,不还原场景相机位置,否则还原.(交互性友好, 其它picking字段同理)
    if (is_picking) {
    } else {
      log_scene_reset();
    }
    $.when(log_init_world_data()).done(callback_done).fail(callback_fail);

    function callback_done() {
      var target_country = AS_atcountry_map[ASnum_searched];
      if (!target_country) {
        console.log(ASnum_searched + " not in graph.");
        return;
      } else {
      }
      // 全图拾取
      var linked_countrys = [];
      var linkAS_nums = jsonfile_ASPostion[target_country][ASnum_searched][3];
      var target_ASindex = world_ASpoint_index_map[ASnum_searched];
      for (var i = 0; i < world_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          world_ASpoints_group.children[i].geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.opacity.array[j] = parseFloat(0.0);
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
          if ($.inArray(AStarget_attr.ASnum.array[j], linkAS_nums) >= 0) {
            AStarget_attr.opacity.array[j] = 1.0;
            var linked_country = AS_atcountry_map[AStarget_attr.ASnum.array[j]];
            if ($.inArray(linked_country, linked_countrys) == -1) {
              linked_countrys.push(linked_country);
            } else {
            }
          } else {
          }
        }
        AStarget_attr.opacity.array[target_ASindex] = 1.0;
        AStarget_attr.size.array[target_ASindex] = 20;
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
      }
      for (var index in world_countrytext_group.children) {
        if (
          $.inArray(
            world_countrytext_group.children[index].name,
            linked_countrys
          ) >= 0
        ) {
          world_countrytext_group.children[index].visible = true;
        } else {
          world_countrytext_group.children[index].visible = false;
        }
      }
      if (topo_flag == "neither") {
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
      } else {
        world_search_ASlink_group = new THREE.Group();
        var linkAS_nums = jsonfile_ASPostion[target_country][ASnum_searched][3];
        var ASlink_geometry = new THREE.BufferGeometry();
        var ASlink_geometry_vertices = [];
        var ASlink_geometry_vertices_pc = [];
        var ASlink_geometry_vertices_cp = [];
        var ASlink_geometry_vertices_pp = [];
        var ASlink_geometry_vertices_ss = [];
        var ASlink_geometry_colors = [];
        var ASlink_geometry_colors_pc = [];
        var ASlink_geometry_colors_cp = [];
        var ASlink_geometry_colors_pp = [];
        var ASlink_geometry_colors_ss = [];
        for (var i = 0; i < linkAS_nums.length; i++) {
          var country_link_ASnum = linkAS_nums[i];
          var link_country = AS_atcountry_map[country_link_ASnum];
          if (
            (target_country == link_country && topo_flag == "in") ||
            (target_country != link_country && topo_flag == "out") ||
            topo_flag == "both"
          ) {
            if (!world_countryAS_info[country_link_ASnum]) {
              continue;
            } else {
            }
          } else {
            continue;
          }
          var link_type =
            jsonfile_staticLogicEdgeInfo[
              ASnum_searched + "-" + country_link_ASnum
            ];
          if (link_type[0] == "P" && link_type[1] == "C") {
            ASlink_geometry_vertices_pc.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pc.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pc.push(0);
            ASlink_geometry_vertices_pc.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pc.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pc.push(0);
            ASlink_geometry_colors_pc.push(pc_color.r);
            ASlink_geometry_colors_pc.push(pc_color.g);
            ASlink_geometry_colors_pc.push(pc_color.b);
            ASlink_geometry_colors_pc.push(pc_color.r);
            ASlink_geometry_colors_pc.push(pc_color.g);
            ASlink_geometry_colors_pc.push(pc_color.b);
          } else if (link_type[0] == "P" && link_type[1] == "P") {
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(0);
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(0);
            ASlink_geometry_colors_pp.push(pp_color.r);
            ASlink_geometry_colors_pp.push(pp_color.g);
            ASlink_geometry_colors_pp.push(pp_color.b);
            ASlink_geometry_colors_pp.push(pp_color.r);
            ASlink_geometry_colors_pp.push(pp_color.g);
            ASlink_geometry_colors_pp.push(pp_color.b);
          } else if (link_type[0] == "C" && link_type[1] == "P") {
            ASlink_geometry_vertices_cp.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_cp.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_cp.push(0);
            ASlink_geometry_vertices_cp.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_cp.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_cp.push(0);
            ASlink_geometry_colors_cp.push(cp_color.r);
            ASlink_geometry_colors_cp.push(cp_color.g);
            ASlink_geometry_colors_cp.push(cp_color.b);
            ASlink_geometry_colors_cp.push(cp_color.r);
            ASlink_geometry_colors_cp.push(cp_color.g);
            ASlink_geometry_colors_cp.push(cp_color.b);
          } else if (link_type[0] == "S" && link_type[1] == "S") {
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(0);
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(0);
            ASlink_geometry_colors_ss.push(ss_color.r);
            ASlink_geometry_colors_ss.push(ss_color.g);
            ASlink_geometry_colors_ss.push(ss_color.b);
            ASlink_geometry_colors_ss.push(ss_color.r);
            ASlink_geometry_colors_ss.push(ss_color.g);
            ASlink_geometry_colors_ss.push(ss_color.b);
          } else {
            // console.log(ASnum_init+"-"+d+" has no aslink type data.");
          }
        }
        var ASlink_geometry_vertices_temp = _.sortBy(
          [
            ASlink_geometry_vertices_pc,
            ASlink_geometry_vertices_pp,
            ASlink_geometry_vertices_cp,
            ASlink_geometry_vertices_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_vertices_temp.length; i++) {
          ASlink_geometry_vertices = ASlink_geometry_vertices.concat(
            ASlink_geometry_vertices_temp[i]
          );
        }
        var ASlink_geometry_colors_temp = _.sortBy(
          [
            ASlink_geometry_colors_pc,
            ASlink_geometry_colors_pp,
            ASlink_geometry_colors_cp,
            ASlink_geometry_colors_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_colors_temp.length; i++) {
          ASlink_geometry_colors = ASlink_geometry_colors.concat(
            ASlink_geometry_colors_temp[i]
          );
        }

        ASlink_geometry.addAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array(ASlink_geometry_vertices),
            3
          )
        );
        ASlink_geometry.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(ASlink_geometry_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: LOG_VSHADER_SOURCE_LINE,
          fragmentShader: LOG_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: false,
        });
        var world_search_ASlink = new THREE.LineSegments(
          ASlink_geometry,
          ASlink_material
        );
        world_search_ASlink_group.add(world_search_ASlink);
        scene.add(world_boundry_circle);
        scene.add(world_countrytext_group);
        scene.add(world_ASpoints_group);
        scene.add(world_search_ASlink_group);
      }
    }

    function callback_fail() {
      // console.log("data processing error");
      world_ASpoints_group = undefined;
      world_countrytext_group = undefined;
      world_point_target = undefined;
      world_boundry_circle = undefined;
      world_ASpoints = {};
      world_index_ASpoint_map = {};
      world_init_done = false;
      current_graph_type = "";
    }
  }

  function log_world_search_country(country_code, is_picking, topo_flag) {
    util_clear_geometry();
    if (is_picking) {
    } else {
      log_scene_reset();
    }
    $.when(log_init_world_data()).done(callback_done).fail(callback_fail);
    function callback_done() {
      var country_ASes = jsonfile_ASPostion[country_code];
      if (!country_ASes) {
        console.log("no this country in jsonfile_ASPostion");
        return;
      }
      var AStarget_attr = world_ASpoints_group.children[0].geometry.attributes;
      for (var j = 0; j < AStarget_attr.opacity.count; j++) {
        AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
        AStarget_attr.opacity.array[j] = 0.0;
      }
      // 线处理
      var linked_countrys = [];
      world_search_ASlink_group = new THREE.Group();
      var ASlink_geometry = new THREE.BufferGeometry();
      var ASlink_geometry_vertices = [];
      var ASlink_geometry_vertices_pccp = [];
      var ASlink_geometry_vertices_pp = [];
      var ASlink_geometry_vertices_ss = [];
      var ASlink_geometry_colors = [];
      var ASlink_geometry_colors_pccp = [];
      var ASlink_geometry_colors_pp = [];
      var ASlink_geometry_colors_ss = [];
      for (var ASnum_searched in country_ASes) {
        var ASnum_searched_index = world_ASpoint_index_map[ASnum_searched];
        AStarget_attr.opacity.array[ASnum_searched_index] = 1.0;
        var linkAS_nums = country_ASes[ASnum_searched][3];
        for (var i = 0; i < linkAS_nums.length; i++) {
          var country_link_ASnum = linkAS_nums[i];
          if (!world_countryAS_info[country_link_ASnum]) {
            continue;
          } else {
          }
          var ASnum_linked_index = world_ASpoint_index_map[country_link_ASnum];
          AStarget_attr.opacity.array[ASnum_linked_index] = 1.0;
          var linked_country = AS_atcountry_map[country_link_ASnum];
          if ($.inArray(linked_country, linked_countrys) == -1) {
            linked_countrys.push(linked_country);
          } else {
          }
          if (
            (linked_country == country_code && topo_flag == "in") ||
            (linked_country != country_code && topo_flag == "out") ||
            topo_flag == "both"
          ) {
          } else {
            continue;
          }
          var link_type =
            jsonfile_staticLogicEdgeInfo[
              ASnum_searched + "-" + country_link_ASnum
            ];
          if (
            (link_type[0] == "P" && link_type[1] == "C") ||
            (link_type[0] == "C" && link_type[1] == "P")
          ) {
            ASlink_geometry_vertices_pccp.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pccp.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pccp.push(0);
            ASlink_geometry_vertices_pccp.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pccp.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pccp.push(0);
            ASlink_geometry_colors_pccp.push(pccp_color.r);
            ASlink_geometry_colors_pccp.push(pccp_color.g);
            ASlink_geometry_colors_pccp.push(pccp_color.b);
            ASlink_geometry_colors_pccp.push(pccp_color.r);
            ASlink_geometry_colors_pccp.push(pccp_color.g);
            ASlink_geometry_colors_pccp.push(pccp_color.b);
          } else if (link_type[0] == "P" && link_type[1] == "P") {
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(0);
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_pp.push(0);
            ASlink_geometry_colors_pp.push(pp_color.r);
            ASlink_geometry_colors_pp.push(pp_color.g);
            ASlink_geometry_colors_pp.push(pp_color.b);
            ASlink_geometry_colors_pp.push(pp_color.r);
            ASlink_geometry_colors_pp.push(pp_color.g);
            ASlink_geometry_colors_pp.push(pp_color.b);
          } else if (link_type[0] == "S" && link_type[1] == "S") {
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[ASnum_searched][0] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[ASnum_searched][1] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(0);
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[country_link_ASnum][0] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(
              world_countryAS_info[country_link_ASnum][1] * custom_scale_level
            );
            ASlink_geometry_vertices_ss.push(0);
            ASlink_geometry_colors_ss.push(ss_color.r);
            ASlink_geometry_colors_ss.push(ss_color.g);
            ASlink_geometry_colors_ss.push(ss_color.b);
            ASlink_geometry_colors_ss.push(ss_color.r);
            ASlink_geometry_colors_ss.push(ss_color.g);
            ASlink_geometry_colors_ss.push(ss_color.b);
          } else {
            // console.log(ASnum_init+"-"+d+" has no aslink type data.");
          }
        }
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;

      for (var index in world_countrytext_group.children) {
        if (
          $.inArray(
            world_countrytext_group.children[index].name,
            linked_countrys
          ) >= 0
        ) {
          world_countrytext_group.children[index].visible = true;
        } else {
          world_countrytext_group.children[index].visible = false;
        }
      }
      if (topo_flag == "in" || topo_flag == "out" || topo_flag == "both") {
        var ASlink_geometry_vertices_temp = _.sortBy(
          [
            ASlink_geometry_vertices_pccp,
            ASlink_geometry_vertices_pp,
            ASlink_geometry_vertices_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_vertices_temp.length; i++) {
          ASlink_geometry_vertices = ASlink_geometry_vertices.concat(
            ASlink_geometry_vertices_temp[i]
          );
        }
        var ASlink_geometry_colors_temp = _.sortBy(
          [
            ASlink_geometry_colors_pccp,
            ASlink_geometry_colors_pp,
            ASlink_geometry_colors_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_colors_temp.length; i++) {
          ASlink_geometry_colors = ASlink_geometry_colors.concat(
            ASlink_geometry_colors_temp[i]
          );
        }

        ASlink_geometry.addAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array(ASlink_geometry_vertices),
            3
          )
        );
        ASlink_geometry.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(ASlink_geometry_colors), 3)
        );
        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: LOG_VSHADER_SOURCE_LINE_GLOBAL,
          fragmentShader: LOG_FSHADER_SOURCE_LINE_GLOBAL,
          transparent: true,
          depthTest: false,
        });
        var world_search_ASlink = new THREE.LineSegments(
          ASlink_geometry,
          ASlink_material
        );
        world_search_ASlink_group.add(world_search_ASlink);
        scene.add(world_ASpoints_group);
        scene.add(world_countrytext_group);
        scene.add(world_boundry_circle);
        scene.add(world_search_ASlink_group);
      } else {
        scene.add(world_ASpoints_group);
        scene.add(world_countrytext_group);
        scene.add(world_boundry_circle);
      }
    }

    function callback_fail() {
      // console.log("data processing error");
      world_ASpoints_group = undefined;
      world_countrytext_group = undefined;
      world_point_target = undefined;
      world_boundry_circle = undefined;

      world_ASpoints = {};
      world_index_ASpoint_map = {};
      world_init_done = false;
      current_graph_type = "";
    }
  }

  function log_click_in_world(raycaster, eX, eY) {
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.linePrecision = 800;
    raycaster.params.Points.threshold = 800;
    // console.log("picking in logic world");
    if (scene.children) {
      var intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        var picked_target = intersects[0].object;
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.type == "Points") {
            picked_target = intersects[i].object;
            picked_index = intersects[i].index;
            break;
          }
        }
        if (picked_target.type == "Points") {
          var country_code = picked_target.name;
          var AS_index = picked_index;
          var picked_AS = world_index_ASpoint_map[AS_index];
          var AStarget_attr =
            world_ASpoints_group.children[0].geometry.attributes;
          var ASnum_searched_index = world_ASpoint_index_map[picked_AS];
          if (AStarget_attr.opacity.array[ASnum_searched_index] == 0) {
            console.log("you can't see me.");
            return;
          } else {
          }
          if (
            timer_seted &&
            timer_target_type == "AS" &&
            timer_target_value == picked_AS
          ) {
            window.clearTimeout(sleep_function);
            timer_seted = false;
            timer_target_type = undefined;
            timer_target_value = undefined;
            switchMap.switchToAS(picked_AS);
            input_record.input_value = picked_AS;
            type_current = "asout";
            type_current_global = "";
            icon_dbclick_AS();
          } else {
            timer_seted = true;
            timer_target_type = "AS";
            timer_target_value = picked_AS;
            sleep_function = window.setTimeout(function () {
              log_world_search_AS(picked_AS, true);
              showInfo.clickAsInGlobal(picked_AS);
              input_record.input_value = picked_AS;
              type_current = "global";
              type_current_global = "global_as";
              timer_seted = false;
              icon_world_click_AS();
            }, 400);
          }
        } else if (picked_target.type == "Mesh") {
          var picked_country_name = picked_target.name;
          if (
            timer_seted &&
            timer_target_type == "country" &&
            timer_target_value == picked_country_name
          ) {
            window.clearTimeout(sleep_function);
            timer_seted = false;
            timer_target_type = undefined;
            timer_target_value = undefined;
            switchMap.switchToCountry(picked_country_name);
            input_record.input_value = picked_country_name;
            type_current = "countryin";
            type_current_global = "";
            icon_dbclick_country();
          } else {
            timer_seted = true;
            timer_target_type = "country";
            timer_target_value = picked_country_name;
            sleep_function = window.setTimeout(function () {
              log_world_search_country(picked_country_name, true);
              showInfo.clickCountryInGlobal(picked_country_name);
              input_record.input_value = picked_country_name;
              type_current = "global";
              type_current_global = "global_country";
              timer_seted = false;
              icon_world_click_country();
            }, 400);
          }
        } else {
        }
      } else {
      }
    }
  }

  // country in
  function log_init_countryin_data(country_code) {
    var dtd = $.Deferred();
    // 初始化数据完毕,直接使用缓存(处理完毕,且现在输入的和原来的一致,即换国家列表,需要重新计算)
    if (
      countryin_init_done == true &&
      countryin_current_country == country_code
    ) {
      // console.log("using country in data cache "+country_code);
      dtd.resolve();
    } else {
      loading.start();
      requirejs(
        [
          "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
          "json!" + datav_config.ajax_data_url + "staticLogicCountryInfo.json",
          "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
          "json!" + datav_config.ajax_data_url + "staticLogicEdgeInfo.json",
        ],
        function (a, b, c, d) {
          // console.log("first time to load staticLogicAsInfo.json, staticLogicCountryInfo.json");
          jsonfile_staticLogicAsInfo = a;
          jsonfile_staticLogicCountryInfo = b;
          jsonfile_ASPostion = c;
          jsonfile_staticLogicEdgeInfo = d;
          data_processing();
          // console.log("country in data processing ok");
          countryin_init_done = true;
          loading.done();
          countryin_current_country = country_code;
          dtd.resolve();
        }
      );
    }
    current_graph_type = "countryin";
    return dtd.promise();

    function data_processing() {
      countryin_topoinsquare_group = new THREE.Group();
      countryin_current_circle = new THREE.Group();
      countryin_ASpoints_group = new THREE.Group();
      countryin_countryothers_group = new THREE.Group(); // 国家圈圈
      countryin_countrytext_group = new THREE.Group(); // 国家文字
      countryin_countrylink_group = new THREE.Group(); // 国家连接线
      countryin_ASlink_group = new THREE.Group(); // 国家连接线

      countryin_ASpoints = {};
      countryin_index_ASpoint_map = {};
      countryin_ASpoint_index_map = {};
      countryin_init_done = false;

      if ($.isEmptyObject(AS_atcountry_map)) {
        _.forEach(jsonfile_staticLogicAsInfo, function (country_AS) {
          var country_code = country_AS["countryCode"];
          var ASInfoList = country_AS["ASInfoList"];
          if (ASInfoList.length == 0) {
            // 某些国家的AS列表为空, 不再展示.
            // console.log(country_code+" has no ASes, not be shown in graph.")
            return;
          }
          _.forEach(ASInfoList, function (ASInfo) {
            AS_atcountry_map[ASInfo["ASNumber"]] = country_code;
          });
        });
      } else {
      }

      var country_AS = _.find(jsonfile_staticLogicAsInfo, function (d) {
        return d["countryCode"] == country_code;
      });
      // 如果没找到这个国家
      if (country_AS == undefined) {
        console.log("Not find country " + country_code);
        return;
      } else {
        // 国家内布局
        var ASInfoList = country_AS["ASInfoList"];
        var common_degree_AS = {}; // 这个国家相同度数的AS集合
        _.forEach(ASInfoList, function (ASInfo, ASindex) {
          var AS_num = ASInfo["ASNumber"];
          var AS_Degree =
            ASInfo["ASDegrees"] == 0
              ? ASInfo["ASDegrees"] + 2
              : ASInfo["ASDegrees"] + 1;
          var topology_flag = ASInfo["topology"];
          var AS_Type = ASInfo["ASType"];
          if (common_degree_AS[AS_Degree] == undefined) {
            common_degree_AS[AS_Degree] = [[AS_num, topology_flag, AS_Type]];
          } else {
            common_degree_AS[AS_Degree].push([AS_num, topology_flag, AS_Type]);
          }
        });
        var country_arc = [0, Math.PI * 2];
        // var points_material = new THREE.PointsMaterial( { vertexColors: true,  size:600, opacity: 1.0, transparent:true} )

        var points_material = new THREE.ShaderMaterial({
          vertexShader: VSHADER_SOURCE,
          fragmentShader: FSHADER_SOURCE,
          transparent: true,
          depthTest: false,
        });

        var points_geometry = new THREE.BufferGeometry();
        var points_geometry_vertices = [];
        var points_geometry_colors = [];
        var points_geometry_sizes = [];
        var points_geometry_types = [];
        var points_geometry_opacitys = [];
        var points_geometry_ASnums = [];

        var topoin_material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
          depthTest: false,
        });
        var topoin_geometry = new THREE.Geometry();
        topoin_geometry.vertices.push(
          new THREE.Vector3(1800, 1800, 0),
          new THREE.Vector3(-1800, 1800, 0),
          new THREE.Vector3(-1800, -1800, 0),
          new THREE.Vector3(1800, -1800, 0),
          new THREE.Vector3(1800, 1800, 0)
        );
        var index_counter = 0; // index aspoint map  , index add counter
        _.forEach(common_degree_AS, function (AS_num_list, AS_Degree) {
          var each_arc_factory = d3
            .scaleLinear()
            .domain([0, AS_num_list.length])
            .range([country_arc[0], country_arc[1]]);
          _.forEach(AS_num_list, function (AS_num, AS_index) {
            var AS_arc = each_arc_factory(AS_index);
            var AS_radius =
              1 - Math.log((AS_Degree + 1) / (max_ASdegree + 1)) / Math.LN10;
            var x = Math.sin(AS_arc) * AS_radius;
            var y = Math.cos(AS_arc) * AS_radius;
            var color = new THREE.Color(color_factory(AS_Degree));
            points_geometry_vertices.push(x * custom_scale_level);
            points_geometry_vertices.push(y * custom_scale_level);
            points_geometry_vertices.push(0);
            points_geometry_colors.push(color["r"]);
            points_geometry_colors.push(color["g"]);
            points_geometry_colors.push(color["b"]);
            points_geometry_opacitys.push(1.0);
            points_geometry_sizes.push(
              1 - Math.log(1 / (max_ASdegree + 1)) / Math.LN10 - AS_radius
            );
            points_geometry_types.push(type_num_map[AS_num[2]]);
            points_geometry_ASnums.push(AS_num[0]);
            if (AS_num[1] == true) {
              // 有域内拓扑
              var topoin_square = new THREE.Line(
                topoin_geometry,
                topoin_material
              );
              topoin_square.position.x = x * custom_scale_level;
              topoin_square.position.y = y * custom_scale_level;
              topoin_square.name = AS_num[0];
              topoin_square.custom_1 = "topoin_square";
              countryin_topoinsquare_group.add(topoin_square);
            }
            countryin_ASpoints[AS_num[0]] = [x, y, 0, AS_arc, color];

            countryin_index_ASpoint_map[index_counter] = AS_num[0];
            countryin_ASpoint_index_map[AS_num[0]] = index_counter;
            index_counter = index_counter + 1;
          });
        });

        points_geometry.addAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array(points_geometry_vertices),
            3
          )
        );
        points_geometry.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(points_geometry_colors), 3)
        );
        points_geometry.addAttribute(
          "opacity",
          new THREE.BufferAttribute(
            new Float32Array(points_geometry_opacitys),
            1
          )
        );
        points_geometry.addAttribute(
          "size",
          new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
        );
        points_geometry.addAttribute(
          "size_copy",
          new THREE.BufferAttribute(new Float32Array(points_geometry_sizes), 1)
        );
        points_geometry.addAttribute(
          "type",
          new THREE.BufferAttribute(new Float32Array(points_geometry_types), 1)
        );
        points_geometry.addAttribute(
          "ASnum",
          new THREE.BufferAttribute(new Float32Array(points_geometry_ASnums), 1)
        );

        countryin_ASpoints_group = new THREE.Points(
          points_geometry,
          points_material
        );
        countryin_ASpoints_group.name = country_code;
        countryin_ASpoints_group.custom_1 = "AS";
        // AS连线
        var country_ASes = jsonfile_ASPostion[country_code];
        var ASlink_geometry = new THREE.BufferGeometry();
        var ASlink_geometry_vertices = [];
        var ASlink_geometry_vertices_pccp = [];
        var ASlink_geometry_vertices_pp = [];
        var ASlink_geometry_vertices_ss = [];
        var ASlink_geometry_colors = [];
        var ASlink_geometry_colors_pccp = [];
        var ASlink_geometry_colors_pp = [];
        var ASlink_geometry_colors_ss = [];
        for (var country_ASnum in country_ASes) {
          var country_link_ASnums = country_ASes[country_ASnum][3];
          for (var i = 0; i < country_link_ASnums.length; i++) {
            var country_link_ASnum = country_link_ASnums[i];
            if (AS_atcountry_map[country_link_ASnum] == country_code) {
              var link_type =
                jsonfile_staticLogicEdgeInfo[
                  country_ASnum + "-" + country_link_ASnum
                ];
              if (
                (link_type[0] == "P" && link_type[1] == "C") ||
                (link_type[0] == "C" && link_type[1] == "P")
              ) {
                ASlink_geometry_vertices_pccp.push(
                  countryin_ASpoints[country_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_pccp.push(
                  countryin_ASpoints[country_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_pccp.push(0);
                ASlink_geometry_vertices_pccp.push(
                  countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_pccp.push(
                  countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_pccp.push(0);
                ASlink_geometry_colors_pccp.push(pccp_color.r);
                ASlink_geometry_colors_pccp.push(pccp_color.g);
                ASlink_geometry_colors_pccp.push(pccp_color.b);
                ASlink_geometry_colors_pccp.push(pccp_color.r);
                ASlink_geometry_colors_pccp.push(pccp_color.g);
                ASlink_geometry_colors_pccp.push(pccp_color.b);
              } else if (link_type[0] == "P" && link_type[1] == "P") {
                ASlink_geometry_vertices_pp.push(
                  countryin_ASpoints[country_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_pp.push(
                  countryin_ASpoints[country_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_pp.push(0);
                ASlink_geometry_vertices_pp.push(
                  countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_pp.push(
                  countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_pp.push(0);
                ASlink_geometry_colors_pp.push(pp_color.r);
                ASlink_geometry_colors_pp.push(pp_color.g);
                ASlink_geometry_colors_pp.push(pp_color.b);
                ASlink_geometry_colors_pp.push(pp_color.r);
                ASlink_geometry_colors_pp.push(pp_color.g);
                ASlink_geometry_colors_pp.push(pp_color.b);
              } else if (link_type[0] == "S" && link_type[1] == "S") {
                ASlink_geometry_vertices_ss.push(
                  countryin_ASpoints[country_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_ss.push(
                  countryin_ASpoints[country_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_ss.push(0);
                ASlink_geometry_vertices_ss.push(
                  countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
                );
                ASlink_geometry_vertices_ss.push(
                  countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
                );
                ASlink_geometry_vertices_ss.push(0);
                ASlink_geometry_colors_ss.push(ss_color.r);
                ASlink_geometry_colors_ss.push(ss_color.g);
                ASlink_geometry_colors_ss.push(ss_color.b);
                ASlink_geometry_colors_ss.push(ss_color.r);
                ASlink_geometry_colors_ss.push(ss_color.g);
                ASlink_geometry_colors_ss.push(ss_color.b);
              } else {
                // console.log(ASnum_init+"-"+d+" has no aslink type data.");
              }
            } else {
            }
          }
        }

        var ASlink_geometry_vertices_temp = _.sortBy(
          [
            ASlink_geometry_vertices_pccp,
            ASlink_geometry_vertices_pp,
            ASlink_geometry_vertices_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_vertices_temp.length; i++) {
          ASlink_geometry_vertices = ASlink_geometry_vertices.concat(
            ASlink_geometry_vertices_temp[i]
          );
        }
        var ASlink_geometry_colors_temp = _.sortBy(
          [
            ASlink_geometry_colors_pccp,
            ASlink_geometry_colors_pp,
            ASlink_geometry_colors_ss,
          ],
          function (n) {
            return -n.length;
          }
        );
        for (var i = 0; i < ASlink_geometry_colors_temp.length; i++) {
          ASlink_geometry_colors = ASlink_geometry_colors.concat(
            ASlink_geometry_colors_temp[i]
          );
        }

        ASlink_geometry.addAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array(ASlink_geometry_vertices),
            3
          )
        );
        ASlink_geometry.addAttribute(
          "custom_color",
          new THREE.BufferAttribute(new Float32Array(ASlink_geometry_colors), 3)
        );

        var ASlink_material = new THREE.ShaderMaterial({
          vertexShader: LOG_VSHADER_SOURCE_LINE,
          fragmentShader: LOG_FSHADER_SOURCE_LINE,
          transparent: true,
          depthTest: false,
        });

        var countryin_ASlink = new THREE.LineSegments(
          ASlink_geometry,
          ASlink_material
        );
        countryin_ASlink_group.add(countryin_ASlink);
        // 国家与其它国家的连接
        // 外面的红色圈, 没有外部连接国家也要画.
        var curve_current_country = new THREE.EllipseCurve(
          0,
          0, // ax, aY
          custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10),
          custom_scale_level *
            (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10),
          0,
          2 * Math.PI, // aStartAngle, aEndAngle
          false, // aClockwise
          0 // aRotation
        );
        var path_current_country = new THREE.Path(
          curve_current_country.getPoints(5000)
        );
        var geometry_current_country =
          path_current_country.createPointsGeometry(5000);
        var material_current_country = new THREE.LineBasicMaterial({
          color: 0x176089,
        });
        countryin_current_circle.add(
          new THREE.Line(geometry_current_country, material_current_country)
        );

        var country_link = _.find(
          jsonfile_staticLogicCountryInfo,
          function (d) {
            return d["countryCode"] == country_code;
          }
        );
        // 与外部国家的
        if (!country_link) {
          console.log("can not find the country links");
          return;
        } else {
          var linkCountryList = country_link["linkCountryList"];
          var country_arc = [0, Math.PI * 2];
          var each_arc_factory = d3
            .scaleLinear()
            .domain([0, linkCountryList.length])
            .range([country_arc[0], country_arc[1]]);
          // var textMaterial = new THREE.MeshBasicMaterial({color:0xffffff});
          var linkCountryList_length = linkCountryList.length;
          _.forEach(linkCountryList, function (linkCountry, linkCountryindex) {
            var curve = new THREE.EllipseCurve(
              0,
              0, // ax, aY
              country_circle_scale(linkCountryList_length),
              country_circle_scale(linkCountryList_length), // xRadius, yRadius
              0,
              2 * Math.PI, // aStartAngle, aEndAngle
              false, // aClockwise
              0 // aRotation
            );
            var path = new THREE.Path(curve.getPoints(50));
            var geometry_circle = path.createPointsGeometry(50);
            var material_circle = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
            });
            var ellipse = new THREE.Line(geometry_circle, material_circle);
            var this_country_arc = each_arc_factory(linkCountryindex);

            ellipse.position.x =
              Math.sin(this_country_arc) *
              (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.8) *
              custom_scale_level;
            ellipse.position.y =
              Math.cos(this_country_arc) *
              (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.8) *
              custom_scale_level;
            ellipse.name = linkCountry;
            ellipse.custom_1 = "countrycircle";
            countryin_countryothers_group.add(ellipse);

            var country_texture = document.createElement("canvas");
            country_texture.height = 256;
            country_texture.width = 256;
            var ctx = country_texture.getContext("2d");
            ctx.font = "128px arival";
            ctx.fillStyle = "white";
            ctx.fillText(linkCountry, 32, 128 + 32);

            var textGeometry = new THREE.PlaneGeometry(
              country_text_scale(linkCountryList_length),
              country_text_scale(linkCountryList_length)
            );
            var material = new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(country_texture),
              transparent: true,
            });
            var textMesh = new THREE.Mesh(textGeometry, material);

            textMesh.position.x =
              Math.sin(this_country_arc) *
              (1 -
                Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                country_textpos_scale(linkCountryList_length)) *
              custom_scale_level;
            textMesh.position.y =
              Math.cos(this_country_arc) *
              (1 -
                Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                country_textpos_scale(linkCountryList_length)) *
              custom_scale_level;
            textMesh.name = linkCountry;
            textMesh.custom_1 = "countrytext";
            countryin_countrytext_group.add(textMesh);

            var material = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
            });
            var geometry = new THREE.Geometry();
            geometry.vertices.push(
              new THREE.Vector3(
                Math.sin(this_country_arc) *
                  (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
                  custom_scale_level,
                Math.cos(this_country_arc) *
                  (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
                  custom_scale_level,
                0
              ),
              new THREE.Vector3(
                Math.sin(this_country_arc) *
                  (1 -
                    Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                    0.8 -
                    country_circle_scale(linkCountryList_length) /
                      custom_scale_level) *
                  custom_scale_level,
                Math.cos(this_country_arc) *
                  (1 -
                    Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                    0.8 -
                    country_circle_scale(linkCountryList_length) /
                      custom_scale_level) *
                  custom_scale_level,
                0
              )
            );
            var country_line = new THREE.Line(geometry, material);
            country_line.name = linkCountry;
            country_line.custom_1 = "country_link";
            countryin_countrylink_group.add(country_line);
          });
        }
      }
    }
  }

  function log_countryin_init(country_code, topo_flag) {
    // 获取参数
    input_record.input_value_plus_type = "";
    input_record.input_value_plus_value = "";
    util_clear_geometry();
    log_scene_reset();
    if (!country_code) {
      console.log("Argument Error.");
      return;
    }
    camera.position.z = camera.position.z * 1.2;
    $.when(log_init_countryin_data(country_code)).done(function () {
      // dian
      var AStarget_attr = countryin_ASpoints_group.geometry.attributes;
      for (var i = 0; i < AStarget_attr.opacity.count; i++) {
        AStarget_attr.opacity.array[i] = parseFloat(1.0);
        AStarget_attr.size.array[i] = AStarget_attr.size_copy.array[i];
      }

      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;

      // 拓扑方框处理
      _.forEach(countryin_topoinsquare_group.children, function (obj) {
        obj["visible"] = true;
      });

      // 线条处理
      _.forEach(countryin_countrylink_group.children, function (obj) {
        obj.visible = true;
      });

      // 抽象国家圆圈处理
      _.forEach(countryin_countryothers_group.children, function (obj) {
        obj.visible = true;
      });

      // 国家文本处理
      _.forEach(countryin_countrytext_group.children, function (obj) {
        obj.visible = true;
      });
      if (topo_flag == true) {
        scene.add(countryin_ASpoints_group);
        scene.add(countryin_topoinsquare_group);
        scene.add(countryin_current_circle);
        scene.add(countryin_countryothers_group);
        scene.add(countryin_countrytext_group);
        scene.add(countryin_countrylink_group);
        scene.add(countryin_ASlink_group);
      } else {
        scene.add(countryin_ASpoints_group);
        scene.add(countryin_topoinsquare_group);
        scene.add(countryin_current_circle);
        scene.add(countryin_countryothers_group);
        scene.add(countryin_countrytext_group);
        scene.add(countryin_countrylink_group);
      }

      countryin_current_country = country_code;
    });
  }

  function log_countryin_search_AS(
    ASnum_searched,
    country_code,
    is_picking,
    topo_flag
  ) {
    showTags([0, 1, 2, 3, 4, 5, 6, 7]);
    util_clear_geometry();
    // 拾取的话,不还原场景相机位置,否则还原. (交互性友好, 其它picking字段同理)
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 1.2;
    }
    $.when(log_init_countryin_data(country_code)).done(function () {
      var AS_target_info = countryin_ASpoints[ASnum_searched];
      if (AS_target_info) {
        countryin_search_ASlink_group = new THREE.Group();
        var linkAS_nums = jsonfile_ASPostion[country_code][ASnum_searched][3];
        var ASlink_geometry = new THREE.BufferGeometry();
        var ASlink_geometry_vertices = [];
        var ASlink_geometry_vertices_pc = [];
        var ASlink_geometry_vertices_cp = [];
        var ASlink_geometry_vertices_pp = [];
        var ASlink_geometry_vertices_ss = [];
        var ASlink_geometry_colors = [];
        var ASlink_geometry_colors_pc = [];
        var ASlink_geometry_colors_cp = [];
        var ASlink_geometry_colors_pp = [];
        var ASlink_geometry_colors_ss = [];

        for (var i = 0; i < linkAS_nums.length; i++) {
          var country_link_ASnum = linkAS_nums[i];
          if (AS_atcountry_map[country_link_ASnum] == country_code) {
            var link_type =
              jsonfile_staticLogicEdgeInfo[
                ASnum_searched + "-" + country_link_ASnum
              ];
            if (link_type[0] == "P" && link_type[1] == "C") {
              ASlink_geometry_vertices_pc.push(
                countryin_ASpoints[ASnum_searched][0] * custom_scale_level
              );
              ASlink_geometry_vertices_pc.push(
                countryin_ASpoints[ASnum_searched][1] * custom_scale_level
              );
              ASlink_geometry_vertices_pc.push(0);
              ASlink_geometry_vertices_pc.push(
                countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
              );
              ASlink_geometry_vertices_pc.push(
                countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
              );
              ASlink_geometry_vertices_pc.push(0);
              ASlink_geometry_colors_pc.push(pc_color.r);
              ASlink_geometry_colors_pc.push(pc_color.g);
              ASlink_geometry_colors_pc.push(pc_color.b);
              ASlink_geometry_colors_pc.push(pc_color.r);
              ASlink_geometry_colors_pc.push(pc_color.g);
              ASlink_geometry_colors_pc.push(pc_color.b);
            } else if (link_type[0] == "P" && link_type[1] == "P") {
              ASlink_geometry_vertices_pp.push(
                countryin_ASpoints[ASnum_searched][0] * custom_scale_level
              );
              ASlink_geometry_vertices_pp.push(
                countryin_ASpoints[ASnum_searched][1] * custom_scale_level
              );
              ASlink_geometry_vertices_pp.push(0);
              ASlink_geometry_vertices_pp.push(
                countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
              );
              ASlink_geometry_vertices_pp.push(
                countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
              );
              ASlink_geometry_vertices_pp.push(0);
              ASlink_geometry_colors_pp.push(pp_color.r);
              ASlink_geometry_colors_pp.push(pp_color.g);
              ASlink_geometry_colors_pp.push(pp_color.b);
              ASlink_geometry_colors_pp.push(pp_color.r);
              ASlink_geometry_colors_pp.push(pp_color.g);
              ASlink_geometry_colors_pp.push(pp_color.b);
            } else if (link_type[0] == "C" && link_type[1] == "P") {
              ASlink_geometry_vertices_cp.push(
                countryin_ASpoints[ASnum_searched][0] * custom_scale_level
              );
              ASlink_geometry_vertices_cp.push(
                countryin_ASpoints[ASnum_searched][1] * custom_scale_level
              );
              ASlink_geometry_vertices_cp.push(0);
              ASlink_geometry_vertices_cp.push(
                countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
              );
              ASlink_geometry_vertices_cp.push(
                countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
              );
              ASlink_geometry_vertices_cp.push(0);
              ASlink_geometry_colors_cp.push(cp_color.r);
              ASlink_geometry_colors_cp.push(cp_color.g);
              ASlink_geometry_colors_cp.push(cp_color.b);
              ASlink_geometry_colors_cp.push(cp_color.r);
              ASlink_geometry_colors_cp.push(cp_color.g);
              ASlink_geometry_colors_cp.push(cp_color.b);
            } else if (link_type[0] == "S" && link_type[1] == "S") {
              ASlink_geometry_vertices_ss.push(
                countryin_ASpoints[ASnum_searched][0] * custom_scale_level
              );
              ASlink_geometry_vertices_ss.push(
                countryin_ASpoints[ASnum_searched][1] * custom_scale_level
              );
              ASlink_geometry_vertices_ss.push(0);
              ASlink_geometry_vertices_ss.push(
                countryin_ASpoints[country_link_ASnum][0] * custom_scale_level
              );
              ASlink_geometry_vertices_ss.push(
                countryin_ASpoints[country_link_ASnum][1] * custom_scale_level
              );
              ASlink_geometry_vertices_ss.push(0);
              ASlink_geometry_colors_ss.push(ss_color.r);
              ASlink_geometry_colors_ss.push(ss_color.g);
              ASlink_geometry_colors_ss.push(ss_color.b);
              ASlink_geometry_colors_ss.push(ss_color.r);
              ASlink_geometry_colors_ss.push(ss_color.g);
              ASlink_geometry_colors_ss.push(ss_color.b);
            } else {
              // console.log(ASnum_init+"-"+d+" has no aslink type data.");
            }
          } else {
          }
        }

        var target_ASindex = countryin_ASpoint_index_map[ASnum_searched];
        var AStarget_attr = countryin_ASpoints_group.geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
          if ($.inArray(AStarget_attr.ASnum.array[j], linkAS_nums) >= 0) {
            AStarget_attr.opacity.array[j] = parseFloat(1.0);
          } else {
            AStarget_attr.opacity.array[j] = parseFloat(0.0);
          }
        }
        AStarget_attr.opacity.array[target_ASindex] = 1.0;
        AStarget_attr.size.array[target_ASindex] =
          AStarget_attr.size_copy.array[target_ASindex] * 2;

        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;

        _.forEach(countryin_topoinsquare_group.children, function (obj) {
          if (obj["name"] == ASnum_searched) {
            obj["visible"] = true;
          } else {
            obj["visible"] = false;
          }
        });

        // 线条处理
        _.forEach(countryin_countrylink_group.children, function (obj) {
          obj.visible = false;
        });

        // 国家文本处理
        _.forEach(countryin_countrytext_group.children, function (obj) {
          obj.visible = false;
        });

        // 国家抽象圆圈
        _.forEach(countryin_countryothers_group.children, function (obj) {
          obj.visible = false;
        });

        var country2country_links = [];
        for (var country in jsonfile_ASPostion) {
          var country_ASes = jsonfile_ASPostion[country];
          var ASinfo = country_ASes[ASnum_searched];
          if (ASinfo) {
            linked_ASes = ASinfo[3];
            for (var i = 0; i < linked_ASes.length; i++) {
              var linked_country = AS_atcountry_map[linked_ASes[i]];
              if (
                linked_country &&
                linked_country != country &&
                $.inArray(linked_country, country2country_links) == -1
              ) {
                country2country_links.push(linked_country);
              } else {
              }
            }
            break;
          } else {
            continue;
          }
        }

        for (var i = country2country_links.length - 1; i >= 0; i--) {
          var linked_country = country2country_links[i];
          countryin_countrytext_group.getObjectByName(
            linked_country
          ).visible = true;
          countryin_countrylink_group.getObjectByName(
            linked_country
          ).visible = true;
          countryin_countryothers_group.getObjectByName(
            linked_country
          ).visible = true;
        }
        if (topo_flag == true) {
          var ASlink_geometry_vertices_temp = _.sortBy(
            [
              ASlink_geometry_vertices_pc,
              ASlink_geometry_vertices_pp,
              ASlink_geometry_vertices_cp,
              ASlink_geometry_vertices_ss,
            ],
            function (n) {
              return -n.length;
            }
          );
          for (var i = 0; i < ASlink_geometry_vertices_temp.length; i++) {
            ASlink_geometry_vertices = ASlink_geometry_vertices.concat(
              ASlink_geometry_vertices_temp[i]
            );
          }
          var ASlink_geometry_colors_temp = _.sortBy(
            [
              ASlink_geometry_colors_pc,
              ASlink_geometry_colors_pp,
              ASlink_geometry_colors_cp,
              ASlink_geometry_colors_ss,
            ],
            function (n) {
              return -n.length;
            }
          );
          for (var i = 0; i < ASlink_geometry_colors_temp.length; i++) {
            ASlink_geometry_colors = ASlink_geometry_colors.concat(
              ASlink_geometry_colors_temp[i]
            );
          }
          ASlink_geometry.addAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(ASlink_geometry_vertices),
              3
            )
          );
          ASlink_geometry.addAttribute(
            "custom_color",
            new THREE.BufferAttribute(
              new Float32Array(ASlink_geometry_colors),
              3
            )
          );
          var ASlink_material = new THREE.ShaderMaterial({
            vertexShader: LOG_VSHADER_SOURCE_LINE,
            fragmentShader: LOG_FSHADER_SOURCE_LINE,
            transparent: true,
            depthTest: false,
          });
          var countryin_ASlink = new THREE.LineSegments(
            ASlink_geometry,
            ASlink_material
          );
          countryin_search_ASlink_group.add(countryin_ASlink);
          scene.add(countryin_search_ASlink_group);
        } else {
        }
        scene.add(countryin_ASpoints_group);
        scene.add(countryin_topoinsquare_group);
        scene.add(countryin_current_circle);
        scene.add(countryin_countryothers_group);
        scene.add(countryin_countrytext_group);
        scene.add(countryin_countrylink_group);
      } else {
        console.log("This country Not find AS " + ASnum_searched);
      }
    });
  }

  function log_countryin_search_country(
    country_code_searched,
    country_code_init,
    is_picking
  ) {
    util_clear_geometry();
    // 拾取的话,不还原场景相机位置,否则还原. (交互性友好, 其它picking字段同理)
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 1.2;
    }
    $.when(log_init_countryin_data(country_code_init)).done(callback_done);

    function callback_done() {
      // offline test
      var target_ASes = [];
      var AStarget_attr = countryin_ASpoints_group.geometry.attributes;
      for (var i = 0; i < AStarget_attr.opacity.count; i++) {
        AStarget_attr.opacity.array[i] = parseFloat(0.0);
        var ASnum = countryin_index_ASpoint_map[i];
        var linkASes = jsonfile_ASPostion[country_code_init][ASnum][3];
        for (var j = 0; j < linkASes.length; j++) {
          var linkAS = linkASes[j];
          var linkAS_country = AS_atcountry_map[linkAS];
          if (
            linkAS_country == country_code_searched &&
            $.inArray(linkAS_country, target_ASes) == -1
          ) {
            target_ASes.push(ASnum);
          } else {
          }
        }
      }
      for (var k = 0; k < target_ASes.length; k++) {
        var i = countryin_ASpoint_index_map[target_ASes[k]];
        AStarget_attr.opacity.array[i] = parseFloat(1.0);
        AStarget_attr.size.array[i] = AStarget_attr.size_copy.array[i];
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;

      // 拓扑方框处理
      _.forEach(countryin_topoinsquare_group.children, function (obj) {
        obj["visible"] = false;
      });
      _.forEach(countryin_topoinsquare_group.children, function (obj) {
        if ($.inArray(obj.name, target_ASes) >= 0) {
          obj["visible"] = true;
        }
      });

      // 线条处理
      var children = countryin_countrylink_group.children;
      for (var i in children) {
        if (children[i]["name"] == country_code_searched) {
          children[i].visible = true;
        } else {
          children[i].visible = false;
        }
      }

      // 国家文本处理
      var children = countryin_countrytext_group.children;
      for (var i in children) {
        if (children[i]["name"] == country_code_searched) {
          children[i].visible = true;
        } else {
          children[i].visible = false;
        }
      }
      var children = countryin_countryothers_group.children;
      for (var i in children) {
        if (children[i]["name"] == country_code_searched) {
          children[i].visible = true;
        } else {
          children[i].visible = false;
        }
      }

      scene.add(countryin_ASpoints_group);
      scene.add(countryin_topoinsquare_group);
      scene.add(countryin_current_circle);
      scene.add(countryin_countryothers_group);
      scene.add(countryin_countrytext_group);
      scene.add(countryin_countrylink_group);

      countryin_current_country = country_code_init;
    }
  }

  function log_countryin_search_linkcountry(
    country_code_searched,
    country_code_init,
    is_picking
  ) {
    log_countryin_search_country(
      country_code_searched,
      country_code_init,
      is_picking
    );
  }

  function log_click_in_countryin(raycaster, eX, eY) {
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.linePrecision = 800;
    raycaster.params.Points.threshold = 800;
    // console.log("picking in logic cuontryin");
    // picking level表示拾取级别：1）在全局里拾取；2）在点击国家后拾取；3）在点击链接线后拾取
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      var picked_target = intersects[0].object;
      for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].object.type == "Points") {
          picked_target = intersects[i].object;
          picked_index = intersects[i].index;
          break;
        }
      }

      if (
        picked_target.type == "Mesh" &&
        picked_target.custom_1 == "countrytext"
      ) {
        var picked_country_name = picked_target.name;
        if (
          timer_target_type == "countrytext" &&
          timer_target_value == picked_country_name
        ) {
          clearTimeout(sleep_function);
          // console.log("dbclick "+picked_target.name);
          switchMap.switchToCountry(picked_country_name);
          type_current = "countryin";
          timer_target_type = undefined;
          timer_target_value = undefined;
          input_record.input_value = picked_country_name;
          icon_dbclick_country();
        } else {
          timer_target_type = "countrytext";
          timer_target_value = picked_country_name;
          sleep_function = window.setTimeout(function () {
            log_countryin_search_country(
              picked_country_name,
              countryin_current_country,
              true
            );
            showInfo.clickCountryInCountryin(picked_country_name);
            type_current = "countryin";
            timer_target_type = undefined;
            timer_target_value = undefined;
            input_record.input_value_plus_type = "countrytext";
            input_record.input_value_plus_value = picked_country_name;
            icon_countryin_click_country();
          }, 400);
        }
      } else if (picked_target.type == "Points") {
        var picked_AS = countryin_index_ASpoint_map[picked_index];
        var AStarget_attr = countryin_ASpoints_group.geometry.attributes;
        var ASnum_searched_index = countryin_ASpoint_index_map[picked_AS];
        if (AStarget_attr.opacity.array[ASnum_searched_index] == 0) {
          console.log("you can't see me.");
          return;
        } else {
        }
        if (timer_target_type == "AS" && timer_target_value == picked_AS) {
          clearTimeout(sleep_function);
          // console.log("dbclick "+ picked_AS);
          switchMap.switchToAS(picked_AS);
          type_current = "asout";
          timer_target_type = undefined;
          timer_target_value = undefined;
          icon_dbclick_AS();
          input_record.input_value = picked_AS;
        } else {
          timer_target_type = "AS";
          timer_target_value = picked_AS;
          timer_seted = true;
          sleep_function = window.setTimeout(function () {
            log_countryin_search_AS(picked_AS, countryin_current_country, true);
            showInfo.clickAsInCountryin(picked_AS);
            type_current = "countryin";
            timer_target_type = undefined;
            timer_target_value = undefined;
            input_record.input_value_plus_type = "AS";
            input_record.input_value_plus_value = picked_AS;
            icon_countryin_click_AS();
          }, 400);
        }
      } else if (
        (picked_target.type =
          "Line" && picked_target.custom_1 == "country_link")
      ) {
        // console.log("picked countrylink " );
        var picked_country_name = picked_target.name;
        log_countryin_search_linkcountry(
          picked_country_name,
          countryin_current_country,
          countryin_current_country,
          true
        );
        showInfo.clickCountryInCountryin(picked_country_name);
        input_record.input_value_plus_type = "countrylink";
        input_record.input_value_plus_value = picked_country_name;
        icon_countryin_click_country();
      } else {
        // console.log("picked,but not handle");
        // console.log(intersects[0]);
      }
    } else {
    }
  }

  // country out
  function log_init_countryout_data(country_code_list) {
    var dtd = $.Deferred();
    // 初始化数据完毕,直接使用缓存(处理完毕,且现在输入的和原来的一致,即换国家列表,需要重新计算)
    if (
      countryout_init_done == true &&
      countryout_current_countrylist.toString() == country_code_list.toString()
    ) {
      // console.log("using country out data cache.");
      dtd.resolve();
    } else {
      console.log(
        "初始化数据完毕,直接使用缓存(处理完毕,且现在输入的和原来的一致,即换国家列表,需要重新计算)"
      );
      loading.start();
      requirejs(
        [
          "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
          "json!" + datav_config.ajax_data_url + "staticLogicCountryInfo.json",
          "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
          "json!" + datav_config.ajax_data_url + "staticLogicEdgeInfo.json",
        ],
        function (a, b, c, d) {
          jsonfile_staticLogicAsInfo = a;
          jsonfile_staticLogicCountryInfo = b;
          jsonfile_ASPostion = c;
          jsonfile_staticLogicEdgeInfo = d;
          data_processing(country_code_list);
          loading.done();
        }
      );
    }
    current_graph_type = "countryout";
    return dtd.promise();

    function data_processing(country_code_list) {
      console.log("log_init_countryout_data() data_processing() runing")
      // console.log("processing");
      countryout_ASpoints = {}; // 存储国家内的位置
      countryout_country_centers = {};
      countryout_index_ASpoint_map = {};
      countryout_ASpoint_index_map = {};
      countryout_ASpoints_group = new THREE.Group();
      countryout_boundry_circle_group = new THREE.Group(); // 外面的红色圆圈
      countryout_center_countrytext_group = new THREE.Group(); // 国家正中间的文字
      countryout_link_country_group = new THREE.Group();
      countryout_ASlinks_group = new THREE.Group();
      if (country_code_list.length != 2) {
        // console.log("No support more than 2 countrys.");
        return;
      }
      // 点处理
      for (
        var index_graph = 0;
        index_graph < country_code_list.length;
        index_graph++
      ) {
        var country_code = country_code_list[index_graph];
        var country_AS = _.find(jsonfile_staticLogicAsInfo, function (d) {
          return d["countryCode"] == country_code;
        });
        if (country_AS == undefined) {
          // console.log("Not find country "+country_code);
          countryout_ASpoints_group = new THREE.Group();
          countryout_ASpoints = {}; // 存储国家内的位置
          countryout_country_centers = {};
          countryout_index_ASpoint_map = {};
          countryout_ASpoint_index_map = {};
          countryout_current_countrylist = [];
          return false;
        } else {
          var ASInfoList = country_AS["ASInfoList"];
          var common_degree_AS = {}; // 这个国家相同度数的AS集合
          _.forEach(ASInfoList, function (ASInfo, ASindex) {
            var AS_num = ASInfo["ASNumber"];
            var AS_Degree =
              ASInfo["ASDegrees"] == 0
                ? ASInfo["ASDegrees"] + 2
                : ASInfo["ASDegrees"] + 1;
            var topology_flag = ASInfo["topology"];
            var AS_Type = ASInfo["ASType"];
            if (common_degree_AS[AS_Degree] == undefined) {
              common_degree_AS[AS_Degree] = [[AS_num, topology_flag, AS_Type]];
            } else {
              common_degree_AS[AS_Degree].push([
                AS_num,
                topology_flag,
                AS_Type,
              ]);
            }
          });
          var country_arc = [0, Math.PI * 2];

          var points_material = new THREE.ShaderMaterial({
            vertexShader: VSHADER_SOURCE,
            fragmentShader: FSHADER_SOURCE,
            transparent: true,
            depthTest: false,
          });

          var points_geometry_vertices = [];
          var points_geometry_colors = [];
          var points_geometry_sizes = [];
          var points_geometry_types = [];
          var points_geometry_opacitys = [];
          var points_geometry_ASes = [];

          var points_geometry = new THREE.BufferGeometry();
          var arc_this_country =
            2 * Math.PI * (index_graph / country_code_list.length);
          var countryout_ASpoints_unit = {};
          var index_counter = 0;
          countryout_index_ASpoint_map[country_code] = {};
          countryout_ASpoint_index_map[country_code] = {};
          _.forEach(common_degree_AS, function (AS_num_list, AS_Degree) {
            var each_arc_factory = d3
              .scaleLinear()
              .domain([0, AS_num_list.length])
              .range([country_arc[0], country_arc[1]]);
            _.forEach(AS_num_list, function (AS_num, AS_index) {
              var AS_arc = each_arc_factory(AS_index);
              var AS_radius =
                1 - Math.log((AS_Degree + 1) / (max_ASdegree + 1)) / Math.LN10;
              if (index_graph == 0) {
                var x =
                  Math.sin(AS_arc) * AS_radius -
                  5 * (1 - Math.log(1) / Math.LN10);
                var y = Math.cos(AS_arc) * AS_radius;
              } else {
                var x =
                  Math.sin(AS_arc) * AS_radius +
                  5 * (1 - Math.log(1) / Math.LN10);
                var y = Math.cos(AS_arc) * AS_radius;
              }

              var color = new THREE.Color(color_factory(AS_Degree));

              points_geometry_vertices.push(x * custom_scale_level);
              points_geometry_vertices.push(y * custom_scale_level);
              points_geometry_vertices.push(0);
              points_geometry_colors.push(color["r"]);
              points_geometry_colors.push(color["g"]);
              points_geometry_colors.push(color["b"]);
              points_geometry_opacitys.push(0);
              points_geometry_sizes.push(
                1 - Math.log(1 / (max_ASdegree + 1)) / Math.LN10 - AS_radius
              );
              points_geometry_types.push(type_num_map[AS_num[2]]);
              points_geometry_ASes.push(AS_num[0]);
              countryout_ASpoints_unit[AS_num[0]] = [x, y, 0, AS_arc, color];
              countryout_index_ASpoint_map[country_code][index_counter] =
                AS_num[0];
              countryout_ASpoint_index_map[country_code][AS_num[0]] =
                index_counter;
              index_counter += 1;
            });
          });
          countryout_ASpoints[country_code] = countryout_ASpoints_unit;

          points_geometry.addAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_vertices),
              3
            )
          );
          points_geometry.addAttribute(
            "custom_color",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_colors),
              3
            )
          );
          points_geometry.addAttribute(
            "opacity",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_opacitys),
              1
            )
          );
          points_geometry.addAttribute(
            "opacity_copy",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_opacitys),
              1
            )
          );
          points_geometry.addAttribute(
            "size",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_sizes),
              1
            )
          );
          points_geometry.addAttribute(
            "size_copy",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_sizes),
              1
            )
          );
          points_geometry.addAttribute(
            "type",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_types),
              1
            )
          );
          points_geometry.addAttribute(
            "ASnum",
            new THREE.BufferAttribute(new Float32Array(points_geometry_ASes), 1)
          );

          var countryout_ASpoints_group_unit = new THREE.Points(
            points_geometry,
            points_material
          );
          countryout_ASpoints_group_unit.custom_1 = "countryout_ASpoints";
          countryout_ASpoints_group_unit.name = country_code;
          countryout_ASpoints_group.add(countryout_ASpoints_group_unit);
        }
      }

      // 国家文字处理
      for (
        var index_graph = 0;
        index_graph < country_code_list.length;
        index_graph++
      ) {
        var countryout_boundry_circle_group_unit = new THREE.Group();
        if (index_graph == 0) {
          var arc_this_country = Math.PI;
        } else {
          var arc_this_country = 0;
        }

        var country_code = country_code_list[index_graph];

        var curve_current_country = new THREE.EllipseCurve(
          0,
          0, // ax, aY
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
            custom_scale_level,
          (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
            custom_scale_level, // xRadius, yRadius
          0,
          2 * Math.PI, // aStartAngle, aEndAngle
          false, // aClockwise
          0 // aRotation
        );
        var path_current_country = new THREE.Path(
          curve_current_country.getPoints(5000)
        );
        var geometry_current_country =
          path_current_country.createPointsGeometry(5000);
        var material_current_country = new THREE.LineBasicMaterial({
          color: 0x176089,
        });
        countryout_boundry_circle_group_unit.add(
          new THREE.Line(geometry_current_country, material_current_country)
        );

        // 中心国家字体
        var country_texture = document.createElement("canvas");
        country_texture.height = 256;
        country_texture.width = 256;
        var ctx = country_texture.getContext("2d");
        ctx.font = "128px arival";
        ctx.fillStyle = "white";
        ctx.fillText(country_code, 32, 128 + 32);

        var geometry = new THREE.PlaneGeometry(50000, 50000);
        var textMaterial = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(country_texture),
          transparent: true,
        });
        var center_textMesh = new THREE.Mesh(geometry, textMaterial);
        center_textMesh.position.y =
          custom_scale_level * (Math.sin(arc_this_country) * 10);
        center_textMesh.position.x =
          custom_scale_level * (Math.cos(arc_this_country) * 10);
        center_textMesh.custom_1 = "countryout_center_countrytext";
        center_textMesh.name = country_code;
        countryout_center_countrytext_group.add(center_textMesh);
        countryout_boundry_circle_group_unit.position.y =
          custom_scale_level * (Math.sin(arc_this_country) * 5);
        countryout_boundry_circle_group_unit.position.x =
          custom_scale_level * (Math.cos(arc_this_country) * 5);
        countryout_boundry_circle_group_unit.name = country_code;
        countryout_country_centers[country_code] = {
          x: custom_scale_level * (Math.sin(arc_this_country) * 5),
          y: custom_scale_level * (Math.cos(arc_this_country) * 5),
        };
        countryout_boundry_circle_group.add(
          countryout_boundry_circle_group_unit
        );
      }
      // 国家连接
      var country_link_country_material = new THREE.LineBasicMaterial({
        color: 0xffffff,
      });
      for (var i = 0; i < country_code_list.length; i++) {
        var country_link_countrys = _.find(
          jsonfile_staticLogicCountryInfo,
          function (d) {
            return d["countryCode"] == country_code_list[i];
          }
        );
        if (country_link_countrys) {
          for (var j = country_code_list.length - 1; j > i; j--) {
            var country_link_country = _.find(
              country_link_countrys.linkCountryList,
              function (d) {
                return d == country_code_list[j];
              }
            );
            if (country_link_country) {
              var country_i = countryout_country_centers[country_code_list[i]];
              var country_j = countryout_country_centers[country_code_list[j]];
              var country_link_country_geometry = new THREE.Geometry();
              country_link_country_geometry.vertices.push(
                new THREE.Vector3(
                  country_i["y"] / 3.5,
                  country_i["x"] / 3.5,
                  0
                ),
                new THREE.Vector3(country_j["y"] / 3.5, country_j["x"] / 3.5, 0)
              );
              var countryout_link_country_unit = new THREE.LineSegments(
                country_link_country_geometry,
                country_link_country_material
              );
              countryout_link_country_unit.custom_1 = "countryout_link_country";
              countryout_link_country_unit.from = country_code_list[i];
              countryout_link_country_unit.to = country_code_list[j];
              countryout_link_country_group.add(countryout_link_country_unit);
            } else {
              // console.log("not link "+country_code_list[i]+" "+country_code_list[j]);
            }
          }
        } else {
          // console.log("no country"+country_code_list[i]+" in json ");
        }
      }
      // AS连线
      var country_code_one = country_code_list[0]; // 单向处理即可
      var country_code_two = country_code_list[1];
      var country_ASes_json_one = jsonfile_ASPostion[country_code_one];
      var country_ASes_json_two = jsonfile_ASPostion[country_code_two];
      var country_ASes_one = countryout_ASpoints[country_code_one];
      var country_ASes_two = countryout_ASpoints[country_code_two];

      var query_ASes_1 = [];
      var query_ASes_2 = [];
      var line_pc = [];
      var line_pp = [];
      var line_cp = [];
      var line_ss = [];
      for (var AS_num in country_ASes_json_one) {
        var linkedASes = country_ASes_json_one[AS_num][3];
        for (var i = 0; i < linkedASes.length; i++) {
          var linkAS_num = linkedASes[i];
          var linkAS_info = country_ASes_two[linkAS_num];
          var link_type =
            jsonfile_staticLogicEdgeInfo[AS_num + "-" + linkAS_num];
          if (link_type && linkAS_info) {
            var AS_info = country_ASes_one[AS_num];
            var countryout_ASlinks_geom = new THREE.Geometry();

            countryout_ASlinks_geom.vertices.push(
              new THREE.Vector3(
                AS_info[0] * custom_scale_level,
                AS_info[1] * custom_scale_level,
                0
              )
            );
            countryout_ASlinks_geom.vertices.push(
              new THREE.Vector3(
                linkAS_info[0] * custom_scale_level,
                linkAS_info[1] * custom_scale_level,
                0
              )
            );
            if (link_type[0] == "P" && link_type[1] == "C") {
              var countryout_ASlink_material = new THREE.LineBasicMaterial({
                color: 0xed2f3d,
                linewidth: 2,
                transparent: false,
                depthTest: false,
              });
              var line = new THREE.Line(
                countryout_ASlinks_geom,
                countryout_ASlink_material
              );
              line.name = AS_num + "-" + linkAS_num;
              line_pc.push(line);
            } else if (link_type[0] == "P" && link_type[1] == "P") {
              var countryout_ASlink_material = new THREE.LineBasicMaterial({
                color: 0x009900,
                linewidth: 2,
                transparent: false,
                depthTest: false,
              });
              var line = new THREE.Line(
                countryout_ASlinks_geom,
                countryout_ASlink_material
              );
              line.name = AS_num + "-" + linkAS_num;
              line_pp.push(line);
            } else if (link_type[0] == "C" && link_type[1] == "P") {
              var countryout_ASlink_material = new THREE.LineBasicMaterial({
                color: 0x6bcaf2,
                linewidth: 2,
                transparent: false,
                depthTest: false,
              });
              var line = new THREE.Line(
                countryout_ASlinks_geom,
                countryout_ASlink_material
              );
              line.name = AS_num + "-" + linkAS_num;
              line_cp.push(line);
            } else if (link_type[0] == "S" && link_type[1] == "S") {
              var countryout_ASlink_material = new THREE.LineBasicMaterial({
                color: 0xffff00,
                linewidth: 2,
                transparent: false,
                depthTest: false,
              });
              var line = new THREE.Line(
                countryout_ASlinks_geom,
                countryout_ASlink_material
              );
              line.name = AS_num + "-" + linkAS_num;
              line_ss.push(line);
            } else {
              // console.log(ASnum_init+"-"+d+" has no aslink type data.");
            }
            query_ASes_1.push(AS_num);
            query_ASes_2.push(linkAS_num);
          } else {
          }
        }
      }
      var ASlink_temp = _.sortBy(
        [line_pc, line_pp, line_cp, line_ss],
        function (n) {
          return -n.length;
        }
      );
      // console.log(ASlink_temp);
      for (var i = 0; i < ASlink_temp.length; i++) {
        for (var j = 0; j < ASlink_temp[i].length; j++) {
          countryout_ASlinks_group.add(ASlink_temp[i][j]);
        }
      }
      // console.log(query_ASes_1);
      // console.log(query_ASes_2);
      for (var i = 0; i < countryout_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          countryout_ASpoints_group.children[i].geometry.attributes;
        if (countryout_ASpoints_group.children[i].name == country_code_one) {
          for (var j = 0; j < query_ASes_1.length; j++) {
            var target_ASindex =
              countryout_ASpoint_index_map[country_code_one][query_ASes_1[j]];
            AStarget_attr.opacity.array[target_ASindex] = parseFloat(1.0);
            AStarget_attr.opacity_copy.array[target_ASindex] = parseFloat(1.0);
          }
        } else if (
          countryout_ASpoints_group.children[i].name == country_code_two
        ) {
          for (var j = 0; j < query_ASes_2.length; j++) {
            var target_ASindex =
              countryout_ASpoint_index_map[country_code_two][query_ASes_2[j]];
            AStarget_attr.opacity.array[target_ASindex] = parseFloat(1.0);
            AStarget_attr.opacity_copy.array[target_ASindex] = parseFloat(1.0);
          }
        } else {
          // console.log("error");
        }
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
      }
      for (
        var i = 0;
        i < countryout_center_countrytext_group.children.length;
        i++
      ) {
        countryout_center_countrytext_group.children[i].material.opacity = 1.0;
      }
      countryout_init_done = true;
      countryout_current_countrylist = country_code_list;
      dtd.resolve();
    }
  }

  function log_countryout_init(country_code_list, is_picking, topo_flag) {
    input_record.input_value_plus_type = "";
    input_record.input_value_plus_value = "";
    util_clear_geometry();
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 2.5;
    }
    $.when(log_init_countryout_data(country_code_list)).done(function () {
      for (var i = 0; i < countryout_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          countryout_ASpoints_group.children[i].geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.opacity.array[j] = AStarget_attr.opacity_copy.array[j];
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
        }
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
      }
      for (
        var i = 0;
        i < countryout_center_countrytext_group.children.length;
        i++
      ) {
        countryout_center_countrytext_group.children[i].material.opacity = 1.0;
      }
      for (var i = 0; i < countryout_ASlinks_group.children.length; i++) {
        countryout_ASlinks_group.children[i].visible = true;
      }
      scene.add(countryout_ASpoints_group);
      scene.add(countryout_boundry_circle_group);
      scene.add(countryout_center_countrytext_group);
      scene.add(countryout_link_country_group);
      if (topo_flag) {
        scene.add(countryout_ASlinks_group);
      } else {
      }
      countryout_picking_value = country_code_list;
    });
  }

  function log_countryout_search_AS(
    AS_num,
    country_code_list,
    is_picking,
    topo_flag
  ) {
    showTags([0, 1, 2, 4, 5, 6, 7]);
    util_clear_geometry();
    // 拾取的话,不还原场景相机位置,否则还原.(交互性友好, 其它picking字段同理)
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 2;
    }
    $.when(log_init_countryout_data(country_code_list)).done(callback_done);

    function callback_done() {
      for (index in countryout_center_countrytext_group.children) {
        countryout_center_countrytext_group.children[
          index
        ].material.opacity = 1.0;
      }

      for (var i = 0; i < countryout_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          countryout_ASpoints_group.children[i].geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.opacity.array[j] = parseFloat(0.0);
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
        }
      }
      for (var i = 0; i < countryout_ASlinks_group.children.length; i++) {
        countryout_ASlinks_group.children[i].visible = false;
      }
      for (var i = 0; i < countryout_ASpoints_group.children.length; i++) {
        var country_name = countryout_ASpoints_group.children[i].name;
        if (countryout_ASpoints[country_name][AS_num]) {
          var AStarget_attr =
            countryout_ASpoints_group.children[i].geometry.attributes;
          var target_ASindex =
            countryout_ASpoint_index_map[country_name][AS_num];
          AStarget_attr.opacity.array[target_ASindex] = 1.0;
          AStarget_attr.size.array[target_ASindex] =
            AStarget_attr.size.array[target_ASindex] * 2;

          var target_AS_links = jsonfile_ASPostion[country_name][AS_num][3];
          if (i == 0) {
            var AStarget_attr_peer =
              countryout_ASpoints_group.children[1].geometry.attributes;
          } else {
            var AStarget_attr_peer =
              countryout_ASpoints_group.children[0].geometry.attributes;
          }
          for (var j = 0; j < AStarget_attr_peer.opacity.count; j++) {
            var ASnum_peer = AStarget_attr_peer.ASnum.array[j];
            if ($.inArray(ASnum_peer, target_AS_links) >= 0) {
              AStarget_attr_peer.opacity.array[j] = parseFloat(1.0);
              var target_link = countryout_ASlinks_group.getObjectByName(
                AS_num + "-" + ASnum_peer
              );
              if (target_link) {
                target_link.visible = true;
              } else {
                countryout_ASlinks_group.getObjectByName(
                  ASnum_peer + "-" + AS_num
                ).visible = true;
              }
            } else {
            }
          }
        } else {
        }
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;
      AStarget_attr_peer.size.needsUpdate = true;
      AStarget_attr_peer.opacity.needsUpdate = true;
      scene.add(countryout_ASpoints_group);
      scene.add(countryout_boundry_circle_group);
      scene.add(countryout_center_countrytext_group);
      scene.add(countryout_link_country_group);
      if (topo_flag) {
        scene.add(countryout_ASlinks_group);
      } else {
      }
    }
  }

  function log_countryout_search_country(
    country_code,
    country_code_list,
    is_picking
  ) {
    util_clear_geometry();
    // 拾取的话,不还原场景相机位置,否则还原. (交互性友好, 其它picking字段同理)
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 2.5;
    }
    $.when(log_init_countryout_data(country_code_list)).done(callback_done);

    function callback_done() {
      for (var i = 0; i < countryout_ASpoints_group.children.length; i++) {
        var AStarget_attr =
          countryout_ASpoints_group.children[i].geometry.attributes;
        if (countryout_ASpoints_group.children[i].name == country_code) {
          for (var j = 0; j < AStarget_attr.opacity.count; j++) {
            AStarget_attr.opacity.array[j] =
              AStarget_attr.opacity_copy.array[j];
            AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
          }
        } else {
          for (var j = 0; j < AStarget_attr.opacity.count; j++) {
            AStarget_attr.opacity.array[j] = 0;
            AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
          }
        }
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
      }

      for (
        var i = 0;
        i < countryout_center_countrytext_group.children.length;
        i++
      ) {
        if (
          countryout_center_countrytext_group.children[i].name == country_code
        ) {
          countryout_center_countrytext_group.children[
            i
          ].material.opacity = 1.0;
        } else {
          countryout_center_countrytext_group.children[
            i
          ].material.opacity = 0.2;
        }
      }

      scene.add(countryout_link_country_group);
      scene.add(countryout_ASpoints_group);
      scene.add(countryout_boundry_circle_group);
      scene.add(countryout_center_countrytext_group);
    }
  }

  function log_countryout_search_linkcountry(country_code_list, is_picking) {
    countryout_init(country_code_list, is_picking);
  }

  function log_click_in_countryout(raycaster, eX, eY) {
    // countryout_picking_value
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.linePrecision = 800;
    raycaster.params.Points.threshold = 800;
    // console.log("picking in logic cuontryout");
    if (scene.children) {
      var intersects = raycaster.intersectObjects(scene.children, true);
      // console.log(intersects);
      if (intersects.length > 0) {
        var picked_target = intersects[0].object;
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.type == "Points") {
            picked_target = intersects[i].object;
            picked_index = intersects[i].index;
            break;
          }
        }
        if (
          picked_target.type == "Mesh" &&
          picked_target.custom_1 == "countryout_center_countrytext"
        ) {
          // console.log(picked_target.name);
          if (
            timer_target_type == "countrytext" &&
            timer_target_value == picked_target.name
          ) {
            clearTimeout(sleep_function);
            timer_target_type = undefined;
            timer_target_value = undefined;
            switchMap.switchToCountry(picked_target.name);
            type_current = "countryin";
            input_record.input_value = picked_target.name;
            icon_dbclick_country();
          } else {
            timer_target_type = "countrytext";
            timer_target_value = picked_target.name;
            sleep_function = window.setTimeout(function () {
              log_countryout_search_country(
                picked_target.name,
                countryout_picking_value,
                true
              );
              showInfo.clickCountryInCountryout(picked_target.name);
              type_current = "countryout";
              timer_target_type = undefined;
              timer_target_value = undefined;
              input_record.input_value_plus_type = "countrytext";
              input_record.input_value_plus_value = picked_target.name;
              icon_countryout_click_country();
            }, 400);
          }
        } else if (
          picked_target.type == "LineSegments" &&
          picked_target.custom_1 == "countryout_link_country"
        ) {
          log_countryout_init([picked_target.from, picked_target.to], true);
          showInfo.clickLineInCountryout(picked_target.from);
          input_record.input_value_plus_type = "countrylink";
          input_record.input_value_plus_value = picked_target.from;
          icon_countryout_click_countrylink();
        } else if (picked_target.type == "Points") {
          // console.log(picked_target.name);
          var picked_AS =
            countryout_index_ASpoint_map[picked_target.name][picked_index];
          var AStarget_attr = picked_target.geometry.attributes;
          var ASnum_searched_index =
            countryout_ASpoint_index_map[picked_target.name][picked_AS];
          if (
            ASnum_searched_index == undefined ||
            AStarget_attr.opacity.array[ASnum_searched_index] == 0
          ) {
            console.log("you can't see me.");
            return;
          } else {
          }
          if (timer_target_type == "AS" && timer_target_value == picked_AS) {
            clearTimeout(sleep_function);
            timer_target_type = undefined;
            timer_target_value = undefined;
            switchMap.switchToAS(picked_AS);
            type_current = "asout";
            icon_dbclick_AS();
            input_record.input_value = picked_AS;
          } else {
            timer_target_type = "AS";
            timer_target_value = picked_AS;
            sleep_function = window.setTimeout(function () {
              log_countryout_search_AS(
                picked_AS,
                countryout_picking_value,
                true
              );
              showInfo.clickAsInCountryout(picked_AS);
              type_current = "countryout";
              timer_target_type = undefined;
              timer_target_value = undefined;
              input_record.input_value_plus_type = "AS";
              input_record.input_value_plus_value = picked_AS;
              icon_countryout_click_AS();
            }, 400);
          }
        } else {
          // console.log("picked others");
        }
      }
    }
  }

  // AS out
  function log_init_ASout_data(ASnum_init) {
    var dtd = $.Deferred();
    // 初始化数据完毕,直接使用缓存(处理完毕,且现在输入的和原来的一致,即换国家列表,需要重新计算)
    if (ASout_init_done == true && ASout_current_AS == ASnum_init) {
      // console.log("using AS out data cache.");
      dtd.resolve();
    } else {
      loading.start();
      requirejs(
        [
          "json!" + datav_config.ajax_data_url + "staticLogicAsInfo.json",
          "json!" + datav_config.ajax_data_url + "ASPostion_v5.json",
          "json!" + datav_config.ajax_data_url + "staticLogicEdgeInfo.json",
        ],
        function (a, b, c) {
          jsonfile_staticLogicAsInfo = a;
          jsonfile_ASPostion = b;
          jsonfile_staticLogicEdgeInfo = c;
          data_processing(ASnum_init);
          loading.done();
          current_graph_type = "asout";
        }
      );
    }

    return dtd.promise();

    function data_processing(ASnum_init) {
      if ($.isEmptyObject(AS_atcountry_map)) {
        _.forEach(jsonfile_staticLogicAsInfo, function (country_AS) {
          var country_code = country_AS["countryCode"];
          var ASInfoList = country_AS["ASInfoList"];
          if (ASInfoList.length == 0) {
            // 某些国家的AS列表为空, 不再展示.
            // console.log(country_code+" has no ASes, not be shown in graph.")
            return;
          }
          _.forEach(ASInfoList, function (ASInfo) {
            AS_atcountry_map[ASInfo["ASNumber"]] = country_code;
          });
        });
      } else {
      }

      var country_code = AS_atcountry_map[ASnum_init];
      if (!country_code) {
        console.log(ASnum_init + " not find in graph.");
        return;
      } else {
      }
      callback(country_code);
      var country2country_links = [];
      for (var country in jsonfile_ASPostion) {
        var country_ASes = jsonfile_ASPostion[country];
        var ASinfo = country_ASes[ASnum_init];
        if (ASinfo) {
          linked_ASes = ASinfo[3];
          for (var i = 0; i < linked_ASes.length; i++) {
            var linked_country = AS_atcountry_map[linked_ASes[i]];
            if (
              linked_country &&
              linked_country != country &&
              $.inArray(linked_country, country2country_links) == -1
            ) {
              country2country_links.push(linked_country);
            } else {
            }
          }
          break;
        } else {
          continue;
        }
      }
      callback_2(country2country_links);
    }

    function callback(country_code) {
      var country_ASes = jsonfile_ASPostion[country_code];
      ASout_ASpoints = {}; // 存储域内的位置
      ASout_index_ASpoint_map = {};
      ASout_ASpoint_index_map = {};
      ASout_index_ASlink_map = {};
      ASout_topoinsquare_group = new THREE.Group();
      ASout_ASlink_group = new THREE.Group();
      ASout_ASpoints_group = new THREE.Group();

      if (country_ASes) {
        var linkedAS_infos = country_ASes[ASnum_init];
        if (linkedAS_infos) {
          linkedASes = linkedAS_infos[3];
        } else {
          console.log(ASnum_init + " no AS links");
          ASout_boundry_circle = new THREE.Group();
          ASout_countryothers_group = new THREE.Group();
          ASout_countrytext_group = new THREE.Group(); // 国家文字
          ASout_countrylink_group = new THREE.Group(); // 国家连接线
          return false;
        }

        // 修改
        var country_AS = _.find(jsonfile_staticLogicAsInfo, function (d) {
          return d["countryCode"] == country_code;
        });
        // var points_material = new THREE.PointsMaterial( { vertexColors: true, size:1000, opacity: 0.8, transparent:true} )

        var points_material = new THREE.ShaderMaterial({
          vertexShader: VSHADER_SOURCE,
          fragmentShader: FSHADER_SOURCE,
          transparent: true,
          depthTest: false,
        });
        var points_geometry = new THREE.BufferGeometry();
        var points_geometry_vertices = [];
        var points_geometry_colors = [];
        var points_geometry_sizes = [];
        var points_geometry_types = [];
        var points_geometry_opacitys = [];

        if (country_AS == undefined) {
          console.log("Not find country ASes " + country_code);
        } else {
          var ASInfoList = country_AS["ASInfoList"];
          var common_degree_AS = {}; // 这个国家相同度数的AS集合
          _.forEach(ASInfoList, function (ASInfo, ASindex) {
            var AS_num = ASInfo["ASNumber"];
            var AS_Degree =
              ASInfo["ASDegrees"] == 0
                ? ASInfo["ASDegrees"] + 2
                : ASInfo["ASDegrees"] + 1;
            var topology_flag = ASInfo["topology"];
            var AS_Type = ASInfo["ASType"];
            if (common_degree_AS[AS_Degree] == undefined) {
              common_degree_AS[AS_Degree] = [[AS_num, topology_flag, AS_Type]];
            } else {
              common_degree_AS[AS_Degree].push([
                AS_num,
                topology_flag,
                AS_Type,
              ]);
            }
          });
          var country_arc = [0, Math.PI * 2];
          var index_counter = 0;
          _.forEach(common_degree_AS, function (AS_num_list, AS_Degree) {
            var each_arc_factory = d3
              .scaleLinear()
              .domain([0, AS_num_list.length])
              .range([country_arc[0], country_arc[1]]);
            _.forEach(AS_num_list, function (AS_num, AS_index) {
              var is_this_country;
              if (AS_num[0] == ASnum_init) {
                is_this_country = 1;
              } else {
                is_this_country = _.findIndex(linkedASes, function (linkedAS) {
                  return linkedAS == AS_num[0];
                });
              }

              if (is_this_country < 0) {
              } else {
                var AS_arc = each_arc_factory(AS_index);
                var AS_radius =
                  1 -
                  Math.log((AS_Degree + 1) / (max_ASdegree + 1)) / Math.LN10;
                var x = Math.sin(AS_arc) * AS_radius;
                var y = Math.cos(AS_arc) * AS_radius;
                var color = new THREE.Color(color_factory(AS_Degree));
                points_geometry_vertices.push(x * custom_scale_level);
                points_geometry_vertices.push(y * custom_scale_level);
                points_geometry_vertices.push(0);
                points_geometry_colors.push(color["r"]);
                points_geometry_colors.push(color["g"]);
                points_geometry_colors.push(color["b"]);
                points_geometry_opacitys.push(1);
                points_geometry_sizes.push(
                  (1 -
                    Math.log(1 / (max_ASdegree + 1)) / Math.LN10 -
                    AS_radius) *
                    1.5
                );
                points_geometry_types.push(type_num_map[AS_num[2]]);

                if (AS_num[1] == true) {
                  var topoin_material = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                  });
                  var topoin_geometry = new THREE.Geometry();
                  topoin_geometry.vertices.push(
                    new THREE.Vector3(3200, 3200, 0),
                    new THREE.Vector3(-3200, 3200, 0),
                    new THREE.Vector3(-3200, -3200, 0),
                    new THREE.Vector3(3200, -3200, 0),
                    new THREE.Vector3(3200, 3200, 0)
                  );
                  var topoin_square = new THREE.Line(
                    topoin_geometry,
                    topoin_material
                  );
                  topoin_square.position.x = x * custom_scale_level;
                  topoin_square.position.y = y * custom_scale_level;
                  topoin_square.name = AS_num[0];
                  ASout_topoinsquare_group.add(topoin_square);
                }
                ASout_ASpoints[AS_num[0]] = [x, y, 0, AS_arc, color];

                // 索引与AS号的对应关系
                ASout_index_ASpoint_map[index_counter] = AS_num[0];
                ASout_ASpoint_index_map[AS_num[0]] = index_counter;
                index_counter += 1;
              }
            });
          });

          points_geometry.addAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_vertices),
              3
            )
          );
          points_geometry.addAttribute(
            "custom_color",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_colors),
              3
            )
          );
          points_geometry.addAttribute(
            "opacity",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_opacitys),
              1
            )
          );
          points_geometry.addAttribute(
            "size",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_sizes),
              1
            )
          );
          points_geometry.addAttribute(
            "size_copy",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_sizes),
              1
            )
          );
          points_geometry.addAttribute(
            "type",
            new THREE.BufferAttribute(
              new Float32Array(points_geometry_types),
              1
            )
          );
          ASout_ASpoints_group = new THREE.Points(
            points_geometry,
            points_material
          );

          var index_counter = 0;
          var target_AS = ASout_ASpoints[ASnum_init];
          var line_pc = [];
          var line_pp = [];
          var line_cp = [];
          var line_ss = [];
          _.forEach(linkedASes, function (d) {
            if (ASout_ASpoints[d]) {
              // 国内的
              var ASout_ASlink_geometry = new THREE.Geometry();
              ASout_ASlink_geometry.vertices.push(
                new THREE.Vector3(
                  ASout_ASpoints[d][0] * custom_scale_level,
                  ASout_ASpoints[d][1] * custom_scale_level,
                  0
                ),
                new THREE.Vector3(
                  target_AS[0] * custom_scale_level,
                  target_AS[1] * custom_scale_level,
                  0
                )
              );
              var link_type =
                jsonfile_staticLogicEdgeInfo[ASnum_init + "-" + d];
              if (link_type[0] == "P" && link_type[1] == "C") {
                var ASout_ASlink_material = new THREE.LineBasicMaterial({
                  color: 0x6bcaf2,
                  linewidth: 2,
                  transparent: true,
                });
                var line = new THREE.Line(
                  ASout_ASlink_geometry,
                  ASout_ASlink_material
                );
                line_pc.push(line);
              } else if (link_type[0] == "P" && link_type[1] == "P") {
                var ASout_ASlink_material = new THREE.LineBasicMaterial({
                  color: 0x009900,
                  linewidth: 2,
                  transparent: true,
                });
                var line = new THREE.Line(
                  ASout_ASlink_geometry,
                  ASout_ASlink_material
                );
                line_pp.push(line);
              } else if (link_type[0] == "C" && link_type[1] == "P") {
                var ASout_ASlink_material = new THREE.LineBasicMaterial({
                  color: 0xed2f3d,
                  linewidth: 2,
                  transparent: true,
                });
                var line = new THREE.Line(
                  ASout_ASlink_geometry,
                  ASout_ASlink_material
                );
                line_cp.push(line);
              } else if (link_type[0] == "S" && link_type[1] == "S") {
                var ASout_ASlink_material = new THREE.LineBasicMaterial({
                  color: 0xffff00,
                  linewidth: 2,
                  transparent: true,
                });
                var line = new THREE.Line(
                  ASout_ASlink_geometry,
                  ASout_ASlink_material
                );
                line_ss.push(line);
              } else {
                // console.log(ASnum_init+"-"+d+" has no aslink type data.");
              }
              line.name = d;
              line.custom_1 = "AS2AS";

              // ASout_ASlink_group.add(line);
              ASout_index_ASlink_map[index_counter] = d;
              index_counter += 1;
            } else {
            }
          });

          var ASlink_temp = _.sortBy(
            [line_pc, line_pp, line_cp, line_ss],
            function (n) {
              return -n.length;
            }
          );
          // console.log(ASlink_temp);
          for (var i = 0; i < ASlink_temp.length; i++) {
            for (var j = 0; j < ASlink_temp[i].length; j++) {
              ASout_ASlink_group.add(ASlink_temp[i][j]);
            }
          }
        }
      } else {
        // console.log("this AS no country");
        ASout_boundry_circle = new THREE.Group();
        ASout_countryothers_group = new THREE.Group();
        ASout_countrytext_group = new THREE.Group(); // 国家文字
        ASout_countrylink_group = new THREE.Group(); // 国家连接线
      }
    }

    function callback_2(country2country_links) {
      // 外面的红色圈
      ASout_boundry_circle = new THREE.Group();
      ASout_countryothers_group = new THREE.Group();
      ASout_countrytext_group = new THREE.Group(); // 国家文字
      ASout_countrylink_group = new THREE.Group(); // 国家连接线
      var curve_current_country = new THREE.EllipseCurve(
        0,
        0, // ax, aY
        (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
          custom_scale_level,
        (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
          custom_scale_level, // xRadius, yRadius
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      );
      var path_current_country = new THREE.Path(
        curve_current_country.getPoints(300)
      );
      var geometry_current_country =
        path_current_country.createPointsGeometry(300);
      var material_current_country = new THREE.LineBasicMaterial({
        color: 0x176089,
      });
      ASout_boundry_circle.add(
        new THREE.Line(geometry_current_country, material_current_country)
      );
      ASout_index_countrylink_map = {};

      if (country2country_links.length == 0) {
        // console.log("can not find the AS's country links");
      } else {
        var country_arc = [0, Math.PI * 2];
        var each_arc_factory = d3
          .scaleLinear()
          .domain([0, country2country_links.length])
          .range([country_arc[0], country_arc[1]]);
        var curve = new THREE.EllipseCurve(
          0,
          0, // ax, aY
          country_circle_scale(country2country_links.length),
          country_circle_scale(country2country_links.length), // xRadius, yRadius
          0,
          2 * Math.PI, // aStartAngle, aEndAngle
          false, // aClockwise
          0 // aRotation
        );
        var path = new THREE.Path(curve.getPoints(50));
        var geometry_circle = path.createPointsGeometry(50);
        // do something with the font

        var index_counter = 0;
        _.forEach(
          country2country_links,
          function (linkCountry, linkCountryindex) {
            var material_circle = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
            });
            var ellipse = new THREE.Line(geometry_circle, material_circle);
            var this_country_arc = each_arc_factory(linkCountryindex);
            ellipse.position.x =
              Math.sin(this_country_arc) *
              (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.8) *
              custom_scale_level;
            ellipse.position.y =
              Math.cos(this_country_arc) *
              (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.8) *
              custom_scale_level;
            ellipse.name = linkCountry;
            ASout_countryothers_group.add(ellipse);

            var country_texture = document.createElement("canvas");
            country_texture.height = 256;
            country_texture.width = 256;
            var ctx = country_texture.getContext("2d");
            ctx.font = "128px arival";
            ctx.fillStyle = "white";
            ctx.fillText(linkCountry, 32, 128 + 32);

            var geometry = new THREE.PlaneGeometry(
              country_text_scale(country2country_links.length),
              country_text_scale(country2country_links.length)
            );
            var text_material = new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(country_texture),
              transparent: true,
            });
            var textMesh = new THREE.Mesh(geometry, text_material);

            textMesh.position.x =
              Math.sin(this_country_arc) *
              (1 -
                Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                country_textpos_scale(country2country_links.length)) *
              custom_scale_level;
            textMesh.position.y =
              Math.cos(this_country_arc) *
              (1 -
                Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                country_textpos_scale(country2country_links.length)) *
              custom_scale_level;
            textMesh.name = linkCountry;
            ASout_countrytext_group.add(textMesh);

            var countrylink_material = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
            });
            var geometry = new THREE.Geometry();
            geometry.vertices.push(
              new THREE.Vector3(
                Math.sin(this_country_arc) *
                  (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
                  custom_scale_level,
                Math.cos(this_country_arc) *
                  (1 - Math.log(16 / (max_ASdegree + 1)) / Math.LN10 + 0.1) *
                  custom_scale_level,
                0
              ),
              new THREE.Vector3(
                Math.sin(this_country_arc) *
                  (1 -
                    Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                    0.8 -
                    country_circle_scale(country2country_links.length) /
                      custom_scale_level) *
                  custom_scale_level,
                Math.cos(this_country_arc) *
                  (1 -
                    Math.log(16 / (max_ASdegree + 1)) / Math.LN10 +
                    0.8 -
                    country_circle_scale(country2country_links.length) /
                      custom_scale_level) *
                  custom_scale_level,
                0
              )
            );
            var country_line = new THREE.Line(geometry, countrylink_material);
            country_line.name = linkCountry;
            country_line.custom_1 = "country2country";
            ASout_countrylink_group.add(country_line);

            ASout_index_countrylink_map[index_counter] = linkCountry;
            index_counter += 1;
          }
        );
      }
      ASout_init_done = true;
      ASout_current_AS = ASnum_init;
      dtd.resolve();
    }
  }

  function log_ASout_init(ASnum_init, topo_flag) {
    input_record.input_value_plus_type = "";
    input_record.input_value_plus_value = "";
    util_clear_geometry();
    log_scene_reset();
    camera.position.z = camera.position.z * 1.2;
    $.when(log_init_ASout_data(ASnum_init)).done(function () {
      var AStarget_attr = ASout_ASpoints_group.geometry.attributes;
      for (var j = 0; j < AStarget_attr.opacity.count; j++) {
        AStarget_attr.opacity.array[j] = parseFloat(1.0);
        AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;
      // circle
      for (var i = 0; i < ASout_countryothers_group.children.length; i++) {
        ASout_countryothers_group.children[i].visible = true;
      }
      // AS links
      for (var i = 0; i < ASout_ASlink_group.children.length; i++) {
        ASout_ASlink_group.children[i].visible = true;
      }
      // country links
      for (var i = 0; i < ASout_countrylink_group.children.length; i++) {
        ASout_countrylink_group.children[i].visible = true;
      }
      // text
      for (var i = 0; i < ASout_countrytext_group.children.length; i++) {
        ASout_countrytext_group.children[i].visible = true;
      }
      // topo in
      for (var i = 0; i < ASout_topoinsquare_group.children.length; i++) {
        ASout_topoinsquare_group.children[i].visible = true;
      }
      scene.add(ASout_ASpoints_group);
      if (topo_flag) {
        scene.add(ASout_ASlink_group);
      } else {
      }
      scene.add(ASout_topoinsquare_group);
      scene.add(ASout_countryothers_group);
      scene.add(ASout_countrytext_group);
      scene.add(ASout_countrylink_group);
      scene.add(ASout_boundry_circle);
    });
  }

  function log_ASout_search_AS(
    ASnum_searched,
    ASnum_init,
    is_picking,
    topo_flag
  ) {
    util_clear_geometry();
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 1.2;
    }

    $.when(log_init_ASout_data(ASnum_init)).done(callback_done);

    function callback_done() {
      var AS_target_info = ASout_ASpoints[ASnum_searched];
      if (AS_target_info) {
        // AS
        var AStarget_attr = ASout_ASpoints_group.geometry.attributes;
        for (var j = 0; j < AStarget_attr.opacity.count; j++) {
          AStarget_attr.opacity.array[j] = parseFloat(0.0);
          AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
        }
        var target_ASindex = ASout_ASpoint_index_map[ASnum_searched];
        AStarget_attr.opacity.array[target_ASindex] = 1.0;
        AStarget_attr.size.array[target_ASindex] =
          AStarget_attr.size.array[target_ASindex] * 1.0;
        target_ASindex = ASout_ASpoint_index_map[ASnum_init];
        AStarget_attr.opacity.array[target_ASindex] = 1.0;
        AStarget_attr.size.array[target_ASindex] =
          AStarget_attr.size.array[target_ASindex] * 1.0;
        AStarget_attr.size.needsUpdate = true;
        AStarget_attr.opacity.needsUpdate = true;
        // AS links
        for (var i = 0; i < ASout_ASlink_group.children.length; i++) {
          if (ASout_ASlink_group.children[i].name == ASnum_searched) {
            ASout_ASlink_group.children[i].visible = true;
          } else {
            ASout_ASlink_group.children[i].visible = false;
          }
        }
        // country links
        for (var i = 0; i < ASout_countrylink_group.children.length; i++) {
          ASout_countrylink_group.children[i].visible = false;
        }
        // text
        for (var i = 0; i < ASout_countrytext_group.children.length; i++) {
          ASout_countrytext_group.children[i].visible = false;
        }
        for (var i = 0; i < ASout_countryothers_group.children.length; i++) {
          ASout_countryothers_group.children[i].visible = false;
        }
        for (var i = 0; i < ASout_topoinsquare_group.children.length; i++) {
          if (
            ASout_topoinsquare_group.children[i].name == ASnum_searched ||
            ASout_topoinsquare_group.children[i].name == ASnum_init
          ) {
            ASout_topoinsquare_group.children[i].visible = true;
          } else {
            ASout_topoinsquare_group.children[i].visible = false;
          }
        }
        if (topo_flag) {
          scene.add(ASout_ASlink_group);
        }
        scene.add(ASout_ASpoints_group);
        scene.add(ASout_topoinsquare_group);
        scene.add(ASout_countryothers_group);
        scene.add(ASout_countrytext_group);
        scene.add(ASout_countrylink_group);
        scene.add(ASout_boundry_circle);
      } else {
        // console.log("Not find AS "+ASnum_searched);
      }
    }
  }

  function log_ASout_search_linkAS(
    ASnum_searched,
    ASnum_init,
    is_picking,
    topo_flag
  ) {
    util_clear_geometry();
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 1.2;
    }

    $.when(log_init_ASout_data(ASnum_init)).done(callback_done);

    function createVector(x, y, z, camera, width, height) {
      var p = new THREE.Vector3(x, y, z);
      var vector = p.project(camera);
      vector.x = ((vector.x + 1) / 2) * width;
      vector.y = (-(vector.y - 1) / 2) * height;
      return vector;
    }

    function callback_done() {
      // as links
      for (var i = 0; i < ASout_ASlink_group.children.length; i++) {
        if (ASout_ASlink_group.children[i].name == ASnum_searched) {
          ASout_ASlink_group.children[i].visible = true;
        } else {
          ASout_ASlink_group.children[i].visible = false;
        }
      }
      // AS
      var AStarget_attr = ASout_ASpoints_group.geometry.attributes;
      for (var j = 0; j < AStarget_attr.opacity.count; j++) {
        if (
          ASout_index_ASpoint_map[j] == ASnum_searched ||
          ASout_index_ASpoint_map[j] == ASnum_init
        ) {
          AStarget_attr.opacity.array[j] = 1.0;
        } else {
          AStarget_attr.opacity.array[j] = 0.0;
        }
        AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
      }
      // text
      for (var i = 0; i < ASout_countrytext_group.children.length; i++) {
        ASout_countrytext_group.children[i].visible = false;
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;
      // country link
      var ASout_countrylinks = ASout_countrylink_group.children;
      _.forEach(ASout_countrylinks, function (d) {
        d.visible = false;
      });
      for (var i = 0; i < ASout_countryothers_group.children.length; i++) {
        ASout_countryothers_group.children[i].visible = false;
      }
      for (var i = 0; i < ASout_topoinsquare_group.children.length; i++) {
        if (
          ASout_topoinsquare_group.children[i].name == ASnum_searched ||
          ASout_topoinsquare_group.children[i].name == ASnum_init
        ) {
          ASout_topoinsquare_group.children[i].visible = true;
        } else {
          ASout_topoinsquare_group.children[i].visible = false;
        }
      }
      if (topo_flag) {
        scene.add(ASout_ASlink_group);
        $.ajax({
          url:
            datav_config.server_url +
            "visual/control/vs/v3/topology/getInterfaceByASnumber",
          type: "POST",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify({
            as1: ASnum_init,
            as2: ASnum_searched.toString(),
          }),
        })
          .done(function (data) {
            if (data.length == 0) {
              var webcontent = "暂无信息";
            } else {
              var webcontent = "";
              for (var i = 0; i < data.length; i++) {
                if (i >= 5) {
                  webcontent += "... ...";
                  break;
                } else {
                  webcontent =
                    webcontent +
                    data[i]["ip1"] +
                    "<-->" +
                    data[i]["ip2"] +
                    "<br />";
                }
              }
            }
            var from_pos = createVector(
              ASout_ASpoints[ASnum_init][0] * custom_scale_level,
              ASout_ASpoints[ASnum_init][1] * custom_scale_level,
              0,
              camera,
              containerW,
              containerH
            );
            var to_pos = createVector(
              ASout_ASpoints[ASnum_searched][0] * custom_scale_level,
              ASout_ASpoints[ASnum_searched][1] * custom_scale_level,
              0,
              camera,
              containerW,
              containerH
            );
            MapMsgshow(
              from_pos.x,
              from_pos.y,
              "AS : " + ASnum_init,
              to_pos.x,
              to_pos.y,
              "AS : " + ASnum_searched,
              webcontent
            );
          })
          .fail(function (error) {
            console.log(error);
            MapMsghide();
          });
      }
      scene.add(ASout_ASpoints_group);
      scene.add(ASout_topoinsquare_group);
      scene.add(ASout_countryothers_group);
      scene.add(ASout_countrytext_group);
      scene.add(ASout_countrylink_group);
      scene.add(ASout_boundry_circle);
    }
  }

  function log_ASout_search_country(
    country_code_searched,
    ASnum_init,
    is_picking,
    topo_flag
  ) {
    util_clear_geometry();
    if (is_picking) {
    } else {
      log_scene_reset();
      camera.position.z = camera.position.z * 1.2;
    }
    $.when(log_init_ASout_data(ASnum_init)).done(callback_done);
    function callback_done() {
      // country links
      for (var i = 0; i < ASout_countrylink_group.children.length; i++) {
        if (ASout_countrylink_group.children[i].name == country_code_searched) {
          ASout_countrylink_group.children[i].visible = true;
        } else {
          ASout_countrylink_group.children[i].visible = false;
        }
      }
      // circles
      for (var i = 0; i < ASout_countryothers_group.children.length; i++) {
        if (
          ASout_countryothers_group.children[i].name == country_code_searched
        ) {
          ASout_countryothers_group.children[i].visible = true;
        } else {
          ASout_countryothers_group.children[i].visible = false;
        }
      }
      // text
      for (var i = 0; i < ASout_countrytext_group.children.length; i++) {
        if (ASout_countrytext_group.children[i].name == country_code_searched) {
          ASout_countrytext_group.children[i].visible = true;
        } else {
          ASout_countrytext_group.children[i].visible = false;
        }
      }
      // as
      var AStarget_attr = ASout_ASpoints_group.geometry.attributes;
      for (var j = 0; j < AStarget_attr.opacity.count; j++) {
        if (ASout_index_ASpoint_map[j] == ASnum_init) {
          AStarget_attr.opacity.array[j] = 1.0;
        } else {
          AStarget_attr.opacity.array[j] = 0.0;
        }
        AStarget_attr.size.array[j] = AStarget_attr.size_copy.array[j];
      }
      AStarget_attr.size.needsUpdate = true;
      AStarget_attr.opacity.needsUpdate = true;
      // topoin
      for (var i = 0; i < ASout_topoinsquare_group.children.length; i++) {
        if (ASout_topoinsquare_group.children[i].name == ASnum_init) {
          ASout_topoinsquare_group.children[i].visible = true;
        } else {
          ASout_topoinsquare_group.children[i].visible = false;
        }
      }

      scene.add(ASout_ASpoints_group);
      scene.add(ASout_topoinsquare_group);
      scene.add(ASout_countryothers_group);
      scene.add(ASout_countrytext_group);
      scene.add(ASout_countrylink_group);
      scene.add(ASout_boundry_circle);
    }
  }

  function log_ASout_search_linkcountry(
    country_code_searched,
    ASnum_init,
    is_picking,
    topo_flag
  ) {
    log_ASout_search_country(country_code_searched, ASnum_init, is_picking);
  }

  function log_click_in_asout(raycaster, eX, eY) {
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.linePrecision = 800;
    raycaster.params.Points.threshold = 800;
    // console.log("picking in logic asout");
    if (scene.children) {
      var intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        var picked_target = intersects[0].object;
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.type == "Points") {
            picked_target = intersects[i].object;
            picked_index = intersects[i].index;
            break;
          }
        }
        if (picked_target.type == "Points") {
          var picked_AS = ASout_index_ASpoint_map[picked_index];
          var AStarget_attr = ASout_ASpoints_group.geometry.attributes;
          var ASnum_searched_index = ASout_ASpoint_index_map[picked_AS];
          if (AStarget_attr.opacity.array[ASnum_searched_index] == 0) {
            console.log("you can't see me.");
            return;
          } else {
          }
          if (
            (timer_seted =
              true &&
              timer_target_type == "AS" &&
              timer_target_value == picked_AS)
          ) {
            clearTimeout(sleep_function);
            // console.log("db click event"+timer_target_value);
            switchMap.switchToAS(picked_AS);
            type_current = "asout";
            timer_target_type = undefined;
            timer_target_value = undefined;
            timer_seted = false;
            icon_dbclick_AS();
            input_record.input_value = picked_AS;
          } else {
            // console.log("picked AS "+picked_AS);
            timer_target_type = "AS";
            timer_target_value = picked_AS;
            timer_seted = true;
            sleep_function = window.setTimeout(function () {
              log_ASout_search_AS(picked_AS, ASout_current_AS, true);
              showInfo.clickAsInAsout(picked_AS);
              type_current = "asout";
              timer_target_type = undefined;
              timer_target_value = undefined;
              timer_seted = false;
              input_record.input_value_plus_type = "AS";
              input_record.input_value_plus_value = picked_AS;
              icon_ASout_click_AS();
            }, 400);
          }
        } else if (
          picked_target.type == "Line" &&
          picked_target.custom_1 == "AS2AS"
        ) {
          // console.log("picked AS link");
          // console.log(picked_target.name);
          log_ASout_search_linkAS(
            picked_target.name,
            ASout_current_AS,
            ASout_current_AS,
            true
          );
          showInfo.clickAsInAsout(picked_target.name);
          input_record.input_value_plus_type = "linkAS";
          input_record.input_value_plus_value = picked_target.name;
          icon_ASout_click_AS2AS();
        } else if (
          picked_target.type == "Line" &&
          picked_target.custom_1 == "country2country"
        ) {
          // console.log("picked country link");
          // console.log(picked_target.name);
          log_ASout_search_linkcountry(
            picked_target.name,
            ASout_current_AS,
            ASout_current_AS,
            true
          );
          showInfo.clickCountryInAsout(picked_target.name);
          input_record.input_value_plus_type = "Line";
          input_record.input_value_plus_value = picked_target.name;
          icon_ASout_click_country();
          // fetchData.getEdgeInfoBetweenAS(ASout_current_AS, picked_target.name, true);
        } else if (picked_target.type == "Mesh") {
          // console.log("picked country text "+picked_target.name);
          if (
            (timer_seted =
              true &&
              timer_target_type == "country" &&
              timer_target_value == picked_target.name)
          ) {
            clearTimeout(sleep_function);
            // console.log("db click event "+timer_target_value);
            switchMap.switchToCountry(picked_target.name);
            input_record.input_value = picked_target.name;
            icon_dbclick_country();
            type_current = "countryin";
            timer_target_type = undefined;
            timer_target_value = undefined;
            timer_seted = false;
          } else {
            // console.log("picked country "+picked_target.name);
            timer_target_type = "country";
            timer_target_value = picked_target.name;
            timer_seted = true;
            sleep_function = window.setTimeout(function () {
              log_ASout_search_country(
                picked_target.name,
                ASout_current_AS,
                ASout_current_AS,
                true
              );
              showInfo.clickCountryInAsout(picked_target.name);
              type_current = "asout";
              timer_target_type = undefined;
              timer_target_value = undefined;
              timer_seted = false;
              input_record.input_value_plus_type = "contrytext";
              input_record.input_value_plus_value = picked_target.name;
              icon_ASout_click_country();
            }, 400);
          }
        } else {
          // console.log("picked but not deal");
          // console.log(intersects[0]);
        }
      } else {
        // console.log("not picked");
      }
    }
  }

  // 重置webgl
  function log_scene_reset() {
    // 克隆已存在的iCamera对象来创建一个新的camera对象
    camera = iCamera.clone();
    // 设置camera的位置为(0, 0, 150000)，即在3D场景中的坐标为(0, 0, 150000)
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 150000;
    // 设置camera的"up"向量为(0, 1, 0)，使得正Y轴成为"上"方向
    camera.up.set(0, 1, 0);
    // 使用THREE.TrackballControls构造函数创建一个新的控制器controler，用于在3D场景中操作相机
    controler = new THREE.TrackballControls(camera, renderer.domElement);
    // 设置controler的noRotate为true，这样相机就不会通过控制器进行旋转
    controler.noRotate = true;
  }

  // 工具函数
  function util_clear_geometry() {
    MapMsghide();
    removeRMap();

    vertical_doshline_group && scene.remove(vertical_doshline_group);
    Land_points_group && scene.remove(Land_points_group);
    direction_light && scene.remove(direction_light);
    direction_light_2 && scene.remove(direction_light_2);
    country_geomap_map && scene.remove(country_geomap_map);
    ASpoints_group && scene.remove(ASpoints_group);
    ASlinks_group_out && scene.remove(ASlinks_group_out);
    ASlinks_group_in && scene.remove(ASlinks_group_in);
    ASlinks_group_both && scene.remove(ASlinks_group_both);
    ASlinks_group_neither && scene.remove(ASlinks_group_neither);

    search_points_group && scene.remove(search_points_group);
    search_ASlinks_group && scene.remove(search_ASlinks_group);

    world_ASpoints_group && scene.remove(world_ASpoints_group); // 国家AS粒子系统
    world_countrytext_group && scene.remove(world_countrytext_group); // 国家标签
    world_boundry_circle && scene.remove(world_boundry_circle); // 轮廓外圆
    world_search_ASlink_group && scene.remove(world_search_ASlink_group);
    log_ASlinks_group_out && scene.remove(log_ASlinks_group_out);
    log_ASlinks_group_in && scene.remove(log_ASlinks_group_in);
    log_ASlinks_group_both && scene.remove(log_ASlinks_group_both);
    log_ASlinks_group_neither && scene.remove(log_ASlinks_group_neither);

    countryin_topoinsquare_group && scene.remove(countryin_topoinsquare_group); // 有域内拓扑的方框组
    countryin_countrytext_group && scene.remove(countryin_countrytext_group); // 国家标签组
    countryin_countrylink_group && scene.remove(countryin_countrylink_group); // 其它国家的抽象连线
    countryin_countryothers_group &&
      scene.remove(countryin_countryothers_group); // 其它国家的AS抽象圆圈
    countryin_current_circle && scene.remove(countryin_current_circle); // 当前国家的轮廓圆圈
    countryin_ASpoints_group && scene.remove(countryin_ASpoints_group); // 国家内的点
    countryin_ASlink_group && scene.remove(countryin_ASlink_group);
    countryin_search_ASlink_group &&
      scene.remove(countryin_search_ASlink_group);

    ASout_ASpoints_group && scene.remove(ASout_ASpoints_group); // 域间的AS点集合
    ASout_topoinsquare_group && scene.remove(ASout_topoinsquare_group); // 域间的方框集合
    ASout_countrytext_group && scene.remove(ASout_countrytext_group); // 域间的国家标签集合
    ASout_countrylink_group && scene.remove(ASout_countrylink_group); // 域间links集合
    ASout_countryothers_group && scene.remove(ASout_countryothers_group); // 域间其它国家的AS抽象圆圈
    ASout_ASlink_group && scene.remove(ASout_ASlink_group); // 域间AS连线集合
    ASout_boundry_circle && scene.remove(ASout_boundry_circle); // AS范围圈

    countryout_ASpoints_group && scene.remove(countryout_ASpoints_group); // 国家间的AS点集合
    countryout_center_countrytext_group &&
      scene.remove(countryout_center_countrytext_group); // 中心点国家文本
    countryout_boundry_circle_group &&
      scene.remove(countryout_boundry_circle_group); // 国家的轮廓圈
    countryout_link_country_group &&
      scene.remove(countryout_link_country_group); // 主体国家与主体国家的连接线
    countryout_ASlinks_group && scene.remove(countryout_ASlinks_group);

    plane_first && scene.remove(plane_first);
    plane_second && scene.remove(plane_second);
    firstboundry_obj && scene.remove(firstboundry_obj);
    secondboundry_obj && scene.remove(secondboundry_obj);
    first_points && scene.remove(first_points);
    second_points && scene.remove(second_points);
    ASinterface_line_group && scene.remove(ASinterface_line_group);
    ASinterface_text_group && scene.remove(ASinterface_text_group);
  }

  function MapMsgshow(eX1, eY1, content1, eX2, eY2, content2, content3) {
    var info_container1 = $(".mymiddle .info_router1");
    var info_container2 = $(".mymiddle .info_router2");
    var info_container3 = $(".mymiddle .info_router3");
    if (info_container1 && info_container2 && info_container3) {
      info_container1.css({ top: eY1, left: eX1, display: "block" });
      info_container2.css({ top: eY2, left: eX2, display: "block" });

      info_container1.html("<p>" + content1 + "</p>");
      info_container2.html("<p>" + content2 + "</p>");
      if (content3 != "") {
        info_container3.html("<p>" + content3 + "</p>");
        info_container3.css({
          top: (eY1 + eY2) / 2,
          left: (eX1 + eX2) / 2,
          display: "block",
        });
      } else {
      }
    } else {
      console.log("Not find the info_container");
    }
  }

  function MapMsghide() {
    var info_container1 = $(".mymiddle .info_router1");
    var info_container2 = $(".mymiddle .info_router2");
    var info_container3 = $(".mymiddle .info_router3");
    if (info_container1 && info_container2 && info_container3) {
      info_container1.hide();
      info_container2.hide();
      info_container3.hide();
    } else {
      console.log("Not find the info_container");
    }
  }

  // 域间图标
  function icon_dbclick_AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        if (jQuery(this).data("val") == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (
          jQuery(this).data("val") == "in" ||
          jQuery(this).data("val") == "neither"
        ) {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  // 国家内图标
  function icon_dbclick_country() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        if (jQuery(this).data("val") == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (
          jQuery(this).data("val") == "in" ||
          jQuery(this).data("val") == "neither"
        ) {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  // 全球单击AS
  function icon_world_click_AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        jQuery(this).show();
        if (jQuery(this).data("val") == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
      });
  }

  // 全球单击国家
  function icon_world_click_country() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        jQuery(this).show();
        if (jQuery(this).data("val") == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
      });
  }

  function icon_countryin_click_country() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        jQuery(this).hide();
      });
  }

  function icon_countryin_click_AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        var dom_val = jQuery(this).data("val");
        if (dom_val == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (dom_val == "neither" || dom_val == "in") {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  function icon_countryout_click_AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        var dom_val = jQuery(this).data("val");
        if (dom_val == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (dom_val == "neither" || dom_val == "out") {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  function icon_countryout_click_country() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        jQuery(this).hide();
      });
  }

  function icon_countryout_click_countrylink() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        var dom_val = jQuery(this).data("val");
        if (dom_val == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (dom_val == "neither" || dom_val == "out") {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  function icon_ASout_click_AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        var dom_val = jQuery(this).data("val");
        if (dom_val == "neither") {
          jQuery(this).addClass("active");
        } else {
        }
        if (dom_val == "neither" || dom_val == "in") {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  function icon_ASout_click_AS2AS() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        var dom_val = jQuery(this).data("val");
        if (dom_val == "in") {
          jQuery(this).addClass("active");
        } else {
        }
        if (dom_val == "neither" || dom_val == "in") {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
  }

  function icon_ASout_click_country() {
    jQuery(".chose_icon").find(".active").removeClass("active");
    jQuery(".chose_icon")
      .find(".myicon")
      .each(function () {
        jQuery(this).hide();
      });
  }

  function log_ASinterface_data(ASnum_first, ASnum_second) {
    var dtd = $.Deferred();
    // 初始化数据完毕,直接使用缓存(处理完毕,且现在输入的和原来的一致,即换国家列表,需要重新计算)
    if (
      ASinterface_init_done == true &&
      ASinterface_current == [ASnum_first, ASnum_second].toString()
    ) {
      // console.log("using AS out data cache.");
      dtd.resolve();
    } else {
      $.ajax({
        url:
          datav_config.server_url +
          "visual/control/vs/v3/topology/getInterfaceByASnumber",
        type: "post",
        headers: { "Content-type": "application/json;charset=UTF-8" },
        data: JSON.stringify({ as1: ASnum_first, as2: ASnum_second }),
      }).done(function (data) {
        current_graph_type = "ASinterface";
        ASinterface_current = [ASnum_first, ASnum_second].toString();
        ASinterface_init_done = true;
        var ip_array_first = [];
        var ip_array_second = [];
        var data_list = data["list"];
        for (var i = 0; i < data_list.length; i++) {
          ip_array_first.push(data_list[i].ip1);
          ip_array_second.push(data_list[i].ip2);
        }
        var ip_set_first = _.uniq(ip_array_first);
        var ip_set_second = _.uniq(ip_array_second);
        var max_ip_cnt = _.max([ip_set_first.length, ip_set_second.length]);

        var geometry_first = new THREE.PlaneGeometry(
          10000,
          (max_ip_cnt + 8) * 800 * 2
        );
        var material_first = new THREE.MeshBasicMaterial({
          color: 0x055682,
          opacity: 0.3,
          transparent: true,
        });
        plane_first = new THREE.Mesh(geometry_first, material_first);

        var geometry_second = new THREE.PlaneGeometry(
          10000,
          (max_ip_cnt + 8) * 800 * 2
        );
        var material_second = new THREE.MeshBasicMaterial({
          color: 0x055682,
          opacity: 0.3,
          transparent: true,
        });
        plane_second = new THREE.Mesh(geometry_second, material_second);

        var boundry_material = new THREE.LineBasicMaterial({
          color: 0x0795e1,
          linewidth: 1,
          transparent: true,
          opacity: 0.9,
        });
        var firstboundry_geometry = new THREE.Geometry();
        firstboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, -800 * (max_ip_cnt + 8), 0)
        );
        firstboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, 800 * (max_ip_cnt + 8), 0)
        );
        firstboundry_geometry.vertices.push(
          new THREE.Vector3(+5000, 800 * (max_ip_cnt + 8), 0)
        );
        firstboundry_geometry.vertices.push(
          new THREE.Vector3(+5000, -800 * (max_ip_cnt + 8), 0)
        );
        firstboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, -800 * (max_ip_cnt + 8), 0)
        );
        firstboundry_obj = new THREE.Line(
          firstboundry_geometry,
          boundry_material
        );
        var secondboundry_geometry = new THREE.Geometry();
        secondboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, -800 * (max_ip_cnt + 8), 0)
        );
        secondboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, 800 * (max_ip_cnt + 8), 0)
        );
        secondboundry_geometry.vertices.push(
          new THREE.Vector3(+5000, 800 * (max_ip_cnt + 8), 0)
        );
        secondboundry_geometry.vertices.push(
          new THREE.Vector3(+5000, -800 * (max_ip_cnt + 8), 0)
        );
        secondboundry_geometry.vertices.push(
          new THREE.Vector3(-5000, -800 * (max_ip_cnt + 8), 0)
        );
        secondboundry_obj = new THREE.Line(
          secondboundry_geometry,
          boundry_material
        );

        var vertices = firstboundry_obj.geometry.vertices;
        var max_vertice = _.max(vertices, function (d) {
          return d.x * d.x + d.y * d.y;
        });
        var maxRadius = Math.sqrt(
          max_vertice.x * max_vertice.x + max_vertice.y * max_vertice.y
        );

        ASinterface_text_group = new THREE.Group();
        var AStexture = document.createElement("canvas");
        AStexture.height = 256;
        AStexture.width = 512;
        var ctx = AStexture.getContext("2d");
        ctx.font = "128px arival";
        ctx.fillStyle = "white";
        ctx.fillText(ASnum_first, 128, 128 + 48);
        var textMaterial_1 = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(AStexture),
          transparent: true,
        });
        var center_textMesh_1 = new THREE.Mesh(
          new THREE.PlaneGeometry(maxRadius / 4, maxRadius / 4),
          textMaterial_1
        );

        ASinterface_text_group.add(center_textMesh_1);
        var AStexture = document.createElement("canvas");
        AStexture.height = 256;
        AStexture.width = 512;
        var ctx = AStexture.getContext("2d");
        ctx.font = "128px arival";
        ctx.fillStyle = "white";
        ctx.fillText(ASnum_second, 128, 128 + 48);
        var textMaterial_2 = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(AStexture),
          transparent: true,
        });
        var center_textMesh_2 = new THREE.Mesh(
          new THREE.PlaneGeometry(maxRadius / 4, maxRadius / 4),
          textMaterial_2
        );
        ASinterface_text_group.add(center_textMesh_2);

        // var sphere = new THREE.SphereGeometry();
        // var object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0xff0000 ) );
        // var box = new THREE.BoxHelper( center_textMesh_2, 0xffff00 );
        // scene.add( box );

        var points_pos_map = {};
        var firstpoints_geometry = new THREE.Geometry();
        firstpoints_geometry.ips = [];
        for (var i = 0; i < ip_set_first.length; i++) {
          if (i == 0) {
            var star = new THREE.Vector3((-maxRadius * 3) / 4, 0, 0);
          } else if (i % 2 != 0) {
            var star = new THREE.Vector3(
              (-maxRadius * 3) / 4,
              1600 * (Math.floor((i - 1) / 2) + 1),
              0
            );
          } else {
            var star = new THREE.Vector3(
              (-maxRadius * 3) / 4,
              -1600 * (Math.floor((i - 1) / 2) + 1),
              0
            );
          }
          points_pos_map[ip_set_first[i]] = star;
          firstpoints_geometry.vertices.push(star);
          firstpoints_geometry.ips.push(ip_set_first[i]);
        }
        var interface_material_first = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 800,
        });
        first_points = new THREE.Points(
          firstpoints_geometry,
          interface_material_first
        );
        first_points.name = ASnum_first;
        first_points.first_or_second = "first";

        var secondpoints_geometry = new THREE.Geometry();
        secondpoints_geometry.ips = [];
        for (var i = 0; i < ip_set_second.length; i++) {
          if (i == 0) {
            var star = new THREE.Vector3((maxRadius * 3) / 4, 0, 0);
          } else if (i % 2 != 0) {
            var star = new THREE.Vector3(
              (maxRadius * 3) / 4,
              1600 * (Math.floor((i - 1) / 2) + 1),
              0
            );
          } else {
            var star = new THREE.Vector3(
              (maxRadius * 3) / 4,
              -1600 * (Math.floor((i - 1) / 2) + 1),
              0
            );
          }
          points_pos_map[ip_set_second[i]] = star;
          secondpoints_geometry.vertices.push(star);
          secondpoints_geometry.ips.push(ip_set_second[i]);
        }
        var interface_material_second = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 800,
        });
        second_points = new THREE.Points(
          secondpoints_geometry,
          interface_material_second
        );
        second_points.name = ASnum_second;
        second_points.first_or_second = "second";

        var line_material = new THREE.LineBasicMaterial({
          color: 0x0795e1,
        });
        ASinterface_line_group = new THREE.Group();
        for (var i = 0; i < data_list.length; i++) {
          var line_geometry = new THREE.Geometry();
          var ip_first = data_list[i]["ip1"];
          var ip_second = data_list[i]["ip2"];
          line_geometry.vertices.push(points_pos_map[ip_first]);
          line_geometry.vertices.push(points_pos_map[ip_second]);
          var line_unit = new THREE.LineSegments(line_geometry, line_material);
          line_unit.from = ip_first;
          line_unit.to = ip_second;
          ASinterface_line_group.add(line_unit);
        }

        plane_first.position.x = (-maxRadius * 3) / 4;
        plane_second.position.x = (maxRadius * 3) / 4;
        firstboundry_obj.position.x = (-maxRadius * 3) / 4;
        secondboundry_obj.position.x = (maxRadius * 3) / 4;
        center_textMesh_1.position.x = -maxRadius * 1.5;
        center_textMesh_2.position.x = maxRadius * 1.5;

        dtd.resolve();
      });
    }
    return dtd.promise();
  }

  function log_ASinterface_init(ASnum_first, ASnum_second, topo_flag) {
    util_clear_geometry();
    log_scene_reset();
    $.when(log_ASinterface_data(ASnum_first, ASnum_second)).done(callback_done);
    function callback_done() {
      var vertices = firstboundry_obj.geometry.vertices;
      var max_vertice = _.max(vertices, function (d) {
        return d.x * d.x + d.y * d.y;
      });
      var maxRadius = Math.sqrt(
        max_vertice.x * max_vertice.x + max_vertice.y * max_vertice.y
      );
      camera.position.z =
        maxRadius * Math.atan((Math.PI / 180) * camera.fov) * 1.4;
      scene.add(plane_first);
      scene.add(plane_second);
      scene.add(firstboundry_obj);
      scene.add(secondboundry_obj);
      if (topo_flag == "neither") {
      } else {
        var line_children = ASinterface_line_group.children;
        for (var i = 0; i < line_children.length; i++) {
          line_children[i].visible = true;
        }
        scene.add(ASinterface_line_group);
      }
      scene.add(first_points);
      scene.add(second_points);
      scene.add(ASinterface_text_group);
    }
  }

  function log_ASinterface_search_ip(ASnum_first, ASnum_second, ip) {
    // out api
    util_clear_geometry();
    if (ip == "") {
      log_ASinterface_init(ASnum_first, ASnum_second, false);
      return;
    } else {
    }
    $.when(log_ASinterface_data(ASnum_first, ASnum_second)).done(callback_done);
    function callback_done() {
      if ($.inArray(ip, first_points.geometry.ips) >= 0) {
        var first_or_second = "first";
      } else if ($.inArray(ip, second_points.geometry.ips >= 0)) {
        var first_or_second = "second";
      } else {
        console.log("Not find this IP.");
        return;
      }
      // var vertices = firstboundry_obj.geometry.vertices;
      // var max_vertice = _.max(vertices, function(d) {
      //   return d.x*d.x + d.y*d.y
      // });
      // var maxRadius = Math.sqrt(max_vertice.x*max_vertice.x +
      //                     max_vertice.y*max_vertice.y)

      // camera.position.z = maxRadius * Math.atan(  Math.PI  / 180 * camera.fov ) * 1.4;
      var line_children = ASinterface_line_group.children;
      if (first_or_second == "first") {
        for (var i = 0; i < line_children.length; i++) {
          var child = line_children[i];
          if (child.from == ip) {
            child.visible = true;
          } else {
            child.visible = false;
          }
        }
      } else if (first_or_second == "second") {
        for (var i = 0; i < line_children.length; i++) {
          var child = line_children[i];
          if (child.to == ip) {
            child.visible = true;
          } else {
            child.visible = false;
          }
        }
      } else {
        console.log("No first or second ?!");
      }

      scene.add(plane_first);
      scene.add(plane_second);
      scene.add(firstboundry_obj);
      scene.add(secondboundry_obj);
      scene.add(ASinterface_line_group);
      scene.add(first_points);
      scene.add(second_points);
      scene.add(ASinterface_text_group);
    }
  }

  function log_ASinterface_search_line(
    ASnum_first,
    ASnum_second,
    ip_from,
    ip_to
  ) {
    // out api
    util_clear_geometry();
    $.when(log_ASinterface_data(ASnum_first, ASnum_second)).done(callback_done);
    function callback_done() {
      function createVector(x, y, z, camera, width, height) {
        var p = new THREE.Vector3(x, y, z);
        var vector = p.project(camera);
        vector.x = ((vector.x + 1) / 2) * width;
        vector.y = (-(vector.y - 1) / 2) * height;
        return vector;
      }
      var line_children = ASinterface_line_group.children;

      for (var i = 0; i < line_children.length; i++) {
        var child = line_children[i];
        if (child.from == ip_from && child.to == ip_to) {
          child.visible = true;
          var from_pos = createVector(
            child.geometry.vertices[0].x,
            child.geometry.vertices[0].y,
            0,
            camera,
            containerW,
            containerH
          );
          var to_pos = createVector(
            child.geometry.vertices[1].x,
            child.geometry.vertices[1].y,
            0,
            camera,
            containerW,
            containerH
          );
          MapMsgshow(
            from_pos.x,
            from_pos.y,
            "IP : " + ip_from,
            to_pos.x,
            to_pos.y,
            "IP : " + ip_to,
            ""
          );
        } else {
          child.visible = false;
        }
      }
      scene.add(plane_first);
      scene.add(plane_second);
      scene.add(ASinterface_line_group);
      scene.add(firstboundry_obj);
      scene.add(secondboundry_obj);
      scene.add(first_points);
      scene.add(second_points);
      scene.add(ASinterface_text_group);
    }
  }

  function log_click_in_ASinterface(raycaster, eX, eY) {
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.linePrecision = 800;
    raycaster.params.Points.threshold = 800;
    if (scene.children) {
      var intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length == 0) {
        return;
      } else {
      }
      var picked_target = intersects[0];
      // 优先拾取点
      if (intersects.length > 0) {
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.type == "Points") {
            picked_target = intersects[i];
            break;
          }
        }
      } else {
      }
      if (picked_target.object.type == "Mesh") {
      } else if (picked_target.object.type == "Points") {
        var index = picked_target.index;
        var ip = picked_target.object.geometry.ips[index];
        var asNumber = input_record.input_value;
        log_ASinterface_search_ip(asNumber[0], asNumber[1], ip);
        (function filter_data() {
          $("#export-form .search-input").val(ip);
          fetchData.getInterfaceByASnumber({
            as1: asNumber[0],
            as2: asNumber[1],
            key: ip,
          });
        })();
      } else if (picked_target.object.type == "LineSegments") {
        var asNumber = input_record.input_value;
        log_ASinterface_search_line(
          asNumber[0],
          asNumber[1],
          picked_target.object.from,
          picked_target.object.to
        );
      } else {
      }
    } else {
    }
  }

  // api接口
  window.datavjs = {
    log_click_in_ASinterface: function (raycaster, eX, eY) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_click_in_ASinterface(raycaster, eX, eY);
    },
    log_ASinterface_search_ip: function (ASnum_first, ASnum_second, ip) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_ASinterface_search_ip(ASnum_first, ASnum_second, ip);
    },
    phy_world_init: function (topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_world_init(topo_flag);
    },
    phy_world_search_AS: function (ASnum_searched, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_world_search_AS(ASnum_searched, topo_flag);
    },
    phy_world_search_country: function (country_code, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_world_search_country(country_code, topo_flag);
    },
    phy_countryin_init: function (country_code, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryin_init(country_code, topo_flag);
    },
    phy_countryin_search_AS: function (
      ASnum_searched,
      country_code,
      topo_flag
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryin_search_AS(ASnum_searched, country_code, topo_flag);
    },
    phy_countryin_search_country: function (country_searched, country_code) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryin_search_country(country_searched, country_code);
    },
    phy_countryin_search_linkcountry: function (
      country_searched,
      country_code
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryin_search_linkcountry(country_searched, country_code);
    },
    phy_countryout_init: function (country_code_list, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryout_init(country_code_list, topo_flag);
    },
    phy_countryout_search_AS: function (
      ASnum_searched,
      country_code_list,
      topo_flag
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryout_search_AS(ASnum_searched, country_code_list, topo_flag);
    },
    phy_countryout_search_country: function (
      country_searched,
      country_code_list
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_countryout_search_country(country_searched, country_code_list);
    },
    phy_ASout_init: function (AS_num, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_ASout_init(AS_num, topo_flag);
    },
    phy_ASout_search_AS: function (ASnum_searched, ASnum_init, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_ASout_search_AS(ASnum_searched, ASnum_init, topo_flag);
    },
    phy_ASout_search_linkAS: function (ASnum_searched, ASnum_init, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_ASout_search_AS(ASnum_searched, ASnum_init, topo_flag);
    },
    phy_ASout_search_country: function (country_searched, ASnum_init) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_ASout_search_country(country_searched, ASnum_init);
    },
    phy_ASout_search_linkcountry: function (country_code_searched, ASnum_init) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      phy_ASout_search_linkcountry(country_code_searched, ASnum_init);
    },
    log_ASinterface_init: function (ASnum_first, ASnum_second, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_ASinterface_init(ASnum_first, ASnum_second, topo_flag);
    },
    log_world_init: function (topo_flag, init_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_world_init(topo_flag, init_flag);
    },
    log_world_search_AS: function (AS_num, is_picking, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_world_search_AS(AS_num, is_picking, topo_flag);
    },
    log_world_search_country: function (country_code, is_picking, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_world_search_country(country_code, is_picking, topo_flag);
    },
    log_click_in_world: function (raycaster, eX, eY) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_click_in_world(raycaster, eX, eY);
    },
    log_countryin_init: function (country_code, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryin_init(country_code, topo_flag);
    },
    log_countryin_search_AS: function (
      AS_num,
      country_code,
      is_picking,
      topo_flag
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryin_search_AS(AS_num, country_code, is_picking, topo_flag);
    },
    log_countryin_search_country: function (
      country_code_searched,
      country_code_init,
      is_picking
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryin_search_country(
        country_code_searched,
        country_code_init,
        is_picking
      );
    },
    log_countryin_search_linkcountry: function (
      country_code_searched,
      country_code_init,
      country_code,
      is_picking
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryin_search_linkcountry(
        country_code_searched,
        country_code_init,
        country_code,
        is_picking
      );
    },
    log_click_in_countryin: function (raycaster, eX, eY) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_click_in_countryin(raycaster, eX, eY);
    },
    log_countryout_init: function (country_code_list, is_picking, topo_flag) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryout_init(country_code_list, is_picking, topo_flag);
    },
    log_countryout_search_AS: function (
      AS_num,
      country_code_list,
      is_picking,
      topo_flag
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryout_search_AS(
        AS_num,
        country_code_list,
        is_picking,
        topo_flag
      );
    },
    log_countryout_search_country: function (
      country_code,
      country_code_list,
      is_picking
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryout_search_country(
        country_code,
        country_code_list,
        is_picking
      );
    },
    log_countryout_search_linkcountry: function (
      country_code_list,
      is_picking
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_countryout_search_linkcountry(country_code_list, is_picking);
    },
    log_click_in_countryout: function (raycaster, eX, eY) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_click_in_countryout(raycaster, eX, eY);
    },
    log_ASout_init: function (ASnum_init, topo_flag) {
      if (ASnum_init == 4134) {
        $(".myicon").hide();
        $("#asoutiframe").show();
        $("#WebGL-output").hide();
        log_ASout_init(ASnum_init, topo_flag);
      } else {
        $("#asoutiframe").hide();
        $("#WebGL-output").show();
        log_ASout_init(ASnum_init, topo_flag);
      }
    },
    log_ASout_search_AS: function (
      ASnum_searched,
      ASnum_init,
      is_picking,
      topo_flag
    ) {
      if (ASnum_init == 4134) {
        $(".myicon").hide();
        $("#asoutiframe").show();
        $("#WebGL-output").hide();
        log_ASout_search_AS(ASnum_searched, ASnum_init, is_picking, topo_flag);
      } else {
        $("#asoutiframe").hide();
        $("#WebGL-output").show();
        log_ASout_search_AS(ASnum_searched, ASnum_init, is_picking, topo_flag);
      }
    },
    log_ASout_search_linkAS: function (
      ASnum_searched,
      ASnum_init,
      is_picking,
      topo_flag
    ) {
      if (ASnum_init == 4134) {
        $(".myicon").hide();
        $("#asoutiframe").show();
        $("#WebGL-output").hide();
        log_ASout_search_linkAS(
          ASnum_searched,
          ASnum_init,
          is_picking,
          topo_flag
        );
      } else {
        $("#asoutiframe").hide();
        $("#WebGL-output").show();
        log_ASout_search_linkAS(
          ASnum_searched,
          ASnum_init,
          is_picking,
          topo_flag
        );
      }
    },
    log_ASout_search_linkcountry: function (
      country_code_searched,
      ASnum_init,
      is_picking,
      topo_flag
    ) {
      if (ASnum_init == 4134) {
        $(".myicon").hide();
        $("#asoutiframe").show();
        $("#WebGL-output").hide();
        log_ASout_search_linkcountry(
          country_code_searched,
          ASnum_init,
          is_picking,
          topo_flag
        );
      } else {
        $("#asoutiframe").hide();
        $("#WebGL-output").show();
        log_ASout_search_linkcountry(
          country_code_searched,
          ASnum_init,
          is_picking,
          topo_flag
        );
      }
    },
    log_ASout_search_country: function (
      country_code_searched,
      ASnum_init,
      is_picking,
      topo_flag
    ) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_ASout_search_country(
        country_code_searched,
        ASnum_init,
        is_picking,
        topo_flag
      );
    },
    log_click_in_asout: function (raycaster, eX, eY) {
      $("#asoutiframe").hide();
      $("#WebGL-output").show();
      log_click_in_asout(raycaster, eX, eY);
    },
    util_clear_geometry: function () {
      util_clear_geometry();
    },
  };
})();
