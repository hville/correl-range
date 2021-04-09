export default class RandomNumber {
	constructor(fz) {
		this._fz = fz
		this._ks = []
		this._ws = []
		this.value = NaN
	}
	valueOf() {
		return this.value
	}
	update(zs) {
		let v = 0
		for (var i=0; i<this._ks.length; ++i) v += this._ws[i] * zs[this._ks[i]]
		this.value = this._fz(v)
		return this
	}
	_link(risks, links) {
		const ks = this._ks,
					ws = this._ws
		let Δ = 1,
				i = 0,
				m = links.length%2 ? links.length-1 : links.length
		while(i<m) {
			ks[ks.length] = riskIndex( risks, links[i++] )
			const w = links[i++]
			Δ -= (ws[ws.length] = w < 1 ? w : 100*w)**2
			if (Δ < -Number.EPSILON) throw Error('sum of squared weights > 1')
		}
		// only bother is there is some weight to be assigned
		if (Δ > Number.EPSILON) {
			ks[ks.length] = riskIndex( risks, links[i] )
			ws[ws.length] = Math.sqrt( Δ )
		}
		return this
	}
}
function riskIndex(risks, itm) {
	let idx = risks.indexOf(itm)
	return idx !== -1 ? idx : risks.push(itm ?? '') - 1
}
