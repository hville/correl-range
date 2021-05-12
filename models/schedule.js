import SIM from '../sim.js'

const tst = ({a,b},)=>3

const stats = SIM(
({N,L,W,U}, // initiation ran once
people = L(5, 9, 'work', 0.5, 'team', 0.5),
office = L(4, 8),
design = L(8,12, 'team', -0.5),
tender = L(4, 8, 'work', 0.5),
deliver= L(8,12, 'work')
)=>( // calculations on every iterations

)=>({ // exported results
duration: Math.max(people, office) + design + tender + deliver
})
).run(10_000).stats

console.log('duration range', stats.duration.Q(0.25).toFixed(0), stats.duration.Q(0.75).toFixed(0))
