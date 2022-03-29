//could make a class for colours too but that would be a touch annoying

var light;
var spheres = [];

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
			console.log(lines[0]);
			let linfo = lines[0].split(/\s+/);
			//the following line also garbage-collects the old light, i think
			console.log("light info:",linfo[1], linfo[2], linfo[3],	//x y z
			linfo[4], linfo[5], linfo[6],	//ambient
			linfo[7], linfo[8], linfo[9]);
			light = new Light(parseInt(linfo[1]), parseInt(linfo[2]), parseInt(linfo[3]),	//x y z
							  parseInt(linfo[4]), parseInt(linfo[5]), parseInt(linfo[6]),	//ambient
							  parseInt(linfo[7]), parseInt(linfo[8]), parseInt(linfo[9]));	//specular
		} else {console.error("Possible improperly formatted input file");}
		if (lines[1]) {
			console.log(lines[1]);
			sphereCount = parseInt(lines[1].replace('#', '')); //NOTE: wait just realized there will be no # in it LOL
		} else {console.error("Improper sphere count read in!");}
		if (lines[2]) {
			for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) { //we will use this loop to scan in the spheres
				let line = lines[lineIndex].split(/\s+/);
				if (lines[lineIndex]) {
					console.log("line ot parse:",lines[lineIndex]);
					spheres.push(new Sphere(parseInt(line[1]), parseInt(line[2]), parseInt(line[3]),	//x y z
											parseInt(line[4]),											//radius
											parseInt(line[5]), parseInt(line[6]), parseInt(line[7]),	//ambient rgb
											parseInt(line[8]), parseInt(line[9]), parseInt(line[10]),	//diffuse rgb
											parseInt(line[11]), parseInt(line[12]), parseInt(line[13]),	//specular rgb
											parseInt(line[14])));										//shininess
				}
			}
		}
		console.log(light, spheres);
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
	let i0 = {x: 0, y: 0, z: 0};
	let i1 = {x: 0, y: 0, z: 0};
	if (B >= 0) {
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
	let min = {x: 0, y: 0, z: 0};
	for (let i = 0; i < spheres.length; i++) {
		let testVal = getIntersection(spheres[i]);
		if (getDist(testVal, ray.pos) < getDist(min, ray.pos)) {
			min.assign(testVal);
		}
	}
	console.log("min:",min);
	return min;
}

function getNormalVector(sphere, intersection) {
	return normalize({x: (intersection.x - sphere.pos.x) / sphere.radius,
					  y: (intersection.y - sphere.pos.y) / sphere.radius,
					  z: (intersection.z - sphere.pos.z) / sphere.radius});
}

function getViewingVector(sphere, intersection) {
	return normalize({x: sphere.pos.x - intersection.x,
					  y: sphere.pos.y - intersection.y,
					  z: sphere.pos.z - intersection.z});
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

function getIlumination(N, V, L, R) { //normal, viewing, light, reflection
	let ray = new Ray(0, 0, 0);
}