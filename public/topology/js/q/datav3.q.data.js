console.log("------ datav3.q.data.js debug ------");
var _ajax_url_ = datav_config.server_url;
var img_url = datav_config.images_url;
// var img_url = datav_config.ajax_images_url;
var paging;

var fetchData = (function () {
  loading.start();
  loading.done();
  var pageSize = 10;
  var svgHeader_global;
  var svgHeader_as;
  var svgHeader_country;
  //********************************************分页函数***********************************/
  // var currPage = 1;
  var jp_previous = $(".holder .jp-previous");
  var jp_next = $(".holder .jp-next");

  // 给下一页、上一页添加样式
  function hasNextFn(hasNext) {
    if (hasNext == true) {
      $(".holder .jp-next").removeClass("jp-disabled");
    } else {
      $(".holder .jp-next").addClass("jp-disabled");
    }
  }

  function paging(param) {
    console.log("分页初始化 paging() run")
    // cb 绑定的是函数 getAllCountruInfoOfGlobal2()
    jp_next.unbind();
    jp_previous.unbind();

    var options = {
      currPage: param.currPage || 1,
      pageSize: pageSize,
      cb: param.cd || "",
      hasNext: param.hasNext || "",
      countryCode: param.countryCode || "",
      lt: param.lt || "",
      key: param.key || "",
      countryCode1: param.countryCode1,
      countryCode2: param.countryCode2,
      as: param.as || "",
      as1: param.as1 || "",
      as2: param.as2 || "",
      areaCode: param.areaCode || "",
    };

    var currPage = (param && param.currPage) || 1;
    var cb = (param && param.cb) || "";

    // 给下一页绑定点击事件
    jp_next.bind("click", function () {
      console.log("点击了下一页")
      if (!$(this).hasClass("jp-disabled")) {
        currPage = currPage * 1 + 1;
        options.currPage = currPage;
        cb(options);
        jp_previous.removeClass("jp-disabled");
      }
    });

    // 给上一页绑定点击事件
    jp_previous.bind("click", function () {
      console.log("点击了上一页")
      if (!$(this).hasClass("jp-disabled")) {
        currPage = currPage * 1 - 1;
        options.currPage = currPage;
        // cb(currPage,countryCode,lt);
        cb(options);
        jp_next.removeClass("jp-disabled");
      }

      if (currPage == 1) {
        jp_previous.addClass("jp-disabled");
      } else if (jp_previous.hasClass("jp-disabled")) {
        jp_previous.removeClass("jp-disabled");
      }
    });
  }
  //********************************************分页函数 end***********************************/

  //********************************************ajax公共调用***********************************/
  function postAjax(url, options, cb, cb2) {
    // loading.set({show: false})
    if ($("#loadingContainer").css("display") === "none") {
      loading.set({ show: false });
      $(".loading-rblist").show();
    }
    $(".content-list").hide();

    $.ajax({
      url: _ajax_url_ + url,
      type: "post",
      datatype: "json",
      headers: { "Content-type": "application/json;charset=UTF-8" },
      data: JSON.stringify(options),
    })
      .done(function (data) {
        $(".loading-rblist").hide();
        loading.set({ show: true });
        if (data) {
          // hideAllInfo();
          cb(data);
        } else {
          handleError();
        }
      })
      .fail(function (err) {
        handleError();
      });
  }

  function getAjax(url, cb) {
    $.ajax({
      url: _ajax_url_ + url,
      type: "get",
      datatype: "json",
    })
      .done(function (data) {
        if (data) {
          cb(data);
        } else {
          handleError();
        }
      })
      .fail(function (err) {
        handleError();
      });
  }

  function handleError() {
    // hideAllInfo();
    showErrowMsg();
  }

  function showAsError(val) {
    console.log("showAsError() running");
    var val = val * 1;
    if (isReservedPrivateAs(val)) {
      $(".right-btm-error").text("保留私有AS").show();
    } else if (isReservedAs(val)) {
      $(".right-btm-error").text("保留AS").show();
    } else {
      $(".right-btm-error").text("无相关信息").show();
    }
  }

  function hideAllInfo() {
    console.log("hideAllInfo() running");
    jQuery(".logic_info_country").hide();
    jQuery(".logic_info_as").hide();
    jQuery(".logic_info_global").hide();
  }

  // 隐藏所有表格数据
  function hideAlltableInfo() {
    console.log("hideAlltableInfo() running");
    $(".right-btm .countrylist").hide();
    // $(".right-btm .aslist").hide();
    $(".right-btm .adjacentaslist").hide();
    // $('.right-btm .adjacentcountrylist').hide();
    $(".right-btm .adjacentcountrylist").hide();
    $(".right-btm .countryinaslist").hide();
    $(".right-btm .countrysaslist").hide();
    $(".right-btm .routerlist").hide();
    $(".right-btm .routeredgelist").hide();
    $(".right-btm .routerlist2").hide();
  }

  // 显示
  function showTablelistContainer() {
    console.log("showTablelistContainer() running");
    $(".right-btm .countrylist").hide();
    // $(".right-btm .aslist").hide();
    $(".right-btm").show();
    $(".right-btm .listContainer").show();
  }

  function showErrowMsg() {}

  //********************************************ajax公共调用 end***********************************/

  // 全球初始化头信息
  var getASInfoOfGlobal = function () {
    console.log("getASInfoOfGlobal() running")
    // 模拟数据
    data = {
      countryTop5: ["US", "CN", "JP", "DE", "GB"],
      content: "4%",
      enterpise: "54%",
      transitORAccess: "42%",
      ipCount: "4294967296",
      asCount: "68905",
      countryCount: "224",
      pp: "122871",
      pc: "105129",
      ss: "2216",
    };
    hideAllInfo();
    createGlobalInfo(data);
    jQuery(".logic_info_global").show();
    // getAjax('visual/control/vs/v3/topology/getASInfoOfGlobal',function(data){
    // 	hideAllInfo();
    // 	createGlobalInfo(data);
    // 	jQuery(".logic_info_global").show();
    // });
  };

  //全球初始化-AS边列表 && 国家内AS边关系列表公用
  function createContentAsedgelist(data) {
    var html = "";
    if (data) {
      data.forEach(function (d, i) {
        html +=
          "<table class='content-list'><tr class='row1'><td>" +
          d.sas +
          "</td><td>" +
          d.srank +
          "</td><td>" +
          d.stype +
          "</td><td>" +
          d.std +
          "</td><td>" +
          d.sname +
          "</td><td rowspan='2'>" +
          d.link_type +
          "</td></tr><tr><td>" +
          d.das +
          "</td><td>" +
          d.drank +
          "</td><td>" +
          d.dtype +
          "</td><td>" +
          d.dtd +
          "</td><td>" +
          d.dname +
          "</td></tr></table>";
      });
    }
    return html;
  }

  var getASEdgeofGlobal2 = function (param) {
    var key = (param && param.key) || "";
    var areaCode = (param && param.areaCode) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;

    var options = {
      pageSize: pageSize,
      currPage: currPage,
      key: key,
      areaCode: areaCode,
    };

    postAjax(
      "visual/control/vs/v3/topology/getASEdgeofGlobal",
      options,
      function (data) {
        // console.log('全球初始化AS列表信息 in 2')
        // console.log(data)
        hasNextFn(data.hasNext);
        var data_html = createContentAsedgelist(data.list);
        $(".asedgelist").find(".content-list").remove();
        $(".asedgelist").append(data_html);
      }
    );
  };

  var getASEdgeofGlobal = function (param) {
    $(".right-btm-error").hide();
    var key = (param && param.key) || "";
    var areaCode = (param && param.areaCode) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;

    var options = {
      pageSize: 10,
      currPage: "1",
      key: key,
      areaCode: areaCode,
    };

    postAjax(
      "visual/control/vs/v3/topology/getASEdgeofGlobal",
      options,
      function (data) {
        hideAlltableInfo();
        // $('.right-btm .listContainer').hide();
        // console.log('AS边关系');
        // console.log(data);
        if (data && data.list && data.list.length > 0) {
          var title = "AS边列表";
          $(".right-btm .title p").html(title);
          var title_html = createRowsTitle4();
          // var data_html = createAslist4(data.list);
          var data_html = createContentAsedgelist(data.list);
          var content_html = title_html + data_html;
          //    $('.right-btm .asedgelist').show();
          // createContentAsedgelistinGlobal(data);
          $(".right-btm .listContainer").html(
            '<div class="content asedgelist countrylistStyle"></div>'
          );
          $(".right-btm .asedgelist").html(content_html);
          $(".right-btm .listContainer").show();
          $(".right-btm").show();
          // $('.right-btm .asedgelist').show();

          var other_info_initAS = {
            "S ASN:": "Source AS(起始AS)",
            "D ASN:": "Destination AS(目的AS)",
            // 'Type:': '类型',
            "TD:": "Transit Degree(传输度数)",
            "LT:": "Linked Type(连接的类型)",
          };

          showContentOther(other_info_initAS);
          hasNextFn(data.hasNext);
          jp_previous.addClass("jp-disabled");
          paging({
            currPage: currPage,
            cb: getASEdgeofGlobal2,
            hasNext: data.hasNext,
            key: key,
            areaCode: areaCode,
          });
        } else {
          $(".right-btm-error").text("无相关信息").show();
        }
      }
    );
  };

  // getASEdgeofGlobal({"key":"4515","currPage":1,"pageSize":10})

  //全球初始化AS列表信息
  function createContentAslistinGlobal(data) {
    var title_html = createRowsTitle1();
    var data_html = createAslist1(data.asInfoList);
    var content_html = title_html + data_html;
    // $(".right-btm .aslist").html(content_html);

    hasNextFn(data.hasNext);
  }

  var getASTypeStatisticsOfGlobal2 = function (param) {
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    // var currPage = param && param.currPage;
    // var currPage = currPage || 1;
    // var currPage = currPage || 1;

    var options = {
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    const data = {
      checkDesc: "success",
      checkFlag: "false",
      productFlag: "false",
    };
    createContentAslistinGlobal(data);
    // postAjax(
    //   "visual/control/vs/v3/topology/getASTypeStatisticsOfGlobal",
    //   options,
    //   function (data) {
    //     // console.log('全球初始化AS列表信息 in 2')
    //     // console.log(data)
    //     createContentAslistinGlobal(data);
    //   }
    // );
  };

  var getASTypeStatisticsOfGlobal = function (param) {
    $(".right-btm-error").hide();
    // if(param && param.key && param.currPage){
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;

    var options = {
      pageSize: 10,
      currPage: "1",
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getASTypeStatisticsOfGlobal",
      options,
      function (data) {
        hideAlltableInfo();

        $(".right-btm .title p").text("AS列表");
        $(".right-btm .listContainer").hide();
        $(".right-btm .countrylist").hide();
        $(".right-btm .aslist").show();

        var other_info_initAS = {
          "ASN:": "AS Number(AS编号)",
          "TD:": "Transit Degree(传输度数)",
          "ASS:": "AS Size(直连的AS数量,节点度数)",
          "IPV:": "IP Volume(IP数量)",
          "CCAS:": "Customer Cone AS Size(连通的AS数量)",
          "CCIP:": "Customer Cone IP Size(连通的IP数量)",
          "CC:": "Country Code(国家或地区简称)",
        };

        showContentOther(other_info_initAS);
        if (data && data.asInfoList && data.asInfoList.length > 0) {
          createContentAslistinGlobal(data);
          hasNextFn(data.hasNext);
          jp_previous.addClass("jp-disabled");
          paging({
            currPage: currPage,
            cb: getASTypeStatisticsOfGlobal2,
            hasNext: data.hasNext,
            key: key,
          });
        } else {
          showAsError(key * 1);
        }
      }
    );
  };

  // 全球初始化国家列表信息
  function createContentCountrylistInGlobal(data) {
    console.log("createContentCountrylistInGlobal running 表格渲染国家数据");
    hideAlltableInfo();
    // $('.right-btm .title p').text('相邻的国家列表');
    var title_arr = ["Country", "CC", "Rank", "ASV", "IPV", "CS", "ASS"];
    var dname_arr = [
      "countryName",
      "countryCode",
      "countryRank",
      "asCount",
      "ipCount",
      "linkedCountrySize",
      "linkedASSize",
    ];
    var title_html = createRowTitle(title_arr);
    // console.log("---- 000 ----")
    // console.log(data)
    var data_html = createRowInfo(data.countryInfolist, dname_arr);
    var content_html = title_html + data_html;
    $("#countrylist").html(content_html);
    hasNextFn(data.hasNext);
  }

  // 获取全球所有国家数据 2
  var getAllCountruInfoOfGlobal2 = function (param) {
    console.log("getAllCountruInfoOfGlobal2() running 获取全球所有国家数据");
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;

    const data = {
      hasNext: true,
      countryInfolist: [
        {
          countryName: "美国",
          countryCode: "US",
          countryRank: 1,
          asCount: 17248,
          ipCount: 1557490245,
          linkedCountrySize: 213,
          linkedASSize: 12462,
        },
        {
          countryName: "中国",
          countryCode: "CN",
          countryRank: 2,
          asCount: 517,
          ipCount: 414788684,
          linkedCountrySize: 63,
          linkedASSize: 541,
        },
        {
          countryName: "日本",
          countryCode: "JP",
          countryRank: 3,
          asCount: 633,
          ipCount: 195881510,
          linkedCountrySize: 47,
          linkedASSize: 368,
        },
        {
          countryName: "德国",
          countryCode: "DE",
          countryRank: 4,
          asCount: 2034,
          ipCount: 132980390,
          linkedCountrySize: 140,
          linkedASSize: 4209,
        },
        {
          countryName: "英国",
          countryCode: "GB",
          countryRank: 5,
          asCount: 1887,
          ipCount: 119040554,
          linkedCountrySize: 146,
          linkedASSize: 6173,
        },
        {
          countryName: "韩国",
          countryCode: "KR",
          countryRank: 6,
          asCount: 759,
          ipCount: 113565020,
          linkedCountrySize: 34,
          linkedASSize: 219,
        },
        {
          countryName: "巴西",
          countryCode: "BR",
          countryRank: 7,
          asCount: 7954,
          ipCount: 88984025,
          linkedCountrySize: 119,
          linkedASSize: 3130,
        },
        {
          countryName: "法国",
          countryCode: "FR",
          countryRank: 8,
          asCount: 1181,
          ipCount: 82681550,
          linkedCountrySize: 146,
          linkedASSize: 4164,
        },
        {
          countryName: "加拿大",
          countryCode: "CA",
          countryRank: 9,
          asCount: 1315,
          ipCount: 70594977,
          linkedCountrySize: 52,
          linkedASSize: 811,
        },
        {
          countryName: "意大利",
          countryCode: "IT",
          countryRank: 10,
          asCount: 967,
          ipCount: 56591866,
          linkedCountrySize: 135,
          linkedASSize: 4312,
        },
      ],
    };
    createContentCountrylistInGlobal(data);
    //  postAjax('visual/control/vs/v3/topology/getAllCountruInfoOfGlobal',options,function(data){
    //     // console.log('全球初始化国家列表信息 in2')
    //     // console.log(data)
    //     createContentCountrylistInGlobal(data);
    //  })
  };

  // 获取全球所有国家数据
  var getAllCountruInfoOfGlobal = function (param) {
    console.log('getAllCountruInfoOfGlobal() running 获取全球所有国家数据')
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;

    // 模拟数据
    const data = {
      hasNext: true,
      countryInfolist: [
        {
          countryName: "美国",
          countryCode: "US",
          countryRank: 1,
          asCount: 17248,
          ipCount: 1557490245,
          linkedCountrySize: 213,
          linkedASSize: 12462,
        },
        {
          countryName: "中国",
          countryCode: "CN",
          countryRank: 2,
          asCount: 517,
          ipCount: 414788684,
          linkedCountrySize: 63,
          linkedASSize: 541,
        },
        {
          countryName: "日本",
          countryCode: "JP",
          countryRank: 3,
          asCount: 633,
          ipCount: 195881510,
          linkedCountrySize: 47,
          linkedASSize: 368,
        },
        {
          countryName: "德国",
          countryCode: "DE",
          countryRank: 4,
          asCount: 2034,
          ipCount: 132980390,
          linkedCountrySize: 140,
          linkedASSize: 4209,
        },
        {
          countryName: "英国",
          countryCode: "GB",
          countryRank: 5,
          asCount: 1887,
          ipCount: 119040554,
          linkedCountrySize: 146,
          linkedASSize: 6173,
        },
        {
          countryName: "韩国",
          countryCode: "KR",
          countryRank: 6,
          asCount: 759,
          ipCount: 113565020,
          linkedCountrySize: 34,
          linkedASSize: 219,
        },
        {
          countryName: "巴西",
          countryCode: "BR",
          countryRank: 7,
          asCount: 7954,
          ipCount: 88984025,
          linkedCountrySize: 119,
          linkedASSize: 3130,
        },
        {
          countryName: "法国",
          countryCode: "FR",
          countryRank: 8,
          asCount: 1181,
          ipCount: 82681550,
          linkedCountrySize: 146,
          linkedASSize: 4164,
        },
        {
          countryName: "加拿大",
          countryCode: "CA",
          countryRank: 9,
          asCount: 1315,
          ipCount: 70594977,
          linkedCountrySize: 52,
          linkedASSize: 811,
        },
        {
          countryName: "意大利",
          countryCode: "IT",
          countryRank: 10,
          asCount: 967,
          ipCount: 56591866,
          linkedCountrySize: 135,
          linkedASSize: 4312,
        },
      ],
    };
    if (data && data.countryInfolist && data.countryInfolist.length > 0) {
      hideAlltableInfo();
      $(".right-btm .listContainer").hide();
      $(".right-btm .countrylist").show();
      createContentCountrylistInGlobal(data);
      // console.log($(".right-btm .aslist"))
      // $(".right-btm .aslist").hide();
      $(".right-btm .title p").text("国家(地区)列表");
      $(".right-btm .countrylist").show();

      var other_info_initCountry = {
        "CC:": " Country Code(国家或地区简称)",
        "ASV:": "AS Volume(拥有的AS数量)",
        "IPV:": "IP Volume(IP数量)",
        "CS:": "Country Size(直连的国家或地区数量)",
        "ASS:": "AS Size(直连的AS数量,节点度数)",
      };

      showContentOther(other_info_initCountry);
      jp_previous.addClass("jp-disabled");
      hasNextFn(data.hasNext);
      paging({
        currPage: currPage,
        cb: getAllCountruInfoOfGlobal2,
        hasNext: data.hasNext,
      });
    } else {
      // $(".right-btm-error").text("无相关信息").show();
    }

    // postAjax(
    //   "visual/control/vs/v3/topology/getAllCountruInfoOfGlobal",
    //   options,
    //   function (data) {
    //   }
    // );
  };

  //全球搜国家-相连的其他国家信息
  function createContentOthercountrylistInCountry(data) {
    $(".right-btm-error").hide();
    $(".right-btm .title p").text("相连国家(地区)列表");
    var title_arr = ["Country", "CC", "Rank", "ASV", "IPV", "CS", "ASS"];
    var dname_arr = [
      "country",
      "countryCode",
      "countryRank",
      "asv",
      "ipv",
      "cs",
      "aslinkCount",
    ];

    var title_html = createRowTitle(title_arr);
    var data_html = createRowInfo(data.countriesAndAslinkCount, dname_arr);
    var content_html = title_html + data_html;
    $(".right-btm .listContainer").html(
      ' <div class="content adjacentcountrylist countrylistStyle"></div>'
    );
    $(".right-btm .adjacentcountrylist").html(content_html);
    hideAlltableInfo();
    $(".right-btm .adjacentcountrylist").show();

    hasNextFn(data.hasNext);
  }
  var getCountriesAsCountByCountry2 = function (param) {
    var countryCode = (param && param.countryCode) || "";
    var pageSize = (param && param.pageSize) || 10;
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || "1";

    var options = {
      countryCode: countryCode,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getCountriesAsCountByCountry",
      options,
      function (data) {
        //   console.log('全球搜国家与某个国家相连的其他国家信息')
        // console.log(data)
        createContentOthercountrylistInCountry(data);
      }
    );
  };

  var getCountriesAsCountByCountry = function (param) {
    $(".right-btm-error").hide();
    var countryCode = (param && param.countryCode) || "";
    var pageSize = (param && param.pageSize) || 10;
    var key = (param && param.key) || "";
    var currPage = (param && param.currPage) || "1";

    var options = {
      countryCode: countryCode,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getCountriesAsCountByCountry",
      options,
      function (data) {
        // console.log('全球搜国家与某个国家相连的其他国家信息')
        // console.log(data)
        showTablelistContainer();
        createContentOthercountrylistInCountry(data);

        var other_info = {
          "CC:": "Country Code(国家或地区简称)",
          "ASV:": "AS Volume(拥有的As数量)",
          "IPV:": "IP Volume(IP数量)",
          "CS:": "Country Size(直连的国家或地区数量)",
          "ASS:": "AS Size(直连的AS数量,节点度数)",
        };

        showContentOther(other_info);
        jp_previous.addClass("jp-disabled");
        hasNextFn(data.hasNext);
        paging({
          currPage: currPage,
          cb: getCountriesAsCountByCountry2,
          hasNext: data.hasNext,
          countryCode: countryCode,
          key: key,
        });
      }
    );
  };

  //全球搜索国家-国家内AS列表
  function createContentAslistInCountry(data) {
    var title_html = createRowsTitle3();
    var data_html = createAslist3(data.asInfoList);
    var content_html = title_html + data_html;

    $(".right-btm .listContainer").html(
      '<div class="content countryinaslist aslistStyle"></div>'
    );
    $(".right-btm .countryinaslist").html(content_html);
    // $('.right-btm .countryinaslist').hide();
    hasNextFn(data.hasNext);
  }
  var getAsNumberListByCountry2 = function (param) {
    var currPage = (param && param.currPage) || "1";
    var pageSize = (param && param.pageSize) || 10;
    var countryCode = (param && param.countryCode) || "";
    var key = (param && param.key) || "";

    var options = {
      countryCode: countryCode,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getAsNumberListByCountry",
      options,
      function (data) {
        // console.log('全球搜索国家-国家内AS列表')
        // console.log(data)
        if (data.asInfoList) {
          createContentAslistInCountry(data);
        }
      }
    );
  };

  var getAsNumberListByCountry = function (param) {
    $(".right-btm-error").hide();
    var currPage = (param && param.currPage) || "1";
    var pageSize = (param && param.pageSize) || 10;
    var countryCode = (param && param.countryCode) || "";
    var key = (param && param.key) || "";

    var options = {
      countryCode: countryCode,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getAsNumberListByCountry",
      options,
      function (data) {
        // console.log('全球搜索国家-国家内AS列表')
        // console.log(data)
        if (data.asInfoList) {
          $(".right-btm .adjacentcountrylist").hide();
          $(".right-btm .title p").text("国家(地区)内AS列表");
          showTablelistContainer();
          createContentAslistInCountry(data);
          $(".right-btm .countryinaslist").show();

          var other_info = {
            "ASN:": "AS Number(AS编号)",
            "TD:": "AS Transit Degree(传输度数)",
            "ASS:": "AS Size(直连的AS数量,节点度数)",
            "IPV:": "IP Volume(IP数量)",
            "CCAS:": "Customer Cone AS Size(连通的AS数量)",
            "CCIP:": "Customer Cone IP Size(连通的IP数量)",
          };

          showContentOther(other_info);
          jp_previous.addClass("jp-disabled");
          paging({
            currPage: currPage,
            cb: getAsNumberListByCountry2,
            hasNext: data.hasNext,
            countryCode: countryCode,
            key: key,
          });
        } else {
          console.log("无对应AS列表");
        }
      }
    );
  };

  // 全球搜索AS-相邻的AS列表信息
  function createContentAslistInAs(data) {
    $(".right-btm-error").hide();

    var title_html = createRowsTitle2();
    var data_html = createAslist2(data.asInfolist);
    var content_html = title_html + data_html;

    $(".right-btm .listContainer").html(
      '<div class="content adjacentaslist aslistStyle"></div>'
    );
    $(".right-btm .adjacentaslist").html(content_html);
    hasNextFn(data.hasNext);
  }

  var getParentASListByASN2 = function (param) {
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var lt = (param && param.lt) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      pageSize: pageSize,
      currPage: currPage,
      lt: lt,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getParentASListByASN",
      options,
      function (data) {
        // console.log("全球搜索AS-相邻的AS列表信息");
        // console.log(data);
        if (data && data.asInfolist) {
          createContentAslistInAs(data);
        }
      }
    );
  };

  var getParentASListByASN = function (param) {
    $(".right-btm-error").hide();
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var lt = (param && param.lt) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      pageSize: pageSize,
      currPage: currPage,
      lt: lt,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getParentASListByASN",
      options,
      function (data) {
        // console.log("全球搜索AS-相邻的AS列表信息")
        // console.log(data)
        $(".right-btm .title p").text("相邻的AS列表");
        showTablelistContainer();

        var other_info = {
          "ASN: AS Number(AS编号)":
            "&nbsp;&nbsp;TD:AS Transit Degree(传输度数)",
          "ASS:": "AS Size(直连的AS数量,节点度数)",
          "IPV:": "IP Volume(IP数量)",
          "CCAS:": "Customer Cone AS Size(连通的AS数量)",
          "CCIP:": "Customer Cone IP Size(连通的IP数量)",
          "CC:Country Code(国家或地区简称)": "&nbsp;LT:Linked Type(连接的类型)",
        };

        showContentOther(other_info);

        $(".right-btm .adjacentaslist").show();
        jp_previous.addClass("jp-disabled");
        if (data && data.asInfolist && data.asInfolist.length > 0) {
          createContentAslistInAs(data);
          hasNextFn(data.hasNext);

          paging({
            currPage: currPage,
            cb: getParentASListByASN2,
            hasNext: data.hasNext,
            as: as,
            lt: lt,
            key: key,
          });
        } else {
          showAsError(as);
        }
      }
    );
  };

  // 根据AS编号获取AS头信息
  var getASInfo = function (asNumber) {
    console.log("------ 根据AS编号获取AS头信息 debug------");
    var options = {
      asNumber: asNumber,
    };

    postAjax(
      "visual/control/vs/v3/topology/getASInfo",
      options,
      function (data) {
        hideAllInfo();
        createASInfoDom(data);

        jQuery(".logic_info_as").show();
      }
    );
  };

  // 国家右上头信息，国家间逻辑拓扑:点击逻辑拓扑中的国家标签返回该国家相关信息
  var getCountryInfoBetweenCountry = function (countryCode) {
    console.log(
      "------ 国家右上头信息，国家间逻辑拓扑:点击逻辑拓扑中的国家标签返回该国家相关信息 ------"
    );
    // var countryCode = param && param.countryCode  && '';
    var options = {
      countryCode: countryCode,
      key: "",
    };

    postAjax(
      "visual/control/vs/v3/topology/getCountryInfoBetweenCountry",
      options,
      function (data) {
        // console.log(data);
        hideAllInfo();
        createCountryInfoDom(data);
        jQuery(".logic_info_country").show();
        jQuery(".logic_info_country").eq(0).show();
      }
    );
  };

  // 国家双击边，显示与X国相连的AS列表
  var getEdgeInfoBetweenCountry2 = function (param) {
    var currPage = (param && param.currPage) || "1";
    var pageSize = (param && param.pageSize) || 10;
    var countryCode1 = (param && param.countryCode1) || "";
    var countryCode2 = (param && param.countryCode2) || "";
    var key = (param && param.key) || "";

    var options = {
      countryCode1: countryCode1,
      countryCode2: countryCode2,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getEdgeInfoBetweenCountry",
      options,
      function (data) {
        // console.log('国家双击边，显示与X国相连的AS列表');
        // console.log(data)
        hideAlltableInfo();
        if (data.list) {
          // var title='与'+data.list[0].scountry+'相连AS列表';
          var title_html = createRowsTitle4();
          var data_html = createAslist4(data.list);
          var content_html = title_html + data_html;

          $(".right-btm .listContainer").html(
            ' <div class="content countrysaslist countrylistStyle"></div>'
          );
          $(".right-btm .countrysaslist").html(content_html);

          hasNextFn(data.hasNext);
        }
      }
    );
  };

  var getEdgeInfoBetweenCountry = function (param) {
    $(".right-btm-error").hide();
    var currPage = (param && param.currPage) || "1";
    var pageSize = (param && param.pageSize) || 10;
    var countryCode1 = (param && param.countryCode1) || "";
    var countryCode2 = (param && param.countryCode2) || "";
    var key = (param && param.key) || "";

    var options = {
      countryCode1: countryCode1,
      countryCode2: countryCode2,
      pageSize: pageSize,
      currPage: currPage,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getEdgeInfoBetweenCountry",
      options,
      function (data) {
        // console.log('国家双击边，显示与X国相连的AS列表');
        // console.log(data)
        hideAlltableInfo();
        if (data.list) {
          // var title='与'+data.list[0].scountry+'相连AS列表';
          var title = "与<b>" + data.dcountry + "</b>相连AS列表";
          $(".right-btm .title p").html(title);
          var title_html = createRowsTitle4();
          var data_html = createAslist4(data.list);
          var content_html = title_html + data_html;

          $(".right-btm .listContainer").html(
            ' <div class="content countrysaslist countrylistStyle"></div>'
          );
          $(".right-btm .countrysaslist").html(content_html);
          $(".right-btm .listContainer").show();

          var other_info = {
            "S ASN:": "Source AS编号",
            "D ASN:": "Destination AS编号",
            "TD:": "AS Transit Degree(传输度数)",
            "LT:": "Link Type(链接类型)",
          };

          showContentOther(other_info);

          $(".right-btm .countrysaslist").show();
          jp_previous.addClass("jp-disabled");
          hasNextFn(data.hasNext);
          paging({
            currPage: currPage,
            cb: getEdgeInfoBetweenCountry2,
            hasNext: data.hasNext,
            countryCode1: countryCode1,
            countryCode2: countryCode2,
            key: key,
          });
        }
      }
    );
  };

  //********************************** 域内拓扑部分*********************/
  function createContentRouterlistInRouterin(data) {
    $(".right-btm-error").hide();
    var title_html = createRouterlistTitle();
    var data_html = createRouterlist(data.list);
    var content_html = title_html + data_html;

    $(".right-btm .listContainer").html(
      '<div class="content routerlist aslistStyle"></div>'
    );
    $(".right-btm .routerlist").html(content_html);
    $(".right-btm .routerlist").show();

    hasNextFn(data.hasNextPage);
    var content_list_mult = $(".routerlist .mult");

    content_list_mult.click(function () {
      $(this).find("ul").slideToggle();
    });
  }

  var getEdgeInfoWithinAS = function (as) {
    var options = { asNumber: as };
    postAjax(
      "visual/control/vs/v3/topology/getEdgeInfoWithinAS",
      options,
      function (data) {
        // console.log('域内路由的右上信息');
        // console.log(data);
        createASDomainInfoDom(data);
        $(".logic_info_as").show();
      }
    );
  };
  //域内路由器列表
  var getRouterInfoWithinAS2 = function (param) {
    var role = (param && param.role) || "all";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      currentPage: currPage,
      pageSize: pageSize,
      role: "all",
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getRouterInfoWithinAS",
      options,
      function (data) {
        // console.log('域内路由的列表信息');
        // console.log(data);
        // $('.right-btm .title p').text('域内路由器列表');

        createContentRouterlistInRouterin(data);
      }
    );
  };

  var getRouterInfoWithinAS = function (param, flag) {
    $(".right-btm-error").hide();
    var role = (param && param.role) || "all";
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      currPage: currPage,
      pageSize: pageSize,
      role: role,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getRouterInfoWithinAS",
      options,
      function (data) {
        // console.log('域内路由的列表信息');
        // console.log(data);
        if (data.list) {
          showTablelistContainer();
          $(".right-btm .title p").text("域内路由器列表");

          createContentRouterlistInRouterin(data);

          var other_info = {
            "NodeID:": "路由器节点ID",
            "TD:": "Transit Degree(传输度数)",
            "IPV:": "IP Volume(IP数量)",
            "DV:": "District Volume(覆盖的行政区数量)",
            "Prov:Province(省)": "&nbsp;&nbsp;&nbsp;&nbsp;Dist: District(区)",
            "Lon: Longitude(经度)":
              "&nbsp;&nbsp;&nbsp;&nbsp;Lat:Latitude(纬度)",
          };

          showContentOther(other_info);
          paging({
            currPage: currPage,
            cb: getRouterInfoWithinAS2,
            hasNext: data.hasNextPage,
            as: as,
            key: key,
          });

          //根据返回的信息对应在地图中显示出高亮的路由
        }
        if (!flag) {
          input_record.input_subResult_record = data.info.markId;

          if (is_phy_log == "phy" && phyTopoin && phyTopoin.searchRouter) {
            if (pageSize == "1") {
              $(".holder .jp-next").addClass("jp-disabled");
              input_record.input_subResult_record.length = 1;
              phyTopoin.searchRouter(input_record.input_subResult_record);
            } else {
              if (data.info.markId.length > 0) {
                phyTopoin.searchRouter(data.info.markId);
              } else if (
                data.info.markId.length == 0 &&
                data.list.length == 0
              ) {
                //无数据
                phyTopoin.searchRouter(data.info.markId);
              } else if (data.info.markId.length == 0 && data.list.length > 0) {
                //全部数据
                phyTopoin.searchAllRouter();
                input_record.input_subResult_record = "all";
              }
            }
          } else if (
            is_phy_log == "log" &&
            logicRouterIn &&
            logicRouterIn.searchRouter
          ) {
            if (pageSize == "1") {
              $(".holder .jp-next").addClass("jp-disabled");
              input_record.input_subResult_record.length = 1;
              phyTopoin.searchRouter(data.info.markId);
            } else {
              if (data.info.markId.length > 0) {
                logicRouterIn.searchRouter(data.info.markId);
              } else if (
                data.info.markId.length == 0 &&
                data.list.length == 0
              ) {
                logicRouterIn.searchRouter(data.info.markId);
              } else if (data.info.markId.length == 0 && data.list.length > 0) {
                logicRouterIn.searchAllRouter();
                input_record.input_subResult_record = "all";
              }
            }
          }
        }
      }
    );
  };

  function createRouterlistTitle() {
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>NodeID</th><th>IP</th><th class="type">Type</th><th>TD</th><th>IPV</th>' +
      '<th class="ipv">DV</th></tr>' +
      '<tr class="row2"><th>Country</th><th>Prov</th>' +
      "<th>City</th><th>Dist</th><th>Lon</th><th>Lat</th></tr></table>";
    return html;
  }

  function createRouterlist(data) {
    var html = "";
    var dvlist_html = "";
    var iplist_html = "";

    data.forEach(function (d) {
      $.each(d.districtCoverageArray, function (index, val) {
        dvlist_html += "<li>" + val + "</li>";
      });

      // console.log(typeof d.districtCoverageArray)
      if (d.ipArray.length > 1) {
        iplist_html +=
          "<span>" +
          '<a href="./b.html?ip=' +
          d.ipArray[0] +
          '" target="_blank" title="进入捕风者定位IP">' +
          d.ipArray[0] +
          "</a>" +
          '</span><ul class="clearfix">';
        for (var i = 1; i < d.ipArray.length; i++) {
          iplist_html +=
            '<li><a href="./b.html?ip=' +
            d.ipArray[i] +
            '" target="_blank" title="进入捕风者定位IP">' +
            d.ipArray[i] +
            "</a></li>";
        }
        iplist_html += "</ul>";
      } else {
        if (d.ipArray[0] == "106.1.188.35") {
          //临时用，文字显示红色
          iplist_html =
            '<a href="./b.html?ip=' +
            d.ipArray[0] +
            '" target="_blank" title="进入捕风者定位IP" style="color: red">' +
            d.ipArray[0] +
            "</a>";
        } else {
          iplist_html =
            '<a href="./b.html?ip=' +
            d.ipArray[0] +
            '" target="_blank" title="进入捕风者定位IP">' +
            d.ipArray[0] +
            "</a>";
        }
      }

      if (d.districtCoverageArray == 0) {
        dvlist_html += "<li>" + "暂无" + "</li>";
      }

      html +=
        "<table class='content-list'><tr class='row1'><td>" +
        d.nodeId +
        "</td><td class='mult'>" +
        iplist_html +
        "</td><td class='type'>" +
        (d.type == "core"
          ? "核心"
          : d.type == "intermediate"
          ? "中间"
          : "边缘") +
        "</td><td>" +
        d.td +
        "</td><td>" +
        d.ipv +
        "</td><td class='mult'><span>" +
        d.districtCoverageArray.length +
        '</span><ul class="clearfix">' +
        dvlist_html +
        "</ul>" +
        "</td></tr><tr class='row2'><td>" +
        (d.country == "" || d.country == "null" || d.country == "None"
          ? "暂无"
          : d.country) +
        "</td><td>" +
        (d.prov == "" || d.prov == "null" || d.prov == "None"
          ? "暂无"
          : d.prov) +
        "</td><td>" +
        (d.city == "" || d.city == "null" || d.city == "None"
          ? "暂无"
          : d.city) +
        "</td><td>" +
        (d.dist == "" || d.dist == "null" || d.dist == "None"
          ? "暂无"
          : d.dist) +
        "</td><td>" +
        (d.lon == "" || d.lon == "null" || d.lon == "None" ? "暂无" : d.lon) +
        "</td><td>" +
        (d.lat == "" || d.lat == "null" || d.lat == "None" ? "暂无" : d.lat) +
        "</td></tr></table>";

      dvlist_html = "";
      iplist_html = "";
    });

    return html;
  }

  /***************************************域内拓扑 与某个AS相连的路由器列表***************************************/

  var getInterfaceByASnumber = function (param, flag) {
    $(".right-btm-error").hide();
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as1 = (param && param.as1) || "";
    var as2 = (param && param.as2) || "";
    var key = (param && param.key) || "";

    var options = {
      currPage: currPage,
      pageSize: pageSize,
      as1: as1,
      as2: as2,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getInterfaceByASnumber",
      options,
      function (data) {
        // console.log('与某个AS相连的域内路由的列表');
        // console.log(data);
        showTablelistContainer();

        $(".right-btm .title p").text("与" + as2 + "相连路由器列表");
        var other_info = {
          "S IP: Source IP(起始IP)": "&nbsp;&nbsp;D IP: Destination IP(目的IP)",
          "CC:": "Country Code(国家或地区简称)",
          "Prov:Province(省)": "&nbsp;&nbsp;&nbsp;&nbsp;Dist: District(区)",
          "Lon: Longitude(经度)": "&nbsp;&nbsp;&nbsp;&nbsp;Lat:Latitude(纬度)",
        };
        showContentOther(other_info);

        if (data && data.list && data.list.length > 0) {
          createCTIninterR(data);

          paging({
            currPage: currPage,
            cb: getInterfaceByASnumber2,
            hasNext: data.hasNextPage,
            as1: as1,
            as2: as2,
            key: key,
          });

          //根据返回的信息对应在地图中显示出高亮的路由
        } else {
          $(".right-btm-error").text("无相关信息").show();
        }

        if (!flag) {
          // input_record.input_subResult_record = data.info.markId;
          //    if(is_phy_log == "phy" && phyInterRouter && phyInterRouter.searchRouter){
          //    	phyTopoin.searchRouter();
          //    }else if(is_phy_log == "log"){
          //    }
        }
      }
    );
  };

  var getInterfaceByASnumber2 = function (param) {
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as1 = (param && param.as1) || "";
    var as2 = (param && param.as2) || "";
    var key = (param && param.key) || "";

    var options = {
      currPage: currPage,
      pageSize: pageSize,
      as1: as1,
      as2: as2,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getInterfaceByASnumber",
      options,
      function (data) {
        if (data.list) {
          showTablelistContainer();
          $(".right-btm .title p").text("与" + as2 + "相连路由器列表");
          createCTIninterR(data);
        }
      }
    );
  };

  function createCTIninterR(data) {
    // createContentRouterlistInRouterin(data);
    var title_html = createTitleIninterR();
    var data_html = createContentIninterR(data.list);
    // console.log(data_html)
    var content_html = title_html + data_html;

    $(".right-btm .listContainer").html(
      '<div class="content routerlist2 aslistStyle"></div>'
    );
    $(".right-btm .routerlist2").html(content_html);
    $(".right-btm .content").hide();
    // $('.right-btm').show();
    $(".right-btm .routerlist2").show();
    hasNextFn(data.hasNext);
  }

  function createContentIninterR(data) {
    //与X国相邻的AS列表，两行相同AS

    var html = "";

    if (data) {
      data.forEach(function (d, i) {
        // console.log(d.ip1_info+i)
        // console.log(d.ip1_info.p)
        html +=
          "<div class=''><table class='content-list'><tr class='row1'><td>" +
          d.ip1 +
          "</td><td>" +
          d.ip1_country +
          "</td><td>" +
          d.ip1_info.p +
          "</td><td>" +
          d.ip1_info.c +
          "</td><td>" +
          (d.ip1_info.d ? d.ip1_info.d : "暂无") +
          "</td><td>" +
          d.ip1_info.j +
          "</td><td>" +
          d.ip1_info.w +
          "</td></tr class='row2'><tr><td>" +
          d.ip2 +
          "</td><td>" +
          d.ip2_country +
          "</td><td>" +
          d.ip2_info.p +
          "</td><td>" +
          d.ip2_info.c +
          "</td><td>" +
          (d.ip2_info.d ? d.ip2_info.d : "暂无") +
          "</td><td>" +
          d.ip2_info.j +
          "</td><td>" +
          d.ip2_info.w +
          "</td></tr></table>";
      });
    } else {
      html = '<p class="error">无对应信息</p>';
    }

    return html;
  }

  function createTitleIninterR() {
    // 与X国相邻的AS列表，两行相同AS
    var html =
      '<table class="content-title">' +
      '<tr class="row1" ><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S&nbsp;&nbsp;IP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>CC</th><th>Prov</th><th>City</th><th>Dist</th><th>Lon</th><th>Lat</th>' +
      '<tr class="row2"><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D&nbsp;&nbsp;IP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>CC</th><th>Prov</th><th>City</th><th>Dist</th><th>Lon</th><th>Lat</th></tr></table>';
    return html;
  }

  // getInterfaceByASnumber();
  /***************************************域内拓扑 与某个AS相连的路由器列表end***************************************/

  //域内路由器的边列表
  var getEdgeInfoInAS = function (param) {
    $(".right-btm-error").hide();
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      currPage: currPage,
      pageSize: pageSize,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getEdgeInfoInAS",
      options,
      function (data) {
        // console.log('域内路由边列表');
        // console.log(data);
        if (data.list) {
          // showTablelistContainer();
          $(".right-btm .title p").text("域内路由器边列表");

          createRouteredgelistInRouterin(data);

          var other_info = {
            "S IP: Source IP(起始IP)":
              "&nbsp;&nbsp;D IP: Destination IP(目的IP)",
            "TD:": "Transit Degree(传输度数)",
            "IPV:": "IP Volume(IP数量)",
            "DV:": "District Volume(覆盖的行政区数量)",
          };

          showContentOther(other_info);
          hasNextFn(data.hasNext);
          // console.log(data.hasNext)
          paging({
            currPage: currPage,
            cb: getEdgeInfoInAS2,
            hasNext: data.hasNext,
            as: as,
            key: key,
          });
        }
      }
    );
  };

  var getEdgeInfoInAS2 = function (param) {
    var currPage = (param && param.currPage) || 1;
    var pageSize = (param && param.pageSize) || 10;
    var as = (param && param.as) || "";
    var key = (param && param.key) || "";

    var options = {
      asNumber: as,
      currPage: currPage,
      pageSize: pageSize,
      key: key,
    };

    postAjax(
      "visual/control/vs/v3/topology/getEdgeInfoInAS",
      options,
      function (data) {
        // console.log('域内路由边列表2');
        // console.log(data);
        if (data.list) {
          createRouteredgelistInRouterin(data);
        }
      }
    );
  };

  function createRouteredgelistInRouterin(data) {
    var title_html = createRouteredgelistTitle();
    var data_html = createRouteredgelist(data.list);
    var content_html = title_html + data_html;
    hideAlltableInfo();
    $(".right-btm .listContainer").html(
      '<div class="content routeredgelist aslistStyle"></div>'
    );
    $(".right-btm .routeredgelist").html(content_html);
    $(".right-btm .routeredgelist").show();
    $(".right-btm .listContainer").show();
    $(".right-btm").show();

    var content_list_mult = $(".routeredgelist .mult");

    content_list_mult.click(function () {
      $(this).find("ul").slideToggle();
    });
  }

  function createRouteredgelistTitle() {
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>S IP</th><th>Type</th><th>TD</th><th>IPV</th>' +
      '<th class="ipv">DV</th><th>Area</th></tr>' +
      '<tr class="row2"><th>D IP</th><th>Type</th><th>TD</th><th>IPV</th>' +
      '<th class="ipv">DV</th><th>Area</th></tr></table>';
    return html;
  }

  function createRouteredgelist(data) {
    var html = "";
    var sdvlist_html = "";
    var ddvlist_html = "";
    var siplist_html = "";
    var diplist_html = "";

    data.forEach(function (d) {
      $.each(d.sdv, function (index, val) {
        sdvlist_html += "<li>" + val + "</li>";
      });

      $.each(d.ddv, function (index, val) {
        ddvlist_html += "<li>" + val + "</li>";
      });

      if (d.sdv.length == 0) {
        sdvlist_html += "<li>" + "暂无" + "</li>";
      }

      if (d.ddv.length == 0) {
        ddvlist_html += "<li>" + "暂无" + "</li>";
      }

      siplist_html = creatIPlistDom(d.sip);
      diplist_html = creatIPlistDom(d.dip);

      function creatIPlistDom(ipArray) {
        var iplist_html = "";
        if (ipArray.length > 1) {
          iplist_html += "<span>" + ipArray[0] + '</span><ul class="clearfix">';
          for (var i = 1; i < ipArray.length; i++) {
            iplist_html += "<li>" + ipArray[i] + "</li>";
          }
          iplist_html += "</ul>";
        } else {
          iplist_html = ipArray[0];
        }

        return iplist_html;
      }

      html +=
        "<table class='content-list'><tr class='row1'><td class='mult'>" +
        siplist_html +
        "</td><td>" +
        (d.stype == "core"
          ? "核心"
          : d.stype == "intermediate"
          ? "中间"
          : "边缘") +
        "</td><td>" +
        d.std +
        "</td><td>" +
        d.sipv +
        "</td><td class='mult'><span>" +
        d.sdv.length +
        '</span><ul class="clearfix">' +
        sdvlist_html +
        "</ul></td><td>" +
        (d.scountry == "" || d.scountry == "None" || d.scountry == "null"
          ? "暂无"
          : d.scountry) +
        "-" +
        (d.sprovince == "" || d.sprovince == "None" || d.sprovince == "null"
          ? "暂无"
          : d.sprovince) +
        "-" +
        (d.scity == "" || d.scity == "None" || d.scity == "null"
          ? "暂无"
          : d.scity) +
        "</td></tr><tr class='row2'><td class='mult'>" +
        diplist_html +
        "</td><td>" +
        (d.dtype == "core"
          ? "核心"
          : d.dtype == "intermediate"
          ? "中间"
          : "边缘") +
        "</td><td>" +
        d.dtd +
        "</td><td>" +
        d.dipv +
        "</td><td class='mult'><span>" +
        d.ddv.length +
        '</span><ul class="clearfix">' +
        ddvlist_html +
        "</ul></td><td>" +
        // +d.dcountry+'-'+d.dprovince+'-'+d.dcity
        (d.dcountry == "" || d.dcountry == "None" || d.dcountry == "null"
          ? "暂无"
          : d.scountry) +
        "-" +
        (d.dprovince == "" || d.dprovince == "None" || d.dprovince == "null"
          ? "暂无"
          : d.dprovince) +
        "-" +
        (d.dcity == "" || d.dcity == "None" || d.dcity == "null"
          ? "暂无"
          : d.dcity) +
        "</td></tr></table>";

      sdvlist_html = "";
      ddvlist_html = "";
      siplist_html = "";
      diplist_html = "";
    });

    return html;
  }

  // getEdgeInfoInAS({"as":3462,"currPage":1,"pageSize":10})

  // function creatAsDomainedgDom(){

  // }
  /************************************** 域内拓扑部分 结束********************************************/

  /*************************************** dom 相关*****************************************************/

  function createAslist1(asInfoList) {
    var html = "";

    asInfoList.forEach(function (d) {
      html +=
        "<table class='content-list'><tr class='row1'><td>" +
        d.asNumber +
        "</td><td>" +
        d.as_rank +
        "</td><td class='type'>" +
        d.type +
        "</td><td>" +
        d.transit_degree +
        "</td><td>" +
        d.linkedASCount +
        "</td><td class='ipv'>" +
        d.ipCount +
        "</td><td>" +
        d.cone_size +
        "</td><td class='ccip'>" +
        d.cone_ip_size +
        "</td></tr><tr class='row2'><td>" +
        d.countryCode +
        "</td><td class='asname' colspan='3'>" +
        d.asName +
        "</td><td class='orgname' colspan='4'>" +
        d.asCom +
        "</td></tr></table>";
    });

    return html;
  }

  function createAslist2(asInfoList) {
    //含有LT

    var html = "";

    asInfoList.forEach(function (d) {
      html +=
        "<table class='content-list'><tr class='row1'><td>" +
        d.asNumber +
        "</td><td>" +
        d.as_rank +
        "</td><td class='type'>" +
        d.type +
        "</td><td>" +
        d.transit_degree +
        "</td><td>" +
        d.linkedASCount +
        "</td><td class='ipv'>" +
        d.ipCount +
        "</td><td>" +
        d.cone_size +
        "</td><td class='ccip'>" +
        d.cone_ip_size +
        "</td></tr><tr class='row2'><td>" +
        d.countryCode +
        "</td><td>" +
        d.lt +
        "</td><td class='asname' colspan='3'>" +
        d.asName +
        "</td><td class='orgname' colspan='3'>" +
        d.asCom +
        "</td></tr></table>";
    });

    return html;
  }

  function createAslist3(asInfoList) {
    //国家内AS列表,不含cc和lt

    var html = "";

    asInfoList.forEach(function (d, i) {
      html +=
        "<table class='content-list'><tr class='row1'><td>" +
        d.asNumber +
        "</td><td>" +
        d.as_rank +
        "</td><td class='type'>" +
        d.type +
        "</td><td>" +
        d.transit_degree +
        "</td><td>" +
        d.linkedASCount +
        "</td><td class='ipv'>" +
        d.ipCount +
        "</td><td>" +
        d.cone_size +
        "</td><td class='ccip'>" +
        d.cone_ip_size +
        "</td></tr><tr class='row2'><td class='asname' colspan='4'>" +
        d.asName +
        "</td><td class='orgname' colspan='4'>" +
        d.asCom +
        "</td></tr></table>";
    });

    return html;
  }

  function createAslist4(data) {
    //与X国相邻的AS列表，两行相同AS

    var html = "";

    data.forEach(function (d, i) {
      html +=
        "<div class=''><table class='content-list'><tr class='row1'><td>" +
        d.sasn.asNumber +
        "</td><td>" +
        d.sasn.asRank +
        "</td><td>" +
        d.sasn.type +
        "</td><td>" +
        d.sasn.transitDegree +
        "</td><td>" +
        d.sasn.asName +
        "</td><td rowspan='2'>" +
        d.lt +
        "</td></tr><tr><td>" +
        // +d.sasn.asNumber
        // +"</td><td>"
        // +d.sasn.asRank
        // +"</td><td>"
        // +d.sasn.type
        // +"</td><td>"
        // +d.sasn.transitDegree
        // +"</td><td>"
        // +d.sasn.asName
        d.dasn.asNumber +
        "</td><td>" +
        d.dasn.asRank +
        "</td><td>" +
        d.dasn.type +
        "</td><td>" +
        d.dasn.transitDegree +
        "</td><td>" +
        d.dasn.asName +
        "</td></tr></table>";
    });

    return html;
  }

  function createRowsTitle1() {
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>ASN</th><th>Rank</th> <th class="type">Type</th><th>TD</th><th>ASS</th>' +
      '<th class="ipv">IPV</th> <th>CCAS</th><th class="ccip">CCIP</th></tr>' +
      '<tr class="row2"><th>CC</th><th class="asname" colspan="3">AS Name </th>' +
      '<th class="orgname" colspan="4">AS Organization Name</th></tr></table>';
    return html;
  }

  function createRowsTitle2() {
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>ASN</th><th>Rank</th> <th class="type">Type</th><th>TD</th><th>ASS</th>' +
      '<th class="ipv">IPV</th> <th>CCAS</th><th class="ccip">CCIP</th></tr>' +
      '<tr class="row2"><th>CC</th><th>LT</th><th class="asname" colspan="3">AS Name </th>' +
      '<th class="orgname" colspan="3">AS Organization Name</th></tr></table>';
    return html;
  }

  function createRowsTitle3() {
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>ASN</th><th>Rank</th> <th class="type">Type</th><th>TD</th><th>ASS</th>' +
      '<th class="ipv">IPV</th> <th>CCAS</th><th class="ccip">CCIP</th></tr>' +
      '<tr class="row2"><th class="asname" colspan="4">AS Name </th>' +
      '<th class="orgname" colspan="4">AS Organization Name</th></tr></table>';
    return html;
  }

  function createRowsTitle4() {
    // 与X国相邻的AS列表，两行相同AS
    var html =
      '<table class="content-title">' +
      '<tr class="row1"><th>S ASN</th><th>Rank</th><th>Type</th><th>TD</th><th>AS Name</th>' +
      '<th rowspan="2">LT</th></tr>' +
      '<tr class="row2"><th>D ASN</th><th>Rank</th> <th>Type</th><th>TD</th><th>AS Name</th></tr></table>';
    return html;
  }

  function createRowTitle(title_arr) {
    var html = '<table class="content-title"><tr>';

    title_arr.forEach(function (d) {
      html += "<th>" + d + "</th>";
    });

    html += "</tr></table>";
    return html;
  }

  function createRowInfo(data, dname_arr) {
    var data_html = "";
    $.each(data, function (i, d) {
      var html = '<table class="content-list"><tr>';
      dname_arr.forEach(function (dname, index) {
        // data_html+=createRowInfo(d.dname);
        html += "<td>" + d[dname] + "</td>";
      });
      html += "</tr></table>";
      data_html += html;
      html = "";
    });

    return data_html;
  }

  function showContentOther(info) {
    var html = '<ul class="contentOther">';
    $.each(info, function (i, d) {
      html += "<li>" + i + "&nbsp;" + d + "</li>";
    });
    html += "</ul>";

    $(".content-other").html(html);
    var ul = $(".content-other ul");
    var height = ul.height();
    $(".content-other ul").css({
      position: "absolute",
      top: "50%",
      marginTop: -height / 2,
    });
  }

  function createGlobalInfo(data) {
    console.log("createGlobal() running")
    // console.log('全球初始化数据')
    // console.log(data)
    var $global = $(".logic_info_global");
    $global.find(".colum2 span").html(data.asCount ? data.asCount : "暂无数据");
    // console.log(data.asCount)
    // $global.find('.colum2 div').eq(0).find('span').html(data.asCount? data.asCount : '暂无数据');
    
    // ----------- 设置全球的as数据 --------
    var $infos = $global.find(".infos div b");
    var infos_data = [
      data.content,
      data.ipCount,
      data.enterpise,
      data.countryCount,
      data.transitORAccess,
      parseInt(data.pc) +
        parseInt(data.pp) +
        parseInt(data.ss) +
        parseInt(data.transitORAccess),
    ];

    $infos.each(function (i, d) {
      $(this).html(infos_data[i]);
    });
    // ----------- 设置全球的as数据 --------


    // console.log(data.countryTop5);
    // 设置国家图标图片
    $global.find(".top5 img").each(function (i, d) {
      var imgsrc = "./images/qi/" + data.countryTop5[i] + ".png";
      $(this).attr("src", imgsrc);
      $(this).next().html(data.countryTop5[i]);
    });

    // 设置 提供者-客户端、点-点、兄弟-兄弟 的总量
    var $infos = $("#ASlink-cnt .num");
    var infos_data_2 = [data.pc, data.pp, data.ss];
    $infos.each(function (i, d) {
      $(this).html(infos_data_2[i]);
    });

    if (svgHeader_global) {
      // svgHeader_global.setContent('ALL OVER THE WORLD');
      svgHeader_global.setContent("THE WORLD");
    } else {
      var circular_global = $(".circular").eq(0).get()[0];
      svgHeader_global = new SvgHeader(circular_global, "c_global");
      // svgHeader_global.setContent('ALL OVER THE WORLD');
      svgHeader_global.setContent("THE WORLD");
    }
  }

  function createASCommonDom(data) {
    var info_right = $(".logic_info_as .info_right");
    var colum2 = info_right.find(".country .colum2");
    info_right.find(".country .colum1 span").eq(1).text(data.asNumber);
    colum2.find("div span").eq(0).text(data.type);
    colum2.find("div span").eq(1).text(data.asName);
    var imageurl = "./images/qi/" + data.countryCode + ".png";
    info_right.find(".colum3").attr("src", imageurl);

    var infos = info_right.find(".infos span b");
    infos.eq(0).text(data.ipCount);
    infos.eq(1).text(data.cone_size);
    infos.eq(2).text(data.as_rank);
    infos.eq(3).text(data.cone_ip_size);

    var dushu = info_right.find(".dushu b");
    dushu.eq(0).text(data.transit_degree);
    dushu.eq(1).text(data.linkedASCount);
    dushu.eq(2).hide();

    //更改头像信息
    // var textpath = document.getElementById('textpath_as');
    // textpath.textContent = data.asName;
    if (svgHeader_as) {
      svgHeader_as.setContent(data.asName);
    } else {
      var circular_as = $(".circular").eq(1).get()[0];
      svgHeader_as = new SvgHeader(circular_as, "c_as");
      svgHeader_as.setContent(data.asName);
      // var textpath = document.getElementById('textpathc_as');
      // textpath.textContent = data.asName;
    }

    var imgurl_as = "./images/logo.png";
    var logo_name = data.logo_name || data.logoName;
    if (logo_name) {
      imgurl_as = "./images/aslogo/" + logo_name;
    } else {
      imgurl_as = "./images/logo.png";
    }

    // var imgurl_as = './images/pngmap/'+ data.logo_name+'.png';
    $(".logic_info_as .info_left .mapicon img").attr("src", imgurl_as);
  }

  function createASInfoDom(data) {
    createASCommonDom(data);
    var info_right = $(".info_right");
    var other_domaininter = info_right.find(".other-domaininter");
    var num = other_domaininter.find(".num");

    if (
      data.provider_size > 99 ||
      // || typeof(data.provider_size) == 'string'
      data.peer_size > 99 ||
      // || typeof(data.peer_size) == 'string'
      data.customer_size > 99 ||
      // || typeof(data.customer_size) == 'string'
      data.cone_size > 99
      // || typeof(data.cone_size) == 'string'
    ) {
      info_right.find(".other div p").css({ fontSize: "8px" });
      num.css({
        fontSize: "16px",
        width: "auto",
        padding: "0 2px",
        minWidth: "10px",
      });
    } else {
      info_right.find(".other div p").css({ fontSize: "10px" });
      num.css({ fontSize: "18px", minWidth: "30px" });
    }

    num.eq(0).text(data.provider_size);
    num.eq(1).text(data.peer_size);
    num.eq(2).text(data.customer_size);
    num.eq(3).text(data.siblng_size);

    info_right.find(".other-domainin").hide();
    $(".dushu span:last").hide();
    $(".dushu b:last").hide();
    other_domaininter.show();
  }

  function createASDomainInfoDom(data) {
    createASCommonDom(data);

    var other_domainin = $(".info_right .other-domainin");
    var num = other_domainin.find(".num");

    num.eq(0).text(data.coreCount ? data.coreCount : "暂无");
    num.eq(1).text(data.interCount);
    num.eq(2).text(data.areaCount);
    var info_right = $(".info_right");
    var dushu = info_right.find(".dushu b");
    dushu.eq(0).text(data.transit_degree);
    dushu.eq(1).text(data.linkedASCount);
    dushu.eq(2).text(data.router_edges);
    dushu.eq(2).show();
    dushu.prev().show();

    $(".info_right .other-domaininter").hide();
    other_domainin.show();
  }

  function createCountryInfoDom(data, isClone) {
    // console.log(data)
    if (isClone) {
      var info_country = $(".logic_info_country").eq(1);
    } else {
      var info_country = $(".logic_info_country").eq(0);
    }

    var info_right = info_country.find(".info_right");
    var colum2 = info_right.find(".country .colum2");
    info_right.find(".country .colum1 span").eq(1).text(data.countryName);
    colum2.find("div span").eq(0).text(data.asCount);
    colum2.find("div span").eq(1).text(data.ipCount);
    var imageurl = "./images/qi/" + data.countryCode + ".png";
    info_right.find(".colum3").attr("src", imageurl);

    var infos = info_right.find(".infos div");
    infos.find("span b").eq(0).text(data.countryRank);
    infos.find("span b").eq(1).text(data.countryCode);
    infos.find("span b").eq(2).text(data.linkedCountryCount);
    infos.find("span b").eq(3).text(data.outlinkedASCount);

    var top5_img = info_right.find(".top5 img");
    var top5_country = info_right.find(".top5 span");

    for (var i = 0; i < data.linkedCountryList.length; i++) {
      var imageurl_top = "./images/qi/" + data.linkedCountryList[i] + ".png";
      top5_img.eq(i).attr("src", imageurl_top);
      top5_country.eq(i + 1).text(data.linkedCountryList[i]);
    }

    // info_right.find('.asNum i').text(data.outlinkedASCount);
    // info_right.find('.other .num').eq(0).text(data.ltCount[2] && data.ltCount[2].ltnum ? data.ltCount[2].ltnum : 0);
    // info_right.find('.other .num').eq(1).text(data.ltCount[1] && data.ltCount[1].ltnum ? data.ltCount[1].ltnum : 0);
    // info_right.find('.other .num').eq(2).text(data.ltCount[0] && data.ltCount[0].ltnum ? data.ltCount[0].ltnum: 0);
    if (data.ltCount && data.ltCount.length > 0) {
      $.each(data.ltCount, function (i, d) {
        if (d.link_type == "PC") {
          info_right
            .find(".other .num")
            .eq(0)
            .text(d.ltnum ? d.ltnum : 0);
        } else if (d.link_type == "PP") {
          info_right
            .find(".other .num")
            .eq(1)
            .text(d.ltnum ? d.ltnum : 0);
        } else if (d.link_type == "SS") {
          info_right
            .find(".other .num")
            .eq(2)
            .text(d.ltnum ? d.ltnum : 0);
        }
      });
    }

    //更换头像信息
    if (svgHeader_country) {
      svgHeader_country.setContent(data.countryNamefull);
    } else {
      var circular_country = $(".circular").eq(2).get()[0];
      svgHeader_country = new SvgHeader(circular_country, "c_country");
      svgHeader_country.setContent(data.countryNamefull);
      // var textpath = document.getElementById('textpathc_as');
      // textpath.textContent = data.asName;
    }
    var imgurl_country = "./images/pngmap/" + data.countryCode + ".png";

    info_country.find(".info_left .mapicon img").attr("src", imgurl_country);
    // var textpath = document.getElementById('textpathc_country');
    //     textpath.textContent = data.countryNamefull;
    // var circular_country = $('.circular').eq(2).get()[0];
    // var svgHeader= new SvgHeader(circular_country,'textcirclecountry');
    // svgHeader.setContent(data.countryNamefull);
  }

  /*************************************** dom 相关 end*****************************************************/

  return {
    getASInfoOfGlobal: getASInfoOfGlobal, //全球右上信息
    getASTypeStatisticsOfGlobal: getASTypeStatisticsOfGlobal, //全球AS列表
    getAllCountruInfoOfGlobal: getAllCountruInfoOfGlobal, //全球国家列表
    getCountryInfoBetweenCountry: getCountryInfoBetweenCountry, //国家右上信息
    getAsNumberListByCountry: getAsNumberListByCountry, //国家内，国家内AS列表
    getCountriesAsCountByCountry: getCountriesAsCountByCountry, //国家内，相邻国家列表
    getEdgeInfoBetweenCountry: getEdgeInfoBetweenCountry, //国家间，显示与X国相连的AS列表getEdgeInfoBetweenCountry('CN','US');
    getASInfo: getASInfo, //AS右上信息
    getParentASListByASN: getParentASListByASN, //AS域间，相邻AS列表
    // clickCountryEdgeinAS:clickCountryEdgeinAS////as点击国家边，只显示相连AS中属于该国家的AS
    getEdgeInfoWithinAS: getEdgeInfoWithinAS, //域内拓扑信息，右上信息
    getRouterInfoWithinAS: getRouterInfoWithinAS, //域内拓扑列表信息
    getInterfaceByASnumber: getInterfaceByASnumber, //域内拓扑与某个AS相连的路由器列表
    getASEdgeofGlobal: getASEdgeofGlobal, //as边关系（全球及国家内）
    getEdgeInfoInAS: getEdgeInfoInAS, //域内路由器的边关系
  };
})();
