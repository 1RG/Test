// --------- Public variables ---------
var c0, c1;
var c0tx, c1tx;

var arr;

var mainCursor,  mainCursorArrNr, eMDCursor, eMDCursorArrNr = null;
var eMousedown = false;

var stopAmin = false;

var Axis = function(x, y) {
  this.x = x;
  this.y = y;
}

var drawMemory = [];
var currentMemoryPoint = 0;
// ---------

// --------- On load page ---------
window.onload = function(){
  _id("info_text").innerHTML = "JS loading";
  initMedia();

  c0 = _id("canvas0");
  c0tx = c0.getContext("2d");
  c1 = _id("canvas1");
  c1tx = c1.getContext("2d");

  arr = getStartArr();

  var nr = 0;
  for (var i = 0; i < arr.length; i++) {

      pointsCoordinatesCross(arr, i, function(e){
        nr++;
  //      console.log(nr, e, i);
      }, 0);
  //    console.log("=== ", i, (nr-len));
  }

  console.log("all nr ", nr);

  initEvent();

  _id("info_text").innerHTML = "";
};
// ---------

// --------- Public JavaScript function ---------
function initEvent(){

  // Init event function

  var onDown = function(evt) {
    if(evt.button == 0){
      if(DEV){ drawCursor(c0tx, mainCursor.x, mainCursor.y, "#00ff00"); }
      eMousedown = true;
      eMDCursor = mainCursor;
      eMDCursorArrNr = mainCursorArrNr;
    }
  };

  var onUp = function(evt) {
    if(evt.button == 0){
      if( stopAmin ){ stopAmin = false }

      if(DEV){ drawCursor(c0tx, mainCursor.x, mainCursor.y, "#0000ff"); }
      if(mainCursorArrNr != eMDCursorArrNr && eMousedown){
        var mainParameters = {
          animation: _id("draw_anim_type").value,
          color: _id("draw_anim_color").value,
          width: _id("draw_line_width").value,
          density: _id("draw_line_density").value,
          delay: _id("draw_anim_delay").value
        };

        // console.log(mainCursor);

        drawLine(c0tx, mainCursor, mainParameters.color, mainParameters.width);

        addNewLine();

        var delPartArr = deleteMinPart();
        // console.log(delPartArr);

        var tempDrawMemory = [];
        for (var i = 0; i < currentMemoryPoint; i++) {
          tempDrawMemory.push( drawMemory[i] );
        }
        tempDrawMemory.push({"line": {"str": eMDCursor, "end": mainCursor}});
        setUnRedoVariables(tempDrawMemory, (currentMemoryPoint + 1), false, true, (currentMemoryPoint + 1), 0);

        fillPart(c0tx, delPartArr, mainParameters);

        // c0tx.clearRect(0, 0, c1.width, c1.height);
        // testMoving2(c0tx, delPartArr);

        if(DEV){
          testMoving(c0tx);
        }
      }
      eMousedown = false;
    }
  };

  var onMove = function(evt) {
    if(arr.length != 0){
      var rect = c1.getBoundingClientRect();
      var mx = evt.clientX - rect.left;
      var my = evt.clientY - rect.top;

      c1tx.clearRect(0, 0, c1.width, c1.height);

      var m = getDistance(mx, my, arr[0]);
      var mo = arr[0];
      var mi = 0;
      for (var i = 0; i < arr.length; i++) {
        pointsCoordinatesCross(arr, i, function(e){
          var t = getDistance(mx, my, e);
          if(t < m){
            m = t;
            mo = e;
            mi = i;
          }
        }, 0);
      }
      mainCursor = mo;
      mainCursorArrNr = mi+1;
      drawCursor(c1tx, mo.x, mo.y, '#ff0000');
      if(eMousedown){
        drawLine(c1tx, mainCursor, invertColor( _id("draw_anim_color").value ), 3);
      }
    }
    //console.log(mainCursorArrNr, mo);
  };

  var firstTouch = function(evt, event_function_arr){
    var touches = evt.changedTouches;
    if(touches.length > 0){
      touches[0].button = 0;

      for(var i = 0; i < event_function_arr.length;  i++){
        event_function_arr[i](touches[0]);
      }
    }
  };

  var onDrawEnd = function(){
    if( stopAmin ){ stopAmin = false }

    var mainParameters = {
      animation: _id("draw_anim_type").value,
      color: _id("draw_anim_color").value,
      width: _id("draw_line_width").value,
      density: _id("draw_line_density").value,
      delay: _id("draw_anim_delay").value
    };

    fillPart(c0tx, arr, mainParameters);

    if(arr.length != 0){
      var tempDrawMemory = [];
      for (var i = 0; i < currentMemoryPoint; i++) {
        tempDrawMemory.push( drawMemory[i] );
      }
      tempDrawMemory.push({"line": "end"});
      setUnRedoVariables(tempDrawMemory, (currentMemoryPoint + 1), false, true, (currentMemoryPoint + 1), 0);
    }

    arr = [];
    c1tx.clearRect(0, 0, c1.width, c1.height);
  };

  var onReset = function(){
    if(confirm("Are you sure you want to clear canvas?")){
      stopAmin = true;
      arr = getStartArr();
      c0tx.clearRect(0, 0, c0.width, c0.height);

      setUnRedoVariables([], 0, true, true, 0, 0);
    }
  };

  var onSidenavBack = function(){
    _id("sidenav").style.width = "0px";
    _id("sidenav_back").style.opacity = "0";

    setTimeout(function(){
      _id("sidenav_back").style.width = "0%";
      _id("sidenav").classList.remove("sidenav_shadow");
    }, 500);
  };

  var makeUndoRedo = function(point_act){
    stopAmin = true;
    // TODO: Can be optimize
    setTimeout(function(){
      stopAmin = false;

      if(((currentMemoryPoint + point_act)) >= 0 && ((currentMemoryPoint + point_act) <= drawMemory.length)){
        c1tx.clearRect(0, 0, c1.width, c1.height);

        var mainParameters = {
          animation: "no",
          color: _id("draw_anim_color").value,
          width: _id("draw_line_width").value,
          density: _id("draw_line_density").value,
          delay: _id("draw_anim_delay").value
        };
        var undoDrawArr = [];

        arr = getStartArr();

        c0tx.clearRect(0, 0, c0.width, c0.height);

        currentMemoryPoint += point_act;

        for (var i = 0; i < (currentMemoryPoint); i++) {
          undoDrawArr.push(drawMemory[i]);
        }

        fillPartArr(c0tx, undoDrawArr, mainParameters);
      }

      var temp_btn_undo = false;
      var temp_btn_redo = false;
      if(currentMemoryPoint == 0){
        temp_btn_undo = true;
      }
      if((drawMemory.length - currentMemoryPoint) == 0){
        temp_btn_redo = true;
      }

      setUnRedoVariables("", "", temp_btn_undo, temp_btn_redo, currentMemoryPoint, (drawMemory.length - currentMemoryPoint));
    }, (_id("draw_anim_delay").value + 1));
  };

  // Mouse event

  c1.addEventListener('mousedown', onDown, false);
  c1.addEventListener('mouseup', onUp, false);
  c1.addEventListener('mousemove', onMove, false);

  // Touch event

  c1.addEventListener('touchstart', function(evt) {
    evt.preventDefault();
    firstTouch(evt, [onMove, onDown]);
  }, false);
  c1.addEventListener('touchend', function(evt) {
    evt.preventDefault();
    firstTouch(evt, [onUp]);
  }, false);
  c1.addEventListener('touchmove', function(evt) {
    evt.preventDefault();
    firstTouch(evt, [onMove]);
  }, false);

  // Button event

  _id("btn_end").addEventListener('click', onDrawEnd, false);
  _id("tool_btn_end").addEventListener('click', onDrawEnd, false);

  _id("btn_reset").addEventListener('click', onReset, false);
  _id("tool_btn_reset").addEventListener('click', onReset, false);

  _id("tool_menu_btn").addEventListener('click', function(){
    _id("sidenav").style.width = "230px";
    _id("sidenav").classList.add("sidenav_shadow");
    _id("sidenav_back").style.width = "100%";
    _id("sidenav_back").style.opacity = "0.5";
  }, false);

  _id("sidenav_back").addEventListener('click', onSidenavBack, false);
  _id("sidenav_close_btn").addEventListener('click', onSidenavBack, false);

  _id("btn_undo").addEventListener('click', function(){
    makeUndoRedo(-1);
  }, false);
  _id("btn_redo").addEventListener('click', function(){
    makeUndoRedo(1);
  }, false);
  _id("btn_download").addEventListener('click', function(){
    var file_name = 'line_draw_'+getDateAndTimeString()+'.png';

    if((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)){
      // IE
      window.navigator.msSaveBlob(_id("canvas0").msToBlob(), file_name);
    }else{
      // Others
      var link = _id("btn_download_a");
      link.download = file_name;
      link.href = _id("canvas0").toDataURL("image/png").replace("image/png", "image/octet-stream");
      link.click();
    }
  }, false);
  _id("btn_view_data").addEventListener('click', function(){
    var dataURL = _id("canvas0").toDataURL("image/png");

    if(navigator.userAgent.indexOf("Firefox") != -1 ){
      // Firefox
      window.open( dataURL, "_blank" );
    }else{
      // Others
      var win = window.open( "", "_blank" );
      win.document.write('<img src="'+dataURL+'"/>');
      win.document.body.style.backgroundColor = "#f0f0f0";
    }
  }, false);

  _id("btn_set_draw_size").addEventListener('click', function(){
    var set_draw_size_w = _id("draw_size_w").value;
    var set_draw_size_h = _id("draw_size_h").value;

    if(set_draw_size_w == c0.width && set_draw_size_h == c0.height){
      alert("Set size equal current canvas size");
      return;
    }

    if(drawMemory.length){
      if(!confirm("During this action your current draw will be lost. Are you sure you want to change canvas size?")){
        return;
      }
    }

    setDrawScreenSize(set_draw_size_w, set_draw_size_h);

    stopAmin = true;
    arr = getStartArr();
    c0tx.clearRect(0, 0, c0.width, c0.height);

    setUnRedoVariables([], 0, true, true, 0, 0);
  }, false);

  // Key event

  window.addEventListener("keydown", function (evt) {
    if(evt.code == "Escape"){
      if(_id("sidenav").offsetWidth != 0){
        onSidenavBack();
      }
    }
    if(evt.ctrlKey && evt.code == "KeyZ"){
        makeUndoRedo(-1);
    }
    if(evt.ctrlKey && evt.code == "KeyY"){
        makeUndoRedo(1);
    }
  }, false);
}

