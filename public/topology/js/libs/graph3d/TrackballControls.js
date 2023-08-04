/**
 * TrackballControls类用于处理相机交互控制，允许用户通过鼠标或触摸屏幕来旋转、缩放和平移相机视角。
 * @param {THREE.Camera} object - Three.js相机对象，要控制的相机。
 * @param {HTMLElement} domElement - 用于绑定事件监听器的DOM元素。
 */
THREE.TrackballControls = function (object, domElement) {
  // 存储this的引用，以便在内部函数中访问外部对象
  var _this = this;

  // 定义操作状态常量
  var STATE = {
    NONE: -1,
    ROTATE: 2, // 添加旋转状态-鼠标右键
    ZOOM: 1, // 添加缩放状态-鼠标滚轮
    PAN: 0, // 添加平移状态-鼠标左键
    TOUCH_ROTATE: 3, // 添加触摸旋转状态
    TOUCH_ZOOM_PAN: 4, // 添加触摸缩放、平移状态
  };

  // 初始化属性
  this.object = object;
  this.domElement = domElement !== undefined ? domElement : document;

  // API控制选项
  this.enabled = true;

  this.screen = { left: 0, top: 0, width: 0, height: 0 };

  this.rotateSpeed = 0.3; //旋转速率
  this.zoomSpeed = 0.4; // 缩放速率
  this.panSpeed = 1; // 平移速率

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;
  this.noRoll = false;

  this.staticMoving = false;
  this.dynamicDampingFactor = 0.4;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [65 /*A*/, 83 /*S*/, 68 /*D*/];

  // 相关向量和状态变量
  this.target = new THREE.Vector3();

  var EPS = 0.000001;

  var lastPosition = new THREE.Vector3();

  var _state = STATE.NONE,
    _prevState = STATE.NONE,
    _eye = new THREE.Vector3(),
    _rotateStart = new THREE.Vector3(),
    _rotateEnd = new THREE.Vector3(),
    _zoomStart = new THREE.Vector2(),
    _zoomEnd = new THREE.Vector2(),
    _touchZoomDistanceStart = 0,
    _touchZoomDistanceEnd = 0,
    _panStart = new THREE.Vector2(),
    _panEnd = new THREE.Vector2();

  // 用于重置的初始状态属性
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.up0 = this.object.up.clone();

  // 自定义事件
  var changeEvent = { type: "change" };
  var startEvent = { type: "start" };
  var endEvent = { type: "end" };

  // handleResize方法处理窗口大小变化，更新屏幕尺寸参数
  this.handleResize = function () {
    // 如果domElement是document，使用整个窗口的大小
    if (this.domElement === document) {
      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;
    } else {
      // 否则，获取domElement的尺寸和位置
      var box = this.domElement.getBoundingClientRect();
      // 使用类似jquery offset()函数的调整来获取相对于页面的位置
      var d = this.domElement.ownerDocument.documentElement;
      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
      this.screen.top = box.top + window.pageYOffset - d.clientTop;
      this.screen.width = box.width;
      this.screen.height = box.height;
    }
  };

  // handleEvent方法处理事件，根据事件类型调用相应的处理方法
  this.handleEvent = function (event) {
    if (typeof this[event.type] == "function") {
      this[event.type](event);
    }
  };

  // getMouseOnScreen方法将页面坐标转换为Three.js中的标准化屏幕坐标
  var getMouseOnScreen = (function () {
    var vector = new THREE.Vector2();
    return function (pageX, pageY) {
      vector.set(
        (pageX - _this.screen.left) / _this.screen.width,
        (pageY - _this.screen.top) / _this.screen.height
      );
      return vector;
    };
  })();

  // getMouseProjectionOnBall方法将页面坐标转换为相机球面坐标
  var getMouseProjectionOnBall = (function () {
    var vector = new THREE.Vector3();
    var objectUp = new THREE.Vector3();
    var mouseOnBall = new THREE.Vector3();
    return function (pageX, pageY) {
      mouseOnBall.set(
        (pageX - _this.screen.width * 0.5 - _this.screen.left) /
          (_this.screen.width * 0.5),
        (_this.screen.height * 0.5 + _this.screen.top - pageY) /
          (_this.screen.height * 0.5),
        0.0
      );
      var length = mouseOnBall.length();
      // 如果设置不旋转（noRoll），则根据长度计算z分量
      if (_this.noRoll) {
        if (length < Math.SQRT1_2) {
          mouseOnBall.z = Math.sqrt(1.0 - length * length);
        } else {
          mouseOnBall.z = 0.5 / length;
        }
      } else if (length > 1.0) {
        mouseOnBall.normalize();
      } else {
        mouseOnBall.z = Math.sqrt(1.0 - length * length);
      }
      // 根据相机位置和鼠标球面坐标计算目标点在球面上的位置
      _eye.copy(_this.object.position).sub(_this.target);
      vector.copy(_this.object.up).setLength(mouseOnBall.y);
      vector.add(
        objectUp.copy(_this.object.up).cross(_eye).setLength(mouseOnBall.x)
      );
      vector.add(_eye.setLength(mouseOnBall.z));
      return vector;
    };
  })();

  // rotateCamera方法处理相机的旋转操作
  this.rotateCamera = (function () {
    var axis = new THREE.Vector3(),
      quaternion = new THREE.Quaternion();
    return function () {
      // console.log("旋转相机")
      // 计算两向量的夹角
      var angle = Math.acos(
        _rotateStart.dot(_rotateEnd) /
          _rotateStart.length() /
          _rotateEnd.length()
      );
      // 如果有旋转角度
      if (angle) {
        // 计算旋转轴
        axis.crossVectors(_rotateStart, _rotateEnd).normalize();
        // 根据旋转角度和旋转轴创建四元数
        angle *= _this.rotateSpeed;
        quaternion.setFromAxisAngle(axis, -angle);
        // 旋转_eye和相机的up向量
        _eye.applyQuaternion(quaternion);
        _this.object.up.applyQuaternion(quaternion);
        _rotateEnd.applyQuaternion(quaternion);
        // 如果使用静态移动(staticMoving)，则将起始旋转向量复制为结束旋转向量
        if (_this.staticMoving) {
          _rotateStart.copy(_rotateEnd);
        } else {
          // 否则，根据动态阻尼因子进行缓动
          quaternion.setFromAxisAngle(
            axis,
            angle * (_this.dynamicDampingFactor - 1.0)
          );
          _rotateStart.applyQuaternion(quaternion);
        }
      }
    };
  })();

  // zoomCamera方法处理相机的缩放操作
  this.zoomCamera = function () {
    if (_state === STATE.TOUCH_ZOOM_PAN) {
      // 处理触摸屏幕的缩放操作
      var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
      _touchZoomDistanceStart = _touchZoomDistanceEnd;
      _eye.multiplyScalar(factor);
    } else {
      // 处理鼠标滚轮的缩放操作
      var factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;
      if (factor !== 1.0 && factor > 0.0) {
        _eye.multiplyScalar(factor);

        // ------  此处代码实现fps过低，故废除 ----------
        // _this.object.zoom *= factor;
        // _this.object.updateProjectionMatrix();// 更新相机投影矩阵
        // ------  此处代码实现fps过低，故废除 ----------
        if (_this.staticMoving) {
          _zoomStart.copy(_zoomEnd);
        } else {
          _zoomStart.y +=
            (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;
        }
      }
    }
  };

  // panCamera方法处理相机的平移操作
  this.panCamera = (function () {
    var mouseChange = new THREE.Vector2(),
      objectUp = new THREE.Vector3(),
      pan = new THREE.Vector3();

    return function () {
      // console.log("平移相机")
      mouseChange.copy(_panEnd).sub(_panStart);

      if (mouseChange.lengthSq()) {
        mouseChange.multiplyScalar(_eye.length() * _this.panSpeed);

        pan.copy(_eye).cross(_this.object.up).setLength(mouseChange.x);
        pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));

        _this.object.position.add(pan);
        _this.target.add(pan);

        if (_this.staticMoving) {
          _panStart.copy(_panEnd);
        } else {
          _panStart.add(
            mouseChange
              .subVectors(_panEnd, _panStart)
              .multiplyScalar(_this.dynamicDampingFactor)
          );
        }
      }
    };
  })();

  // checkDistances方法检查相机与目标点之间的距离，确保在设置的最小和最大距离范围内。
  this.checkDistances = function () {
    if (!_this.noZoom || !_this.noPan) {
      if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {
        _this.object.position.addVectors(
          _this.target,
          _eye.setLength(_this.maxDistance)
        );
      }
      if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {
        _this.object.position.addVectors(
          _this.target,
          _eye.setLength(_this.minDistance)
        );
      }
    }
  };

  // update方法更新相机的位置和朝向，同时调用事件change。
  this.update = function () {
    // console.log("update")
    _eye.subVectors(_this.object.position, _this.target);
    if (!_this.noRotate) {
      // 此处调用是为了高fps
      _this.rotateCamera();
      // console.log("noRotate")
    }
    if (!_this.noZoom) {
      // 此处调用是为了高fps
      _this.zoomCamera();
      // console.log("noZoom")
    }
    if (!_this.noPan) {
      // 此处调用是为了高fps
      _this.panCamera();
    }
    _this.object.position.addVectors(_this.target, _eye);
    _this.checkDistances();
    _this.object.lookAt(_this.target);
    if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
      _this.dispatchEvent(changeEvent);
      lastPosition.copy(_this.object.position);
    }
  };

  // reset方法将相机的位置和朝向重置为初始状态。
  this.reset = function () {
    _state = STATE.NONE;
    _prevState = STATE.NONE;
    _this.target.copy(_this.target0);
    _this.object.position.copy(_this.position0);
    _this.object.up.copy(_this.up0);
    _eye.subVectors(_this.object.position, _this.target);
    _this.object.lookAt(_this.target);
    _this.dispatchEvent(changeEvent);
    lastPosition.copy(_this.object.position);
  };

  // 键盘按下事件处理函数
  function keydown(event) {
    if (_this.enabled === false) return;

    window.removeEventListener("keydown", keydown);

    _prevState = _state;

    if (_state !== STATE.NONE) {
      return;
    } else if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noRotate) {
      _state = STATE.ROTATE;
    } else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {
      _state = STATE.ZOOM;
    } else if (event.keyCode === _this.keys[STATE.PAN] && !_this.noPan) {
      _state = STATE.PAN;
    }
  }

  // 键盘松开事件处理函数
  function keyup(event) {
    if (_this.enabled === false) return;

    _state = _prevState;

    window.addEventListener("keydown", keydown, false);
  }

  // 鼠标按下事件处理函数
  function mousedown(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;
    // console.log("mousedown");
    // 隐藏信息窗口
    $(".info_router").hide();
    console.log(event.button);
    // 阻止事件的默认行为和冒泡，以防止事件继续传播。
    event.preventDefault();
    event.stopPropagation();

    // 根据鼠标按下的按钮设置状态
    // 左键：0    右键：2    滚轮：1
    if (_state === STATE.NONE) {
      _state = event.button;
    }
    // 0 -1 0 1 2
    // console.log(_state, STATE.NONE, STATE.ROTATE, STATE.ZOOM, STATE.PAN);
    // 根据状态处理不同的交互操作
    if (_state === STATE.ROTATE && !_this.noRotate) {
      // 记录旋转操作的起始点
      // 将鼠标页面坐标转换为Three.js中使用的归一化的屏幕坐标，并赋值给_panStart【起始点】【Vector2】向量
      _rotateStart.copy(getMouseProjectionOnBall(event.pageX, event.pageY));
      // 将 _rotateStart 向量的值复制给 _rotateEnd 向量，以保存旋转操作的起始点
      _rotateEnd.copy(_rotateStart);
    } else if (_state === STATE.PAN && !_this.noPan) {
      // 记录平移操作的起始点
      // 将鼠标页面坐标转换为Three.js中使用的归一化的屏幕坐标，并赋值给_panStart【起始点】【Vector2】向量
      _panStart.copy(getMouseOnScreen(event.pageX, event.pageY));
      // 将 _panStart 向量的值复制给 _panEnd 向量，以保存旋转操作的起始点
      _panEnd.copy(_panStart);
    }

    // 添加鼠标移动和鼠标抬起事件监听器
    document.addEventListener("mousemove", mousemove, false);
    document.addEventListener("mouseup", mouseup, false);

    // 触发 start 事件
    _this.dispatchEvent(startEvent);
  }

  // 鼠标移动事件处理函数
  function mousemove(event) {
    // console.log("mousemove");
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;

    // 阻止事件的默认行为和冒泡，以防止事件继续传播。
    event.preventDefault();
    event.stopPropagation();

    // console.log(_state, STATE.NONE, STATE.ROTATE, STATE.ZOOM, STATE.PAN);
    // 根据当前状态更新相应的操作终点
    if (_state === STATE.ROTATE && !_this.noRotate) {
      // 将经过球面投影处理后的鼠标位置保存在 _rotateEnd 向量中
      _rotateEnd.copy(getMouseProjectionOnBall(event.pageX, event.pageY));
    } else if (_state === STATE.PAN && !_this.noPan) {
      // 将鼠标在屏幕上的坐标转换为Three.js场景中的归一化坐标，赋值给 _panEnd
      // console.log(event.pageX)
      _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
      // 在 this.panCamera 函数中实现了相机平移，这里只是更新位置
      // _this.panCamera()
    }
  }

  // 鼠标抬起事件处理函数
  function mouseup(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    // 重置状态为 STATE.NONE
    _state = STATE.NONE;

    // 移除鼠标移动和鼠标抬起事件监听器
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);

    // 触发 end 事件
    _this.dispatchEvent(endEvent);
  }

  // 鼠标滚轮事件处理函数
  function mousewheel(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;

    // 隐藏信息窗口
    $(".info_router").hide();

    // 阻止事件的默认行为和冒泡，以防止事件继续传播
    event.preventDefault();
    event.stopPropagation();

    var delta = 0;

    // 根据不同浏览器的事件对象，获取鼠标滚轮的滚动距离（delta值），赋值给变量 delta。
    if (event.wheelDelta) {
      // WebKit / Opera / Explorer 9

      delta = event.wheelDelta / 40;
    } else if (event.detail) {
      // Firefox

      delta = -event.detail / 3;
    }

    // 增加缩放的增量，可以根据需要调整系数
    _zoomStart.y += delta * 0.01;
    // 触发 startEvent 和 endEvent 事件，通知其他组件缩放操作的开始和结束。
    _this.zoomCamera()
    _this.dispatchEvent(startEvent);
    _this.dispatchEvent(endEvent);
  }

  // 触摸屏幕开始触摸事件处理函数
  function touchstart(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;
    // 隐藏信息窗口
    $(".info_router").hide();

    switch (event.touches.length) {
      case 1:
        // 单点触摸，记录旋转操作的起始点
        _state = STATE.TOUCH_ROTATE;
        _rotateStart.copy(
          getMouseProjectionOnBall(
            event.touches[0].pageX,
            event.touches[0].pageY
          )
        );
        _rotateEnd.copy(_rotateStart);
        break;

      case 2:
        // 双点触摸，记录缩放和平移操作的起始点
        _state = STATE.TOUCH_ZOOM_PAN;
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(
          dx * dx + dy * dy
        );

        var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        _panStart.copy(getMouseOnScreen(x, y));
        _panEnd.copy(_panStart);
        break;

      default:
        _state = STATE.NONE;
    }
    // 触发 start 事件
    _this.dispatchEvent(startEvent);
  }

  // 触摸屏幕移动事件处理函数
  function touchmove(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1:
        // 单点触摸，更新旋转终点
        _rotateEnd.copy(
          getMouseProjectionOnBall(
            event.touches[0].pageX,
            event.touches[0].pageY
          )
        );
        break;

      case 2:
        // 双点触摸，更新缩放和平移终点
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

        var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        _panEnd.copy(getMouseOnScreen(x, y));
        break;

      default:
        _state = STATE.NONE;
    }
  }

  // 触摸屏幕结束触摸事件处理函数
  function touchend(event) {
    // 如果控制器被禁用，则直接返回
    if (_this.enabled === false) return;

    switch (event.touches.length) {
      case 1:
        // 单点触摸，更新旋转终点和起始点
        _rotateEnd.copy(
          getMouseProjectionOnBall(
            event.touches[0].pageX,
            event.touches[0].pageY
          )
        );
        _rotateStart.copy(_rotateEnd);
        break;

      case 2:
        // 双点触摸，重置缩放起始点和终点，并更新平移终点和起始点
        _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

        var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        _panEnd.copy(getMouseOnScreen(x, y));
        _panStart.copy(_panEnd);
        break;
    }

    // 重置状态为 STATE.NONE
    _state = STATE.NONE;
    // 触发 end 事件
    _this.dispatchEvent(endEvent);
  }

  // 监听鼠标右键点击事件，防止上下文菜单弹出
  this.domElement.addEventListener(
    "contextmenu",
    function (event) {
      event.preventDefault();
    },
    false
  );

  // 监听鼠标按下事件
  this.domElement.addEventListener("mousedown", mousedown, false);

  // 监听鼠标滚轮事件和触摸屏幕的手势事件
  this.domElement.addEventListener("mousewheel", mousewheel, false);
  this.domElement.addEventListener("DOMMouseScroll", mousewheel, false); // 兼容Firefox

  this.domElement.addEventListener("touchstart", touchstart, false);
  this.domElement.addEventListener("touchend", touchend, false);
  this.domElement.addEventListener("touchmove", touchmove, false);

  // 监听键盘事件
  window.addEventListener("keydown", keydown, false);
  window.addEventListener("keyup", keyup, false);

  // 初始化时强制更新一次
  this.handleResize();
  this.update();
};

// 将TrackballControls的原型指向THREE.EventDispatcher的实例，从而可以使用自定义事件。
THREE.TrackballControls.prototype = Object.create(
  THREE.EventDispatcher.prototype
);
