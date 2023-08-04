<template>
    <div class="main_container">
        <div class="mycontainer" id="mycontainer">
            <div class="myleft">
                <div class="right_pic_border"></div>
                <!-- 左选框 开始 -->
                <div class="right_pic_border"></div>
                <div class='leftinfo'>
                    <div class="right">
                        <div class='poly'></div>
                        <input id='input-topo' placeholder="AS/国家(地区)" onkeydown="keydownEvent(this);"
                            data-btn="search-topo-logic" />
                        <i class="iconfont icon-upper-triangle-copy" id="search-topo-logic"></i>
                    </div>
                    <div class='left'>
                        <div class='left-wrap'>
                            <div class='first' data-sel='全球'><img src="/topology/images/q/s_sel_global.png" alt=""></div>
                            <div data-sel='国家'><img src="/topology/images/q/s_sel_country.png" alt=""></div>
                            <div data-sel='AS'><img src="/topology/images/q/s_sel_as.png" alt=""></div>
                            <!--   <div class='first' data-sel='全球'></div>
                      <div data-sel='国家'></div>
                      <div data-sel='AS'></div> -->
                        </div>
                    </div>
                </div>
                <!-- 左选框 结束-->
                <div class="swith_log_phy">
                    <div class="log active">
                        <div class='active'></div>
                    </div>
                    <div class="phy">
                        <div></div>
                    </div>
                </div>

            </div>
            <div class="mymiddle">
                <div id="WebGL-output" class='WebGL-output'></div>
                <div id="map_topoin"></div>
                <div class="info_router info_router1"></div>
                <div class="info_router info_router2"></div>
                <div class="info_router info_router3"></div>
                <div class="marker-msg">
                    <i class="iconfont icon-close"></i>
                    <div class='content'></div>
                </div>
                <div class="top_bg"></div>
                <div class="bottom_bg"></div>
                <div class="top_tip">OPERATION DISPLAY</div>
                <div class="chose_icon">
                    <div class="myicon" data-val="out"><i class="iconfont icon-quanqiu"></i><span class="tooltip">国外</span>
                    </div>
                    <div class="myicon" data-val="in"><i class="iconfont icon-guonei"></i><span class="tooltip">国内</span>
                    </div>
                    <div class="myicon" data-val="both"><i class="iconfont icon-quanxuan"></i><span
                            class="tooltip">全部</span>
                    </div>
                    <div class="myicon active" data-val="neither"><i class="iconfont icon-xiaochu"></i><span
                            class="tooltip">清空</span></div>
                </div>
                <div class='btn-bf'>
                    <button class="backtodomainouter">返回域间</button>
                    <button class="intodomain">进入域内</button>
                </div>
                <div class="tips">
                    <ul class='notes'>
                        <li>
                            <span class="icon tri"></span>
                            <span>CONTENT</span>
                        </li>
                        <li>
                            <span class="icon rec"></span>
                            <span>ENTERPRISE</span>
                        </li>
                        <li>
                            <span class="icon circle"></span>
                            <span>TRANSIT/ACCESS</span>
                        </li>
                        <li>
                            <span class="icon rec-hole"></span>
                            <span>INTRA&nbsp;AS</span>
                        </li>
                        <li>
                            <span class="icon line"></span>
                            <span>PROVIDER</span>
                        </li>
                        <li>
                            <span class="icon line"></span>
                            <span>PEER</span>
                        </li>
                        <li>
                            <span class="icon line"></span>
                            <span>CUSTOMER</span>
                        </li>
                        <li>
                            <span class="icon line"></span>
                            <span>SIBLING</span>
                        </li>

                        <li>
                            <span class="icon line"></span>
                            <span>CUSTOMER & PROVIDER</span>
                        </li>
                    </ul>

                    <div class="grad">
                        <img src="/topology/images/q/middle_tips_grad.png">
                        <ul>
                            <li>4809</li>
                            <li>4328</li>
                            <li>3847</li>
                            <li>3366</li>
                            <li>2885</li>
                            <li>2404</li>
                            <li>1923</li>
                            <li>1442</li>
                            <li>961</li>
                            <li>480</li>
                            <li>0</li>
                        </ul>
                    </div>
                </div>

                <ul class="logrouter_tips">
                    <li>
                        <span class="icon circle"></span>
                        <span>核心路由器</span>
                    </li>
                    <li>
                        <span class="icon circle"></span>
                        <span>中间路由器</span>
                    </li>
                    <li>
                        <span class="icon circle"></span>
                        <span>边缘路由器</span>
                    </li>
                </ul>

                <ul class="phyrouter_tips">
                    <li>
                        <span class="icon circle"></span>
                        <span>核心路由器</span>
                    </li>
                    <li>
                        <span class="icon circle"></span>
                        <span>中间路由器</span>
                    </li>
                    <li>
                        <span class="icon circle"></span>
                        <span>边缘路由器</span>
                    </li>
                </ul>
                <ul class="inter_r_tips">
                    <li>
                        <span class="icon circle"></span>
                        <span>起始IP</span>
                    </li>
                    <li>
                        <span class="icon circle"></span>
                        <span>目的IP</span>
                    </li>
                </ul>

                <div>
                </div>
            </div>
            <div class="myright"></div>
        </div>
        <div class='right_info_container'>
            <div class="logic_info logic_info_global">
                <div class='info_right'>
                    <div class='country'>
                        <div class='colum1'>
                            <span></span><span>全球</span>
                        </div>
                        <div class='colum2'>
                            AS数量：<span></span>
                        </div>
                    </div>
                    <div class='infos'>
                        <div>
                            <span>CONTENT：<b></b></span> <span>IP数量：<b></b></span>
                        </div>
                        <div>
                            <span>ENTERPRISE：<b></b></span> <span>国家数量：<b></b></span>
                        </div>
                        <div>
                            <span>TRANSIT/ACCESS：<b></b></span> <span>AS边数：<b></b></span>
                        </div>
                    </div>
                    <div class="grad grad_top"></div>
                    <div class='raw top5'>
                        <span>TOP5:</span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                    </div>
                    <div class="grad grad_btm"></div>

                    <div class='raw other' id="ASlink-cnt">
                        <div class='red' title="Provider-Customer">
                            <p>PC</p>
                            <span>Provider-Customer</span>
                        </div>
                        <div class='num rednum'></div>

                        <div class='green' title="Peer-Peer">
                            <p>PP</p>
                            <span>Peer-Peer</span>
                        </div>
                        <div class='num greenum'></div>

                        <div class='yellow' title="Sibling-Sibling">
                            <p>SS</p>
                            <span>Sibling-Sibling</span>
                        </div>
                        <div class='num yellownum'></div>

                    </div>

                </div>
                <div class='info_left'>
                    <div class='circular circular_global'></div>
                    <!-- <div class="triangle"></div> -->
                    <div class='mapicon'><img src='/topology/images/pngmap/World.png' /></div>
                </div>
                <div class='border_right'>
                    <svg>
                        <polyline points="0,1.5 18,1.5 18,160 -2,180 " />
                    </svg>
                </div>
            </div>

            <div class="logic_info logic_info_as">
                <div class='info_right'>
                    <div class='country'>
                        <div class='colum1'>
                            <span>AS</span><span class='asNumber'></span>
                        </div>
                        <div class='colum2'>
                            <div>类型：<span></span></div>
                            <div>名称：<span></span></div>
                        </div>
                        <img class='colum3' src='/topology/images/qi/US.png' />
                    </div>
                    <div class='infos'>
                        <div>
                            <span>IP数量：<b></b></span>
                                &nbsp;|
                            <span>连通的AS数量：<b></b></span>
                        </div>
                        <div>
                            <span>排名：<b></b></span>
                            &nbsp;|
                            <span>连通的IP数量：<b></b></span>
                        </div>
                    </div>
                    <div class="grad grad_top"></div>
                    <div class='raw dushu'>
                        <span>传输度数</span>
                        <b></b>
                        <span>节点度数</span>
                        <b></b>
                        <span>路由器边</span>
                        <b></b>
                    </div>
                    <div class="grad grad_btm"></div>
                    <div class='raw other other-domaininter'>
                        <div class='red'>
                            <p>PROVIDER</p>
                            <span>提供商</span>
                        </div>
                        <div class='num rednum'></div>

                        <div class='green'>
                            <p>&nbsp;&nbsp;&nbsp;PEER</p>
                            <span>对等点</span>
                        </div>
                        <div class='num greenum'></div>

                        <div class='blue'>
                            <p>CUSTOMER</p>
                            <span>客户</span>
                        </div>
                        <div class='num bluenum'></div>

                        <div class='yellow'>
                            <p>SIBLING</p>
                            <span>同机构</span>
                        </div>
                        <div class='num yellownum'></div>

                    </div>

                    <div class='raw other other-domainin'>
                        <div class='yellow'>
                            <p>CORE</p>
                            <span>核心路由</span>
                        </div>
                        <div class='num yellownum'></div>

                        <div class='red'>
                            <p>INTERMEDIATE</p>
                            <span>中间路由</span>
                        </div>
                        <div class='num rednum'></div>

                        <div class='blue'>
                            <p>AREA</p>
                            <span>边缘路由</span>
                        </div>
                        <div class='num bluenum'></div>
                    </div>

                </div>
                <div class='info_left'>
                    <div class='circular circular_as'></div>
                    <div class="triangle"></div>
                    <div class='mapicon'><img src='/topology/images/logo.png' /></div>
                </div>
                <div class='border_right'>
                    <svg>
                        <polyline points="0,1.5 18,1.5 18,160 -2,180 " />
                    </svg>
                </div>
            </div>

            <div class="logic_info logic_info_country">
                <div class='info_right'>
                    <div class='raw country'>
                        <div class='colum1'>
                            <span>名称</span><span></span>
                        </div>
                        <div class='colum2'>
                            <div>AS数量：<span></span></div>
                            <div>IP数量：<span></span></div>
                        </div>
                        <img class='colum3' src='/topology/images/qi/US.png' />
                    </div>
                    <div class='infos'>
                        <div>
                            <span>IP数排名：<b></b></span>
                            &nbsp;|
                            <span>国家(地区)代码：<b class='countryCode'></b></span>
                        </div>
                        <div>
                            <span>连接国家(地区)数量：<b></b></span>
                            &nbsp;|
                            <span class='asNum'>连接的AS数量：<b></b></span>
                        </div>
                    </div>
                    <div class="grad grad_top"></div>
                    <div class='raw top5'>
                        <span>TOP5:</span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                        <img src='' /><span></span>
                    </div>
                    <div class="grad grad_btm"></div>
                    <!--  <div class='raw asNum'>
			      连接的AS数量： <i></i>
			    </div> -->
                    <div class='raw other'>
                        <div class='red' title="Provider-Customer">
                            <p>PC</p>
                            <span>Provider-Customer</span>
                        </div>
                        <div class='num rednum'></div>

                        <div class='green' title="Peer-Peer">
                            <p>PP</p>
                            <span>Peer-Peer</span>
                        </div>
                        <div class='num greenum'></div>

                        <div class='yellow' title="Sibling-Sibling">
                            <p>SS</p>
                            <span>Sibling-Sibling</span>
                        </div>
                        <div class='num yellownum'></div>

                    </div>
                </div>
                <div class='info_left'>
                    <div class='circular circular_country'></div>
                    <div class="triangle"></div>
                    <div class='mapicon'><img src='/topology/images/logo.png' /></div>
                </div>

                <div class='border_right'>
                    <svg>
                        <polyline points="0,1.5 18,1.5 18,160 -2,180 " />
                    </svg>
                </div>
            </div>
        </div>
        <div class="right-btm">
            <div class="title">
                <p>相连国家（地区）列表</p>
                <span class='rec'></span>
            </div>

            <form target="" method="post" class="search" id='export-form'>
                <!-- <input type="hidden" name="country" value="台湾"> -->
                <input type="text" class='search-input' onkeydown="keydownEvent(this);" data-btn="logic-export-search"
                    autocomplete="off" />
                <input type="hidden" class='search-input1' onkeydown="keydownEvent(this);" data-btn="logic-export-search"
                    autocomplete="off" />
                <input type="hidden" class='search-input2' onkeydown="keydownEvent(this);" autocomplete="off"
                    style="display: none " />
                <!-- <input type="hidden" class='search-input3' onkeydown="keydownEvent(this);"   autocomplete="off" style="display: none " /> -->
                <span class='iconfont icon-sousuo-sousuo' id='logic-export-search'></span>
                <span class='iconfont icon-qingchu'></span>
                <input class="export" id='logic-export' value='' type='submit' />
            </form>

            <!-- <div class="content aslist aslistStyle" id='aslist'></div> -->
            <div class="content countrylist countrylistStyle" id='countrylist'></div>
            <div class="listContainer" id='listContainer'>
                <!--  <div class="content adjacentaslist aslistStyle"></div>   
       <div class="content adjacentcountrylist countrylistStyle"></div>
       <div class="content countryinaslist aslistStyle"></div>
       <div class="content countrysaslist aslistStyle"></div> -->
            </div>
            <div class="loading-rblist">
                <div></div>
            </div>
            <div class="right-btm-error">无相关信息</div>
            <div class="holder">
                <a class="jp-previous jp-disabled">上一页</a>
                <!-- <a>1</a> -->
                <!-- <a>2</a> -->
                <!-- <a></a> -->
                <a class="jp-next">下一页</a>
            </div>

            <div class="content-other">
                <!--  <ul>
           <li>TD:<span>AS Transit Degree(传输度数)</span></li>
           <li>ASS:<span>AS Size(直连的AS数量)</span></li>
           <li>IPS:<span>IP Size(拥有的IP数量)</span></li>
           <li>CCAS:<span>Customer Cone AS Size(连通的AS数量)</span></li>
           <li>CCIP:<span>Custoner Cone IP Size(连通的IP数量)</span></li>
       </ul> -->
            </div>

            <div class="rb-btn rb-btn2" style="transform: rotate(45deg);">
                <div class="rb-btn-outer">
                    <!-- <div class="circular"> 
            <svg viewBox="0 0 100 100" transform="rotate(-45)" fill='#000'> 
              <path d="M 0,49 a 49,49 0 1,1 0,1 z" id="circle1" />
              <text > 
                <textPath xlink:href="#circle1">
                 域内路由器列表
                </textPath> 
                <textPath xlink:href="#circle1" startOffset='50%'>
                域内路由器边列表
                </textPath> 
              </text> 
            </svg> 
           </div>          -->
                    <img class='rb-btn2-1' data-item='1' src='/topology/images/q/rb_btn_yellow.png' title="域内路由器列表" />
                    <img class='rb-btn2-2' data-item='2' src='/topology/images/q/rb_btn_green.png' title="域内路由器边列表" />
                </div>
                <!-- <img class='rb-btn-center' src='/topology/images/q/rb_btn_null.png' style="transform: rotate(-45deg);"/> -->
            </div>

            <div class="rb-btn rb-btn3">

                <div class="rb-btn-outer">
                    <!--  <div class="circular"> 
            <svg viewBox="0 0 100 100"> 
              <path d="M 0,50 a 50,50 0 1,1 0,1 z" id="circle" />
              <text> 
                <textPath xlink:href="#circle">
                  国家(地区)列表 
                  &nbsp;&nbsp;&nbsp;AS边列表
                </textPath> 
              </text> 
            </svg> 
           </div>            -->
                    <img class='rb-btn3-1 active' data-item='1' src='/topology/images/q/rb_btn3_1.png' title="国家(地区)列表" />
                    <img class='rb-btn3-2' data-item='2' src='/topology/images/q/rb_btn3_2.png' title="AS列表 " />
                    <img class='rb-btn3-3' data-item='3' src='/topology/images/q/rb_btn3_3.png' title="AS边列表" />
                </div>
                <!-- <img class='rb-btn-center' src='/topology/images/q/rb_btn_all.png'/> -->

            </div>

            <div class="rb-btn rb-btn4">
                <div class="rb-btn-outer">
                    <img class='rb-btn4-1 active' data-item='1' src='/topology/images/q/rb_btn1.png' />
                    <img class='rb-btn4-2' data-item='2' src='/topology/images/q/rb_btn2.png' />
                    <img class='rb-btn4-3' data-item='3' src='/topology/images/q/rb_btn3.png' />
                    <img class='rb-btn4-4' data-item='4' src='/topology/images/q/rb_btn4.png' />
                </div>
                <img class='rb-btn-center' src='/topology/images/q/rb_btn_all.png' />
            </div>

            <div class="rb-btn rb-btn5">
                <div class="rb-btn-outer">

                </div>
                <img class='rb-btn-center' src='/topology/images/q/rb_btn_all.png' />
            </div>

        </div>
    </div>
