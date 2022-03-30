//could make a class for colours too but that would be a touch annoying

var light;
var spheres = [];
const DEPTH = 255;

class Light {
	constructor(x, y, z, ar, ag, ab, sr, sg, sb) { //ax and sx are for ambient & specular
		this.pos = {x: x, y: y, z: z};
		this.ambient = {r: ar, g: ag, b: ab};
		this.specular = {r: sr, g: sg, b: sb};
	}
}

class Sphere {
	constructor(x, y, z, r, ar, ag, ab, dr, dg, db, sr, sg, sb, shiny) {
		this.pos = {x: x, y: y, z: z};
		this.radius = r;
		this.ambient = {r: ar, g: ag, b: ab};
		this.diffuse = {r: dr, g: dg, b: db};
		this.specular = {r: sr, g: sg, b: sb};
		this.shininess = shiny;
	}
}

class Ray {
	constructor(x, y, z, dx, dy, dz) {
		this.pos = {x: x, y: y, z: z};
		this.dir = {x: dx, y: dy, z: dz};
	}
	setDir(direction) {
		this.dir.x = direction.x;
		this.dir.y = direction.y;
		this.dir.z = direction.z;
	}
}

function readFile(input) {
	let file = input.files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
		/*	line 1 is the light info, starts with "light".
			line 2 is the count of spheres that follow.
			lines 3-12 are the sphere info lines	*/
		const lines = reader.result.split('\n');
		let sphereCount = 0;
		if (lines[0]) {
			let linfo = lines[0].split(/\s+/);
			//the following line also garbage-collects the old light, i think
			light = new Light(parseFloat(linfo[1]), parseFloat(linfo[2]), parseFloat(linfo[3]),		//x y z
							  parseFloat(linfo[4]), parseFloat(linfo[5]), parseFloat(linfo[6]),		//ambient
							  parseFloat(linfo[7]), parseFloat(linfo[8]), parseFloat(linfo[9]));	//specular
		} else {console.error("Possible improperly formatted input file");}
		if (lines[1]) {
			sphereCount = parseFloat(lines[1].replace('#', '')); //NOTE: wait just realized there will be no # in it LOL
		} else {console.error("Improper sphere count read in!");}
		if (lines[2]) {
			for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) { //we will use this loop to scan in the spheres
				let line = lines[lineIndex].split(/\s+/);
				if (lines[lineIndex]) {
					spheres.push(new Sphere(parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]),		//x y z
											parseFloat(line[4]),												//radius
											parseFloat(line[5]), parseFloat(line[6]), parseFloat(line[7]),		//ambient rgb
											parseFloat(line[8]), parseFloat(line[9]), parseFloat(line[10]),		//diffuse rgb
											parseFloat(line[11]), parseFloat(line[12]), parseFloat(line[13]),	//specular rgb
											parseFloat(line[14])));												//shininess
				}
			}
		}
		console.log("light:", light, "spheres:", spheres);
		draw();
	};
	return;
}

function getDist(a, b) {
	return getLength({x: b.x - a.x, y: b.y - a.y, z: b.z - a.z});
}

function getLength(a) {
	return (Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2)));
}

function normalize(a) {
	let len = getLength(a);
	return {x: a.x/len, y: a.y/len, z: a.z/len};
}

function dotProduct(a, b) {
	return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
}

function getIntersection(sphere, ray) {
	let A = 1.0; //hrm
	let B = 2 * (ray.dir.x * (ray.pos.x - sphere.pos.x) + ray.dir.y * (ray.pos.y - sphere.pos.y) + ray.dir.z * (ray.pos.z - sphere.pos.z));
	let C = Math.pow(ray.pos.x - sphere.pos.x, 2) + Math.pow(ray.pos.y - sphere.pos.y, 2) + Math.pow(ray.pos.z - sphere.pos.z, 2) - Math.pow(sphere.radius, 2);
	//hope these are right as they would be a nightmare to debug! 😃
	let discriminant = Math.pow(B, 2) - 4 * A * C;
	let i0 = {x: Infinity, y: Infinity, z: Infinity};
	let i1 = {x: Infinity, y: Infinity, z: Infinity};
	//console.log("rayprop",ray.pos,ray.dir,A, B, C, "ray discriminant", sphere.pos, discriminant);
	if (discriminant >= 0) {
		//console.log(A, B, C, "ray discriminant", sphere.pos, discriminant);
		let t0 = 0;
		let t1 = 0;
		t0 = (-B - Math.sqrt(discriminant)) / (2 * A);
		if (B > 0) {
			t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
			i1 = {x: ray.pos.x + ray.dir.x * t1,
				  y: ray.pos.y + ray.dir.y * t1,
				  z: ray.pos.z + ray.dir.z * t1};
		}
		i0 = {x: ray.pos.x + ray.dir.x * t0,
			  y: ray.pos.y + ray.dir.y * t0,
			  z: ray.pos.z + ray.dir.z * t0};
	}
	return (getDist(i0, ray.pos) < getDist(i1, ray.pos)) ? i0 : i1;
}

