
import SampleDistribution from 'sample-distribution'
import LazyStats from 'lazy-stats'
import nextView from '@hugov/byte-views'

export default class Stats {
	constructor(names, resolution) {
		const dim = names.length,
					lazyLength = (dim+1)*(dim+2)/2
		this.data = resolution.buffer ? resolution : new Float64Array( lazyLength + dim*resolution*2 )
		this.stats = {}
		let view = nextView(this.data.buffer, Float64Array, lazyLength)
		this._moments = new LazyStats( view )
		for (let i=0; i<dim; ++i) {
			view = nextView(view, Float64Array, resolution*2)
			const stat = this.stats[names[i]] = new SampleDistribution( view )
		}
		this.ave = (a) => this._moments.ave(names.indexOf(a))
		this.dev = (a) => this._moments.dev(names.indexOf(a))
		this.var = (a) => this._moments.var(names.indexOf(a))
		this.cov = (a,b) => this._moments.cov(names.indexOf(a), names.indexOf(b))
		this.cor = (a,b) => this._moments.cor(names.indexOf(a), names.indexOf(b))
		this.slope = (a,b) => this._moments.slope(names.indexOf(a), names.indexOf(b))
		this.intercept = (a,b) => this._moments.intercept(names.indexOf(a), names.indexOf(b))
	}

	//push(res) {

			/*
	this._moments.push(...values)
	stats[name0].push(value0)
	stats[name1].push(value1)
	stats[name2].push(value2)
	*/
}
