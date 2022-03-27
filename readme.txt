Updates: 
1    The direction vector which points towards the viewing plane is along the negative z-axis (0 0
-1).
2    Pick a size for the viewing plane that you will use to create the rays projecting from the
viewpoint. Something like the space created between the points (-1 -1 -1) to (1 1 -1). Divide this
space by the height and width of the display measured in pixels to calculate the x,y,x coordinates
for the viewing ray that is cast from the viewpoint at the origin (0 0 0). 
3    If the sphere has an edge that is the colour of the specular reflection then make sure that
R.V isn't negative.

CIS*4800 - Assignment 4 - Ray Tracing
Due: Friday, March 25.
There is an extension on the assignment until Friday, April 1. There will be no other extensions
granted for this assignment. 

Write a program which performs ray tracing of a scene.

Part I - Read the Scene File 
Read a text file that describes the structure of the scene. The file will list the location of the
sphere and the light in the scene. For this assignment there will only be one light source. The
file has the format:

light    x  y  z       lar lag lab    lpr lpg lpb
#c
sphere   x  y  z  R     ar  ag  ab     dr dg db   sr sg sb    shiny

where:
x,y,z are the centre of the sphere or the location of the light,
R is the radius of the sphere
ar, ag, ab are the ambient coefficients for the red, green, and blue colours for the sphere
dr, dg, db are the diffuse coefficients for the red, green, and blue colours for the sphere
sr, sg, sb are the specular coefficients for the red, green, and blue colours for the sphere
shiny indicates how reflective the object is, a value of 0.0 means the object is not reflective, a
value of 1.0 means the object is a perfect mirror

lar, lag, lab are the ambient colours for the light
lpr, lpg, lpb are the colour of the point light source and they are also the specular coefficients
for the red, green, and blue colours for the light

#c is an integer that indicates how many sphere lines will be defined after it, there can be at
most 10 spheres

The coefficients control how much light of that colour reflects from the surface.

An example of this format is:
light    4.0 5.0 4.0   0.5 0.5 0.5    0.8 0.8 0.8
1
sphere  0.0 -0.5  -3.0    1.0     0.2 0.2 0.2     0.0 0.5 0.0    0.8 0.8 0.8   1.0 

would create a:
-a  light would be at x,y,z position (4.0 5.0 4.0)
-the light would have the ambient colour (0.5, 0.5, 0.5) 
-the light would have the diffuse colour (0.8, 0.8, 0.8) and this would also be the colour of the
specular highlight on the sphere

and one sphere:
-at location x,y,z position (0.0 -0.5 -3.0)
-a radius of 1.0
-with a dark gray ambient colour coefficient (0.2 0.2 0.2)
-a green diffuse colour coefficient (0.0 0.5 0.0)
-a bright gray specular colour coefficient (0.8 0.8 0.8)
-the sphere is very shiny (1.0) so it will reflect other spheres


The "light" and "sphere" strings start each line indicate the purpose for the line.

Read the file by having the user send it to the script using the file selector.

There can be any number of spaces between each value in the file. 


Part II - Simple Ray Tracing
Draw the scene described in the text file using ray tracing to determine the visibility and
shading.  Cast one ray per pixel Determine if the ray intersects with the sphere objects in the
scene using method described in class. 


Part III - Recursive Ray Tracing
Add the ability to create shadows and reflections to the simple ray tracer from part II.

If a point on a sphere is in shadows then use only the ambient light value (no diffuse or specular)
when calculating that point's illumination value. You will need to cast rays towards the light and
determine if it intersects with a sphere to find if the current point is in shadow.

A reflection is calculated if the reflection ray R for a point on the sphere intersects with
another sphere. If it does then blend the colours of the current sphere and the reflected sphere. 

The sphere's reflection value indicates how much of the sphere's own colour and how much of the
reflection will be blended together. A sphere with a shiny value of 0.0 is not reflective so it
will entirely be coloured using the sphere's own colour. A shiny value of 1.0 means the sphere will
reflect any other objects and will completely replace their own colour with the other sphere's
colour. If the reflection ray does not intersect with another sphere then there is no reflection
then the colour is that of the original sphere. If there is a reflection then the amount of the
original sphere's colour will be (1.0-shiny)*r,g,b and the amount of the reflected sphere's colour
will be shiny*r,g,b. 

You only need to use one reflection and shadow ray per point calculation. 

The sphere that is intersected by the ray from the viewpoint is the first sphere. The sphere that
is reflected on the first sphere is the second sphere.  The reflected colour is taken from the
illumination equation of the second sphere. You don't need to calculate the reflections of other
spheres or shadows on the second sphere to use its colour on the first sphere. There only needs to
be one level of reflection or shadow rays. 

The Math

The Viewing Vector
=================
The origin of the ray is (x0, y0, z0). This is the where the viewpoint will
be placed. The viewpoint is (0 0 0).

The direction of the ray is (xd, yd, zd). This is the point in the viewing
window that the ray passes through. You need one of these for each pixel.
You will need to loop through all pixels.


The Sphere
==========
The centre of the sphere is (xc, yc, zc).
The radius of the sphere is Sr.

These are read from the input file.


Solving the Intersection of the Ray and Sphere
==============================================
By substituting the ray equation into the sphere equation and using
the quadratic equation we can find the intersection point(s).

Calculate A, B, C:
A is equal to 1.0.

B = 2 * ( xd * (x0 - xc)  + yd * (y0 - yc)  +  zd * (z0 - zc) )

C = (x0 - xc)^2  + (y0 - yc)^2   + (z0 - zc)^2  - (Sr)^2

where ^2 means everything in the brackets is squared (raised to the power of 2).


The Discriminant
================
Use the discriminant to determine if the ray intersects the sphere at 0, 1, or 2 points.

