import SIM from '../sim.js'

const tst = ({a,b},)=>3

const stats = SIM(
({N,L,W,U}, // initiation ran once
costs={
	excavation: L(5,8),
	foundation: L(10,15),
	structure: L(20,25),
	roof: L(5,8),
	exterior: L(30,50),
	interior: L(20,30)
},
items=Object.keys(costs),
sum = costs => {
	let tot = 0
	for (const itm of items) tot += costs[itm]
	return tot
}
)=>( // calculations on every iterations
)=>({ // exported results
estimate: sum(costs)
})
).run(10_000).stats

console.log('estimate range', stats.estimate.Q(0.25).toFixed(0), stats.estimate.Q(0.75).toFixed(0))
