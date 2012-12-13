var MAXZOMBIE=2000;
var FPS_WANTED=24;
var FPS_RANGE=1/0.2;
var INTERVAL_FPS_MS=1000/FPS_WANTED;
var IA_INTERVAL_MS=50*INTERVAL_FPS_MS;
var ZOMBIE_SIZE_PX=2;
var ZOMBIE_PX_SPEED=2;
var ZOMBIE_SIGHT=300;
var SLIDING_MEAN=10
var was=0;

var GLOBALGOALX=500;
var GLOBALGOALY=500;

/* TO DO
  - The configuration file should be a Json loaded on startup
  - Number of zombies should probably be ajsuted vs FPS performances
*/

/* Developpment helper  *******************************************************/

function test()
{
  var u = new vector2D(9,12);
  var v = new vector2D(9,15);
  var w = new vector2D(10,20);
  var s = 3;
  
  
  console.log('Magnitude of ('+u.x+','+u.y+') is '+u.magnitude()); 
   
  v=u.scalMul(s);
  console.log(s+'*('+u.x+','+u.y+') is ('+v.x+','+v.y+')'); 
  
  v=u.scalDiv(s);
  console.log(s+' dividing ('+u.x+','+u.y+') is ('+v.x+','+v.y+')');   
  
  v=u.normalize();
  console.log('Magnitude of ('+v.x+','+v.y+') is '+v.magnitude());
  
  v=u.reverse();
  console.log('reverse of ('+u.x+','+u.y+') is('+v.x+','+v.y+')');
  
  v=u.add(w);
  console.log('('+u.x+','+u.y+')+('+w.x+','+w.y+') = ('+v.x+','+v.y+')');

  v=u.sub(w);
  console.log('('+u.x+','+u.y+')-('+w.x+','+w.y+') = ('+v.x+','+v.y+')');
  
  v.x=3;
  v.y=5;
  s=u.dotProduct(v);
  console.log('('+u.x+','+u.y+')x('+v.x+','+v.y+') = '+s);
}

function timedLog(message)
{
  //For debug only, performance killer
  /*
  var now= new Date();

   var minute = now.getMinutes();
   var second = now.getSeconds();

   if (minute < 10) { minute = "0" + minute; }
   if (second < 10) { second = "0" + second; }
   var timeString = minute + ':' +second;
    
    
   console.log('['+timeString+'] : '+message);
*/   
}


/********  IHM functions, jquery related  *******************************/

function upExpectedFPS()
{
  FPS_WANTED++;
}
function downExpectedFPS()
{
  FPS_WANTED--;
}
function locateMouse(e)
{
      if(e.offsetX) {
        GLOBALGOALX = e.offsetX-15-4;
        GLOBALGOALY = e.offsetY-15-4;
    }
    else if(e.layerX) {
        GLOBALGOALX = e.layerX-4;
        GLOBALGOALY = e.layerY-4;
    }
}
/********  Object Oriented Java. Class and others *****************************/
function zombieConstructor()
{
  this.position = new vector2D(Math.random(),Math.random());
  this.velocity = new vector2D(0.5-Math.random(),0.5-Math.random());
  this.mass = 4;
}

/***********  Game engine loops  *********************************************/

function updateZombiesIA(mapHandler,zombiesHandler)
{
  var tText='';
  
  ttext='FPS : '+mapHandler.fps;
  $("#fpsValue").text(ttext);  
  
  ttext='Zombies : '+zombiesHandler.length;
  $("#zombiesValue").text(ttext);
     
  ttext='Expected FPS : '+FPS_WANTED;
  $("#fpsExpected").text(ttext);  
  

   
  //dynamicly ajust number of zombies
  //Add or sub if less/more than 20% of the expected FPS
  
  if(mapHandler.fps>=FPS_WANTED+FPS_WANTED/FPS_RANGE)
    for(var j=0;j<100;j++)
    {
      var randomZombie=new zombieConstructor();
      randomZombie.position.x *= mapHandler.width;
      randomZombie.position.y *= mapHandler.height;
       
      zombiesHandler.push(randomZombie);
    }
    
  if(mapHandler.fps<FPS_WANTED-FPS_WANTED/FPS_RANGE) for(var j=0;j<100;j++)  zombiesHandler.pop();
 
//Here are different kindof IA 

 //Random walk
 /* for (var i=0; i<zombiesHandler.length; i++)
  {    
     var w=new vector2D(0.5-Math.random(),0.5-Math.random()); 
     //zombies think..
     zombiesHandler[i].velocity=zombiesHandler[i].velocity.add(w);
     zombiesHandler[i].velocity=zombiesHandler[i].velocity.normalize();
  } 
  */
  
 //Stupid IA
 /*
  for (var i=0; i<zombiesHandler.length; i++)     
    zombiesHandler[i].velocity.rotate(10);  
 */
 
 //Seeking IA
  var desired_velocity=new vector2D(0,0);
  var steering=new vector2D(0.5-Math.random(),0.5-Math.random());  
  var target=new vector2D(GLOBALGOALX,GLOBALGOALY);
  
  for (var i=0; i<zombiesHandler.length; i++)
  { 
    desired_velocity = target.sub(zombiesHandler[i].position);
    if(desired_velocity.magnitude()<ZOMBIE_SIGHT) 
    {
      steering = desired_velocity.sub(zombiesHandler[i].velocity);
      steering = steering.scalDiv(zombiesHandler[i].mass);
    }

   
   zombiesHandler[i].velocity= zombiesHandler[i].velocity.add(steering);
 
  }   
}

