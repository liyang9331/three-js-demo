console.log("------ datav3.q.left.js debug ------")

$(function(){
    var leftinfo = $('.leftinfo');
    var leftinfoR =$('.right');
    var img_wrap =leftinfo.find('.left-wrap div');
    var img_height = img_wrap.eq(0).height();
    var margin = 10;
    var slideTime = 300;
    var transitionTime = 600;
    var animate_flag = true;

    function aniTransform($obj){

        var dtd  = $.Deferred();
        var transZ = transZ || -200;

        if(!$obj.hasClass('first')){
            var top = $obj.css('top');
            
            img_wrap.each(function(index,data){
                
                if($(data).hasClass('first')){
                    $(data).removeClass('first')
                    $(data).css({top:top, 'transform':'rotate(360deg) scale(0.8)','z-index':1});
                }
            })
            
            $obj.transition({
                top: 0,
                zIndex: 2,
                transform:'rotate(0deg) scale(1)',
                
            },transitionTime,function(){
                $(this).addClass('first');
                dtd.resolve();
            })          
        } 

        return dtd.promise();
    }

    function slidetoRight(){

        var dtd  = $.Deferred();

        leftinfoR.animate({
            width: '200px'
        },slideTime,function(){
            dtd.resolve();
        })

        return dtd.promise();
    }

    function slidetoLeft(){

        var dtd  = $.Deferred();

        leftinfoR.animate({
            width: 0
        },slideTime,function(){
            dtd.resolve();
        })

        return dtd.promise();
    }

    img_wrap.each(function(i,d){
        $(this).click(function(e){

            var $_this = $(this);
            if(!$_this.hasClass('first') && (animate_flag==true)){
                animate_flag = false;
                var slide_left = slidetoLeft();
                slide_left.then(function(){         
                    return aniTransform($_this);
                }).then(function(){
                    return slidetoRight();
                }).then(function(){
                    animate_flag = true;
                })
            }
        })
    })

    //逻辑和地理图选择按钮
    var button_switch = $('.swith_log_phy>div');

    button_switch.each(function(){
        $(this).click(function(){
            $(this).addClass('active');
            $(this).siblings().removeClass('active')
        })      
    })

    // 点击物理和逻辑的切换按钮，改变样式
    jQuery(".swith_log_phy"). children("div").click(function(){
        jQuery(this).addClass("active");
        jQuery(this).find('div').addClass("active");
        jQuery(this).siblings().removeClass("active");
        jQuery(this).siblings().find('div').removeClass("active");
    });

    //  $('.swith_log_phy .log').click(function(){
    //      $(this).css({backgroundPosition:'0px -59px'})
    //      $(this).siblings().css({backgroundPosition:'99px 0px'})
    //  })

    //  $('.swith_log_phy .phy').click(function(){
    //      $(this).css({backgroundPosition:'99px -59px'});
    //      $(this).siblings().css({backgroundPosition:'0px 0px'})
    //  })
});
   