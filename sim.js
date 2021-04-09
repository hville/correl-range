import N from 'grosso-modo/norm.js'
import L from 'grosso-modo/logn.js'
import D from 'grosso-modo/dice.js'
import U from 'grosso-modo/uniform.js'
import W from 'grosso-modo/weibull.js'

import RandomNumber from './src/_random-number.js'
import Sim from './src/_sim.js'

export default function( factory, confidence=0.5 ) {
	const	risks = [],
				rndNs = [],
				conf = confidence <= 1 ? confidence : Math.pow(2, 1 - 1/confidence) - 1,
				rndFs = {}
	let init = false
	for (const [key,fcn] of Object.entries({ N, L, D, U, W })) {
		rndFs[key] = (low, top, ...args) => {
			if (init) throw Error('distribution definition must be at initiation')
			return rndNs[rndNs.length] = new RandomNumber(fcn(low, top, conf))._link(risks, args)
		}
	}
	const model = factory(rndFs)
	init = true
	return new Sim(rndNs, risks, model)
}
