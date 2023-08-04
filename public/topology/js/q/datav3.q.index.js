console.log("------- datav3.q.index debug -------");
// var phyTopoin =null;
var switchMap;
var showInfo = null;
var type_current = "global";
// type_current为："global","countryin","countryout","asin","asout"
var type_current_global = "global_init";
// type_current_global为: global_init, 'global_as','global_country'
var contentlist_btnstatus = "1";
var is_phy_log = "log"; // 物理图或逻辑图
var select_tit_cur = "全球"; // 选择框
var input_record = {
  select_cur: "全球",
  input_value: "", // 全球二次搜索，或国家、AS一级搜索。
  input_value_plus_type: "", // 国家或者AS二级搜索类型（国家、AS，线）"AS","linkAS","countrytext","countrylink"
  input_value_plus_value: "", // 国家或者AS二级搜索值
  // subinput_asin: 'all',
  subinput_asin: "", //域内二级搜索框的记录值
};
var rbtn_searchvalue_record = "";

require.config({
  waitSeconds: 0,
});

var showTags = function (arr) {
  var lis = $(".mymiddle .tips .notes li");
  lis.each(function (i, d) {
    $(this).hide();
  });
  arr.forEach(function (d, i) {
    lis.eq(d).show();
  });
};

requirejs(
  ["/topology/js/q/datav3.q.map.js"],

  function (mapjs) {
    console.log("------ datav3.q.map.js 加载完成 -----")
    jQuery(function () {
      // 初始化状态信息

      // 初始化全球逻辑图
      datavjs.log_world_init("neither", true);

      // 选择器变量
      var $_middle = $(".mymiddle");
      var $_mtips = $_middle.find(".tips"); // webGL图例
      var $_mtips_phyrouter = $_middle.find(".phyrouter_tips"); // webGL图例
      var $_mtips_logrouter = $_middle.find(".logrouter_tips"); // webGL图例
      var $_choseicon = $_middle.find(".chose_icon"); // 4个状态框
      var $_intodomain = $(".intodomain"); // 域内拓扑标签
      var $_b2outer = $(".backtodomainouter"); // 域内拓扑返回标签
      var $_info_router1 = $(".info_router1");
      var $_info_router2 = $(".info_router2");
      var $_currentHeaderCountrycode = $(
        ".logic_info_country .info_right .infos .countryCode"
      );
      var currentHeaderCountrycode;
      var $_currentHeaderAs = $(".logic_info_as .info_right .colum1 span").eq(
        1
      );
      var currentHeaderAs;
      var $_export_input = $("#export-form .search-input");

      //********* 功能封装*************
      // 有展示各项信息接口showInfo
      // showInfo.initGlobal()
      // showInfo.initAS(as)
      // showInfo.initCountry(country)
      // showInfo.initRoutertopo()
      // showInfo.clickCountryEdgeinAS()
      // showInfo.dblclickEdgeinCountry()
      // 双击地图切换效果接口switchMap
      // switchMap.switchToAS()
      // switchMap.switchToCountry()
      // switchMap.swicthToGlobe()
      //******** 功能封装**************
      // 地图的图例切换
      // showTags([0,1,2,5,7,8]);
      function showTags(arr) {
        var lis = $(".mymiddle .tips .notes li");
        lis.each(function (i, d) {
          $(this).hide();
        });
        arr.forEach(function (d, i) {
          lis.eq(d).show();
        });
      }

      showInfo = {
        initGlobal: function () {
          fetchData.getASInfoOfGlobal();
          fetchData.getAllCountruInfoOfGlobal();
          showTags([0, 1, 2, 5, 7, 8]);
          // fetchData.getASTypeStatisticsOfGlobal();
          $(".right-btm").show();
          $(".right-btm .title p").text("国家(地区)列表");
          $(".right-btm .aslist").show();
          showRbbtn(1);
        },
        initAS: function (inputValue) {
          fetchData.getASInfo(inputValue);
          fetchData.getParentASListByASN({ as: inputValue });
          showTags([0, 1, 2, 3, 4, 5, 6, 7]);
          showRbbtn(2);
        },
        initCountry: function (inputValue) {
          fetchData.getCountryInfoBetweenCountry(inputValue);
          fetchData.getCountriesAsCountByCountry({ countryCode: inputValue });
          showTags([0, 1, 2, 3, 5, 7, 8]);
          // fetchData.getAsNumberListByCountry(inputValue);
          showRbbtn(1);
        },
        initMultCountry: function (country1, country2) {
          fetchData.getCountryInfoBetweenCountry(country1);
          fetchData.getEdgeInfoBetweenCountry({
            countryCode1: country1,
            countryCode2: country2,
          });
          // fetchData.getAsNumberListByCountry({countryCode:country1});
          showTags([0, 1, 2, 4, 5, 6, 7]);
          showRbbtn(2);
        },
        initRoutertopo: function (inputValue) {
          fetchData.getEdgeInfoWithinAS(inputValue);
          fetchData.getRouterInfoWithinAS({ as: inputValue });
          // showTags([]);
          // showRbbtn(0);
          showRbbtn(0);
        },
        initInterRouter: function (as1, as2) {
          // 多个AS路由器
          fetchData.getASInfo(as1);
          fetchData.getInterfaceByASnumber({ as1: as1, as2: as2 });
          // showTags([]);
          showRbbtn(3);
        },
        clickCountryEdgeinAS: function (country) {
          clickCountryEdgeinAS(country);
          showRbbtn(2);
        },
        dblclickEdgeinCountry: function (country1, country2) {
          fetchData.getEdgeInfoBetweenCountry({
            countryCode1: country1,
            countryCode2: country2,
          });
          showRbbtn(2);
        },
        clickAsInGlobal: function (as) {
          if (contentlist_btnstatus === "2") {
            fetchData.getASTypeStatisticsOfGlobal({ key: as });
          } else {
            rbtn_searchvalue_record = as;
            $(".rb-btn3-2").click();
          }
          $("#export-form .search-input").val(as);
        },
        clickCountryInGlobal: function (country) {
          if (contentlist_btnstatus === "1") {
            fetchData.getAllCountruInfoOfGlobal({ key: country });
          } else {
            rbtn_searchvalue_record = country;
            $(".rb-btn3-1").click();
          }
          $("#export-form .search-input").val(country);
        },
        clickAsInAsout: function (as) {
          filterContentInAsout(as);
          $("#export-form .search-input").val(as);
        },
        clickCountryInAsout: function (country) {
          filterContentInAsout(country);
          $("#export-form .search-input").val(country);
        },
        clickLineInAsout: function (as) {
          // 同点击AS 效果，调用clickAsInAsout接口
        },
        clickAsInAsin: function (ip) {
          filterContentInAsin(ip);
        },
        // clickCountryInAsin: function(country){
        //     filterContentInAsin(country);
        // },
        clickAsInCountryout: function (as) {
          filterContentInDblClickCountry(as);
          $("#export-form .search-input").val(as);
        },
        clickCountryInCountryout: function (country) {
          // 无对应信息效果，同初始化，不调用
          $("#export-form .search-input").val("");
        },
        clickLineInCountryout: function (as) {
          // 无对应信息效果，同初始化，不调用
          $("#export-form .search-input").val("");
        },
        clickAsInCountryin: function (as) {
          if (contentlist_btnstatus === "2") {
            filterContentInCountry(as);
          } else {
            rbtn_searchvalue_record = as;
            $(".rb-btn3-2").click();
          }
          $("#export-form .search-input").val(as);
        },
        clickCountryInCountryin: function (country) {
          if (contentlist_btnstatus === "1") {
            filterContentInCountry(country);
          } else {
            rbtn_searchvalue_record = country;
            $(".rb-btn3-1").click();
          }
          $("#export-form .search-input").val(country);
        },
      };

      // type_current = "asinterface";
      // // phyInterRouter = new PhyInterRouter('4134','3462');
      // phyInterRouter = new PhyInterRouter('3462','4134');
      // setTimeout(function(){
      //    // phyInterRouter.searchRouter(['220.128.3.13','220.128.6.245']);
      //    phyInterRouter.searchRouter('220.128.6.245');
      // },2000)

      showInfo.initGlobal();
      // showInfo.initInterRouter('3462','4134');
      // input_record.input_value = ['3462','4134'];
      // type_current = 'asin';zoomToShowLayer
      // is_phy_log = "log";
      // showInfo.initRoutertopo(18182);
      // showInfo.initInterRouter(10010,17682);
      // getRouterInData('18182');
      // phyTopoin = new PhyTopoin('18182');

      // 双击地图切换效果接口
      // 调用示例
      // switchMap.switchToAS(1);
      // showInfo.initRoutertopo('4780');
      // showInfo.dblclickEdgeinCountry('CN','US');
      switchMap = {
        switchToAS: function (as) {
          input_record.input_value = as;
          contentlist_btnstatus = "1";
          switchSelect("AS");
          changeInput(as);
          searchInAS(as, "neither");
        },
        switchToCountry: function (country) {
          input_record.input_value = country;
          contentlist_btnstatus = "1";
          switchSelect("国家");
          changeInput(country);
          searchInCountry(country, "neither");
        },
        switchToMulcountry: function (country2) {
          var country1 = $(".logic_info_as .info_right .colum1 span")
            .eq(1)
            .text();
          contentlist_btnstatus = "1";
          input_record.input_value = [country1, country2];
          showInfo.dblclickEdgeinCountry(country1, country2);
          switchSelect("国家");
          changeInput(country);
          handleMapinSearchcountry(
            [country1, country2],
            datavjs.phy_countryout_init
          );
        },
        swicthToGlobe: function (inputValue) {
          input_record.input_value = inputValue;
          contentlist_btnstatus = "1";
          switchSelect("全球");
          changeInput(inputValue);
          searchInGlobal(inputValue, false, "neither");
        },
      };

      function switchSelect(data_sel) {
        var img_wrap = $(".leftinfo .left-wrap div").each(function (i, d) {
          if ($(this).data("sel") == data_sel) {
            $(this).click();
          }
        });
      }

      function changeInput(inputValue) {
        $("#input-topo").val(inputValue);
      }

      // **************************************左搜索框******************************************/
      $("#input-topo").click(function () {
        $(this).removeClass("error");
        $(this).val("");
      });

      jQuery("#input-topo").focus(function () {
        $(".error_msg").slideUp();
        if ($(this).val() == "") {
          $(this).val("");
        }
        $(this).attr("placeholder", "");
      });

      jQuery(".left .left-wrap div").each(function (i, d) {
        jQuery(this).click(function () {
          $("#input-topo").val("");
          $("#export-form").find(".search-input").val("");
          select_tit_cur = jQuery(this).data("sel");
          type_current = "global";
          type_current_global = "global_init";
          // input_record.input_value = '';
          $(".backtodomainouter").hide();
          $_intodomain.hide();
          // $_mtips.show();
          $_mtips_logrouter.hide();
          $_mtips_phyrouter.hide();

          // 逻辑图的全球选项特殊效果（reset）
          if (select_tit_cur === "全球") {
            // resetExport();
            // $('#export-form .search-input').val('');
            input_record.input_value = "";
            contentlist_btnstatus = "1";
            // showGlobalinitInfo();
            showInfo.initGlobal();
            $(".tips").show();

            jQuery(".chose_icon")
              .find(".myicon")
              .each(function () {
                $(this).show();
                if ($(this).data("val") == "neither") {
                  $(this).addClass("active");
                } else {
                  $(this).removeClass("active");
                }
              });

            if (is_phy_log === "log") {
              removePhyTopoin();
              clearRouterIn();
              datavjs.log_world_init("neither", false);
              $_choseicon.show();
            } else if (is_phy_log === "phy") {
              removePhyTopoin();

              datavjs.phy_world_init("neither");
              $_choseicon.show();
            }

            $("#input-topo").attr("placeholder", "AS/国家(地区)");
          } else if (select_tit_cur == "AS") {
            $("#input-topo").attr("placeholder", "AS");
          } else if (select_tit_cur == "国家") {
            $("#input-topo").attr("placeholder", "一个或多个国家(地区)");
          }
        });
      });

      jQuery("#search-topo-logic").click(function () {
        $(".error_msg").slideUp();
        $("#export-form").find(".search-input").val("");
        var inputValue = jQuery(this).prev().val().trim();
        if (select_tit_cur == "全球") {
          searchInGlobal(inputValue, false, "neither");
          input_record.select_cur = "全球";
        } else if (select_tit_cur == "AS") {
          searchInAS(inputValue, "neither");
          input_record.select_cur = "AS";
        } else if (select_tit_cur == "国家") {
          searchInCountry(inputValue, "neither");
          input_record.select_cur = "国家";
        }
        // input_record.input_value = inputValue;
      });

      function searchInGlobal(inputValue, flag, topo_flag) {
        // contentlist_btnstatus = '1';
        // resetExport();
        $(".tips").show();
        $(".marker-msg").fadeOut();
        $("#export-form .search-input").val("");
        input_record.subinput_asin = "";
        input_record.input_value_plus_value = "";
        type_current = "global";
        $(".backtodomainouter").hide();
        $_intodomain.hide();
        $_mtips_logrouter.hide();
        $_mtips_phyrouter.hide();

        jQuery(".chose_icon").find(".active").removeClass("active");
        jQuery(".chose_icon")
          .find(".myicon")
          .each(function () {
            jQuery(this).show();
            if (jQuery(this).data("val") == topo_flag) {
              jQuery(this).addClass("active");
            } else {
            }
          });

        if (inputValue !== "string") {
          inputValue = inputValue.toString();
        }

        if (inputValue && isAsnumber(inputValue)) {
          type_current_global = "global_as";
          showInfo.clickAsInGlobal(inputValue);

          // $('.rb-btn2').show();
          // $('.rb-btn3').hide();
          // $('.rb-btn4').hide();
          showTags([0, 1, 2, 4, 5, 6, 7]);

          is_phy_log === "log"
            ? datavjs.log_world_search_AS(inputValue, flag, topo_flag)
            : datavjs.phy_world_search_AS(inputValue, topo_flag);
        } else if (isCountry(inputValue) && inputValue.length > 0) {
          type_current_global = "global_country";
          var countryCode = util.judgeCountry(inputValue);

          if (countryCode) {
            var inputValue = countryCode;
            showInfo.clickCountryInGlobal(inputValue);

            // $('.rb-btn2').hide();
            // $('.rb-btn3').show();
            // $('.rb-btn4').hide();
            showTags([0, 1, 2, 5, 7, 8]);
            is_phy_log === "log"
              ? datavjs.log_world_search_country(inputValue, flag, topo_flag)
              : datavjs.phy_world_search_country(inputValue, topo_flag);
          } else {
            // console.log('请输入正确国家或地区')
            $("#input-topo").val("输入信息有误");
            $("#input-topo").addClass("error");
          }
        } else {
          $("#input-topo").val("输入信息有误");
          $("#input-topo").addClass("error");
        }

        input_record.input_value = inputValue;
        input_record.select_cur = "全球";
      }

      function searchInCountry(inputValue, topo_flag) {
        // resetExport();
        $(".tips").show();
        $(".marker-msg").fadeOut();
        $("#export-form .search-input").val("");
        input_record.subinput_asin = "";
        input_record.input_value_plus_value = "";
        contentlist_btnstatus = "1";
        if (inputValue.indexOf("，") !== -1) {
          var inputValue = inputValue.replace("，", ",");
        }

        if (typeof inputValue == "string") {
          var countrysArr = inputValue.split(",");
        } else {
          var countrysArr = inputValue;
        }

        countrysArr.forEach(function (d, i) {
          var countryCode = util.judgeCountry(countrysArr[i]);
          if (countryCode) {
            countrysArr[i] = countryCode;
          } else {
            countrysArr = [];
            // console.log('请输入正确国家或地区')
            $("#input-topo").val("输入国家或地区有误");
            $("#input-topo").addClass("error");
          }
        });

        input_record.input_value = countrysArr;

        $(".backtodomainouter").hide();
        $_intodomain.hide();
        $_mtips.show();
        $_mtips_logrouter.hide();
        $_mtips_phyrouter.hide();

        if (
          (isCountry(countrysArr[0]) && countrysArr.length === 1) ||
          (countrysArr.length > 1 && countrysArr[0] == countrysArr[1])
        ) {
          // if((isCountry(countrysArr[0]) )){
          type_current = "countryin";
          jQuery(".chose_icon").find(".active").removeClass("active");
          jQuery(".chose_icon")
            .find(".myicon")
            .each(function () {
              var topo_flag_dom = jQuery(this).data("val");
              if (topo_flag_dom == topo_flag) {
                jQuery(this).addClass("active");
              } else {
              }
              if (topo_flag_dom == "neither" || topo_flag_dom == "in") {
                jQuery(this).show();
              } else {
                jQuery(this).hide();
              }
            });
          var inputValue = countrysArr[0];

          // fetchData.getCountryInfoBetweenCountry(inputValue);
          showInfo.initCountry(inputValue);
          if (topo_flag == "neither") {
            var topo_flag_bool = false;
          } else {
            var topo_flag_bool = true;
          }
          switch (is_phy_log) {
            case "log":
              clearRouterIn();
              //绘制单个国家内拓扑
              datavjs.log_countryin_init(inputValue, topo_flag_bool);
              break;
            case "phy":
              removePhyTopoin();
              datavjs.phy_countryin_init(inputValue, topo_flag_bool);
              break;
          }
        } else if (
          isCountry(countrysArr[0]) &&
          isCountry(countrysArr[1]) &&
          countrysArr.length > 1
        ) {
          type_current = "countryout";
          jQuery(".chose_icon").find(".active").removeClass("active");
          jQuery(".chose_icon")
            .find(".myicon")
            .each(function () {
              var flag = jQuery(this).data("val");
              if (flag == topo_flag) {
                jQuery(this).addClass("active");
              } else {
              }
              if (flag == "neither" || flag == "out") {
                jQuery(this).show();
              } else {
                jQuery(this).hide();
              }
            });

          showInfo.initMultCountry(countrysArr[0], countrysArr[1]);

          $(".button .back").hide();
          topo_flag == "neither"
            ? (topo_flag_bool = false)
            : (topo_flag_bool = true);
          switch (is_phy_log) {
            case "log":
              clearRouterIn();

              datavjs.log_countryout_init(countrysArr, false, topo_flag_bool);

              break;
            case "phy":
              datavjs.phy_countryout_init(countrysArr, topo_flag_bool);
              break;
          }
        } else {
          $("#input-topo").val("输入信息有误");
          $("#input-topo").addClass("error");
        }
      }

      function searchInAS(inputValue, topo_flag) {
        // resetExport();
        $(".marker-msg").fadeOut();
        $("#export-form .search-input").val("");
        input_record.subinput_asin = "";
        input_record.input_value_plus_value = "";
        $_mtips.show();
        $_mtips_logrouter.hide();
        $_mtips_phyrouter.hide();
        contentlist_btnstatus = "1";
        $(".backtodomainouter").hide();
        $_intodomain.hide();

        var regexp = /^\d*[,，]\d*$/g; //匹配两个AS输入
        if (inputValue && regexp.test(inputValue)) {
          type_current = "asinterface";
          input_record.input_value = inputValue.replace("，", ",").split(",");
          input_record.select_cur = "AS";
          input_record.input_value_plus_type = "";
          input_record.input_value_plus_value = "";
          //如果输入的是逗号分隔的多个AS
          var AS_first = input_record.input_value[0];
          var AS_second = input_record.input_value[1];
          if (is_phy_log === "log") {
            datavjs.log_ASinterface_init(AS_first, AS_second, topo_flag);
          } else {
            jQuery(".chose_icon")
              .find(".myicon")
              .each(function () {
                jQuery(this).hide();
              });
            phyInterRouter = new PhyInterRouter(AS_first, AS_second);
          }
          showInfo.initInterRouter(AS_first, AS_second);
          jQuery(".chose_icon").find(".active").removeClass("active");
          jQuery(".chose_icon")
            .find(".myicon")
            .each(function () {
              var topo_flag_dom = jQuery(this).data("val");
              if (topo_flag_dom == topo_flag) {
                jQuery(this).addClass("active");
              } else {
              }
              if (topo_flag_dom == "neither" || topo_flag_dom == "both") {
                jQuery(this).show();
              } else {
                jQuery(this).hide();
              }
            });
          $(".tips").hide();
          showTags([]);
        } else if (inputValue && isAsnumber(inputValue)) {
          $(".tips").show();
          jQuery(".chose_icon").find(".active").removeClass("active");
          jQuery(".chose_icon")
            .find(".myicon")
            .each(function () {
              var topo_flag_dom = jQuery(this).data("val");
              if (topo_flag_dom == topo_flag) {
                jQuery(this).addClass("active");
              } else {
              }
              if (topo_flag_dom == "neither" || topo_flag_dom == "in") {
                jQuery(this).show();
              } else {
                jQuery(this).hide();
              }
            });

          type_current = "asout";
          input_record.input_value = inputValue;
          input_record.select_cur = "AS";

          showInfo.initAS(inputValue);
          var isTopoin = isTopoinAS(inputValue);

          if (isTopoin) {
            $_intodomain.show();
          } else {
            $_intodomain.hide();
            // $('.backtodomainouter').hide();
          }
          if (topo_flag == "neither") {
            var topo_flag_bool = false;
          } else {
            var topo_flag_bool = true;
          }
          if (is_phy_log === "log") {
            clearRouterIn();
            datavjs.log_ASout_init(inputValue, topo_flag_bool);
          } else if (is_phy_log === "phy") {
            removePhyTopoin();
            datavjs.phy_ASout_init(inputValue, topo_flag_bool);
          }
          $(".backtodomainouter").hide();
          // $_intodomain.hide();
        } else {
          $("#input-topo").val("请输入正确的AS号");
          $("#input-topo").addClass("error");
        }
      }

      // ************************************左逻辑和地理切换按钮操作***********************************

      jQuery(".swith_log_phy .phy").click(function () {
        if (is_phy_log == "phy") {
          return;
        } else {
          is_phy_log = "phy";
          jQuery(".backtodomainouter").hide();
          $(".info5").hide();
          $(".marker-msg").fadeOut();
          if (type_current == "asin") {
            // 特殊处理
            jQuery(".chose_icon").hide();
            logicRouterIn.clear();

            phyTopoin = new PhyTopoin(
              input_record.input_value,
              input_record.subinput_asin
            );
            $(".backtodomainouter").show();
            $(".mymiddle .info_router").hide();
            $_mtips_logrouter.hide();
            $_mtips_phyrouter.show();
          } else {
            jQuery(".chose_icon").show();
            clearRouterIn();
            var inputValue = jQuery.trim(input_record.input_value);
            var topo_flag = jQuery(".chose_icon").find(".active").data("val");
            if (type_current == "global") {
              // 特殊处理
              if (inputValue == "") {
                datavjs.phy_world_init(topo_flag);
              } else {
                searchInGlobal(inputValue, false, topo_flag);
              }
            } else {
              var input_value_plus_type = input_record.input_value_plus_type;
              var input_value_plus_value = input_record.input_value_plus_value;
              topo_flag = topo_flag == "neither" ? false : true;
              if (type_current == "countryin") {
                if (input_value_plus_type == "AS") {
                  datavjs.phy_countryin_search_AS(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.phy_countryin_search_country(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.phy_countryin_search_linkcountry(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else {
                  datavjs.phy_countryin_init(inputValue, topo_flag);
                }
              } else if (type_current == "countryout") {
                if (input_value_plus_type == "AS") {
                  datavjs.phy_countryout_search_AS(
                    input_value_plus_value,
                    input_record.input_value,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.phy_countryout_search_country(
                    input_value_plus_value,
                    input_record.input_value
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.phy_countryout_search_country(
                    input_value_plus_value,
                    input_record.input_value
                  );
                } else {
                  datavjs.phy_countryout_init(
                    input_record.input_value,
                    topo_flag
                  );
                }
              } else if (type_current == "asout") {
                if (input_value_plus_type == "AS") {
                  datavjs.phy_ASout_search_AS(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else if (input_value_plus_type == "linkAS") {
                  datavjs.phy_ASout_search_linkAS(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.phy_ASout_search_country(
                    input_value_plus_value,
                    inputValue,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.phy_ASout_search_linkcountry(
                    input_value_plus_value,
                    inputValue
                  );
                } else {
                  datavjs.phy_ASout_init(inputValue, topo_flag);
                }
              } else if (type_current == "asinterface") {
                jQuery(".chose_icon")
                  .find(".myicon")
                  .each(function () {
                    jQuery(this).hide();
                  });

                var searchip = $("#export-form .search-input").val().trim();
                phyInterRouter = new PhyInterRouter(
                  input_record.input_value[0],
                  input_record.input_value[1],
                  searchip
                );
              } else {
                console.log("Error");
              }
            }
          }
        }
      });

      jQuery(".swith_log_phy .log").click(function () {
        if (is_phy_log == "log") {
          return;
        } else {
          // jQuery('.mymiddle .tips').show();
          is_phy_log = "log";
          $(".marker-msg").fadeOut();
          var inputValue = jQuery.trim(input_record.input_value);
          if (type_current == "asin") {
            datavjs.util_clear_geometry();
            // phyTopoin.remove();
            removePhyTopoin();

            getRouterInData(
              input_record.input_value,
              input_record.subinput_asin
            );
            $(".backtodomainouter").show();
            $_mtips_phyrouter.hide();
            $_mtips_logrouter.show();
          } else {
            var topo_flag = jQuery(".chose_icon").find(".active").data("val");
            if (type_current == "global") {
              // 特殊处理
              if (inputValue == "") {
                datavjs.log_world_init(topo_flag, false);
              } else {
                searchInGlobal(inputValue, false, topo_flag);
              }
            } else {
              var input_value_plus_type = input_record.input_value_plus_type;
              var input_value_plus_value = input_record.input_value_plus_value;
              topo_flag = topo_flag == "neither" ? false : true;
              if (type_current == "countryin") {
                if (input_value_plus_type == "AS") {
                  datavjs.log_countryin_search_AS(
                    input_value_plus_value,
                    inputValue,
                    false,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.log_countryin_search_country(
                    input_value_plus_value,
                    inputValue,
                    false
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.log_countryin_search_linkcountry(
                    input_value_plus_value,
                    inputValue,
                    inputValue,
                    false
                  );
                } else {
                  datavjs.log_countryin_init(inputValue, topo_flag);
                }
              } else if (type_current == "countryout") {
                if (input_value_plus_type == "AS") {
                  datavjs.log_countryout_search_AS(
                    input_value_plus_value,
                    input_record.input_value,
                    false,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.log_countryout_search_country(
                    input_value_plus_value,
                    input_record.input_value,
                    false
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.log_countryout_search_linkcountry(
                    input_value_plus_value,
                    input_record.input_value,
                    false
                  );
                } else {
                  datavjs.log_countryout_init(
                    input_record.input_value,
                    false,
                    topo_flag
                  );
                }
              } else if (type_current == "asout") {
                if (input_value_plus_type == "AS") {
                  datavjs.log_ASout_search_AS(
                    input_value_plus_value,
                    inputValue,
                    false,
                    topo_flag
                  );
                } else if (input_value_plus_type == "linkAS") {
                  datavjs.log_ASout_search_linkAS(
                    input_value_plus_value,
                    inputValue,
                    false,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrytext") {
                  datavjs.log_ASout_search_country(
                    input_value_plus_value,
                    inputValue,
                    false,
                    topo_flag
                  );
                } else if (input_value_plus_type == "countrylink") {
                  datavjs.log_ASout_search_linkcountry(
                    input_value_plus_value,
                    inputValue,
                    false,
                    topo_flag
                  );
                } else {
                  datavjs.log_ASout_init(inputValue, topo_flag);
                }
              } else if (type_current == "asinterface") {
                jQuery(".chose_icon").find(".active").removeClass("active");
                jQuery(".chose_icon")
                  .find(".myicon")
                  .each(function () {
                    var topo_flag_dom = jQuery(this).data("val");
                    if (topo_flag_dom == "neither") {
                      jQuery(this).addClass("active");
                    } else {
                    }
                    if (topo_flag_dom == "neither" || topo_flag_dom == "both") {
                      jQuery(this).show();
                    } else {
                      jQuery(this).hide();
                    }
                  });
                datavjs.log_ASinterface_init(
                  input_record.input_value[0],
                  input_record.input_value[1],
                  "neither"
                );
              } else {
                console.log("Error");
              }
            }
          }
        }
      });

      // ******************************** 中逻辑图图形中交互相关***********************************
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      var clock = new THREE.Clock();

      document
        .getElementById("WebGL-output")
        .addEventListener("click", clickHandle, false);
      function clickHandle(event) {
        if (event.target.nodeName == "CANVAS") {
          var rect = event.target.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / containerW) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / containerH) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);

          if (type_current === "global" && is_phy_log === "log") {
            datavjs.log_click_in_world(raycaster, event.clientX, event.clientY);
          } else if (type_current === "asin" && is_phy_log === "log") {
            // logicRouterIn.showRoutersMsg(raycaster,event.clientX,event.clientY);
            if (logicRouterIn) {
              logicRouterIn.clickRouters(
                raycaster,
                event.clientX,
                event.clientY,
                event
              );
            }
          } else if (type_current === "asout" && is_phy_log === "log") {
            datavjs.log_click_in_asout(raycaster, event.clientX, event.clientY);
            //模拟点击连线
            // fetchData.getEdgeInfoBetweenAS('1','US');
          } else if (type_current === "countryin" && is_phy_log === "log") {
            datavjs.log_click_in_countryin(
              raycaster,
              event.clientX,
              event.clientY
            );
            // 在国家内点击国家标签返回的信息
            // fetchData.getLinkedCountryInfoWithinCountry("US");
            // // //点击国家连线获取信息
            // fetchData.getEdgeInfoWithinCountry("US","CN");
          } else if (type_current === "countryout" && is_phy_log === "log") {
            datavjs.log_click_in_countryout(
              raycaster,
              event.clientX,
              event.clientY
            );
            // getCountryInfoBetweenCountry("US");
            //点击国家连线获取信息
            // fetchData.getEdgeInfoBetweenCountry("GB", "US");
          } else if (type_current === "asinterface" && is_phy_log === "log") {
            datavjs.log_click_in_ASinterface(
              raycaster,
              event.clientX,
              event.clientY
            );
          }
        }
      }

      //进入域内和返回域间按钮操作

      $_intodomain.click(function () {
        // forbExport();
        $("#export-form .search-input").val("");
        var currentHeaderAs = $(".logic_info_as .info_right .colum1 span")
          .eq(1)
          .text();
        showInfo.initRoutertopo(currentHeaderAs);
        input_record.as = input_record.input_value;

        $_mtips.hide();

        if (is_phy_log == "log" && type_current === "asout") {
          datavjs.util_clear_geometry();
          getRouterInData(input_record.input_value, input_record.subinput_asin);
          $_mtips_logrouter.show();
        } else if (is_phy_log == "phy" && type_current === "asout") {
          datavjs.util_clear_geometry();
          phyTopoin = new PhyTopoin(
            input_record.input_value,
            input_record.subinput_asin
          );

          $_mtips_phyrouter.show();
        }

        $_choseicon.find(".myicon").hide();
        $(".intodomain").hide();
        $(".backtodomainouter").show();
        type_current = "asin";
      });

      $(".backtodomainouter").click(function () {
        // resetExport();
        $("#export-form .search-input").val("");
        type_current = "asout";
        var currentHeaderAs = $_currentHeaderAs.text();
        showInfo.initAS(currentHeaderAs);
        var myicon_active = $(".myicon.active").data().val;
        if (is_phy_log == "log") {
          clearRouterIn();
          if (myicon_active == "neither") {
            datavjs.log_ASout_init(input_record.as, false);
          } else if (myicon_active == "in") {
            datavjs.log_ASout_init(input_record.as, true);
          } else {
            console.log("Error");
            datavjs.log_ASout_init(input_record.as, true);
          }
        } else if (is_phy_log == "phy") {
          removePhyTopoin();
          if (myicon_active == "neither") {
            datavjs.phy_ASout_init(input_record.as, false);
          } else if (myicon_active == "in") {
            datavjs.phy_ASout_init(input_record.as, true);
          } else {
            console.log("Error");
            datavjs.phy_ASout_init(input_record.as, true);
          }
        }

        $(this).hide();
        $(".intodomain").show();
        $_choseicon.show();
        $_choseicon.find(".myicon").show();
        $_choseicon.find(".myicon").eq(0).hide();
        $_choseicon.find(".myicon").eq(2).hide();
        $_mtips.show();
        $_mtips_logrouter.hide();
        $_mtips_phyrouter.hide();
      });

      //进入域内和返回域间按钮操作end

      function clearRouterIn() {
        if (logicRouterIn) {
          logicRouterIn.clear();
          logicRouterIn = null;
        }
      }

      function removePhyTopoin() {
        if (phyTopoin && phyTopoin.remove) {
          phyTopoin.remove();
          phyTopoin = null;
        }
      }

      //地理拓扑中的右上四个按钮操作
      // var  activeIndex = 0;
      jQuery(".chose_icon")
        .find(".myicon")
        .each(function () {
          jQuery(this).click(function () {
            var input_value = jQuery.trim(input_record.input_value);
            var input_value_plus_type = input_record.input_value_plus_type;
            var input_value_plus_value = input_record.input_value_plus_value;
            var picking_flag = true;
            if (type_current == "global") {
              if (jQuery(this).hasClass("active")) {
              } else {
                var topo_flag = jQuery(this).data("val");
                if (input_value == "") {
                  if (is_phy_log == "log") {
                    datavjs.log_world_init(topo_flag, false);
                  } else if (is_phy_log == "phy") {
                    datavjs.phy_world_init(topo_flag, false);
                  } else {
                  }
                  jQuery(".chose_icon").find(".active").removeClass("active");
                  jQuery(this).addClass("active");
                } else {
                  searchInGlobal(input_value, picking_flag, topo_flag);
                }
              }
            } else if (type_current == "countryin") {
              if (jQuery(this).hasClass("active")) {
              } else {
                var topo_flag =
                  jQuery(this).data("val") == "neither" ? false : true;
                if (input_value_plus_type == "") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryin_init(input_value, topo_flag);
                  } else {
                    datavjs.phy_countryin_init(input_value, topo_flag);
                  }
                } else if (input_value_plus_type == "AS") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryin_search_AS(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_countryin_search_AS(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "countrytext") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryin_search_country(
                      input_value_plus_value,
                      input_value,
                      false
                    );
                  } else {
                    datavjs.phy_countryin_search_country(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "countrylink") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryin_search_linkcountry(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_countryin_search_linkcountry(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else {
                  console.log("Error");
                }
                jQuery(".chose_icon").find(".active").removeClass("active");
                jQuery(this).addClass("active");
              }
            } else if (type_current == "countryout") {
              if (jQuery(this).hasClass("active")) {
              } else {
                var topo_flag =
                  jQuery(this).data("val") == "neither" ? false : true;
                if (input_value_plus_type == "") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryout_init(
                      input_record.input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_countryout_init(
                      input_record.input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "AS") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryout_search_AS(
                      input_value_plus_value,
                      input_record.input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_countryout_search_AS(
                      input_value_plus_value,
                      input_record.input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "countrytext") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryout_search_country(
                      input_value_plus_value,
                      input_record.input_value,
                      false
                    );
                  } else {
                    datavjs.phy_countryout_search_country(
                      input_value_plus_value,
                      input_record.input_value
                    );
                  }
                } else if (input_value_plus_type == "countrylink") {
                  if (is_phy_log == "log") {
                    datavjs.log_countryout_init(
                      input_record.input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_countryout_init(
                      input_record.input_value,
                      topo_flag
                    );
                  }
                } else {
                  console.log("Error");
                }
                jQuery(".chose_icon").find(".active").removeClass("active");
                jQuery(this).addClass("active");
              }
            } else if (type_current == "asout") {
              if (jQuery(this).hasClass("active")) {
              } else {
                var topo_flag =
                  jQuery(this).data("val") == "neither" ? false : true;
                if (input_value_plus_type == "") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASout_init(input_value, topo_flag);
                  } else {
                    datavjs.phy_ASout_init(input_value, topo_flag);
                  }
                } else if (input_value_plus_type == "AS") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASout_search_AS(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_ASout_search_AS(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "linkAS") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASout_search_linkAS(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_ASout_search_linkAS(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "countrytext") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASout_search_country(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_ASout_search_country(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else if (input_value_plus_type == "countrylink") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASout_search_country(
                      input_value_plus_value,
                      input_value,
                      false,
                      topo_flag
                    );
                  } else {
                    datavjs.phy_ASout_search_country(
                      input_value_plus_value,
                      input_value,
                      topo_flag
                    );
                  }
                } else {
                  console.log("Error");
                }
                jQuery(".chose_icon").find(".active").removeClass("active");
                jQuery(this).addClass("active");
              }
            } else if (type_current == "asinterface") {
              if (jQuery(this).hasClass("active")) {
              } else {
                var topo_flag = jQuery(this).data("val");
                if (input_value_plus_type == "") {
                  if (is_phy_log == "log") {
                    datavjs.log_ASinterface_init(
                      input_record.input_value[0],
                      input_record.input_value[1],
                      topo_flag
                    );
                  } else {
                    console.log("phy need add");
                  }
                } else {
                  console.log("log condition need add");
                }
                jQuery(".chose_icon").find(".active").removeClass("active");
                jQuery(this).addClass("active");
              }
            } else {
              console.log("Error");
            }
          });
        });

      jQuery(".chose_icon")
        .find(".myicon")
        .each(function () {
          jQuery(this).hover(
            function () {
              jQuery(this).find("span").css({ opacity: 1 });
            },
            function () {
              jQuery(this).find("span").css({ opacity: 0 });
            }
          );
        });

      //***************************8*******************右下信息操作*********************************************/
      //初始化各图形及图形操作对应的信息对应的调用

      function clickCountryEdgeinAS(countryCode) {
        if (type_current == "asout") {
          filterContentlist(countryCode, "CODE");
        }
      }

      function filterContentlist(lt, val) {
        var content_list = $(".right-btm .listContainer .content-list");
        var index = 1;

        $(".right-btm .listContainer .content-title th").each(function (i, d) {
          if ($(this).text() == val) {
            index = i;
            return false;
          }
        });

        content_list.each(function (i, d) {
          var lt_text = $(this).find("td").eq(index).text();

          if (lt_text !== lt) {
            $(this).css({ display: "none" });
          } else if (lt_text == lt) {
            $(this).css({ display: "table" });
          }
        });
      }

      function showRbbtn(index) {
        //0,1,2 分别对应2,3,4个按钮
        switch (index) {
          case 0:
            $(".rb-btn2 .rb-btn-outer").css({
              webkitTransform: "rotate(-40deg)",
              transform: "rotate(0deg)",
            });
            break;
          case 1:
            $(".rb-btn3 .rb-btn-outer").css({
              webkitTransform: "rotate(0deg)",
              transform: "rotate(0deg)",
            });
            break;
          case 2:
            $(".rb-btn4 .rb-btn-outer").css({
              webkitTransform: "rotate(0deg)",
              transform: "rotate(0deg)",
            });
            break;
        }

        $(".right-btm .rb-btn").each(function (i, d) {
          if (i == index) {
            $(this).css({ display: "block" });
          } else {
            $(this).css({ display: "none" });
          }
        });
      }

      // function setCirtext(){

      // }

      //全球初始化信息展示
      function showGlobalinitInfo() {
        $(".logic_info_as").hide();
        $(".logic_info_country").hide();
        $(".logic_info_global").show();

        $(".right-btm .content").each(function () {
          $(this).css({ display: "none" });
        });
        $(".right-btm .title p").text("国家(地区)列表");
        $(".right-btm .aslist").css({ display: "block" });
      }

      // 搜索过滤
      // $('.search-input').blur(function(){
      //   $(this).val('');
      // })

      $("#logic-export-search").click(function () {
        var searchValue = $.trim($(".search-input").val());
        if (type_current == "asin") {
          input_record.subinput_asin = searchValue;
        } else {
          input_record.input_value_plus_value = searchValue;
        }

        // filterContentInDblClickCountry(searchValue)
        // if(type_current == 'global' && type_current_global == 'global_init'){
        searchInRblist(searchValue);
      });

      function searchInRblist(searchValue) {
        if (type_current == "global") {
          filterInGlobalinit(searchValue);
          // }else if(type_current == 'global' && type_current_global == 'global_as'){
          //      filterContentInAsout(searchValue);
          // }else if(type_current == 'global' && type_current_global == 'global_country'){
          //      filterContentInCountry(searchValue);
        } else if (type_current == "asin") {
          filterContentInAsin(searchValue);
        } else if (type_current == "asout") {
          filterContentInAsout(searchValue);
        } else if (type_current == "countryin") {
          filterContentInCountry(searchValue);
        } else if (type_current == "countryout") {
          // filterContentInCountry(searchValue);
          filterContentInDblClickCountry(searchValue);
        } else if (type_current == "asinterface") {
          filterContentInAsinterface(searchValue);
        }
      }

      // 全球单击AS
      function icon_world_click_AS() {
        jQuery(".chose_icon")
          .find(".myicon")
          .each(function () {
            jQuery(this).show();
          });
      }

      // 全球单击国家
      function icon_world_click_country() {
        jQuery(".chose_icon")
          .find(".myicon")
          .each(function () {
            jQuery(this).show();
          });
      }

      function filterInGlobalinit(searchValue) {
        input_record.input_value = searchValue;
        var is_ASnum = isAsnumber(searchValue);
        var is_country = isCountry(searchValue);
        var topo_flag = jQuery(".chose_icon").find(".active").data("val");
        switch (contentlist_btnstatus) {
          case "1":
            fetchData.getAllCountruInfoOfGlobal({ key: searchValue });
            if (is_phy_log == "log") {
              if (is_country) {
                icon_world_click_country();
                datavjs.log_world_search_country(
                  searchValue.toUpperCase(),
                  false,
                  topo_flag
                );
              } else if (searchValue === "") {
                datavjs.log_world_init(topo_flag, false);
              } else {
                console.log("No graph api.");
              }
            } else if (is_phy_log == "phy") {
              if (is_country) {
                icon_world_click_country();
                datavjs.phy_world_search_country(
                  searchValue.toUpperCase(),
                  topo_flag
                );
              } else if (searchValue === "") {
                icon_world_click_country();
                datavjs.phy_world_init(topo_flag);
              } else {
                console.log("No graph api.");
              }
            } else {
              console.log("Not log or phy!");
            }
            break; //初始化
          case "2":
            fetchData.getASTypeStatisticsOfGlobal({ key: searchValue });
            if (is_phy_log == "log") {
              if (is_ASnum) {
                icon_world_click_AS();
                datavjs.log_world_search_AS(
                  searchValue.toUpperCase(),
                  false,
                  topo_flag
                );
              } else if (is_country) {
                icon_world_click_country();
                datavjs.log_world_search_country(
                  searchValue.toUpperCase(),
                  false,
                  topo_flag
                );
              } else if (searchValue === "") {
                datavjs.log_world_init(topo_flag, false);
              } else {
                console.log("No graph api.");
              }
            } else if (is_phy_log == "phy") {
              if (is_ASnum) {
                icon_world_click_AS();
                datavjs.phy_world_search_AS(
                  searchValue.toUpperCase(),
                  topo_flag
                );
              } else if (is_country) {
                icon_world_click_country();
                datavjs.phy_world_search_country(
                  searchValue.toUpperCase(),
                  topo_flag
                );
              } else if (searchValue === "") {
                icon_world_click_country();
                datavjs.phy_world_init(topo_flag);
              } else {
                console.log("No graph api.");
              }
            } else {
              console.log("Not log or phy!");
            }
            break; //初始化
          case "3":
            fetchData.getASEdgeofGlobal({ key: searchValue });
            if (is_phy_log == "log") {
              if (is_ASnum) {
                icon_world_click_AS();
                datavjs.log_world_search_AS(
                  searchValue.toUpperCase(),
                  false,
                  topo_flag
                );
              } else if (searchValue === "") {
                datavjs.log_world_init(topo_flag, false);
              } else {
                console.log("No graph api.");
              }
            } else if (is_phy_log == "phy") {
              if (is_ASnum) {
                icon_world_click_AS();
                datavjs.phy_world_search_AS(
                  searchValue.toUpperCase(),
                  topo_flag
                );
              } else if (searchValue === "") {
                datavjs.phy_world_init(topo_flag);
              } else {
                console.log("No graph api.");
              }
            } else {
              console.log("Not log or phy!");
            }
            break;
        }
      }

      function filterContentInAsout(searchValue) {
        //与as间搜索as 通用
        currentHeaderAs = $_currentHeaderAs.text();
        fetchData.getParentASListByASN({
          as: currentHeaderAs,
          key: searchValue,
        });
        //对应的图形调用程序
        var is_ASnum = isAsnumber(searchValue);
        var topo_flag =
          jQuery(".chose_icon").find(".active").data("val") == "neither"
            ? false
            : true;
        input_record.input_value_plus_type = "AS";

        if (is_phy_log == "log") {
          if (isAsnumber(searchValue)) {
            icon_countryin_click_AS();
            datavjs.log_ASout_search_AS(
              searchValue,
              currentHeaderAs,
              topo_flag
            );
          } else if (searchValue === "") {
            datavjs.log_ASout_init(currentHeaderAs, topo_flag);
          } else {
            console.log("输入正确的as");
          }
        } else if (is_phy_log == "phy") {
          if (isAsnumber(searchValue)) {
            icon_countryin_click_AS();
            datavjs.phy_ASout_search_AS(
              searchValue,
              currentHeaderAs,
              topo_flag
            );
          } else if (searchValue === "") {
            datavjs.phy_ASout_init(currentHeaderAs, topo_flag);
          } else {
            console.log("输入正确的as");
          }
        }
      }

      // 4种状态的切换
      function icon_countryin_click_country() {
        jQuery(".chose_icon")
          .find(".myicon")
          .each(function () {
            jQuery(this).hide();
          });
      }
      function icon_countryin_click_AS() {
        jQuery(".chose_icon")
          .find(".myicon")
          .each(function () {
            var dom_val = jQuery(this).data("val");
            if (dom_val == "neither" || dom_val == "in") {
              jQuery(this).show();
            } else {
              jQuery(this).hide();
            }
          });
      }

      // 搜索国家
      function filterContentInCountry(searchValue) {
        //与国家搜索国家通用
        currentHeaderCountrycode = $_currentHeaderCountrycode.text();
        var is_ASnum = isAsnumber(searchValue);
        var is_country = isCountry(searchValue);
        var topo_flag =
          jQuery(".chose_icon").find(".active").data("val") == "neither"
            ? false
            : true;

        switch (contentlist_btnstatus) {
          case "1": //相邻国家列表接口
            fetchData.getCountriesAsCountByCountry({
              countryCode: currentHeaderCountrycode,
              key: searchValue,
            });
            input_record.input_value_plus_type = "countrytext";
            input_record.input_value_plus_value = searchValue.toUpperCase();
            if (is_phy_log == "log") {
              if (is_country) {
                icon_countryin_click_country();
                datavjs.log_countryin_search_country(
                  searchValue.toUpperCase(),
                  currentHeaderCountrycode.toUpperCase(),
                  false
                );
              } else if (searchValue === "") {
                datavjs.log_countryin_init(
                  currentHeaderCountrycode.toUpperCase(),
                  false
                );
              } else {
                console.log("No graph api.");
              }
            } else if (is_phy_log == "phy") {
              if (is_country) {
                icon_countryin_click_country();
                datavjs.phy_countryin_search_country(
                  searchValue.toUpperCase(),
                  currentHeaderCountrycode.toUpperCase()
                );
              } else if (searchValue === "") {
                datavjs.phy_countryin_init(
                  currentHeaderCountrycode.toUpperCase()
                );
              } else {
                console.log("No graph api.");
              }
            } else {
              console.log("Not log or phy!");
            }
            break;
          case "2": // 国家内AS列表
            fetchData.getAsNumberListByCountry({
              countryCode: currentHeaderCountrycode,
              key: searchValue,
            });
            input_record.input_value_plus_type = "AS";
            input_record.input_value_plus_value = searchValue;
            if (is_phy_log == "log") {
              if (is_ASnum) {
                icon_countryin_click_AS();
                datavjs.log_countryin_search_AS(
                  searchValue,
                  currentHeaderCountrycode.toUpperCase(),
                  false,
                  topo_flag
                );
              } else {
                console.log("No graph api.");
              }
            } else if (is_phy_log == "phy") {
              if (is_ASnum) {
                icon_countryin_click_AS();
                datavjs.phy_countryin_search_AS(
                  searchValue,
                  currentHeaderCountrycode.toUpperCase(),
                  topo_flag
                );
              } else {
                console.log("No graph api.");
              }
            } else {
              console.log("Not log or phy!");
            }
            break;
          case "3": // 国家内AS边列表
            fetchData.getASEdgeofGlobal({
              areaCode: currentHeaderCountrycode,
              key: searchValue,
            });
            break;
        }
      }

      function filterContentInAsin(searchValue) {
        currentHeaderAs = $_currentHeaderAs.text();
        // fetchData.getRouterInfoWithinAS({as: currentHeaderAs,key:searchValue});
        switch (contentlist_btnstatus) {
          case "1":
            fetchData.getRouterInfoWithinAS({
              as: currentHeaderAs,
              key: searchValue,
            });
            break;
          case "2":
            if (is_phy_log == "log") {
              logicRouterIn.searchEdges(searchValue);
            } else if (is_phy_log == "phy") {
              phyTopoin.searchEdges(searchValue);
            }
            fetchData.getEdgeInfoInAS({
              as: currentHeaderAs,
              key: searchValue,
            });
            break;
        }
      }

      function filterContentInDblClickCountry(searchValue) {
        //filterContentInCountryout
        var countryCode = input_record.input_value;
        fetchData.getEdgeInfoBetweenCountry({
          countryCode1: countryCode[0],
          countryCode2: countryCode[1],
          key: searchValue,
        });
        var topo_flag =
          jQuery(".chose_icon").find(".active").data("val") == "neither"
            ? false
            : true;
        input_record.input_value_plus_type = "linkAS";

        if (is_phy_log == "log") {
          if (isAsnumber(searchValue)) {
            icon_countryin_click_country();
            datavjs.log_countryout_search_AS(
              searchValue,
              countryCode,
              false,
              topo_flag
            );
          } else if (searchValue === "") {
            datavjs.log_countryout_init(countryCode, false, topo_flag);
          } else {
            console.log("输入正确的as");
          }
        } else if (is_phy_log == "phy") {
          if (isAsnumber(searchValue)) {
            icon_countryin_click_country();
            datavjs.phy_countryout_search_AS(
              searchValue,
              countryCode,
              false,
              topo_flag
            );
          } else if (searchValue === "") {
            datavjs.phy_countryout_init(countryCode, false, topo_flag);
          } else {
            console.log("输入正确的as");
          }
        }
      }

      function filterContentInAsinterface(searchValue) {
        var asNumber = input_record.input_value;
        fetchData.getInterfaceByASnumber({
          as1: asNumber[0],
          as2: asNumber[1],
          key: searchValue,
        });
        if (is_phy_log == "phy") {
          phyInterRouter.searchRouter(searchValue);
        } else if (is_phy_log == "log") {
          datavjs.log_ASinterface_search_ip(
            asNumber[0],
            asNumber[1],
            searchValue
          );
        }
      }

      $(".rb-btn4 .rb-btn-center").click(handleClickRbbtn4);

      $(".rb-btn3 .rb-btn-center").click(handleClickRbbtn3);

      function handleClickRbbtn2() {
        // if(type_current == 'global'){
        //   filterInGlobalinit('');
        // }
      }

      function handleClickRbbtn3() {
        var currentHeaderAs = $(".logic_info_as .info_right .colum1 span")
          .eq(1)
          .text();

        if (type_current == "asin") {
          filterContentInAsin("");
        } else if (type_current == "asout") {
          filterContentInAsout("");
        } else if (type_current == "global") {
          filterInGlobalinit("");
        } else if (type_current == "countryout") {
          filterContentInDblClickCountry("");
        }
      }

      function handleClickRbbtn4() {
        if (type_current === "countryin") {
          filterContentInCountry("");
        }
      }

      //删除两个按钮状态下all功能，在搜索框右侧添加清除按钮操作
      $("#export-form .icon-qingchu").click(function () {
        // handleClickRbbtn2();
        handleClickRbbtn3();
        handleClickRbbtn4();
        if (type_current == "asinterface") {
          filterContentInAsinterface("");
        }
        $(this).siblings("input").val("");
        input_record.subinput_asin = "";
        input_record.input_value_plus_value = "";
        input_record.input_value_plus_type = "";
      });

      $(".rb-btn4 .rb-btn-outer img").each(function () {
        $(this).click(function () {
          var item = $(this).data("item");
          if (type_current == "countryout") {
            var countryCode = input_record.input_value;

            switch (item) {
              case 1:
                fetchData.getEdgeInfoBetweenCountry({
                  countryCode1: countryCode[0],
                  countryCode2: countryCode[1],
                  key: "pp",
                });
                contentlist_btnstatus = "1";
                break;
              case 2:
                fetchData.getEdgeInfoBetweenCountry({
                  countryCode1: countryCode[0],
                  countryCode2: countryCode[1],
                  key: "cp",
                });
                contentlist_btnstatus = "2";
                break;
              case 3:
                fetchData.getEdgeInfoBetweenCountry({
                  countryCode1: countryCode[0],
                  countryCode2: countryCode[1],
                  key: "ss",
                });
                contentlist_btnstatus = "3";
                break;
              case 4:
                fetchData.getEdgeInfoBetweenCountry({
                  countryCode1: countryCode[0],
                  countryCode2: countryCode[1],
                  key: "pc",
                });
                contentlist_btnstatus = "4";
                break;
            }
          } else if (type_current == "asout") {
            var currentHeaderAs = $(".logic_info_as .info_right .colum1 span")
              .eq(1)
              .text();

            switch (item) {
              case 1:
                fetchData.getParentASListByASN({
                  as: currentHeaderAs,
                  lt: "pp",
                });
                contentlist_btnstatus = "1";
                break;
              case 2:
                fetchData.getParentASListByASN({
                  as: currentHeaderAs,
                  lt: "cp",
                });
                contentlist_btnstatus = "2";
                break;
              case 3:
                fetchData.getParentASListByASN({
                  as: currentHeaderAs,
                  lt: "ss",
                });
                contentlist_btnstatus = "3";
                break;
              case 4:
                fetchData.getParentASListByASN({
                  as: currentHeaderAs,
                  lt: "pc",
                });
                contentlist_btnstatus = "4";
                break;
            }
          }
        });
      });

      $(".rb-btn3 .rb-btn-outer img").each(function () {
        $(this).click(function () {
          var item = $(this).data("item");

          if (type_current === "asin") {
            // var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
            // var index_lt = $('.content-list .lt').index();
            // switch(item){
            //   case 1: fetchData.getRouterInfoWithinAS({as:currentHeaderAs,'role':'area'});contentlist_btnstatus = '1';break;
            //   case 2: fetchData.getRouterInfoWithinAS({as:currentHeaderAs,'role':'core'});contentlist_btnstatus = '2';break;
            //   case 3: fetchData.getRouterInfoWithinAS({as:currentHeaderAs,'role':'intermediate'});contentlist_btnstatus = '3';break;
            // }
          } else if (type_current === "global") {
            switch (item) {
              case 1:
                contentlist_btnstatus = "1";
                fetchData.getAllCountruInfoOfGlobal({
                  key: rbtn_searchvalue_record,
                });
                break;
              case 2:
                contentlist_btnstatus = "2";
                fetchData.getASTypeStatisticsOfGlobal({
                  key: rbtn_searchvalue_record,
                });
                break;
              case 3:
                contentlist_btnstatus = "3";
                fetchData.getASEdgeofGlobal({ key: rbtn_searchvalue_record });
                break;
            }
            rbtn_searchvalue_record = "";
          } else if (type_current === "countryin") {
            var currentHeaderCountrycode = $(
              ".logic_info_country .info_right .infos .countryCode"
            ).text();
            switch (item) {
              case 1:
                contentlist_btnstatus = "1";
                fetchData.getCountriesAsCountByCountry({
                  countryCode: currentHeaderCountrycode,
                  key: rbtn_searchvalue_record,
                });
                break;
              case 2:
                contentlist_btnstatus = "2";
                fetchData.getAsNumberListByCountry({
                  countryCode: currentHeaderCountrycode,
                  key: rbtn_searchvalue_record,
                });
                break;
              case 3:
                contentlist_btnstatus = "3";
                fetchData.getASEdgeofGlobal({
                  areaCode: currentHeaderCountrycode,
                  key: rbtn_searchvalue_record,
                });
                break;
            }
            rbtn_searchvalue_record = "";
          }
        });
      });

      $(".rb-btn2 .rb-btn-outer img").each(function () {
        $(this).click(function () {
          var item = $(this).data("item");

          if (type_current === "asin") {
            var currentHeaderAs = $(".logic_info_as .info_right .colum1 span")
              .eq(1)
              .text();

            switch (item) {
              case 1:
                contentlist_btnstatus = "1";
                fetchData.getRouterInfoWithinAS({
                  as: currentHeaderAs,
                  key: input_record.subinput_asin,
                });
                break;
              case 2:
                contentlist_btnstatus = "2";
                fetchData.getEdgeInfoInAS({
                  as: currentHeaderAs,
                  key: input_record.subinput_asin,
                });
                if (is_phy_log == "log") {
                  logicRouterIn.searchEdges(input_record.subinput_asin);
                } else if (is_phy_log == "phy") {
                  phyTopoin.searchEdges(input_record.subinput_asin);
                }
                break;
            }
          }
        });
      });

      // 清空输入框
      $(".rb-btn-outer img").click(function () {
        if (type_current != "asin") {
          $("#export-form .search-input").val("");
        }
      });

      $(".rb-btn-center").click(function () {
        $("#export-form .search-input").val("");
      });
    });
  }
);
