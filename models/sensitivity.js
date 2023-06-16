/*
TESTING LINEAR SENSITIVITY - Covariance, One at a time, Elementary Effects
*/
import SIM from '../sim.js'

const sim = SIM(
({N,L,W,U,G}, // initiation ran once
f1 = N(0,1),
f2 = U(0,1)
)=>( // calculations on every iterations
)=>({ // exported results
	f1,f2,
	exp11: (f1**1) * (f2**1),
	exp21: (f1**2) * (f2**1),
	exp12: (f1**1) * (f2**2),
	exp22: (f1**2) * (f2**2),
	exp02: f2**2
})
)

const res = sim.run(100_000)
const stats = res.stats
const format = n => n.toFixed(2).padStart(5)

Object.keys(stats).forEach( (n,i) => console.log(
	n.padEnd(8),
	`IQR: ${ format(res.stats[n].Q(0.25)) } ${	format(res.stats[n].Q(0.75)) }  `
))
console.log(`==> oat this gives the slope to the underlying 'hidden' risk factors, not the output value. Also, named correlated factors hange the order and index of the factors
d(exp11)/df1: d(f1**1 * f2**1)/df1 = f2 :: 0.5 vs slope of ${ stats.exp11.slope('f1') }
d(exp21)/df1: d(f1**2 * f2**1)/df1 = 2f1*f2 = 2*exp11 :: ${ 2*stats.exp11.ave() } vs slope of ${ stats.exp21.slope('f1') }
d(exp12)/df1: d(f1**1 * f2**2)/df1 = f2**2 = exp02 :: ${ stats.exp02.ave() } vs slope of ${ stats.exp12.slope('f1') }
d(exp22)/df1: d(f1**2 * f2**2)/df1 = 2f1*f2**2 = 2*exp12:: ${ 2*stats.exp12.ave() } vs slope of ${ stats.exp22.slope('f1') }
d(exp02)/df2: 2f2 :: 1 vs slope of ${ stats.exp02.slope('f2') }
`)

