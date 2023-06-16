import {Stats} from '../sim.js'

const o3 = { valueOf: () => 3 },
			v2 = 2,
			oR = { valueOf: () => Math.random() },
			sample = {o3, v2, oR},
			names = Object.keys(sample)

const stats = new Stats (Object.keys(sample), 8)
stats.push(sample)

console.log(names.map( n => stats[n].ave()), names.map( n => stats[n].E ), names.map( n => +sample[n]) )
