console.log("------ datav3.q.lemap.js debug ------");

var PhyInterRouter = function (as1, as2, searchip) {
  var _ajax_url_ = datav_config.server_url;
  removeAllMap();
  init_map();
  $("#asoutiframe").hide();
  // $("#WebGL-output").show();

  // map.setView([32.30,14.36], 2);

  var intermediateIcon = L.divIcon({
    className: "interIcon iconfont icon-luyou",
    iconAnchor: [12, 12],
    iconSize: [30, 30],
    shadowAnchor: [0, 0],
    popupAnchor: [0, -5],
  });

  var areaIcon = L.divIcon({
    className: "areaIcon iconfont icon-luyou",
    iconAnchor: [12, 12],
    iconSize: [30, 30],
    shadowAnchor: [0, 0],
    popupAnchor: [0, -5],
  });

  var overlay = new L.echartsLayer(map, echarts);
  var chartsContainer = overlay.getEchartsContainer();
  $(chartsContainer).css({ zIndex: 999 });
  var myChart = overlay.initECharts(chartsContainer);
  window.onresize = myChart.onresize;
  var option = {
    color: ["gold", "aqua", "lime"],
    title: {
      text: "",
      subtext: "",
      x: "center",
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}",
    },
    toolbox: {
      show: false,
      orient: "vertical",
      x: "right",
      y: "center",
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    series: [
      {
        name: "all lines",
        type: "map",
        roam: true,
        hoverable: true,
        mapType: "none",
        itemStyle: {
          normal: {
            borderColor: "rgba(100,149,237,1)",
            borderWidth: 1,
            areaStyle: {
              color: "#1b1b1b",
            },
          },
        },
        data: [],
        markLine: {
          effect: {
            color: "rgba(204, 246, 255, 0.5)",
            show: true,
            period: 40,
          },
          // bundling: {
          //     // enable: true
          // },
          // large: true,
          smooth: true,
          smoothness: 0.1,
          symbol: ["none", "none"],
          symbolSize: 3,
          itemStyle: {
            normal: {
              color: "#fff",
              borderWidth: 1,
              borderColor: "rgba(255, 0, 0,0.5)",
              lineStyle: {
                // color: 'rgba(255, 69, 0,0.7)',
                color: "rgba(102, 255, 103,0.6)",
                type: "solid",
                width: 0.7,
                // opacity: 0.6
              },
            },
          },
          data: [],
        },
        geoCoord: {},
      },
      {
        name: "source ip",
        // type: 'map',
        type: "map",
        mapType: "none",
        data: [],
        markPoint: {
          // symbol:'emptyCircle',
          // symbol:'circle',
          symbol: "image://images/intermediaterouter.png",
          symbolSize: function (v) {
            // return 10 + v/10
            return [10, 10];
          },
          // effect : {
          //     show: true,
          //     shadowBlur : 0
          // },
          // itemStyle:{
          //     normal:{
          //         color: 'rgba(251, 118, 123,0.5)',
          //         // color: 'rgba(25, 183, 207,0.5)',
          //         label:{show:false}
          //     },
          //     emphasis: {
          //         label:{position:'top'},
          //         offset: 1,
          //         color: 'rgba(204, 46, 72,0.5)',
          //         symbolSize: 6,
          //         shadowColor: 'rgba(204, 46, 72,0.5)',
          //         shadowBlur: 100,
          //         borderWidth: 10
          //     }
          // },
          data: [],
        },
      },
      {
        name: "destnation ip",
        type: "map",
        mapType: "none",
        data: [],
        markPoint: {
          // symbol:'emptyCircle',
          symbol: "circle",
          symbol: "image://images/arearouter.png",
          symbolSize: function (v) {
            // return 10 + v/10
            return [10, 10];
          },
          // effect : {
          //     show: true,
          //     shadowBlur : 0
          // },
          itemStyle: {
            normal: {
              color: "rgba(129, 227, 238,0.5)",
              label: { show: false },
            },
            emphasis: {
              label: { position: "top" },
              offset: 1,
              color: "rgba(25, 183, 20,0.5)",
              size: 16,
              shadowColor: "rgba(25, 183, 20,0.5)",
              shadowBlur: 100,
              borderWidth: 10,
            },
          },
          data: [],
        },
      },
    ],
  };

  //数据格式
  // option.series[0].markLine.data = alldata;
  // option.series[0].geoCoord = geoCoord;
  // var alldata = [
  //                     [{name:'北京'},{name:'包头'}],
  //                     [{name:'北京'},{name:'北海'}],
  //                     [{name:'北京'},{name:'广州'}],
  //                     [{name:'北京'},{name:'郑州'}],
  //                     [{name:'北京'},{name:'成都'}],
  //                     [{name:'广州'},{name:'盐城'}]
  //                ];

  // var  geoCoord = {
  //                 '上海': [121.4648,31.2891],
  //                 '东莞': [113.8953,22.901],
  //                 '东营': [118.7073,37.5513],
  //                 '中山': [113.4229,22.478],
  //                 '临汾': [111.4783,36.1615],
  //                 '阳泉': [113.4778,38.0951],
  //                 '青岛': [120.4651,36.3373],
  //                 '韶关': [113.7964,24.7028]
  //             };

  var markers = L.markerClusterGroup({
    // spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false,
    maxClusterRadius: 0.0001,
    // maxClusterRadius: 500,
    spiderfyDistanceMultiplier: 1,
  });
  var allLines = [];
  // var sPoints = [];
  // var dPoints = [];
  var sPointsM = [];
  var dPointsM = [];
  var geoCoord = {};

  $.ajax({
    url: _ajax_url_ + "visual/control/vs/v3/topology/getInterfaceByASnumber",
    type: "post",
    datatype: "json",
    headers: { "Content-type": "application/json;charset=UTF-8" },
    // data: JSON.stringify({
    //     "as1":"10010",
    //     "as2":"17682"
    // })
    // data: JSON.stringify({
    //     "as1":"9808",
    //     "as2":"24400"
    // })
    // data: JSON.stringify({
    //     "as1":"4134",
    //     "as2":"3356"
    // })
    data: JSON.stringify({
      as1: as1,
      as2: as2,
    }),
  })
    .done(function (data) {
      if (data && data.list && data.list.length > 0) {
        $.each(data.list, function (i, d) {
          //echart连线数据
          geoCoord[d.ip1] = [d.ip1_info.j, d.ip1_info.w];
          geoCoord[d.ip2] = [d.ip2_info.j, d.ip2_info.w];
          allLines.push([{ name: d.ip1 }, { name: d.ip2 }]);
          sPointsM.push(d.ip1);
          dPointsM.push(d.ip2);
        });

        sPointsM = _.uniq(sPointsM);
        dPointsM = _.uniq(dPointsM);
        //聚簇点

        $.each(sPointsM, function (i, d) {
          var m1 = L.marker([geoCoord[d][1], geoCoord[d][0]], {
            //这里需传入纬度，经度，echart中的数据为经度，纬度
            icon: intermediateIcon,
            // ip:d.ip1
            name: d,
          }).bindPopup("<div>起始IP:" + d + "</div>");
          m1.on("click", handleClickM);
          markers.addLayer(m1);
        });

        $.each(dPointsM, function (i, d) {
          var m2 = L.marker([geoCoord[d][1], geoCoord[d][0]], {
            icon: areaIcon,
            // ip:d.ip2
            name: d,
          }).bindPopup("<div>目的IP:" + d + "</div>");
          m2.on("click", handleClickM);
          markers.addLayer(m2);
        });

        map.addLayer(markers);
        map.fitBounds(markers.getBounds());

        option.series[0].geoCoord = geoCoord;
        // option.series[1].markPoint.data = sPoints;
        // option.series[2].markPoint.data = dPoints;

        if (!searchip) {
          option.series[0].markLine.data = allLines;
        }
        myChart = overlay.initECharts(chartsContainer);
        overlay.setOption(option);
        // searchRouter(ip)
      } else {
        console.log("无相连路由器");
      }
    })
    .done(function () {
      if (searchip) {
        setTimeout(function () {
          searchRouter(searchip);
        }, 500);
      }
    })
    .fail(function (err) {
      // handleError()
    });

  // 添加图例
  showLengend();
  function showLengend() {
    $(".logrouter_tips").hide();
    $(".tips").hide();
    $(".phyrouter_tips").hide();
    $(".backtodomainouter").hide();
    $(".intodomain").hide();
    $(".chose_icon .myicon").hide();
    $(".inter_r_tips").show();
  }

  function handleClickM(e) {
    var searchValue = e.target.options.name;
    var asNumber = input_record.input_value;
    $("#export-form .search-input").val(searchValue);
    fetchData.getInterfaceByASnumber({
      as1: asNumber[0],
      as2: asNumber[1],
      key: searchValue,
    });
    redrawLines(searchValue);
  }

  function searchRouter(ip) {
    spiderfy(ip);
    redrawLines(ip);
  }
  function spiderfy(ip) {
    if (ip) {
      //展开聚簇
      markers.eachLayer(function (layer) {
        if (layer.options.name == ip) {
          if (!layer.getElement()) {
            layer.__parent.spiderfy();
            layer.openPopup();
          }
        }
      });
    } else {
      markers._unspiderfy();
    }
  }

  function redrawLines(ip) {
    if (ip) {
      //重新绘制连线
      var new_lines = [];
      for (var j = 0; j < allLines.length; j++) {
        if (allLines[j][0].name == ip || allLines[j][1].name == ip) {
          new_lines.push(allLines[j]);
        }
      }
      option.series[0].markLine.data = new_lines;
      myChart = overlay.initECharts(chartsContainer);
      overlay.setOption(option);
    } else {
      option.series[0].markLine.data = allLines;
      myChart = overlay.initECharts(chartsContainer);
      overlay.setOption(option);
    }
  }
  // searchRouter();
  return {
    searchRouter: searchRouter,
  };
};