function getClosestIntersect(ray) {
	let min = {x: Infinity, y: Infinity, z: Infinity};
	let whichSphere = -1; //so we know which sphere to get colour info of
	for (let i = 0; i < spheres.length; i++) {
		let testVal = getIntersection(spheres[i], ray);
		if (getDist(testVal, ray.pos) < getDist(min, ray.pos)) {
			Object.assign(min, testVal);
			whichSphere = i;
		}
	}
	return {value: {x: min.x, y: min.y, z: min.z}, id: whichSphere}; 
}

function getReflectionIntersect(ray, fromWhich) {
	let min = {x: Infinity, y: Infinity, z: Infinity};
	let whichSphere = -1; //so we know which sphere to get colour info of
	for (let i = 0; i < spheres.length; i++) {
		if (i != fromWhich) { //dont test our sphere
			let testVal = getIntersection(spheres[i], ray);
			if (getDist(testVal, ray.pos) < getDist(min, ray.pos)) {
				Object.assign(min, testVal);
				whichSphere = i;
			}
		}
	}
	return {value: {x: min.x, y: min.y, z: min.z}, id: whichSphere}; 
}

function getNormalVector(sphere, intersection) {
	return normalize({x: (intersection.x - sphere.pos.x) / sphere.radius,
					  y: (intersection.y - sphere.pos.y) / sphere.radius,
					  z: (intersection.z - sphere.pos.z) / sphere.radius});
}

function getViewingVector(ray, intersection) {
	return normalize({x: ray.pos.x - intersection.x,
					  y: ray.pos.y - intersection.y,
					  z: ray.pos.z - intersection.z});
}

function getLightVector(intersection) {
	return normalize({x: light.pos.x - intersection.x,
					  y: light.pos.y - intersection.y,
					  z: light.pos.z - intersection.z});
} //from the global var light. could be adjusted

function getReflectionVector(N, L) {
	let NdotL = dotProduct(N, L);
	return normalize({x: 2 * NdotL * N.x - L.x,
					  y: 2 * NdotL * N.y - L.y,
					  z: 2 * NdotL * N.z - L.z});
}

function getRecReflectionVector(N, V) {
	let NdotV = dotProduct(N, V);
	return normalize({x: 2 * NdotV * N.x - V.x,
					  y: 2 * NdotV * N.y - V.y,
					  z: 2 * NdotV * N.z - V.z});
}

function getIllumination(N, V, L, R, intersection) { //normal, viewing, light, reflection
	let n = 25;
	let I = intersection.value;
	let sphere = spheres[intersection.id];
	let ambient = {r: light.ambient.r * sphere.ambient.r,
				   g: light.ambient.g * sphere.ambient.g,
				   b: light.ambient.b * sphere.ambient.b};

	let diffuse = {r: light.specular.r * sphere.diffuse.r * Math.max(dotProduct(N, L), 0.0),
				   g: light.specular.g * sphere.diffuse.g * Math.max(dotProduct(N, L), 0.0),
				   b: light.specular.b * sphere.diffuse.b * Math.max(dotProduct(N, L), 0.0)};

	let specular = {r: light.specular.r * sphere.specular.r * Math.max(dotProduct(R, V), 0.0) ** n,
					g: light.specular.g * sphere.specular.g * Math.max(dotProduct(R, V), 0.0) ** n,
					b: light.specular.b * sphere.specular.b * Math.max(dotProduct(R, V), 0.0) ** n};

	if (sphere.shininess != 0) { //recursive reflection call
		let RR = getRecReflectionVector(N, V);
		console.log(RR);
		let reflectionRay = new Ray(I.x, I.y, I.z, RR.x, RR.y, RR.z);
		let reflectionIntersect = getReflectionIntersect(reflectionRay, intersection.id);
		if (reflectionIntersect.id != -1) {
			console.log(reflectionIntersect.id,":",sphere,"reflects",reflectionIntersect);
			
		}
	}

	return {r: (ambient.r + specular.r + diffuse.r) * DEPTH,
			g: (ambient.g + specular.g + diffuse.g) * DEPTH,
			b: (ambient.b + specular.b + diffuse.b) * DEPTH};
}

function draw() {
	const canvas = document.querySelector('#canvas');
	const ctx = canvas.getContext('2d');
	let ray = new Ray(0, 0, 0, 0, 0, 0);
	let vpStartX = -1;
	let vpStartY = 1;
	let vpSize = 2;
	for (let i = 0; i < canvas.height; i++) {
		for (let j = 0; j < canvas.width; j++) {
			ray.setDir(normalize({x: vpStartX + (vpSize * j / canvas.height), //.width?
								  y: vpStartY - (vpSize * i / canvas.height),
								  z: -1
			}));
			let intersect = getClosestIntersect(ray); //this shit loops over all spheres twice whoops
			if (intersect.id != -1) {
				//console.log(".");
				let normalv = getNormalVector(spheres[intersect.id], intersect.value);//juist realized there may be a fatal flaw
				let lightv = getLightVector(intersect.value); //check intersect.value
				let pixel = getIllumination(normalv, getViewingVector(ray, intersect.value), lightv, getReflectionVector(normalv, lightv), intersect);
				//console.log(j, i, pixel);
				ctx.fillStyle = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ')';
			}
			else ctx.fillStyle = `rgb(0, 0, 0)`; //this actually just makes like a non-overwriting black pixel
			ctx.fillRect(j, i, 1, 1);
		}
	}
}