dis = B^2 - 4*A*C

If dis < 0 there is no intersection point, the ray misses the sphere.
If dis = 0 then the ray intersects the sphere at one point.
If dis > 0 then the ray intersects the sphere at two points. 


The Intersection Point
======================
To solve the equation which represents the intersection of the ray and sphere
use the quadratic equation:

t0 = (-B - sqrt(dis) ) / 2A
t1 = (-B + sqrt(dis) ) / 2A

If there is one solution (dis = 0) then calculate only one of the above. If there are two solutions
(dis > 0) then calculate both t0 and t1.


Once t0 and t1 are found the intersection point ri can be calculated.  If there is one intersection
point (dis = 0) then calculate it using t0:

ri = (xi yi, zi) = ( (x0 + xd*t0)    (y0 + yd*t0)    (z0 + zd*t0) )

If there are two intersection points then calculate the two points then calculate both of them
using t0 and t1.

ri0 = ( (x0 + xd*t0)    (y0 + yd*t0)    (z0 + zd*t0) )
ri1 = ( (x0 + xd*t1)    (y0 + yd*t1)    (z0 + zd*t1) )

Calculate the distance between the viewpoint (x0, y0, z0) and each point ri0 and ri1.  Pick the
intersection point which has the smallest distance to the viewpoint.  This point will be on the
side of the sphere facing the viewer. The point which is farther away will be on the far side of
the sphere. Which ever point is closer becomes ri = (xi yi zi) for later calculations.


Calculate the Normal Vector
===========================
The normal vector for the intersection point ri = (xi yi zi) is calculated using
the sphere parameters:

N = (nx ny nz)  =  ( (xi - xc)/Sr    (yi - yc)/Sr    (zi - zc)/Sr  )

This may not be a unit vector so you should normalize it. 


Calculate the Viewing Vector
============================
Use the origin point ro = (x0 y0 z0) and the intersection point ri = (xi yi zi).

V = ro - ri
= (vx vy vz)
= (x0-xi  y0-yi  z0-zi)

This may not be a unit vector so you should normalize it. 


Calculating the Light Vector
============================
Use the light location point l0 = (lx ly lz) and the intersection point ri = (xi yi zi).

L = l0 - ri
= (lvx  lvy  lvz)
= (lx-xi  ly-yi  lz-zi)

where lvx, lvy, lvz are the light vector values. This is the different from the
position of the light itself which is at the point (lx ly lz).

This may not be a unit vector so you should normalize it. 


Calculating the dot product of N and L (N.L)
============================================
Use the normal vector N and the light vector L calculated above.

N.L = ( nx*lvx +  ny*lvy +  nz*lvz )


Calculating the Reflection Vector
=================================
The reflection vector is calculated using:

R = 2 * (N.L) * N - L
= (rx ry rz)

This may not be a unit vector so you should normalize it. 


Calculating the dot product of R and V (R.V)
============================================

R.V = ( rx*vx +  ry*vy +  rz*vz )


The Illumination Equation
=========================
You can plug the dot products (N.L) and (R.V) into the illumination equation along with the values
that you read from the input file. 

From the input file:
-the ambient colour for the sphere are:  ar, ag, ab
-the diffuse colour for the sphere are:  dr, dg, db
-the colour of the specular reflection is sr, sg, sb

The lighting equations is:

I =  ambient + diffuse  + specular

where:

ambient = la[rgb] * a[rgb]
diffuse = lp[rgb] * d[rgb] * (N.L)
specular = lp[rgb] * s[rgb] * (R.V)^n

You need to perform this calculation for each of the red, green, blue colours. You will end up with
three values that are the RGB values for a pixel.

The diffuse and specular colour for the light are the same lp[rgb].

Pick an n value that makes the specular reflections easy to see.

If a point on a sphere is in shadow then only the ambient component is calculated.

If a sphere reflects another then you need to calculate the illumination equation for both spheres
and blend the two colours.


More Math

Calculating a Dot Product
=========================
The dot product of two vectors A = (ax, ay, az) and B = (bx, by, bz) is
equal to A.B = (ax*bx + ay*by + az*bz).


Calculating a Unit Vector
=========================
Normalizing the vector. Calculate the length of the vector len
and divide each element of the vector by that value.
For the vector A = (x y z).

len = sqrt( x^2 + y^2 + z^2)
or
len = sqrt( x*x  y*y   z*z)

The unit vector for A equals (x/len  y/len  z/len).


Implementation Notes
There is sample code on Courselink which draws coloured points on a 2D canvas. You can use this as
an example for how to display the results from the ray tracing. You can add other files if you
wish. The program will be started using the index.html file. 

If your code must be reset before a new file can be loaded and displayed then include this
information in the readme file.

You can test if the intersection of the ray and spheres is working correctly by drawing a point on
the screen when the intersection calculation indicates the presence of a sphere. This is a good way
to test intersections before you have the illumination equation implemented.

If the sphere looks distorted and does not look round make sure that it is far enough away from the
viewing plane. Don't let the sphere overlap the viewing plane or the viewpoint (x0, y0, z0).

Handin Notes
Submit the assignment using the dropbox for assignment 4 in Courselink.

Don't change the names of the index.hmtl file.  You can add more files if you wish.

Before you submit your code, do the following:
-include a readme.txt with you student number and your name
-check that all of the files needed to run the program have been
included

If any parts of the system don't work correctly then include a description of the problem in the
readme.txt file.

Your code will be tested using the Chrome browser. If it doesn't work with Chrome but it does work
on another browser then you will lose marks. 

The assignment will be compiled following these steps by:
-unpacking your submission (tar or zip)
-running the python3 http.server module
-starting index.html in the browser using localhost:8000