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
	}
}

function getLength(a) {
	return (Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2)));
}

function normalize(a) {
	let len = getLength(a);
	return [(a.x/len), (a.y/len), (a.z/len)];
}

function dotProduct(a, b) {
	return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
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
			let linfo = lines[0].split();
			//the following line also garbage-collects the old light, i think
			light = new Light(linfo[1], linfo[2], linfo[3], linfo[4], linfo[5], linfo[6], linfo[7], linfo[8], linfo[9]);
		} else {console.error("Possible improperly formatted input file");}
		if (lines[1]) {
			sphereCount = parseInt(lines[1].replace('#', '')); //NOTE: wait just realized there will be no # in it LOL
		} else {console.error("Improper sphere count read in!");}
		if (lines[2]) {
			for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) { //we will use this loop to scan in the spheres
				let line = lines[lineIndex];
				if (line) {
					console.log(lines[lineIndex]);
				}
				spheres.push(new Sphere());
			}
		}
	};
}