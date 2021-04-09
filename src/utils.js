import icdf from 'norm-dist/icdf.js'

export function fillZ(arr) {
	for (let i=0; i<arr.length; ++i) arr[i] = icdf( (i+0.5)/arr.length )
	return arr
}
