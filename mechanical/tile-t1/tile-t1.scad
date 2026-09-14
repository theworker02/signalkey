// SignalKey TILE T1 — parametric appearance and service assembly study.
// Units: mm. Native editable CAD. See README for bounded P3 component envelopes.
// Appearance target: selected TILE concept image. This is NOT production tooling geometry.
part = "assembly"; // upper, button, guide, lightguide, lower, coupon, assembly, exploded, section, top, rear, underside
$fn = 72;

// P3 integration envelope: increased from 78 x 78 x 23 study to accommodate
// current Pico H/breadboard prototype and 38.1 mm-deep arcade switch.
W = 128; D = 108; H = 52;
base_h = 3.2; base_inset = 1.0; base_reveal = 1.0;
body_r = 18; top_r = 19; wall = 2.4; top_t = 2.8;
button_w = 104; button_d = 84; button_r = 15; button_clear = 1.2;
button_t = 3.2; button_rest_z = H - top_t + .10; button_travel = .60; button_stop = .78;
button_concavity = .65; guide_clear = .25; guide_land = 5.2;
light_w = 11; light_d = 2.2; light_x = 48; light_y = 38;
pcb_w = 55; pcb_d = 82.6; pcb_t = 9.3; pcb_z = 7.85; // actual P3 breadboard envelope
usb_w = 12; usb_h = 6.0; usb_z = 15.0; // Pico H Micro-USB opening envelope; measure received plug
switch_x = -39; switch_body_d = 29.5; switch_depth = 38.1; // Adafruit 471 supplier envelope
assert(button_w + 2*button_clear < W);
assert(button_d + 2*button_clear < D);
assert(button_rest_z + button_t <= H + 3.2);

