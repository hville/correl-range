/**
 * @typedef {Array|Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array} ArrayLike
 */
import Stats from './_stats.js'
import icdf from 'norm-dist/icdf-voutier.js'

function random(dim) {
	const zs = dim.length ? dim : new Float64Array(dim)
	return function() {
		for (let i=0; i<zs.length; ++i) zs[i] = icdf(Math.random())
		return zs
	}
}

export default class Sim {
	constructor(rndNs, risks, model, resolution) {
		const point = model(),
					names = Object.keys( point )
		this.names = names
		this.risks = risks
		this.rndNs = rndNs
		this.model = model
		this.stats = new Stats( names, resolution )

		/**
		 * single run with given Z inputs
		 * @param {ArrayLike<number>} zs
 		 * @return {Object}
		 */
		this.one = Function('zs',
			`for (const rn of this.rndNs) rn.update(zs);const o=this.model();${
			names.filter( n => typeof point[n] !== 'number')
				.map( n => `o['${n}']=o['${n}'].value`)
				.join(';')
			};return o`
		)

		/**
		 * N runs compressed into empirical sample distributions
		 * TODO allow context parameter as input to the loop function for chaining/spreadsheets
		 * @param {number} N number of runs
		 * @param {()=>ArrayLike<number>)} [sampler] source of Z inputs
		 * @param {number} [dim] empirical distribution points
 		 * @return {Object}
		 */
		this.run = Function(
		/* binded    */'random', 'moments',
		/* arguments */'N=25000', 'sampler=random(this.risks.length)','dim',
		/* javascrip */`const stats = this.stats;
			for (let i=0; i<N; ++i) {
				const zs = sampler();
				for (const rn of this.rndNs) rn.update(zs);
				const o=this.model();
				moments.push(${
					this.names.map(
						(n,i) => typeof point[n] === 'number' ? `o['${n}']` : `o['${n}'].value`
					).join(',')
				});${
					this.names.map(
						n => typeof point[n] === 'number' ? `stats['${n}'].push(o['${n}'])` : `stats['${n}'].push(o['${n}'].value)`
					).join(';')
				}
			}
			return this`
		).bind(this, random, Stats.momentsOf(this.stats))
	}

	all(iterations, sampler=random(this.risks.length)) {
		const TypedArray = Float32Array, //all Float32Array for now
					BYTES_PER_SET = TypedArray.BYTES_PER_ELEMENT * this.names.length,
					buffer = typeof iterations === 'number' ? new ArrayBuffer(BYTES_PER_SET * iterations) : iterations.buffer || iterations

		let offset = iterations.byteOffset || 0

		const size = Math.floor( ( buffer.byteLength - offset ) / BYTES_PER_SET ),
					results = {}

		for (const name of this.names) {
			results[name] = new TypedArray( buffer, offset, size )
			offset += size * TypedArray.BYTES_PER_ELEMENT
		}

		for (let i=0; i<size; ++i) {
			const zs = sampler()
			for (const rnd of this.rndNs) rnd.update(zs)
			const sample = this.model()
			for (const name of this.names) results[name][i] = +sample[name] // +important to trigger RandomNumber.valueOf()
		}
		return results
	}

	get buffer() {
		return Stats.bufferOf(this.stats)
	}
}
