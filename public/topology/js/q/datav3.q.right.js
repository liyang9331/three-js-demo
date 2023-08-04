console.log("------ datav3.q.right.js debug ------");

//***********右侧信息展示中供index调用的接口封装***********/

//  右下按钮动画
$(function () {
  var right_btm = $(".right-btm");
  var content = right_btm.find(".content");
  var content_list = content.find(".content-list");
  right_btm.find(".rb-btn").each(function () {
    rbBtnAnimate($(this));
  });
  // rbBtnAnimate(right_btm.find('.rb-btn2'));

  function rbBtnAnimate($ele) {
    var btn_country = $ele.find(".rb-btn-center");
    var rb_btn_outer = $ele.find(".rb-btn-outer");
    var btn_transition_time = 500;

    var img_len = rb_btn_outer.find("img").length;
    var per_deg = 360 / img_len;

    // var init_rotate = 140;
    if (img_len == 2) {
      btn_country.click(function () {
        $_this = $(this);

        var anim1 = scaleBtnCountry($_this);
        anim1.then(function () {
          resetBtnCountry($_this);
        });
      });
    } else {
      btn_country.click(function () {
        $_this = $(this);

        var anim1 = transiteBtnOuterDown($_this, -200);
        anim1.then(function () {
          resetBtnOuter($_this);
        });
      });
    }

    function scaleBtnCountry($_el) {
      var dtd = $.Deferred();

      $_el.transition(
        {
          transform: "scale(0.8) rotate(-40deg)",
        },
        btn_transition_time,
        function () {
          dtd.resolve();
        }
      );

      return dtd.promise();
    }

    function resetBtnCountry($_el) {
      var dtd = $.Deferred();

      $_el.transition(
        {
          transform: "scale(1) rotate(-40deg)",
        },
        btn_transition_time,
        function () {
          dtd.resolve();
        }
      );

      return dtd.promise();
    }

    rb_btn_outer.find("img").each(function (i, d) {
      $(this).on("click.animate", function () {
        var $_this = $(this);
        var rotate_deg = i * per_deg;

        var anim1 = transiteBtnOuterDown($_this);
        anim1
          .then(function () {
            transiteBtnOuterUp($_this);
            return rotateBtn($_this, rotate_deg);
          })
          .then(function () {
            resetBtnOuter($_this);
          });
        // $_this.addClass('active');
      });
    });

    function transiteBtnOuterDown($_el, transZ) {
      var dtd = $.Deferred();
      var transZ = transZ || -40;

      $_el.transition(
        {
          transform: "translate3d(0px,0px," + transZ + "px)",
        },
        btn_transition_time,
        function () {
          dtd.resolve();
        }
      );

      return dtd.promise();
    }

    function transiteBtnOuterUp($_el, transZ) {
      var dtd = $.Deferred();
      var transZ = transZ || 50;

      $_el.transition(
        {
          transform: "translate3d(0px,0px," + transZ + "px)",
        },
        btn_transition_time,
        function () {
          dtd.resolve();
        }
      );

      return dtd.promise();
    }

    function rotateBtn($_el, rotate_deg) {
      var dtd = $.Deferred();

      $_el.parent().transition(
        {
          transform: "rotate(-" + rotate_deg + "deg)",
        },
        btn_transition_time,
        function () {
          dtd.resolve();
        }
      );

      return dtd.promise();
    }

    function resetBtnOuter($_el) {
      $_el.transition(
        {
          transform: "translate3d(0px,0px,0px)",
        },
        btn_transition_time
      );
    }
  }

  //右下信息中交互操作
  $(".aslist .content-list").each(function () {
    $(this).hover(
      function () {
        $(this).addClass("active");
      },
      function () {
        $(this).removeClass("active");
      }
    );
  });
});
