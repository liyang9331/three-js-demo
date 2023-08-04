console.log("------ datav3.q.initwebgl.js debug ------")

// 声明变量，用于存储渲染器、场景、相机、容器宽高、控制器和克隆相机
var renderer;
var scene;
var camera;
var containerW;
var containerH;
var controler;
var iCamera;

// 使用立即调用函数表达式（IIFE）封装代码，避免变量污染全局作用域
(function () {
  // 创建一个计时器，用于动画更新
  var clock = new THREE.Clock();

  // 初始化函数，包含获取DOM元素、初始化WebGL、初始化控制器、初始化事件、开始渲染动画
  (function init() {
    getDom();
    init_webgl();
    init_controler();
    init_event();
    animate();
  })();

  // 初始化WebGL
  function init_webgl() {
    // 创建一个新的three.js场景
    scene = new THREE.Scene();

    // 使用透视相机创建相机对象
    // 参数依次为：视角角度，宽高比，近裁剪面，远裁剪面
    camera = new THREE.PerspectiveCamera(85, containerW / containerH, 1, 100000000);

    // 设置相机的位置
    camera.position.set(0, 0, 150000);

    // 将相机添加到场景中
    scene.add(camera);

    // 克隆相机对象，可以用于创建其他视角
    iCamera = camera.clone();

    // 创建一个WebGL渲染器，启用透明度和抗锯齿
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // 将像素比设置为设备的像素比，以获得更好的分辨率
    renderer.setPixelRatio(window.devicePixelRatio);

    // 将渲染器的大小设置为容器的宽度和高度
    renderer.setSize(containerW, containerH);

    // 将渲染器的画布元素添加到DOM中
    // 请在getElementById中添加有效的ID名称，用于指定画布应该附加到哪个元素上
    document.getElementById("WebGL-output").appendChild(renderer.domElement);
  }

  // 初始化控制器
  function init_controler() {
    // 使用TrackballControls创建一个交互控制器，传入相机和渲染器的DOM元素
    controler = new THREE.TrackballControls(camera, renderer.domElement);
    // 设置控制器的旋转速度、缩放速度和平移速度
    controler.rotateSpeed = 1.0;
    controler.zoomSpeed = 1.0;
    controler.panSpeed = 1.0;
    // 可以根据需要注释掉或设置其他控制器选项
  }

  // 初始化事件
  function init_event() {
    // 添加窗口大小改变事件监听器，当窗口大小改变时调用resizeHandle函数
    window.addEventListener("resize", resizeHandle, false);
  }

  // 渲染动画
  function animate() {
    // 获取从上一帧到当前帧的时间差
    var delta = clock.getDelta();
    // 更新控制器状态，以响应鼠标拖拽等操作
    controler.update();
    // 请求浏览器动画帧，实现动画循环
    requestAnimationFrame(animate);
    // 使用渲染器渲染场景和相机
    renderer.render(scene, camera);
  }

  // 获取DOM元素的宽高
  function getDom() {
    // 通过jQuery获取DOM元素的宽高，并减去4像素的边框
    containerW = $("#WebGL-output").width() - 4;
    containerH = $("#WebGL-output").height() - 4;
  }

  // 处理窗口大小改变事件
  function resizeHandle() {
    // 获取新的DOM元素宽高
    getDom();
    // 更新相机的宽高比，保持正确的画面比例
    camera.aspect = containerW / containerH;
    // 更新相机的投影矩阵
    camera.updateProjectionMatrix();
    // 更新渲染器的大小，以适应新的容器宽高
    renderer.setSize(containerW, containerH);
    // 更新克隆相机的宽高比和投影矩阵，保持一致
    iCamera.aspect = containerW / containerH;
    iCamera.updateProjectionMatrix();
  }
})()
