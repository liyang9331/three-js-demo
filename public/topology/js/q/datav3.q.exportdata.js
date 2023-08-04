console.log("------ datav3.q.exportdata.js debug ------")

$('#logic-export').click(function(){
    var inputValue = $(this).siblings('input').val();
  
    var currentHeaderCountrycode = $('.logic_info_country .info_right .infos .countryCode').text();
    var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
  
    switch(type_current){
      case 'global': exportDataInGlobal(inputValue);break;
      case 'countryin': exportDataInCountryin(inputValue);break;
      case 'countryout': exportDataInCountryout(inputValue);break;
      case 'asin': exportDataInAsin(inputValue);break;
      case 'asout': exportDataInAsout(inputValue);break;
      case 'asinterface': exportDataInAsinterface(inputValue);break;
    }
  })
  
  //总共6个接口
  // exportData('getCountryInfoToExport',key,value);
  // exportData('getASInfoByKeyWord',key,value);
  // exportData('getEdgeInfoByAS',key,value);
  // exportData('getCountryEdgeInfo',key,value);
  // exportData("getEdgeBetweenCountry",key,value);
  function exportData(url,key,value,key1,value1,key2,value2){
  
    $('#export-form').attr({'action':datav_config.server_url+'visual/control/vs/v3/exportData/'+url})    
    $('#export-form').find('.search-input').attr({'name':key})
    $('#export-form').find('.search-input').val(value);
    $('#export-form').find('.search-input1').attr({'name':key1})
    $('#export-form').find('.search-input1').val(value1);
    $('#export-form').find('.search-input2').attr({'name':key2})
    if(value2){
      $('#export-form').find('.search-input2').val(value2);
    }else{
      $('#export-form').find('.search-input2').val('');
    }
    // $('#export-form').find('.search-input3').val(value3);
    // $('#export-form').find('.search-input3').attr({'name':key3})
    // $('#export-form').find('.search-input3').val('');
    $('#logic-export').submit();  
  }
  
  function exportDataInGlobal(inputValue){
  
       // if(inputValue && isCountry(inputValue)){
       //  exportData('getCountryInfoToExport','key',inputValue);
       // }else if(inputValue && isAsnumber(inputValue)){
       //  exportData('getASInfoByKeyWord','key',inputValue);
       // }else if(inputValue == ''){
       //     switch(contentlist_btnstatus){
       //      case '1': exportData('getCountryInfoToExport','key','');break;
       //      case '2': exportData('getASInfoByKeyWord','key','');break;
       //     }
       // }else{
       //   console.log('请输入正确的AS号或国家，输入为空时导出全部')
       // }
       // 
        switch(contentlist_btnstatus){
          case '1': handleExportInCountry();break;
          case '2': handleExportInAs();break;
          case '3': handleExportInAsedge();break;
        }
  
        function handleExportInCountry(){
          if(inputValue && isCountry(inputValue)){
            exportData('getCountryInfoToExport','key',inputValue,'','','','');
          }else if(inputValue == ''){
            exportData('getCountryInfoToExport','','','key','','','')
          }
        }
  
        function handleExportInAs(){
          if(inputValue){
            exportData('getASInfoByKeyWord','key',inputValue,'','','','');
          }else if(inputValue == ''){
            exportData('getASInfoByKeyWord','','','key','','','');
          }
        }
  
         function handleExportInAsedge(){
          if(inputValue){
            exportData('getASEdgeInfo','key',inputValue,'','','','');
          }else if(inputValue == ''){
            exportData('getASEdgeInfo','','','','','','');
          }
         }
  };
  
  function exportDataInCountryout(inputValue){
    var currentHeaderCountrycode = $('.logic_info_country .info_right .infos .countryCode').text();
    var countrycn = $('.right-btm .title p b').text();
    var countryCode2 = util.judgeCountry(countrycn);
  
    if(inputValue && isAsnumber(inputValue)){
      exportData('getASInfoByKeyWord','key',inputValue,'','','','');
    }else if(inputValue == ''){
       exportData('getEdgeBetweenCountry','','','c1',currentHeaderCountrycode,'c2',countryCode2);
    }else{
      console.log('请输入正确的AS号，输入为空时导出全部')
    }
  };
  
  function exportDataInCountryin(inputValue){
    var currentHeaderCountrycode = $('.logic_info_country .info_right .infos .countryCode').text();
    // var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
  
    switch(contentlist_btnstatus){
      case '1': handleExportInCountrys();break;
      case '2': handleExportInAslist();break;
      case '3': handleExportInAsedge();break;
     }
  
     function handleExportInCountrys(){
      if(inputValue && isCountry(inputValue)){
        exportData('getCountryInfoToExport','key',inputValue,'','','','');
      }else if(inputValue == ''){
        exportData('getCountryEdgeInfo','','','key',currentHeaderCountrycode,'','');
      }
     }
  
     function handleExportInAslist(){
      if(inputValue && isAsnumber(inputValue)){
          exportData('getASInfoByKeyWord','key',inputValue,'','','','');
      }else if(inputValue == ''){
          exportData('getASInfoByKeyWord','','','key',currentHeaderCountrycode,'','');
      }
     }
  
     function handleExportInAsedge(){
      if(inputValue && isAsnumber(inputValue)){
          exportData('getASEdgeInfo','key',inputValue,'areaCode',currentHeaderCountrycode,'','');
      }else if(inputValue == ''){
          exportData('getASEdgeInfo','','','areaCode',currentHeaderCountrycode,'','');
      }
     }
  };
  
  function exportDataInAsin(inputValue){
    var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
  
    switch(contentlist_btnstatus){
      case '1': handleExportInRouterlist();break;
      case '2': handleExportInRouteredge();break;
    }
  
     function handleExportInRouterlist(){
        if(!inputValue){
          // exportData('getRouterByAS','','','asNumber',currentHeaderAs,'','');
          exportData('getRouterByAS','','','asNumber',currentHeaderAs,'key','');
        }else{
          // console.log('');
          exportData('getRouterByAS','','','asNumber',currentHeaderAs,'key',inputValue);
        }
     }
  
     function handleExportInRouteredge(){
          // as域内边关系导出接口
          if(!inputValue){
             exportData('getRouterEdgeInfo','','','asNumber',currentHeaderAs,'key',inputValue);
           }else{
             exportData('getRouterEdgeInfo','','','asNumber',currentHeaderAs,'',"");
           }
     }
    
  };
  
  function exportDataInAsout(inputValue){
    var currentHeaderAs = $('.logic_info_as .info_right .colum1 span').eq(1).text();
  
    if(inputValue){
      exportData('getASInfoByKeyWord','key',inputValue,'','','','');
    }else if(inputValue == ''){
      exportData('getEdgeInfoByAS',"key",'','asNumber',currentHeaderAs,'lt','');
    }else{
      console.log('请输入正确的AS号，输入为空时导出全部')
    }
  };
  
  function exportDataInAsinterface(inputValue){
   var asNumber = input_record.input_value;
   exportData('getInterfaceBetweenAS',"key",inputValue,'as1',asNumber[0],'as2',asNumber[1]);
  };
  
  