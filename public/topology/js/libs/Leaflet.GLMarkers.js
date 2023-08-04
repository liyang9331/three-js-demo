"use strict";

// 严格模式: 强制执行更严格的JavaScript语法，减少错误和不安全的代码

// 所有返回4x4矩阵的操作都是基于表示为16个元素数组的矩阵

console.log("------ Leaflet.GLMarkers:严格模式 debug ------");

// 将两个4x4矩阵相乘，以16个元素数组的形式给出
function matrixMultiply(a, b) {
  // 提取矩阵a的元素
  var a00 = a[0 * 4 + 0];
  var a01 = a[0 * 4 + 1];
  var a02 = a[0 * 4 + 2];
  var a03 = a[0 * 4 + 3];
  var a10 = a[1 * 4 + 0];
  var a11 = a[1 * 4 + 1];
  var a12 = a[1 * 4 + 2];
  var a13 = a[1 * 4 + 3];
  var a20 = a[2 * 4 + 0];
  var a21 = a[2 * 4 + 1];
  var a22 = a[2 * 4 + 2];
  var a23 = a[2 * 4 + 3];
  var a30 = a[3 * 4 + 0];
  var a31 = a[3 * 4 + 1];
  var a32 = a[3 * 4 + 2];
  var a33 = a[3 * 4 + 3];

  // 提取矩阵b的元素
  var b00 = b[0 * 4 + 0];
  var b01 = b[0 * 4 + 1];
  var b02 = b[0 * 4 + 2];
  var b03 = b[0 * 4 + 3];
  var b10 = b[1 * 4 + 0];
  var b11 = b[1 * 4 + 1];
  var b12 = b[1 * 4 + 2];
  var b13 = b[1 * 4 + 3];
  var b20 = b[2 * 4 + 0];
  var b21 = b[2 * 4 + 1];
  var b22 = b[2 * 4 + 2];
  var b23 = b[2 * 4 + 3];
  var b30 = b[3 * 4 + 0];
  var b31 = b[3 * 4 + 1];
  var b32 = b[3 * 4 + 2];
  var b33 = b[3 * 4 + 3];

  // 计算矩阵相乘结果
  return [
    a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
    a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
    a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
    a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
    a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
    a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
    a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
    a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
    a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
    a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
    a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
    a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
    a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
    a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
    a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
    a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
  ];
}

// 返回一个单位矩阵
function identityMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

// 返回一个平移矩阵
// offset是一个包含3个元素的数组
function translationMatrix(t) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1];
}

// 返回一个缩放矩阵
// scale是一个包含3个元素的数组
function scaleMatrix(s) {
  return [s[0], 0, 0, 0, 0, s[1], 0, 0, 0, 0, s[2], 0, 0, 0, 0, 1];
}

// L.GLMarker 类代表一个WebGL标记，定义为一个Leaflet类
L.GLMarker = L.Class.extend({
  // 构造函数，接收一个纬度经度坐标(latlng)和一些选项作为参数
  initialize: function initialize(latLng, options) {
    if (options === void 0) options = {};

    this._latLng = L.latLng(latLng);
    L.Util.setOptions(this, options);
  },
});

// 设置一个全局变量
L.Browser.gl = false;
try {
  // return
  // 创建一个canvas元素并获取WebGL上下文
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("webgl");
  if (context && typeof context.getParameter == "function") {
    L.Browser.gl = "webgl";
  } else {
    context = canvas.getContext("experimental-webgl");
    if (context && typeof context.getParameter == "function") {
      L.Browser.gl = "experimental-webgl";
    }
  }
} catch (e) {
  // 可能会抛出安全错误
  L.Browser.gl = false;
}

