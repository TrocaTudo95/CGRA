/**
 * MyTorpedo
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

var POSTION_TIME=1;
var POSITION_HEIGHT=SEMISPHERE_HEIGHT/BASECYLINDER_HEIGHT;
var TORPEDO_SPEED=8;

function MyTorpedo(scene, submarine, targets=0) {
	CGFobject.call(this,scene);

	this.body=new MyTorpedoBody(this.scene);
	this.targets=targets;
	this.target=0;
	this.submarine=submarine;

	this.x=0;
	this.z=BASECYLINDER_HEIGHT/2-0.5;
	this.degree=0*degToRad;
	this.velocity=0;
	this.relative_height=0;
	this.high=0;
	this.slope=0;

	this.position=0;
	this.position_time=0;
	this.fire=0;
	this.fire_time=0;
	this.fire_totaltime=0;

	this.P1=[0, 0, 0];
	this.P2=[0, 0, 0];
	this.P3=[0, 0, 0];
	this.P4=[0, 0, 0];
};


MyTorpedo.prototype = Object.create(CGFobject.prototype);
MyTorpedo.prototype.constructor=MyTorpedo;


MyTorpedo.prototype.display = function (){
	if(this.fire==0){
		this.scene.pushMatrix();
		this.scene.translate(this.submarine.x, this.submarine.high, this.submarine.z);
		this.scene.translate(0, 0, SUBMARINE_ROT_ADV); 
		this.scene.rotate(this.submarine.degree,0,1,0);
		this.scene.rotate(this.submarine.vertical_degree,1,0,0); 
		this.scene.translate(0, 0, -SUBMARINE_ROT_ADV); 
		this.scene.translate(0,this.relative_height,0);
		this.scene.translate(0, 0, BASECYLINDER_HEIGHT/2-0.5);
		this.scene.scale(1/BASECYLINDER_HEIGHT, 1/BASECYLINDER_HEIGHT, 1/BASECYLINDER_HEIGHT);
		this.body.display();
		this.scene.popMatrix();
	}
	else{
		this.scene.pushMatrix();
		this.scene.translate(this.x, this.high, this.z);
		this.scene.rotate(this.degree,0,1,0);
		this.scene.rotate(this.slope,1,0,0);
		this.scene.scale(1/BASECYLINDER_HEIGHT, 1/BASECYLINDER_HEIGHT, 1/BASECYLINDER_HEIGHT);
		this.body.display();
		this.scene.popMatrix();
	}
};

MyTorpedo.prototype.associate = function(){
	this.target=0;
	for(var i =0;i<this.targets.length;i++){
		if(this.targets[i].destroyed==0){
			this.target=this.targets[i];
			break;
		}
	}
}

MyTorpedo.prototype.Position = function ()
{	if(this.fire==0 && this.position==0){
	this.position_time=0;
	this.position=1;
	this.relative_height-=SEMISPHERE_HEIGHT/2-SEMISPHERE_HEIGHT/(2*BASECYLINDER_HEIGHT);
	}
}

MyTorpedo.prototype.Fire=function(){
	if(this.target!=0 && this.fire==0){
		this.position=0;
		this.fire=1;
		this.fire_time=0;
		var base=BASECYLINDER_HEIGHT/2-0.5;
		this.x=this.submarine.x+Math.sin(this.submarine.degree)*(this.relative_height*Math.sin(this.submarine.vertical_degree)+(base -SUBMARINE_ROT_ADV)*Math.cos(this.submarine.vertical_degree));
		this.z=this.submarine.z+Math.cos(this.submarine.degree)*(this.relative_height*Math.sin(this.submarine.vertical_degree)+(base -SUBMARINE_ROT_ADV)*Math.cos(this.submarine.vertical_degree))+SUBMARINE_ROT_ADV;
		this.high=-(base -SUBMARINE_ROT_ADV)*Math.sin(this.submarine.vertical_degree)+this.relative_height*Math.cos(this.submarine.vertical_degree) +this.submarine.high;
		this.degree=this.submarine.degree;
		this.slope=this.submarine.vertical_degree;
		this.fire_totaltime=Math.sqrt((this.x-this.target.x)*(this.x-this.target.x)+(this.high-this.target.y)*(this.high-this.target.y)+(this.z-this.target.z)*(this.z-this.target.z))/TORPEDO_SPEED;
		this.P1=[this.x, this.high, this.z];
		this.P2=[this.x+6*Math.sin(this.degree)*Math.cos(this.slope), this.high+6*Math.sin(-this.slope), this.z+6*Math.cos(this.degree)*Math.cos(this.slope)];
		this.P3=[this.target.x, this.target.y+3, this.target.z];
		this.P4=[this.target.x, this.target.y, this.target.z];
	}


}


MyTorpedo.prototype.destroy=function(){
	this.x=this.submarine.x;
	this.z=this.submarine.z+BASECYLINDER_HEIGHT/2-0.5;
	this.degree=this.submarine.degree;
	this.velocity=this.submarine.velocity;
	this.relative_height=0;

	this.position=0;
	this.position_time=0;
	this.fire=0;
	this.target.destroyed=1;
}


MyTorpedo.prototype.update= function (currTime)
{	if(this.fire==0){
		if(this.position==1){
			this.position_time=this.position_time+0.10;
			if(this.position_time<=POSTION_TIME){
				this.relative_height=this.relative_height-0.10*POSITION_HEIGHT/POSTION_TIME
			}
			else{
				this.associate();
				this.Fire();
			}
		}
	}
	else if(this.fire==1){
			
			if(this.fire_time<(this.fire_totaltime-1/TORPEDO_SPEED)){
			var t=(this.fire_time+UPDATE_SCENE)/this.fire_totaltime;
			this.fire_time=this.fire_time+UPDATE_SCENE;
			var x=(1-t)*(1-t)*(1-t)*this.P1[0]+3*t*(1-t)*(1-t)*this.P2[0]+3*t*t*(1-t)*this.P3[0]+t*t*t*this.P4[0];
			var high=(1-t)*(1-t)*(1-t)*this.P1[1]+3*t*(1-t)*(1-t)*this.P2[1]+3*t*t*(1-t)*this.P3[1]+t*t*t*this.P4[1];
			var z=(1-t)*(1-t)*(1-t)*this.P1[2]+3*t*(1-t)*(1-t)*this.P2[2]+3*t*t*(1-t)*this.P3[2]+t*t*t*this.P4[2];
			var P=[x, high, z];
			if((this.z-P[2])==0){
				if((this.x-P[0])<0){
					this.degree=90*degToRad;
				}
				else if((this.x-P[0])>0){
					this.degree=270*degToRad;
				}
			}
			else{
				if((P[2]-this.z)>0){
					this.degree=Math.atan((this.x-P[0])/(this.z-P[2]));
				}
				else if((P[2]-this.z)<0){
					this.degree=180*degToRad+Math.atan((this.x-P[0])/(this.z-P[2]));
				}

			}
			var distance=Math.sqrt((this.x-P[0])*(this.x-P[0])+(this.z-P[2])*(this.z-P[2]));
			if(distance==0){
				if((this.high-P[1])<0){
					this.slope=270*degToRad;
				}
				else if(this.high-P[1]>0){
					this.slope=90*degToRad;
				}
			}
			else{
				this.slope=-Math.atan((P[1]-this.high)/distance);
			}
			this.x=P[0];
			this.high=P[1];
			this.z=P[2];

		}
		else{
			this.destroy();
			this.target.explode();
		}
	}



};
