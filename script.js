var c0 = document.getElementById("canvas0");
var c0tx = c0.getContext("2d");
var c1 = document.getElementById("canvas1");
var c1tx = c1.getContext("2d");

var mainCursor = null;
var mainCursorArrNr = null;
var eMousedown = false;
var eMDCursor = null;
var eMDCursorArrNr = null;

var Axis = function(x, y) {
  this.x = x;
  this.y = y;
}

var arr = [
  new Axis(50, 34),
  new Axis(250, 14),
  new Axis(490, 70),
//  new Axis(370, 250),
  new Axis(363, 310),
  new Axis(251, 423),
  new Axis(55, 423),
];

testMoving(c0tx);
//fillPart(c0tx, arr, "Full");
//fillPart(c0tx, arr, "Circle");
//fillPart(c0tx, arr, "No");

var nr = 0;
for (var i = 0; i < arr.length; i++) {
    var len = nr;
    pointsCoordinatesCross(arr, i, function(e){
      nr++;
//      console.log(nr, e, i);
    });
//    console.log("=== ", i, (nr-len));
}
console.log("all nr ",nr);

c1.addEventListener('mousedown', function(evt) {
  if(evt.button == 0){
    drawCursor(c0tx, mainCursor.x, mainCursor.y, "#00ff00");
    eMousedown = true;
    eMDCursor = mainCursor;
    eMDCursorArrNr = mainCursorArrNr;
  }
}, false);

c1.addEventListener('mouseup', function(evt) {
  if(evt.button == 0){
    drawCursor(c0tx, mainCursor.x, mainCursor.y, "#0000ff");
    if(mainCursorArrNr != eMDCursorArrNr && eMousedown){
      drawLine(c0tx, mainCursor,"#abcabc");

      addNewLine();

      var delPartArr = deleteMinPart();
      console.log(delPartArr);
      fillPart(c0tx, delPartArr, "Full");

  //    c0tx.clearRect(0, 0, c1.width, c1.height);
      testMoving2(c0tx, delPartArr);
      testMoving(c0tx);
    }
    eMousedown = false;
  }
}, false);

c1.addEventListener('mousemove', function(evt) {
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
    });
  }
  mainCursor = mo;
  mainCursorArrNr = mi+1;
  drawCursor(c1tx, mo.x, mo.y);
  if(eMousedown){
    drawLine(c1tx, mainCursor, "#ffff00");
  }
  //console.log(mainCursorArrNr, mo);
}, false);

function drawCursor(ctx, x, y, rgb = '#ff0000') {
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
  testDot(ctx)
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
  testDot(ctx)
}

function testDot(ctx) {
  for (var i = 0; i < arr.length; i++) {
    ctx.rect(arr[i].x, arr[i].y, 10, 10);
  }
  ctx.stroke();
}

function pointsCoordinatesCross(arrA, n, method, bre = 0) {
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

function drawLine(ctx, endAxis, rgb = '#000000'){
  if(eMDCursor != null){
    ctx.beginPath();
    ctx.moveTo( eMDCursor.x, eMDCursor.y );
    ctx.lineTo( endAxis.x, endAxis.y );
    ctx.closePath();
    ctx.lineWidth = 3;
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
    });

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

function fillPart(ctx, a, animation) {
  var draw = function(e0, e1){
    ctx.beginPath();
    ctx.moveTo( e0.x, e0.y );
    ctx.lineTo( e1.x, e1.y );
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#bb6699";
    ctx.stroke();
  }

  var dis = 10;
  var anTimeDelay = 60;
  var maxPrevPerimCoun = 10;

  var nr = 0;
  var temp = a[0];
  var tempA0 = a;
  var tempA1 = [];

  var endloop = false;
  var perim = 0;
  var prevPerim = 0;
  var prevPerimCoun = 0;

  function drawLP1(i){
    nr = 0;
    pointsCoordinatesCross(tempA0, i, function(p1){
      nr++;
      if((nr%dis) == 0){
        var p0 = temp;
        if(i != 0){
          draw(p0, p1);
          testLoopEnd(p0, p1, false);
        }
        temp = p1;
        tempA1.push(p1);
      }
    }, dis);
  }
  function drawLP2(){
    // #1/3 Klaidos gaudimas
    try {
      draw(tempA1[tempA1.length-1], tempA1[0]);
      testLoopEnd(tempA1[tempA1.length-1], tempA1[0], true);
    } catch (e) {
      console.log("FUCK");
      endloop = true;
    }
    tempA0 = tempA1;
    console.log(tempA0);
    tempA1 = [];
  }
  function testLoopEnd(p0, p1, check){
      perim += getDistance(p0.x, p0.y, p1);
      if(check){
        //#2/3 Vienodas perimetras
        if(Math.round(perim) == prevPerim){
          prevPerimCoun++;
        }
        prevPerim = Math.round(perim);

        //#3/3 Kampu skaičius
        if(prevPerimCoun == maxPrevPerimCoun || tempA1.length<=2){//a.length){
          endloop = true;
        }

        console.log((tempA1.length<a.length),endloop, perim);
        perim = 0;
    }
  }

  switch (animation) {
    case "Full":
      var i = 0;
      var interval = setInterval(function(){
        if(i < tempA0.length){
          drawLP1(i);
          i++;
        }else{
          i = 0;
          drawLP2();
          if(endloop){ clearInterval(interval) }
        }
      }, anTimeDelay);
    break;
    case "Circle":
      var interval = setInterval(function(){
        for (var i = 0; i < tempA0.length; i++) {
          drawLP1(i);
        }
        drawLP2();
        if(endloop){ clearInterval(interval) }
      }, anTimeDelay);
    break;
    case "No":
      var loop = true;
      while(loop) {
        for (var i = 0; i < tempA0.length; i++) {
          drawLP1(i);
        }
        drawLP2();
        if(endloop){ loop = false; }
      }
    break;
  }
}
