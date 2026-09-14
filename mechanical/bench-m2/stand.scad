// SignalKey M2 open bench stand. Units mm. Prototype, not a safety enclosure.
part="assembly";
hole_d=30.2;
seat_t=1.6;
plate_t=3;
span=45;
$fn=96;
assert(hole_d>=30 && hole_d<=30.4);
assert(seat_t>=1.2 && seat_t<=2);
module outline(){offset(r=5)square([170,100],center=true);}
module bolts(){for(x=[-80,80],y=[-45,45])translate([x,y,-1])cylinder(h=5,d=3.4);}
module base(){difference(){linear_extrude(plate_t)outline();bolts();
 for(x=[3,67],y=[-35,35])translate([x,y,1.5])cube([3,8,5],center=true);
}}
module deck(){difference(){linear_extrude(plate_t)outline();bolts();
 translate([-50,0,-1])cylinder(h=5,d=hole_d);
 // Underside counterbore leaves the snap seat at its selected thickness.
 translate([-50,0,-0.1])cylinder(h=plate_t-seat_t+0.1,d=38);
 translate([35,0,-1])linear_extrude(5)offset(r=3)square([60,88],center=true);
}}
module spacer(){difference(){cylinder(h=span,d=14);translate([0,0,-1])cylinder(h=span+2,d=3.4);}}
module coupon(){difference(){linear_extrude(seat_t)offset(r=3)square([40,40],center=true);translate([0,0,-1])cylinder(h=seat_t+2,d=hole_d);}}
module assembly(exploded=false){
 color("#283d52")base();
 for(x=[-80,80],y=[-45,45])translate([x,y,plate_t+(exploded?8:0)])color("#647c92")spacer();
 translate([0,0,plate_t+span+(exploded?22:0)])color("#9eafc0")deck();
 // Reference envelopes only: not printable parts or production component CAD.
 if(!exploded){
 translate([35,0,3])color("#e8e8e2",0.8)linear_extrude(9.3)square([55,82.6],center=true);
 translate([35,0,17])color("#408779")linear_extrude(1)square([21,51],center=true);
 translate([-50,0,plate_t+span+plate_t])color("#60a2c0",0.7)cylinder(h=6.5,d=33.2);
 }
}
if(part=="base")base();
else if(part=="deck")translate([0,0,plate_t])rotate([180,0,0])deck();
else if(part=="spacer")spacer();
else if(part=="coupon")coupon();
else if(part=="base_dxf")projection(cut=true)translate([0,0,-1.5])base();
else if(part=="deck_dxf")projection(cut=true)translate([0,0,-2.5])deck();
else if(part=="pocket_dxf")translate([-50,0])circle(d=38);
else if(part=="exploded")assembly(true);
else assembly();
