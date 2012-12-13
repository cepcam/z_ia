function vector2D(x,y)
{
  this.x = x;
  this.y = y;
  
  this.magnitude = function()
  {
    var m=Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
    return m;
  };
  
  this.scalMul = function(scalaire)
  {
      var u=new vector2D(this.x*scalaire,this.y*scalaire)
      return u;
  };
  this.scalDiv = function(scalaire)
  {
      var u=new vector2D(this.x/scalaire,this.y/scalaire)
      return u;  
  };  
  
  this.normalize = function()
  {
    var u=new vector2D(0,0);
    
    u=this.scalDiv(this.magnitude());
    return u;
  };
  
  this.reverse = function()
  {
     var u=new vector2D(this.x*-1,this.y*-1);
     return u;
  };
  
  this.add = function(v)
  {
    var u = new vector2D(this.x+v.x,this.y+v.y);
    return u;
  };

  this.sub = function(v)
  {
    var u = new vector2D(this.x-v.x,this.y-v.y);
    return u;
  };  
  
  this.dotProduct = function(v)
  {
    var s = this.x*v.x+this.y*v.y;
    return s;    
  };
  
  this.rotate = function(a)
  {
     a=a*0.0174532925; 
     var cosT = Math.cos(a);
     var sinT = Math.sin(a);
    
     var x= this.x;
     var y= this.y;
     //zombies think..
     this.x=x*cosT-y*sinT;
     this.y=x*sinT+y*cosT;  
  };

  
  
  this.printVector = function()
  {
    console.log('V: ('+this.x+','+this.y+')');
  }
  
}