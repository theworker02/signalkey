// SignalKey M1: geometric fit study, millimetres. Not a production enclosure.
part="assembly"; // base, lid, cap, diffuser, carrier, assembly, exploded, collision
width=55; depth=55; base_h=20; wall=2.2; corner=8;
lid_z=20; lid_t=2; cap_top=24; cap_d=36; radial_clearance=0.35;
travel=0.6; flange_d=38.5; flange_t=1.2;
carrier_top=lid_z-flange_t-travel; carrier_t=1.8;
carrier_z=carrier_top-carrier_t;
$fn=72;
assert(radial_clearance>0 && travel>0 && carrier_z>wall);
module rounded(w,d,h,r){linear_extrude(h)offset(r=r)square([w-2*r,d-2*r],center=true);}
module post(x,y,h,r=3){
 translate([x,y,wall])difference(){cylinder(h=h-wall,r=r);translate([0,0,0.5])cylinder(h=h,d=1.8);}
}
module base(){
 difference(){
  union(){
   difference(){rounded(width,depth,base_h,corner);translate([0,0,wall])rounded(width-2*wall,depth-2*wall,base_h,corner-wall);}
   for(x=[-20,20],y=[-20,20]){
    post(x,y,base_h,3.5);
    translate([x>0?x:x-6,y-1.2,wall])cube([6,2.4,base_h-wall]);
   }
   for(x=[-22,22],y=[-9,9]){
    post(x,y,carrier_z,2.8);
    translate([x>0?x:x-4,y-1.2,wall])cube([4,2.4,carrier_z-wall]);
   }
   // Provisional board supports: 32 x 32 mm centers; no final PCB exists.
   for(x=[-16,16],y=[-16,16])post(x,y,6.2,3);
  }
  translate([0,depth/2,8.8])cube([12,wall*4,6],center=true);
  // Recut screw pilots through ribs as well as posts.
  for(x=[-20,20],y=[-20,20])translate([x,y,wall+0.5])cylinder(h=base_h,d=1.8);
  for(x=[-22,22],y=[-9,9])translate([x,y,wall+0.5])cylinder(h=carrier_z,d=1.8);
 }
}
module lid(){
 translate([0,0,lid_z])difference(){
  rounded(width,depth,lid_t,corner);
  translate([0,0,-1])cylinder(h=lid_t+2,d=cap_d+2*radial_clearance);
  translate([0,0,1.4])cylinder(h=lid_t,d=43.5);
  for(x=[-20,20],y=[-20,20])translate([x,y,-1])cylinder(h=lid_t+2,d=2.4);
 }
}
module cap(displacement=0){
 translate([0,0,-displacement])union(){
  translate([0,0,lid_z])cylinder(h=cap_top-lid_z,d=cap_d);
  translate([0,0,lid_z-flange_t])cylinder(h=flange_t,d=flange_d);
  translate([0,0,14])cylinder(h=lid_z-14,d=5);
 }
}
module carrier(){
 translate([0,0,carrier_z])difference(){
  union(){
   difference(){cylinder(h=carrier_t,d=40.5);translate([0,0,-1])cylinder(h=carrier_t+2,d=36.8);}
   for(x=[-22,22],y=[-9,9])hull(){
    translate([x,y,0])cylinder(h=carrier_t,r=2.7);
    translate([x>0?17.5:-17.5,y,0])cylinder(h=carrier_t,r=2.2);
   }
  }
  for(x=[-22,22],y=[-9,9]){
   translate([x,y,-1])cylinder(h=carrier_t+2,d=2.4);
   translate([x,y,carrier_t-1.2])cylinder(h=1.3,d1=2.4,d2=4.6);
  }
 }
}
module diffuser(){
 translate([0,0,21.4])difference(){cylinder(h=1.4,d=43);translate([0,0,-1])cylinder(h=4,d=36.7);}
}
module assembled(explode=false){
 color("#303847")base();
 translate([0,0,explode?16:0])color("#7f8ea5")carrier();
 translate([0,0,explode?32:0])color("#424f65")lid();
 translate([0,0,explode?43:0])color("#9fd1f0",0.7)diffuser();
 translate([0,0,explode?56:0])color("#d6e0ef",0.8)cap();
}
if(part=="base")base();
else if(part=="lid")translate([0,0,-lid_z])lid();
else if(part=="cap")translate([0,0,cap_top])rotate([180,0,0])cap();
else if(part=="carrier")translate([0,0,-carrier_z])carrier();
else if(part=="diffuser")translate([0,0,-21.4])diffuser();
else if(part=="exploded")assembled(true);
else if(part=="collision"){
 // Check throughout travel with a 0.01 mm gap from intended stop contacts.
 union(){
  intersection(){base();union(){lid();carrier();diffuser();cap(0.01);}}
  intersection(){lid();union(){carrier();cap(0.01);diffuser();}}
  intersection(){diffuser();cap(0.01);}
  for(d=[0.01:0.05:travel-0.01])intersection(){cap(d);carrier();}
 }
}else assembled();