function reDraw(mapHandler,zombiesHandler)
{
  var u= new vector2D(0,0); 
  var now=new Date();
  var dt;
  //dt is in seconds
  now=now.getSeconds()+now.getMilliseconds()/1000; 
  dt=now-was;

  // this is for minute change, arbitrary value instead of fucking calculation
  // I never managed to find
  if(dt<=0) dt=0.01;  
  was=now;

  //This only to keep track of average FPS. Sliding avereage
  mapHandler.sliding_av_counter++;
  mapHandler.av_dt+=dt;  
  
  if(mapHandler.sliding_av_counter>=SLIDING_MEAN)
  {
    mapHandler.av_dt = mapHandler.av_dt/mapHandler.sliding_av_counter;
    mapHandler.fps=1/mapHandler.av_dt;   
    mapHandler.sliding_av_counter=0;
    mapHandler.av_dt+=0;  
       
  }
  timedLog("redraw map");

  mapHandler.ctx.fillStyle="rgb(199,197,153)";  
  mapHandler.ctx.clearRect(0,0,mapHandler.width,mapHandler.height);
  mapHandler.ctx.fillRect(0, 0, mapHandler.width, mapHandler.height);
  mapHandler.ctx.fillStyle="rgb(51,51,51)";   
    
  for (var i=0; i<zombiesHandler.length; i++)
  {

      
      u=zombiesHandler[i].velocity;    
      
      u=u.scalMul(dt);
      u=u.normalize();
      u=u.scalMul(ZOMBIE_PX_SPEED);      
      zombiesHandler[i].position=zombiesHandler[i].position.add(u);
    
    //Test outbound and deflect 
    
      if ( zombiesHandler[i].position.x > mapHandler.width)
      {
        zombiesHandler[i].position.x = mapHandler.width;
        zombiesHandler[i].velocity.x *= -1;
      }
      
      if ( zombiesHandler[i].position.x <0)
      {
        zombiesHandler[i].position.x = 0;
        zombiesHandler[i].velocity.x *= -1;
      }  
      
      if ( zombiesHandler[i].position.y > mapHandler.height)
      {
        zombiesHandler[i].position.y = mapHandler.height;
        zombiesHandler[i].velocity.y *= -1;
      }
      
      if ( zombiesHandler[i].position.y <0)
      {
        zombiesHandler[i].position.y = 0;
        zombiesHandler[i].velocity.y *= -1;
      }   
      
      mapHandler.ctx.fillRect(zombiesHandler[i].position.x,zombiesHandler[i].position.y,ZOMBIE_SIZE_PX, ZOMBIE_SIZE_PX);           
  }
  
  mapHandler.ctx.fillStyle="rgb(152,98,51)";   
  mapHandler.ctx.fillRect(GLOBALGOALX,GLOBALGOALY,8, 8);    
}

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
/************  Set up functions, init and all the stuff ****************/
function initMap()
{
  timedLog("Init Canvas");
  
  //THe map strucutre hold some map informations even frameRate infos
  var map = {  
    ctx : '', 
    width : 0, 
    height:0,
    fps: 24,
    sliding_av_counter:0,
    av_dt:0
  } 

  var canvas = document.getElementById("mapCanvas");  
  map.ctx = canvas.getContext("2d");  
  map.width = canvas.width;
  map.height = canvas.height;
  return map;  
}

function drawMap(map)
{
  timedLog("Draw map on the canvas");
  
  map.ctx.fillStyle="rgb(199,197,153)";
  map.ctx.fillRect(0, 0, map.width, map.height);   
}

function generateZombies(map)
{
  timedLog("Generate Zombies");
  
  var zombiePopulation = new Array();
  for(var i=0;i<MAXZOMBIE;i++)
  {
    var newZombie =new zombieConstructor();
    newZombie.position.x *=map.width;
    newZombie.position.y *=map.height;  
    
    zombiePopulation.push(newZombie);  
  }
  
  return zombiePopulation;
}

function launchTicker()
{
  timedLog("Launch Animation ticker");
}
/******************************************************************************/
function launch()
{
  var mapHandler, zombiesHandler;
  timedLog("Launch the simu");
  //Bind UI
  $("#fpsUP").click(upExpectedFPS);
  $("#fpsDOWN").click(downExpectedFPS);
  $("#mapCanvas").click(locateMouse);     
  //test();
  
  mapHandler = initMap();
  drawMap(mapHandler);
  zombiesHandler = generateZombies(mapHandler);  
  
  (function animloop(){
     requestAnimFrame(animloop);
     reDraw(mapHandler,zombiesHandler);
  })();  

  setInterval(function(){updateZombiesIA(mapHandler,zombiesHandler);},IA_INTERVAL_MS);  
  
}

$(document).ready(launch);