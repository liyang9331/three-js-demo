console.log("------ q/svgHeader2.js debug ------");

var SvgHeader = function (el, textid) {
  var el = el;

  var width = 180;
  var height = 180;

  var NS = "http://www.w3.org/2000/svg";
  var xlinkNS = "http://www.w3.org/1999/xlink";
  var svg = document.createElementNS(NS, "svg");

  // var rec1 = document.createElementNS(NS, "path");
  // var rec2 = document.createElementNS(NS, "path");
  var circle = document.createElementNS(NS, "path");
  var text = document.createElementNS(NS, "text");
  var textPath = document.createElementNS(NS, "textPath");
  svg.setAttribute("viewBox", "0 0" + " " + width + " " + height);

  circle.setAttribute("d", "m 90,12 A 78,78 0 1,0 91,12");
  circle.setAttribute("id", textid);
  circle.setAttribute("class", "text_circle");

  textPath.setAttributeNS(xlinkNS, "xlink:href", "#" + textid);
  textPath.setAttribute("id", "textpath" + textid);

  text.appendChild(textPath);
  svg.appendChild(circle);

  svg.appendChild(text);
  textPath.textContent = "";
  el.appendChild(svg);

  var textend_deg = 120;
  var r_text = 80;

  svg.querySelectorAll(".circle");

  function setContent(content) {
    // textPath.textContent = '';
    textPath.textContent = content;
    // console.log('content')
    // console.log(content)

    // console.log(text.textLength)//暂不能删除
    // console.log(text.getComputedTextLength())
    // console.log(text.getNumberOfChars())

    // var textstart_deg =text.textLength.animVal.value; //使用svg内部精确的计算值计算
    var textstart_deg = 186 - (content.length * 9) / 2; // 每个字符按10度计算
    // console.log(textstart_deg)
    function degToArc(deg) {
      return (deg * 2 * Math.PI * r_text) / 360;
    }

    // var m=document.querySelectorAll("circle")[3];

    circle.setAttribute("transform", "rotate(-" + textstart_deg + " 90 90)");
    // midcircle.setAttribute('stroke-dasharray', arc_length+' '+(2*Math.PI*r_text-arc_length));
    textstart_deg = 0;
  }

  return {
    setContent: setContent,
  };
};

// var circular_as = $('.circular').eq(0).get()[0];
// var svgHeaderAs = new SvgHeader(circular_as,'textcircleas');
// svgHeaderAs.setContent('333333333333')