function initMedia(){
  var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  // console.log("width: "+ width +"px");
  // _id("info_text").innerHTML = width;

  var setWidth = width - 12;
  var setHeight = height - 12 - 35;
  setDrawScreenSize(setWidth, setHeight);
}

function _id(id){
  return document.getElementById(id);
}

function setDrawScreenSize(setWidth, setHeight){
  _id("canvas0").setAttribute("width", setWidth);
  _id("canvas1").setAttribute("width", setWidth);
  _id("canvas0").setAttribute("height", setHeight);
  _id("canvas1").setAttribute("height", setHeight);

  _id("view").style.width = setWidth + "px";
  _id("view").style.height = setHeight + "px";

  _id("draw_size_w").value = setWidth;
  _id("draw_size_h").value = setHeight;
}

function drawCursor(ctx, x, y, rgb) {
  var a = 30;
  ctx.beginPath();
  ctx.moveTo( x, y-a/2 ); //250, 225
  ctx.lineTo( x, y+a/2 ); //250, 275
  ctx.moveTo( x-a/2 , y ); //225, 250
  ctx.lineTo( x-a/2+a, y ); //275, 250
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgb;
  ctx.stroke();
}

function getDistance(x1, y1, ms){
  //Pitagoto teorema
  var a = Math.abs(x1 - ms.x);
  var b = Math.abs(y1 - ms.y);
  var c = Math.sqrt(a*a + b*b);
  return c;
}

