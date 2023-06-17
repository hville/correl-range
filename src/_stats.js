
import SampleDistribution from 'sample-distribution'
import LazyStats from 'lazy-stats'
import nextView from '@hugov/byte-views'

export default class Stats {
	static bufferOf(instance) { return instance[Symbol.for('buffer')] }
	static momentsOf(instance) { return instance[Symbol.for('moments')] }
	/**
	 * @param { [string] } names
	 * @param { number|ArrayBuffer } resolution
	 */
	constructor(names, resolution) {
		const dim = names.length,
					lazyLength = (dim+1)*(dim+2)/2,
					indexOf = Object.fromEntries( names.map( (n,i) => [n,i] ) ),
					buffer = resolution instanceof ArrayBuffer ? resolution : new ArrayBuffer( (lazyLength + dim*resolution*2) * 64 ),
					res2 = Math.floor( (buffer.byteLength/64 - lazyLength)/dim )
		let view = nextView(buffer, Float64Array, lazyLength)
		const moments = new LazyStats( view )

		for (let i=0; i<dim; ++i) {
			view = nextView(view, Float64Array, res2)
			const stat = this[names[i]] = new SampleDistribution( view )
			stat.ave = () => moments.ave( i )
			stat.dev = () => moments.dev( i )
			stat.var = () => moments.var( i )
			stat.cov = (b) => moments.cov( i, indexOf[b] )
			stat.cor = (b) => moments.cor( i, indexOf[b] )
			stat.slope = (b) => moments.slope( i, indexOf[b] )
			stat.intercept = (b) => moments.intercept( i, indexOf[b] )
		}

		this[Symbol.for('buffer')] = buffer
		this[Symbol.for('moments')] = moments
	}
	push(sample) {
		this[Symbol.for('moments')].push(Object.values(sample))
		for (const n of Object.keys(this)) this[n].push(sample[n])
		return this
	}
}