module rr(w,d,h,r){ linear_extrude(height=h) offset(r=r) square([w-2*r,d-2*r],center=true); }
module smooth_body(){
  hull(){ translate([0,0,base_h]) rr(W,D,1,body_r); translate([0,0,H-top_t]) rr(W-1.6,D-1.6,top_t,top_r); }
}
module button_shape(h=button_t){
  difference(){
    rr(button_w,button_d,h,button_r);
    // Large shallow concavity on the visible face.
    translate([0,0,h+14.0]) sphere(r=14.65);
  }
}
module top_opening(){ translate([0,0,H-top_t-.1]) rr(button_w+2*button_clear,button_d+2*button_clear,top_t+1,button_r+button_clear); }
module front_wordmark(){
  translate([0,-D/2-.03,11.0]) rotate([90,0,0]) linear_extrude(.28)
    text("SignalKey",size=5.1,halign="center",valign="center",font="Segoe UI:style=Regular");
}
module upper(){
  difference(){
    smooth_body();
    // Lower interior: hidden seam just above graphite base.
    translate([0,0,base_h+wall]) rr(W-2*wall,D-2*wall,H-base_h-wall-top_t+.2,body_r-wall);
    top_opening();
    // Rear Micro-USB opening; exact Pico H connector datum remains unmeasured.
    translate([0,D/2-1,usb_z]) cube([usb_w,wall+4,usb_h],center=true);
    // Light insert pocket remains optically separate from the button.
    translate([light_x,light_y,H-top_t-.1]) rr(light_w+.5,light_d+.5,top_t+1,1.1);
    front_wordmark();
    // Four insert bores; accessible only from lower chassis.
    for(x=[-51,51],y=[-40,40]) translate([x,y,base_h]) cylinder(h=10,d=3.6);
  }
}
module lower(){
  difference(){
    union(){
      rr(W-2*base_inset,D-2*base_inset,base_h,body_r-1.1);
      // Shallow interior chassis lip and P3 breadboard support volume.
      translate([0,0,base_h-.01]) difference(){ rr(W-2*wall,D-2*wall,3.0,body_r-wall); rr(W-2*wall-3,D-2*wall-3,4,body_r-wall-1.5); }
      for(x=[-51,51],y=[-40,40]) translate([x,y,base_h]) cylinder(h=10,d=7.5);
      // Four load posts take guide/button force to chassis, bypassing switch PCB.
      for(x=[-42,42],y=[-31,31]) translate([x,y,base_h]) cylinder(h=40.4,d=8);
    }
    // Underside screw access remains outside feet/pad positions.
    for(x=[-51,51],y=[-40,40]){
      translate([x,y,-.1]) cylinder(h=base_h+3,d=2.7);
      translate([x,y,-.1]) cylinder(h=1.7,d1=5.8,d2=2.7);
    }
    // Rear connector clearance includes plug shell keep-out, not final connector drawing.
    translate([0,D/2-2,usb_z]) cube([usb_w+4,7,usb_h+2],center=true);
  }
}
module button(){
  translate([0,0,button_rest_z]) union(){
    button_shape();
    // Four guide shoes distribute off-centre loads into guide rails, not switch.
    for(x=[-42,42],y=[-31,31]) translate([x,y,-3.1]) rr(5.2,5.2,3.3,1.4);
    // Offset plunger reaches existing arcade switch; four guides keep cap planar.
    translate([switch_x,0,-4.0]) cylinder(h=4.2,d=7.0);
  }
}
module guide(){
  // Separate support frame: printable prototype part; P3 switch carrier/datum provisional.
  translate([0,0,42.0]) difference(){
    union(){
      difference(){ rr(112,92,3.0,17); rr(88,68,4,11); }
      for(x=[-42,42],y=[-31,31]) translate([x,y,0]) difference(){ rr(6.0,6.0,5.3,1.6); translate([0,0,-.1]) rr(5.2+2*guide_clear,5.2+2*guide_clear,6,1.3); }
      // Switch carrier takes only actuation; stops transfer excess force to lower posts.
      translate([switch_x,0,-2.5]) cylinder(h=2.7,d=17);
    }
    translate([0,0,-3]) cylinder(h=10,d=8);
  }
}
module lightguide(){
  // Amber translucent insert: flush at top; flange retains it from below.
  translate([light_x,light_y,H-top_t-.05]) union(){
    rr(light_w,light_d,top_t+.05,1.0);
    translate([0,0,-1.0]) rr(light_w+1.4,light_d+1.4,1.1,1.3);
    // Internal mixing pocket facing the existing LED-ring source envelope.
    translate([0,0,-2.2]) rr(7,1.2,2.3,.6);
  }
}
module feet(){
  // Purchased silicone pads, reference only (not printable custom parts).
  for(x=[-53,53],y=[-43,43]) translate([x,y,-.8]) cylinder(h=.85,d=10);
}
module p3_reference(){
  // Envelopes are reference geometry, not measured manufacturer STEP.
  color("#2d5b62",.72) translate([29,0,pcb_z]) cube([pcb_w,pcb_d,pcb_t],center=true);
  color("#596b73",.72) translate([29,D/2-4.5,usb_z]) cube([usb_w,9,usb_h],center=true);
  color("#242a2f",.72) translate([switch_x,0,9.6]) cylinder(h=switch_depth,d=switch_body_d);
  color("#f2a22c",.45) translate([41,25,39]) cylinder(d=36.8,h=6.7);
  color("#f2a22c",.85) translate([light_x,light_y,45.5]) cube([6,1.2,1.1],center=true);
}
module assembled(exploded=0){
  color("#eee7dc") upper();
  translate([0,0,exploded*1.0]) color("#e9e1d6") guide();
  translate([0,0,exploded*1.8]) color("#f5f0e8") button();
  translate([0,0,exploded*2.0]) color("#f3a128",.85) lightguide();
  color("#25272a") lower();
  color("#36383a") feet();
  if(exploded==0) p3_reference();
}
module coupon(){
  // Print coupon: guide shoe clearance variants 1.20 / 1.35 / 1.50 mm.
  for(i=[0:2]) translate([(i-1)*22,0,0]) difference(){ rr(18,18,4,5); translate([0,0,-1]) rr(12+2*(1.2+.15*i),12+2*(1.2+.15*i),6,3); }
}
if(part=="upper") upper();
else if(part=="lower") lower();
else if(part=="button") translate([0,0,-button_rest_z]) button();
else if(part=="guide") translate([0,0,-42]) guide();
else if(part=="lightguide") translate([-light_x,-light_y,-(H-top_t-2.2)]) lightguide();
else if(part=="coupon") coupon();
else if(part=="exploded") assembled(11);
else if(part=="section") difference(){ assembled(); translate([-100,-100,-2]) cube([200,100,100]); }
else if(part=="top") projection(cut=true) assembled();
else if(part=="rear") projection(cut=true) rotate([90,0,0]) assembled();
else if(part=="underside") projection(cut=true) rotate([180,0,0]) assembled();
else assembled();