function testMoving(ctx) {
  ctx.beginPath();
  for (var i = 0; i < arr.length; i++) {
    ctx.lineTo(arr[i].x, arr[i].y)
  }
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  if(DEV){
    testDot(ctx);
  }
}

function testMoving2(ctx, a) {
  ctx.beginPath();
  for (var i = 0; i < a.length; i++) {
    ctx.lineTo(a[i].x, a[i].y)
  }
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ff0000';
  ctx.stroke();

  if(DEV){
    testDot(ctx)
  }
}

function testDot(ctx) {
  for (var i = 0; i < arr.length; i++) {
    ctx.rect(arr[i].x, arr[i].y, 10, 10);
  }
  ctx.stroke();
}

function pointsCoordinatesCross(arrA, n, method, bre) {
  if(_id("draw_line_density").value < 10){
    pointsCoordinatesCrossVersionFloat(arrA, n, method, bre);
  }else{
    pointsCoordinatesCrossVersionInteger(arrA, n, method, bre);
  }
}

function pointsCoordinatesCrossVersionInteger(arrA, n, method, bre) {
  var x1 = arrA[n].x;
  var y1 = arrA[n].y;
  if(arrA.length != n+1){
    var x2 = arrA[n+1].x;
    var y2 = arrA[n+1].y;
  }else{
    var x2 = arrA[0].x;
    var y2 = arrA[0].y;
  }

  var tx = x1;
  var ty = y1;

  var breCount = null;
  function met() {
   method(new Axis(tx, ty));
    if(bre>0){
      breCount++;
    }
  }

  if(x1 == x2){
    while ((ty == y2) == false) {
      if(y1 < y2){ ty++; }else{ ty--; }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }

  if(y1 == y2){
    while ((tx == x2) == false) {
      if(x1 < x2){ tx++; }else{ tx--; }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }

  if(x1 != x2 && y1 != y2){
    var useSF_x =  Math.abs(x1 - x2) > Math.abs(y1 - y2);
    var loopRun = true;
    while (loopRun) {
      //http://stackoverflow.com/questions/13491676/get-all-pixel-coordinates-between-2-points
      //slope (Krypties koeficiento)
      var m = (y2 - y1) / (x2 - x1);
      //intercept
      var b = y1 - m * x1;

      if(useSF_x){
        if(x1 < x2){ tx++; }else{ tx--; }
       ty =  Math.round(m * tx + b);

       loopRun = tx != x2;
      }else{
        if(y1 < y2){ ty++; }else{ ty--; }
       tx = Math.round(((b - ty) / m) * (-1));

       loopRun = ty != y2;
      }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }
}

function pointsCoordinatesCrossVersionFloat(arrA, n, method, bre) {
  var x1 = arrA[n].x;
  var y1 = arrA[n].y;
  if(arrA.length != n+1){
    var x2 = arrA[n+1].x;
    var y2 = arrA[n+1].y;
  }else{
    var x2 = arrA[0].x;
    var y2 = arrA[0].y;
  }

  var tx = x1;
  var ty = y1;

  var breCount = null;
  function met() {
    method(new Axis((Math.round(tx * 100) / 100), (Math.round(ty * 100) / 100)));
    if(bre>0){
      breCount++;
    }
  }

  if(Math.round(x1) == Math.round(x2)){
    while ((Math.round(ty) == Math.round(y2)) == false) {
      if(y1 < y2){ ty++; }else{ ty--; }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }

  if(Math.round(y1) == Math.round(y2)){
    while ((Math.round(tx) == Math.round(x2)) == false) {
      if(x1 < x2){ tx++; }else{ tx--; }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }

  if(Math.round(x1) != Math.round(x2) && Math.round(y1) != Math.round(y2)){
    var useSF_x =  Math.abs(x1 - x2) > Math.abs(y1 - y2);
    var loopRun = true;
    while (loopRun) {
      //http://stackoverflow.com/questions/13491676/get-all-pixel-coordinates-between-2-points
      //slope (Krypties koeficiento)
      var m = (y2 - y1) / (x2 - x1);
      //intercept
      var b = y1 - m * x1;

      if(useSF_x){
        if(x1 < x2){ tx++; }else{ tx--; }
        ty = m * tx + b;

        loopRun = Math.round(tx) != Math.round(x2);
      }else{
        if(y1 < y2){ ty++; }else{ ty--; }
        tx = ((b - ty) / m) * (-1);

        loopRun = Math.round(ty) != Math.round(y2);
      }
      met();
      if(breCount == bre){
        break;
      }
    }
    return;
  }
}

function drawLine(ctx, endAxis, rgb, width){
  if(eMDCursor != null){
    ctx.beginPath();
    ctx.moveTo( eMDCursor.x, eMDCursor.y );
    ctx.lineTo( endAxis.x, endAxis.y );
    ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = rgb;
    ctx.stroke();
  }
}

function countingSidesperimimeter(arrNr1, arrNr2){
  var bNr1 = 0;
  var aNr1 = 0;

  for (var i = 0; i < arr.length; i++) {
    var nr = 0;
    pointsCoordinatesCross(arr, i, function(e){
      nr++;
    }, 0);

    if(arrNr1<arrNr2){
      if(arrNr1<=i && i<arrNr2){
        bNr1 = bNr1 + nr;
      }else{
        aNr1 = aNr1 + nr;
      }
    }else{
      if(arrNr1>i && i>=arrNr2){
        bNr1 = bNr1 + nr;
      }else{
        aNr1 = aNr1 + nr;
      }
    }
  }
  return {in: bNr1, out: aNr1};
}

function addNewLine() {
  if(eMDCursorArrNr<mainCursorArrNr){
    mainCursorArrNr++;
    arr.splice(eMDCursorArrNr, 0, eMDCursor);
    arr.splice(mainCursorArrNr, 0, mainCursor);
  }else{
    eMDCursorArrNr++;
    arr.splice(mainCursorArrNr, 0, mainCursor);
    arr.splice(eMDCursorArrNr, 0, eMDCursor);
  }
}

function deleteMinPart(){
  var eMDC = eMDCursorArrNr;
  var mainC = mainCursorArrNr;

  var delArr = [];
  var spliceDelete = function(start, deleteCount){
    for (var i = start; i < start+deleteCount; i++) {
      delArr.push(arr[i]);
    }
    arr.splice(start, deleteCount);
  }

  var intervalSize = countingSidesperimimeter(eMDC, mainC);
  var del = true;
  if(intervalSize.out > intervalSize.in){
    del = false;
  }
  if(eMDC<mainC){
    if(del){
      spliceDelete(0, eMDC);
      delArr.push(eMDCursor);
      delArr.push(mainCursor);
      spliceDelete(mainC-eMDC+1, arr.length-1-mainC+eMDC);
    }else{
      delArr.push(eMDCursor);
      spliceDelete(eMDC+1, mainC-(eMDC+1));
      delArr.push(mainCursor);
    }
  }else{
    if(del){
      spliceDelete(0, mainC);
      delArr.push(mainCursor);
      delArr.push(eMDCursor);
      spliceDelete(eMDC-mainC+1, arr.length-1-eMDC+mainC);
    }else{
      delArr.push(mainCursor);
      spliceDelete(mainC+1, eMDC-(mainC+1));
      delArr.push(eMDCursor);
    }
  }

  return delArr;
}

function fillPart(ctx, aa, parameter) {
  var parObj = {
    animation: "full",
    color: "#38475c",
    width: 3,
    density: 10,
    delay: 60
  };

  for (var pov in parObj) {
    if(parameter.hasOwnProperty( pov )){
        parObj[pov] = parameter[pov];
    }
  }

  var draw = function(e0, e1){
    ctx.beginPath();
    ctx.moveTo( e0.x, e0.y );
    ctx.lineTo( e1.x, e1.y );
    ctx.closePath();
    ctx.lineWidth = parObj.width;
    ctx.strokeStyle = parObj.color;
    ctx.stroke();
  }

  var maxPrevPerimCoun = 10;

  var nr = 0;
  var temp = aa[0];
  var tempA0 = aa;
  var tempA1 = [];

  var endloop = false;
  var perim = 0;
  var prevPerim = 0;
  var prevPerimCoun = 0;

  function drawLP1(i){
    nr = 0;
    pointsCoordinatesCross(tempA0, i, function(p1){
      nr++;
      if((nr % parObj.density) == 0){
        var p0 = temp;
        if(i != 0){
          draw(p0, p1);
          testLoopEnd(p0, p1, false);
        }
        temp = p1;
        tempA1.push(p1);
      }
    }, parObj.density);
  }
  function drawLP2(){
    // #1/4 Klaidos gaudimas
    try {
      draw(tempA1[tempA1.length-1], tempA1[0]);
      testLoopEnd(tempA1[tempA1.length-1], tempA1[0], true);
    } catch (e) {
      // console.log("F");
      endloop = true;
    }
    tempA0 = tempA1;
    // console.log(tempA0);
    tempA1 = [];
  }
  function testLoopEnd(p0, p1, check){
      perim += getDistance(p0.x, p0.y, p1);
      if(check){
        //#2/4 Vienodas perimetras
        if(Math.round(perim) == prevPerim){
          prevPerimCoun++;
        }
        prevPerim = Math.round(perim);

        //#3/4 Kampu skaičius
        if(prevPerimCoun == maxPrevPerimCoun || tempA1.length<=2){//aa.length){
          endloop = true;
        }

        //#4/4 Mazas perimetras
        if(perim <= 10){
          endloop = true;
        }

//        console.log((tempA1.length<aa.length),endloop, perim);
        perim = 0;
    }
  }

  switch (parObj.animation) {
    case "full":
      var i = 0;
      var interval = setInterval(function(){
        if(stopAmin){ clearInterval(interval); } else {
          if(i < tempA0.length){
            drawLP1(i);
            i++;
          }else{
            i = 0;
            drawLP2();
            if(endloop){ clearInterval(interval); }
          }
        }
      }, parObj.delay);
    break;
    case "circle":
      var interval = setInterval(function(){
        if(stopAmin){
          clearInterval(interval);
        }else{
          for (var i = 0; i < tempA0.length; i++) {
            drawLP1(i);
          }
          drawLP2();
          if(endloop){ clearInterval(interval); }
        }
      }, parObj.delay);
    break;
    case "no":
      var loop = true;
      while(loop) {
        if(stopAmin){
           loop = false;
        }else{
          for (var i = 0; i < tempA0.length; i++) {
            drawLP1(i);
          }
          drawLP2();
          if(endloop){ loop = false; }
        }
      }
    break;
  }
}

function getStartArr(){
  var r_arr = [];
  if(DEV){
    r_arr = [
      new Axis(50, 34),
      new Axis(250, 14),
      new Axis(490, 70),
      new Axis(363, 310),
      new Axis(251, 423),
      new Axis(55, 423)
    ];

    testMoving(c0tx);
    //fillPart(c0tx, arr, {color: "full"});
    //fillPart(c0tx, arr, {color: "circle"});
    //fillPart(c0tx, arr, {color: "no"});
  }else{
    r_arr = [
      new Axis(0, 0),
      new Axis(c0.width, 0),
      new Axis(c0.width, c0.height),
      new Axis(0 , c0.height)
    ];
  }

  return r_arr;
}

function invertColor(color_s){
  var r = parseInt(color_s.substring(1, 3), 16);
  var g = parseInt(color_s.substring(3, 5), 16);
  var b = parseInt(color_s.substring(5, 7), 16);

  var hex_r = (255 - r).toString(16);
  var hex_g = (255 - g).toString(16);
  var hex_b = (255 - b).toString(16);

  var ret = "#";
  ret += (255 - r) > 9 ? hex_r : "0"+ hex_r;
  ret += (255 - g) > 9 ? hex_g : "0"+ hex_g;
  ret += (255 - b) > 9 ? hex_b : "0"+ hex_b;

  return ret;
}

function fillPartArr(ctx, aa, parameter){
  var getCursorArrNr = function(point){
    var m = getDistance(point.x, point.y, arr[0]);
    var mi = 0;
    for (var f = 0; f < arr.length; f++) {
      pointsCoordinatesCross(arr, f, function(e){
        var t = getDistance(point.x, point.y, e);
        if(t < m){
          m = t;
          mi = f;
        }
      }, 0);
    }
    return mi+1;
  };

  for (var i = 0; i < aa.length; i++) {
    if(aa[i].line !== "end"){
      eMDCursor = aa[i].line.str;
      mainCursor = aa[i].line.end;

      drawLine(ctx, mainCursor, parameter.color, parameter.width);

      eMDCursorArrNr = getCursorArrNr(eMDCursor);
      mainCursorArrNr = getCursorArrNr(mainCursor);
      addNewLine();

      var delPartArr = deleteMinPart();

      fillPart(ctx, delPartArr, parameter);
    }else{
      fillPart(ctx, arr, parameter);
      arr = [];
    }
  }
}

function setUnRedoVariables(set_draw_memory, set_memory_point, is_undo_disabled, is_redo_disabled, set_undo_html, set_redo_html){
  if(set_draw_memory !== ""){
    drawMemory = set_draw_memory;
  }
  if(set_memory_point !== ""){
    currentMemoryPoint = set_memory_point;
  }
  if(is_undo_disabled !== ""){
    _id("btn_undo").disabled = is_undo_disabled;
  }
  if(is_redo_disabled !== ""){
    _id("btn_redo").disabled = is_redo_disabled;
  }
  if(set_undo_html !== ""){
    _id("btn_undo_nr").innerHTML = set_undo_html;
  }
  if(set_redo_html !== ""){
    _id("btn_redo_nr").innerHTML = set_redo_html;
  }
}

function getDateAndTimeString(){
  var setZ_NN = function( time ){
  	if ( time < 10 ){
  		if ( time == 0 ){
  			time = "00";
  		}else{
  			time = "0" + time;
  		}
  	}
  	return time;
  };

  var d = new Date();

  return d.getFullYear() + "_" + setZ_NN((d.getMonth() + 1)) + "_" + setZ_NN(d.getDate()) + "_" +
  setZ_NN(d.getHours()) + "_" + setZ_NN(d.getMinutes()) + "_" + setZ_NN(d.getSeconds());
}
// ---------
