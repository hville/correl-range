/**
 * @typedef {Array|Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array} ArrayLike
 */
import { random, permute } from '../samplers.js'
import {shuffle as shfl} from 'array-order'
import SampleDistribution from 'sample-distribution'
import LazyStats from 'lazy-stats'
import {fillZ} from './utils.js'

//TODO test sensitivity oat and ee
export default class Sim {
	constructor(rndNs, risks, model, resolution) {
		const point = model()

		this.risks = risks
		this.rndNs = rndNs
		this.model = model
		const names = this.names = Object.keys( point )
		this._moments = new LazyStats(names.length)
		this.stats = {}
		for (let i=0; i<this.names.length; ++i) {
			const stat = this.stats[names[i]] = new SampleDistribution(resolution)
			stat.ave = () => this._moments.ave(i)
			stat.dev = () => this._moments.dev(i)
			stat.var = () => this._moments.var(i)
			stat.cov = name => this._moments.cov(i, names.indexOf(name))
			stat.cor = name => this._moments.cor(i, names.indexOf(name))
		}

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
		 * @param {number} N number of runs
		 * @param {()=>ArrayLike<number>)} [sampler] source of Z inputs
		 * @param {number} [dim] empirical distribution points
 		 * @return {Object}
		 */
		this.run = Function(
		/* binded    */'random',
		// TODO if N.length add results in views?
		/* arguments */'N=25000', 'sampler=random(this.risks.length)','dim',
		/* javascrip */`const stats = this.stats;
			for (let i=0; i<N; ++i) {
				const zs = sampler();
				for (const rn of this.rndNs) rn.update(zs);
				const o=this.model();
				this._moments.push(${
					names.map(
						(n,i) => typeof point[n] === 'number' ? `o['${n}']` : `o['${n}'].value`
					).join(',')
				});${
					names.map(
						n => typeof point[n] === 'number' ? `stats['${n}'].push(o['${n}'])` : `stats['${n}'].push(o['${n}'].value)`
					).join(';')
				}
			}
			return this`
		).bind(this, random)
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

		//TODO optimize push(...,size,sampler,result).bind(rndNs,model)
		for (let i=0; i<size; ++i) {
			const zs = sampler()
			for (const rnd of this.rndNs) rnd.update(zs)
			const sample = this.model()
			for (const name of this.names) results[name][i] = +sample[name] // +important to trigger RandomNumber.valueOf()
		}
		return results
	}
	//one-at-a-time (OAT) Δy = y(z) - y(-z)
	oat() {
		const zs = new Float64Array(this.risks.length),
					z = 0.67448, // === Q(0.75) === -Q(0.25)
					dyzs = {},
					data0 = this.one(zs)
		for (const n of this.names) dyzs[n] = []
		for (let i=0; i<this.risks.length; ++i) {
			zs[i] = z
			for (const [n,v] of Object.entries(this.one(zs))) dyzs[n][i] = [+v, 0]
			zs[i] = -z
			for (const [n,v] of Object.entries(this.one(zs))) {
				const dyp = dyzs[n][i][0] - data0[n],
							dym = data0[n] - v
				dyzs[n][i][0] = (dyp + dym) / z / 2
				dyzs[n][i][1] = ( Math.abs(dyp) + Math.abs(dym) ) / z / 2
			}
			zs[i] = 0
		}
		return dyzs
	}
	//elementary effects - EE (morris[1991])
	ee(hp=2 /* half p */) {
		//divide in p=2*hp intervals and get icdf
		const	p = 2*hp,
					ps = fillZ(Array(p)),
					Δa = ps[hp]-ps[0],
					k = this.risks.length, //number of inputs
					zs = Array(k + p - k%p).fill(0), //a little bigger to include same number of intervals
					r = Math.min( Math.floor( (p**k)/(k+1) ), 60 ), //best is 50 or 60, less if median was used
					ee = {}
		for (let i=0; i<zs.length; ++i) zs[i] = ps[i%p]
		const sampler = permute( shfl(zs) ) //permute found to have the least variance and converges well
		for (const n of this.names) ee[n] = this.risks.map( () => [0,0] ) //sum, suma
		for (let i=0; i<r; ++i) {
			// new trajectory
			let point0 = this.one(sampler())
			for (let j=0; j<k; ++j) {
				const Δ = zs[j]<.5 ? Δa : -Δa
				zs[j] += Δ
				let point1 = this.one(zs)
				for (const n of this.names) {
					const dy = (point1[n] - point0[n]) / Δ
					ee[n][j][0] += dy
					ee[n][j][1] += Math.abs(dy)
				}
				point0 = point1
			}
			// flip the tail end too
			for (let j=k; j<zs.length; ++j) zs[j] += zs[j]<.5 ? Δa : -Δa
		}
		for (const n of this.names) for (const sum of ee[n]) {
			sum[0] /= r
			sum[1] /= r
		}
		return ee
	}
}