</template>
<script>
export default {
    data:{
    },
    mounted () {
        this.loadStyle('/topology/css/reset.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/js/leaflet/dist/spider/MarkerCluster.Default.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/js/leaflet/dist/spider/MarkerCluster.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/js/leaflet/leaflet.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.jpages.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/font_281571_sdkcyu9fzo69wwmi.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.topoin.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.right.table.css'); // 替换成实际的文件路径
    
        this.loadStyle('/topology/css/datav3.q.right.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.middle.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.left.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.loading.css'); // 替换成实际的文件路径
        this.loadStyle('/topology/css/datav3.q.css'); // 替换成实际的文件路径
        // this.loadStyle(''); // 替换成实际的文件路径
        // 替换成实际的文件路径
        // this.loadScript('');
        this.loadScript('/topology/js/q/datav3.q.left.js');
        this.loadScript('/topology/js/q/datav3.q.right.js');
        this.loadScript('/topology/js/q/datav3.q.data.js');
        this.loadScript('/topology/js/q/datav3.q.exportdata.js');
        // 绘图相关开始
        // this.loadScript('');
        this.loadScript('/topology/js/libs/graph3d/d3.v4.min.js');
        this.loadScript('/topology/js/libs/graph3d/d3-threeD.js');
        // this.loadScript('');
        this.loadScript('/topology/js/q/datav3.q.initwebgl.js');
        this.loadScript('/topology/js/q/q_log_topoin/routers.js');
        this.loadScript('/topology/js/q/q_log_topoin/logicalRouterIn.js');
        this.loadScript('/topology/js/leaflet/leaflet.js');
        this.loadScript('/topology/js/leaflet/dist/spider/leaflet.markercluster-src.js');
        this.loadScript('/topology/js/libs/leaflet-echarts/echarts.source.js');
        this.loadScript('/topology/js/libs/leaflet-echarts/leaflet-echarts.js');
        // this.loadScript('');
        this.loadScript('/topology/js/libs/Leaflet.GLMarkers.js');

        this.loadScript('/topology/js/q/q_phy_topoin/index.js');
        this.loadScript('/topology/js/q/datav3.q.lemap.js');
        this.loadRequireScript('/topology/js/libs/requirejs/require.js', '/topology/js/q/datav3.q.index.js');
    },
    methods: {
        loadScript (src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        },
        loadRequireScript (src, dataMain) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.setAttribute('data-main', dataMain);
                script.onload = resolve;
                script.onerror = reject;
                // console.log(script)
                document.body.appendChild(script);
            });
        },
        loadStyle (href) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }
    }
}
</script>

<style>
</style>