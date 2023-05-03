import SIM from '../sim.js'

const res = SIM(
({N,L,W,U},
// initiation ran once
fixed$ = L(500_000, 650_000, 'demand', 0.5, 'price'),
month$ = L(5_000, 7_000, 'demand', 0.5, 'season', 0.5),
months = L(6, 9, 'season', 0.5, 'price', -0.5)
)=>(
// calculations on every iterations
total$ = fixed$ + month$ * months
)=>({
// exported results
months,
total$
})
).run(10_000)

const stats=res.stats
console.log('total$ range', stats.total$.Q(0.25).toFixed(0), stats.total$.Q(0.75).toFixed(0))
console.log('months range', stats.months.Q(0.25).toFixed(4), stats.months.Q(0.75).toFixed(4))
console.log('correlation', res.cor('total$','months'))
