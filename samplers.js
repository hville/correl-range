import icdf from 'norm-dist/icdf-voutier.js'
import {fillZ} from './src/utils.js'
import {sattolo as satt, shuffle as shuf, permute as perm} from 'array-order'

//TODO only random (simulation) and permute (sensitivity) are used

export function random(dim) {
	const zs = dim.length ? dim : new Float64Array(dim)
	return function() {
		for (let i=0; i<zs.length; ++i) zs[i] = icdf(Math.random())
		return zs
	}
}
export function sattolo(dim) {
	const zs = dim.length ? dim : fillZ(Array(dim))
	return satt.bind(null,zs)
}
export function shuffle(dim) {
	const zs = dim.length ? dim : fillZ(Array(dim))
	return shuf.bind(null,zs)
}
export function permute(dim) { //works well for elementary effects after flips
	const zs = dim.length ? dim : shuf( fillZ(Array(dim)) )
	return perm(zs)
}
