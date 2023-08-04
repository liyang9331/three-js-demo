//数据获取与绘图
// 依赖数据预处理与域内路由拓扑
var logicRouterIn = null;

var getRouterInData = function(as,input_subResult_record){
  var as = as*1 || 4515;
  var url = "./data/asnumber_routerin/AS"+as+".json";
  // var url = '../data/AS-Router/AS' + as+'.json';
loading.start();
removeAllMap();
$("#asoutiframe").hide();
$("#WebGL-output").show();
$.getJSON(url,function(data){
   if(data && data[0].routerInfoList && data[0].routerInfoList.length> 0){
      var R1data = handleRouterInData(data);
      var Rdata = computeCircleLayout(R1data)
      logicRouterIn =new LogicRouterIn(Rdata);

      if(input_subResult_record == 'all' || input_subResult_record == '' || !input_subResult_record){
        logicRouterIn.searchAllRouter();
      }else{
    
        switch(contentlist_btnstatus){
          case "1":logicRouterIn.searchRouterBykey(input_subResult_record,as);break;
          case "2":logicRouterIn.searchEdges(input_subResult_record,as);break;
        }
      }

      loading.done();
      Rdata = null;   
   }else{
     console.log('路由数据不存在')
   }
	
});

}


function computeCircleLayout(data){
  //圆形布局
  var theta_just = 0;
  var pointsData = [];

  data.forEach(function(d,i){
    var length = d.length;
    var theta = 2*Math.PI/length;
    theta_just += Math.PI/10;

    d.forEach(function(data,index){
      
      var x = Math.cos(theta*index+theta_just)*data.radius;
      var y = Math.sin(theta*index+theta_just)*data.radius;
      var z = 0;

      pointsData.push({
        "position": [x, y, z],
        "id": data.routerID,
        "links": data.linkedRouterIDList,
        "type":data.routerType,
        "name": data.routerIP,
        "description": data.description
      })

    })
  })

   return pointsData;
}


//数据预处理模块
var  handleRouterInData = function(d){
  var routerInfoListData = d[0].routerInfoList;
  var maxdegree = computeM(routerInfoListData);
  var Rdata = computeLayoutpara(routerInfoListData,maxdegree);

  function computeM(d){
    //计算最大最小度数
    var startdegree = d[0].degree*1,
        maxdegree = startdegree,mindegree = startdegree;
    
    d.forEach(function(d,i){

        if(d.degree*1 > maxdegree){
            maxdegree = d.degree*1;
        }      
    })

    return maxdegree;
  }

  function computeLayoutpara(data,maxdegree){
  //根据布局计算R,size,angle,color
    var Rdata = [];
    var RSegdata = [];
    var firstDegree = data[0].degree*1;
    
     data.forEach(function(d,i){
      
      var radius = computeRadius(d.degree,maxdegree);
      var size = computeSize(d.degree,maxdegree);
      // var color = computeRColor(d.routerType);

      var RdataObj = {};
      RdataObj.routerID = d.routerID;
      // RdataObj.rid = d.id;
      RdataObj.radius = radius;
      RdataObj.size = size;
      // RdataObj.color = color;
      RdataObj.routerType = d.routerType;
      RdataObj.routerIP= d.routerIP;
      RdataObj.description= d.description;
      RdataObj.linkedRouterIDList= d.linkedRouterIdList;
      // RdataObj.linkedRouterIDList= d.linkedIdList;

      if(d.degree*1 == firstDegree*1){
        RSegdata.push(RdataObj)
      }else{
        firstDegree = d.degree*1;
        Rdata.push(RSegdata)
        RSegdata = [];
        RSegdata.push(RdataObj)
      }  
        
    })

    Rdata.push(RSegdata)

    return Rdata;
  }

  function computeRadius(degree,maxdegree){
    // var radius = 1-Math.log((degree+1)/(maxdegree+1));
    // return radius;
    return (1-Math.log((degree*1+1)/(maxdegree*1+1)))*50;
  }

  function computeSize(degree,maxdegree){

    // var size =  (degree+1+maxdegree)/(maxdegree+1+maxdegree);
    return 0.08;
    // return (degree+1+maxdegree)/(maxdegree+1+maxdegree)/6;
  }

  // function computeRColor(routerType){
  //   //根据路由类型计算颜色
  //   var color = [110, 205, 222];
  //   var areaColor = [110, 205, 222],
  //     intermediateColor = [237, 31, 31],
  //     coreColor = [255, 190, 15];

  //   if(routerType === "core"){
  //     color = coreColor
  //   }else if(routerType === "intermediate"){
  //     color = intermediateColor
  //   }else if(routerType === "area"){
  //     color = areaColor
  //   }
  //   return color;
  // }

  return Rdata;
}