// 创建一个GLMarkerGroup类，它是一个自定义Leaflet图层，用于管理多个GLMarkers
L.GLMarkerGroup = L.Layer.extend({
  // 构造函数，接收一些选项作为参数
  initialize: function initialize(options) {
    if (options === void 0) options = {};

    L.Util.setOptions(this, options);

    // 将GLMarkers存储在一个数组中
    this._glMarkers = [];
  },

  // 添加一个GLMarker到组中
  addGLMarker: function addGLMarker(glMarker) {
    this._glMarkers.push(glMarker);
  },

  // 从组中移除一个GLMarker
  removeGLMarker: function removeGLMarker(glMarker) {
    var index = this._glMarkers.indexOf(glMarker);
    if (index !== -1) {
      this._glMarkers.splice(index, 1);
    }
  },

  // 设置着色器的uniforms和attributes选项
  // uniforms是一个包含uniforms选项的对象
  // attributes是一个包含attributes选项的对象
  setOptions: function setOptions(uniforms, attributes) {
    if (uniforms === void 0) uniforms = {};
    if (attributes === void 0) attributes = {};

    this._uniforms = uniforms;
    this._attributes = attributes;
  },

  // 初始化WebGL上下文和画布
  _initGL: function _initGL() {
    if (!this._gl) {
      this._canvas = document.createElement("canvas");
      this._gl = this._canvas.getContext(L.Browser.gl);
    }
  },

  // 编译着色器并创建GL程序
  _glCreateProgram: function _glCreateProgram(vertexShaderSource, fragmentShaderSource) {
    var vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
    var fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
    this._gl.shaderSource(vertexShader, vertexShaderSource);
    this._gl.shaderSource(fragmentShader, fragmentShaderSource);
    this._gl.compileShader(vertexShader);
    this._gl.compileShader(fragmentShader);
    var program = this._gl.createProgram();
    this._gl.attachShader(program, vertexShader);
    this._gl.attachShader(program, fragmentShader);
    this._gl.linkProgram(program);
    this._gl.useProgram(program);

    return program;
  },

  // 调整画布大小以适应地图大小
  _glResizeCanvas: function _glResizeCanvas() {
    var size = this._map.getSize();
    var devicePixelRatio = window.devicePixelRatio || 1;

    this._canvas.width = size.x * devicePixelRatio;
    this._canvas.height = size.y * devicePixelRatio;
    this._canvas.style.width = size.x + "px";
    this._canvas.style.height = size.y + "px";

    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
  },

  // 加载标记的纹理
  _loadTextures: function _loadTextures() {
    // 请添加加载纹理的代码
    // ...
  },

  // 更新GL缓冲区数据
  _redoBuffers: function _redoBuffers() {
    // 请添加更新缓冲区数据的代码
    // ...
  },

  // 获取变换矩阵
  _getTransformMatrix: function _getTransformMatrix() {
    // 获取地图中心和缩放级别
    var center = this._map.getCenter();
    var zoom = this._map.getZoom();

    // 计算投影坐标
    var worldPoint = this._map.project(center, zoom);

    // 获取地图分辨率
    var resolution = (2 * Math.PI * 6378137) / (256 * Math.pow(2, zoom));

    // 计算缩放比例
    var scale = 1 / resolution;

    // 计算偏移量
    var offset = [worldPoint.x, worldPoint.y, 0];

    // 返回变换矩阵
    return matrixMultiply(
      translationMatrix(offset),
      matrixMultiply(scaleMatrix([scale, -scale, 1]), translationMatrix([-1, -1, 0]))
    );
  },

  // 渲染GLMarkerGroup，更新WebGL上下文
  render: function render() {
    // 初始化WebGL上下文和画布
    this._initGL();

    // 调整画布大小以适应地图大小
    this._glResizeCanvas();

    // 加载标记的纹理
    this._loadTextures();

    // 更新GL缓冲区数据
    this._redoBuffers();

    // 获取变换矩阵
    var transformMatrix = this._getTransformMatrix();

    // 更新着色器的uniforms
    // 请根据需求定义uniforms
    // ...

    // 更新着色器的attributes
    // 请根据需求定义attributes
    // ...

    // 清除画布并重新渲染GLMarkers
    // 请根据需求定义渲染代码
    // ...
  },
});

console.log("------- Leaflet.GLMarker 调试 -------");
