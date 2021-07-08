<!-- markdownlint-disable MD004 MD007 MD010 MD041 MD022 MD024 MD029 MD031 MD032 MD036 -->
# correl-range

*correlated variable monte carlo simulations*

• [Example](#example) • [API](#api) • [Notes](#notes) • [License](#license)

## Example

```javascript
import SIM from '../sim.js'

const stats = SIM(
({N,L,W,U})=>{
// initiation ran once
const fixed$ = L(500_000, 650_000, 'demand', 0.5, 'price'),
			month$ = L(5_000, 7_000, 'demand', 0.5, 'season', 0.5),
			months = L(6, 9, 'season', 0.5, 'price', -0.5)
return ()=>{
// calculations on every iterations
const total$ = fixed$ + month$ * months
return {
// exported results
	months,
	total$
}}}
).run(10_000).stats

console.log('total$ range', stats.total$.Q(0.25).toFixed(0), stats.total$.Q(0.75).toFixed(0))
console.log('correlation', stats.total$.cor('months'))
```

## API

### sim( factory, {confidence=0.5, resolution=128} ).run( N=25_000 ) ⇒ simulation

* *factory*: `({N, L, W, U}) => model` where N, L, W and D are *randomVariableFactory*
* *randomVariableFactory*: `(low, high, ...correlation) => randomVariable` to match the simulation confidence interval
  * N: normal
  * L: lognormal
  * W: weibull
  * U: uniform
* *randomVariable*: with `.valueOf()` that changes on each iteration
* *simulation*
  * *stats*: empirical distribution cdf, pdf, quantiles, average (based on modules `sample-distribution` and `lazy-stats`)

## Notes
1. use case is human approximation in decision making - "guesstimates"
2. default is to use a confidence interval of 50% (IQR)
  * familiarity with box plots
  * minimizes overconfidence
  * 50% is also conservative approximation of the median min and max of 3 occurences (`2^(1-1/n)-1=59%` for n=3). This is in line with studies showing ~50% confidence range when asked to provide ~60% confidence. Actual overconfidence varies between studies but is always present.
3. variables can be correlated with independent risk factors by providing the linear factor
4. to maintain correlation, each variable returns a single value per cycle - random variables are constant within a given cycle

# License

[MIT](http://www.opensource.org/licenses/MIT) © [Hugo Villeneuve](https://github.com/hville)
