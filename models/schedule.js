import SIM from '../sim.js'

const tst = ({a,b},)=>3

const stats = SIM(
({N,L,W,U,G}, // initiation ran once
people = G(5, 9, 'work', 0.5, 'team', 0.5),
office = G(4, 8),
design = G(8,12, 'team', -0.5),
tender = G(4, 8, 'work', 0.5),
deliver= G(8,12, 'work')
)=>( // calculations on every iterations

)=>({ // exported results
duration: Math.max(people, office) + design + tender + deliver
})
).run(10_000).stats

console.log('duration range', stats.duration.Q(0.25).toFixed(0), stats.duration.Q(0.75).toFixed(0))
