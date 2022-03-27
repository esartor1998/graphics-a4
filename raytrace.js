//could make a class for colours too but that would be a touch annoying

var light;

class Light {
	constructor(x, y, z, ar, ag, ab, sr, sg, sb) { //ax and sx are for ambient & specular

	}
}

function readfile(input) {
	let file = input.files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
		/*	line 1 is the light info, starts with "light".
			line 2 is the count of spheres that follow.
			lines 3-12 are the sphere info lines	*/
		const lines = reader.result.split('\n');
		if (lines[0]) {
			let linfo = lines[0].split();
			//the following line also garbage-collects the old light, i think
			light = new Light(linfo[1], linfo[2], linfo[3], linfo[4], linfo[5], linfo[6], linfo[7], linfo[8], linfo[9]);
		}
		for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) { //we will use this loop to scan in the spheres
			let line = lines[lineIndex];
			if (line) {
				console.log(lines[lineIndex]);
			}
		}
	};
}