// M3 closed prototype enclosure. Units mm. Component envelopes are not supplier CAD.
part="assembly";
$fn=96;
W=150; D=110; H=60; wall=2.4; floor_t=3; lid_t=3;
switch_x=-43; light_x=28; cable_d=4.0;
module rounded(w,d,h,r=12){linear_extrude(h)offset(r=r)square([w-2*r,d-2*r],center=true);}
module cable_bore(){translate([0,60,55])rotate([90,0,0])cylinder(h=20,d=cable_d);}
module shell(){difference(){union(){
 difference(){rounded(W,D,H);translate([0,0,floor_t])rounded(W-2*wall,D-2*wall,H,12-wall);}
 for(x=[-65,65],y=[-45,45])translate([x,y,0])cylinder(h=H,d=10);
 // Split cable saddle. Top half is removable; cable enters before closure.
 translate([-11,43,0])cube([22,12,55]);
 }
 for(x=[-65,65],y=[-45,45])translate([x,y,48])cylinder(h=20,d=2.5);
 translate([-4,51,52])cube([8,10,9]);
 translate([-11.2,42.8,55])cube([22.4,13,6]);
 cable_bore();
 for(x=[-7,7])translate([x,48,45])cylinder(h=15,d=1.8);
}}
module lid(){difference(){union(){
 translate([0,0,H])rounded(W,D,lid_t);
 for(x=[light_x-28,light_x+28],y=[-22,22])translate([x,y,54])cylinder(h=6,d=6);
 }
 for(x=[-65,65],y=[-45,45])translate([x,y,59])cylinder(h=5,d=3.4);
 translate([switch_x,0,59])cylinder(h=5,d=30.2);
 // Local 1.6 mm panel seat for selected snap-in switch.
 translate([switch_x,0,59])cylinder(h=2.4,d=38);
 translate([light_x,0,59])cylinder(h=5,d=42.6);
 for(x=[light_x-28,light_x+28],y=[-22,22])translate([x,y,53])cylinder(h=8,d=1.8);
}}
module lens(){translate([light_x,0,0])union(){
 translate([0,0,58.5])cylinder(h=1.5,d=46);
 translate([0,0,60])cylinder(h=3,d=42);
}}
module tray(){difference(){union(){
 translate([light_x,0,48.2])cylinder(h=1.8,d=48);
 translate([light_x,0,50])difference(){cylinder(h=8.3,d=48);cylinder(h=9,d=38);}
 for(x=[light_x-28,light_x+28],y=[-22,22])hull(){
 translate([x,y,52])cylinder(h=2,d=6);
 translate([light_x+(x<light_x?-15:15),y<0?-15:15,52])cylinder(h=2,d=6);
 }
 }
 translate([light_x,0,47])cylinder(h=5,d=14);
 // Pad/wire escape through front floor and wall; LEDs stay clear of this sector.
 translate([light_x-4,-27,47])cube([8,18,7]);
 for(x=[light_x-28,light_x+28],y=[-22,22])translate([x,y,51])cylinder(h=4,d=2.4);
}}
module clamp(){difference(){translate([-11,43,55])cube([22,12,5]);cable_bore();
 for(x=[-7,7]){
 translate([x,48,54])cylinder(h=7,d=2.4);
 translate([x,48,57])cylinder(h=4,d=4.8);
 }
}}
module references(){
 color("#384e66")translate([switch_x,0,23.3])cylinder(h=38.1,d=29.5);
 color("#f4f6f8")translate([switch_x,0,63])cylinder(h=3,d=33.2);
 color("#f2f0e9")translate([2.5,-41.3,3])cube([55,82.6,9.3]);
 color("#20816e")translate([20,-25.5,14])cube([21,51,1]);
 color("#242831")translate([light_x,0,50])difference(){cylinder(h=1.6,d=36.8);cylinder(h=2,d=23.3);}
 for(a=[0:30:330])color("#91d8fa")translate([light_x+15*cos(a),15*sin(a),51.6])rotate([0,0,a])translate([-2.5,-2.5,0])cube([5,5,5.1]);
}
module assembly(explode=0){
 color("#2e3541")shell();
 translate([0,0,explode])color("#596575")tray();
 translate([0,0,explode*2])color("#acdff5")lens();
 translate([0,0,explode*3])color("#d6dce5")lid();
 translate([0,0,explode])color("#727d8b")clamp();
 if(explode==0)references();
}
if(part=="shell")shell();
else if(part=="lid")translate([0,0,63])rotate([180,0,0])lid();
else if(part=="lens")translate([-light_x,0,-58.5])lens();
else if(part=="tray")translate([-light_x,0,-48.2])tray();
else if(part=="clamp")translate([0,-49,-55])clamp();
else if(part=="exploded")assembly(18);
else if(part=="section")difference(){assembly();translate([-100,-100,-1])cube([200,100,150]);}
else assembly();
