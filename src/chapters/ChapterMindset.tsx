import { Info, RefreshCw, GitBranch, BarChart2, CheckSquare } from 'lucide-react';
import { InlineMath, BlockMath } from '../components/Maths';
import { CodeBlock } from '../components/CodeBlock';
import { BetaBinomialUpdater } from '../components/BetaBinomialUpdater';

const BAYES_THEOREM_FORMULA = `P(\\theta \\mid D) = \\frac{P(D \\mid \\theta)\\; P(\\theta)}{P(D)}`;
const EVIDENCE_INTEGRAL = `P(D) = \\int P(D \\mid \\theta)\\; P(\\theta)\\; d\\theta`;
const CONJUGATE_NORMAL_MU = `\\mu_{\\text{post}} = \\frac{\\mu_0/\\sigma_0^2 + n\\bar{x}/\\sigma^2}{1/\\sigma_0^2 + n/\\sigma^2}`;
const CONJUGATE_NORMAL_SIGMA = `\\frac{1}{\\sigma_{\\text{post}}^2} = \\frac{1}{\\sigma_0^2} + \\frac{n}{\\sigma^2}`;

const CONJUGATE_SIM_CODE = `import numpy as np

# True parameters
true_mu = 3.2
true_sigma = 1.0

# Prior: mu ~ Normal(mu0=0, sigma0=5)
mu_0, sigma_0 = 0.0, 5.0

# Observe n=20 data points
rng = np.random.default_rng(42)
data = rng.normal(loc=true_mu, scale=true_sigma, size=20)
n, x_bar = len(data), data.mean()

# Conjugate Normal-Normal posterior update (closed form):
# 1/sigma_post^2 = 1/sigma_0^2 + n/sigma^2
sigma_post_sq = 1.0 / (1/sigma_0**2 + n/true_sigma**2)
sigma_post = np.sqrt(sigma_post_sq)

# mu_post = sigma_post^2 * (mu_0/sigma_0^2 + n*x_bar/sigma^2)
mu_post = sigma_post_sq * (mu_0/sigma_0**2 + n*x_bar/true_sigma**2)

print(f"Posterior:  mu = {mu_post:.3f},  sigma = {sigma_post:.3f}")
print(f"True value: mu = {true_mu}")
# Posterior:  mu = 3.170,  sigma = 0.222
# Notice: even with a vague prior (sigma_0=5), 20 data points pull
# the posterior very close to the true value.`;

const GENERATIVE_CODE = `import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)

# ---------- Step 1: Sample parameters from the PRIOR ----------
n_simulations = 1000
log_mu_samples  = rng.normal(0, 1, size=n_simulations)   # log-mean
obs_noise_samples = np.abs(rng.normal(0, 1, size=n_simulations))  # sigma

# ---------- Step 2: For each parameter draw, simulate data ----------
simulated_durations = []
for log_mu, sigma in zip(log_mu_samples, obs_noise_samples):
    # Each simulation produces one "fake" dataset of 80 patients
    fake_data = rng.lognormal(mean=log_mu, sigma=sigma, size=80)
    simulated_durations.append(fake_data.mean())

# ---------- Step 3: Inspect the prior predictive distribution ----------
plt.hist(simulated_durations, bins=50, density=True, alpha=0.7)
plt.xlabel("Simulated mean duration (months)")
plt.title("Prior Predictive: What does our model expect before seeing data?")
plt.axvline(50, color="red", linestyle="--", label="Implausible: 50 months")
plt.legend()
plt.show()

# If you see simulated means > 40 months, your prior is too vague!`;

const CONJUGATE_TABLE = [
    { prior: 'Beta(α, β)', likelihood: 'Bernoulli(p)', posterior: 'Beta(α + successes, β + failures)', use: 'Clinical trial recovery rate' },
    { prior: 'Normal(μ₀, σ₀)', likelihood: 'Normal(μ, σ²) — known σ', posterior: 'Normal(μ_post, σ_post)', use: 'Estimating mean duration (our case)' },
    { prior: 'Gamma(α, β)', likelihood: 'Poisson(λ)', posterior: 'Gamma(α + Σx, β + n)', use: 'Admission rate at hospitals' },
    { prior: 'Dirichlet(α)', likelihood: 'Categorical(p)', posterior: 'Dirichlet(α + counts)', use: 'Symptom category frequencies' },
];

export function ChapterMindset() {
    return (
        <div className="space-y-16 pb-16">

            {/* Intro */}
            <section className="space-y-5">
                <h3 className="text-2xl font-bold text-slate-800">What is Bayesian Inference?</h3>
                <p className="text-[17px] text-slate-600 leading-[1.85]">
                    This guide walks through the full <strong>Bayesian Workflow</strong> using a realistic
                    Long-Covid symptom duration dataset as a running example. Unlike frequentist methods
                    that produce point estimates and p-values, Bayesian inference produces a full
                    <strong> posterior distribution</strong> over every unknown parameter — a complete
                    picture of our uncertainty given the data and prior knowledge.
                </p>
                <div className="p-5 bg-indigo-50/80 rounded-xl border border-indigo-100 text-slate-700 text-[15px] leading-relaxed">
                    <strong>Core insight:</strong> Bayesian inference is about consistently applying the
                    rules of probability to update beliefs. A prior encodes what we know before seeing data;
                    the likelihood scores how well each parameter value explains the data; and the
                    posterior combines both — it is the logically optimal update given our model.
                </div>
            </section>

            {/* Bayes Theorem */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">Bayes' Theorem — The Full Formula</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    Every element of Bayes' theorem has a precise scientific meaning. The denominator —
                    the <em>evidence</em> or <em>marginal likelihood</em> — is what makes exact Bayesian
                    inference intractable for most real problems.
                </p>

                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                    <BlockMath math={BAYES_THEOREM_FORMULA} />
                    <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
                        {[
                            { term: 'P(θ | D)', name: 'Posterior', color: 'indigo', desc: 'Updated belief about θ after observing data D' },
                            { term: 'P(D | θ)', name: 'Likelihood', color: 'blue', desc: 'How probable is D given a specific value of θ?' },
                            { term: 'P(θ)', name: 'Prior', color: 'emerald', desc: 'Our initial belief about θ before any data' },
                            { term: 'P(D)', name: 'Evidence', color: 'amber', desc: 'Normalizing constant — the probability of D under all possible θ' },
                        ].map(c => (
                            <div key={c.name} className={`p-4 rounded-xl bg-${c.color}-50/80 border border-${c.color}-100`}>
                                <div className={`font-mono text-xs mb-2 text-${c.color}-400`}>{c.term}</div>
                                <div className={`font-bold text-${c.color}-800`}>{c.name}</div>
                                <div className={`text-xs text-${c.color}-600/80 mt-2 leading-relaxed`}>{c.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                        <div className="text-sm font-semibold text-amber-800">Why is P(D) intractable?</div>
                        <BlockMath math={EVIDENCE_INTEGRAL} />
                        <p className="text-sm text-slate-600 leading-relaxed">
                            This requires integrating over <em>all possible values of θ</em> — a high-dimensional
                            integral that has no closed form for most models. MCMC bypasses this entirely by
                            sampling proportional to <InlineMath math="P(D|\theta) \cdot P(\theta)" />, never
                            computing <InlineMath math="P(D)" /> explicitly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive: Beta-Binomial Updater */}
            <section className="space-y-5 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">Interactive: Posterior Updating in Action</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    The clearest way to see Bayes' theorem work is with a <strong>conjugate model</strong> where
                    the update is instant and exact. Flip coins, observe clinical trial outcomes, or watch a
                    diagnostic test — every observation sharpens the posterior.
                </p>
                <BetaBinomialUpdater />
            </section>

            {/* Bayesian vs Frequentist */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">Bayesian vs. Frequentist Thinking</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    These are two philosophically distinct frameworks. Neither is universally superior —
                    they answer fundamentally different questions.
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left p-4 font-semibold text-slate-600 w-1/4">Concept</th>
                                <th className="text-left p-4 font-semibold text-blue-600">Frequentist</th>
                                <th className="text-left p-4 font-semibold text-indigo-600">Bayesian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { concept: 'Probability', freq: 'Long-run frequency in repeated experiments', bayes: 'Degree of belief, quantified in [0, 1]' },
                                { concept: 'Parameters', freq: 'Fixed unknown constants — not random variables', bayes: 'Random variables with probability distributions' },
                                { concept: 'Output', freq: 'Point estimate + confidence interval + p-value', bayes: 'Full posterior distribution' },
                                { concept: 'Prior knowledge', freq: 'Not incorporated (or via regularization, ad-hoc)', bayes: 'Explicitly encoded in the prior P(θ)' },
                                { concept: 'Small samples', freq: 'Relies on asymptotic (large n) guarantees', bayes: 'Principled uncertainty even with n < 20' },
                                { concept: 'Interval meaning', freq: '"95% of intervals computed this way contain θ"', bayes: '"P(θ ∈ HDI | data) = 94%"' },
                            ].map((r, i) => (
                                <tr key={r.concept} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <td className="p-4 font-semibold text-slate-700">{r.concept}</td>
                                    <td className="p-4 text-slate-500 text-[13.5px]">{r.freq}</td>
                                    <td className="p-4 text-slate-500 text-[13.5px]">{r.bayes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Generative Model */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">What is a Generative Model?</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    Bayesian models are <strong>generative</strong>: they describe a forward process for
                    how data is created. You can always <em>simulate</em> data from a generative model
                    by sampling parameters from the prior and then sampling data from the likelihood.
                    This is the key to <strong>Prior Predictive Checks</strong> — you simulate whole
                    datasets <em>before</em> seeing any real data to verify the model is scientifically sane.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                    <div className="text-sm font-semibold text-slate-700">The generative process for our Long-Covid model:</div>
                    <div className="space-y-2 text-sm text-slate-600">
                        {[
                            { step: '1', label: 'Sample log-mean from prior', math: '\\log\\mu \\sim \\mathcal{N}(0, 1)' },
                            { step: '2', label: 'Sample noise from prior', math: '\\sigma_{\\text{obs}} \\sim \\text{HalfNormal}(1)' },
                            { step: '3', label: 'Generate patient durations', math: 'x_i \\sim \\text{LogNormal}(\\log\\mu,\\; \\sigma_{\\text{obs}})' },
                        ].map(item => (
                            <div key={item.step} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-slate-100">
                                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-600 text-xs font-medium">{item.label}</span>
                                    <InlineMath math={item.math} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <CodeBlock code={GENERATIVE_CODE} title="Python – Simulating from the Generative Model" />
            </section>

            {/* Conjugate Priors */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">Conjugate Priors — When Math Works Out</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    A <strong>conjugate prior</strong> is one where the prior and posterior belong to the
                    same distribution family. When a conjugate pair exists, the posterior update has a
                    simple closed-form expression — no MCMC needed. For the Normal-Normal case with known
                    likelihood variance:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                        <div className="text-sm font-semibold text-slate-700">Posterior precision (reciprocal variance):</div>
                        <BlockMath math={CONJUGATE_NORMAL_SIGMA} />
                        <p className="text-xs text-slate-500 leading-relaxed">The posterior precision is the sum of prior precision and data precision.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                        <div className="text-sm font-semibold text-slate-700">Posterior mean (precision-weighted average):</div>
                        <BlockMath math={CONJUGATE_NORMAL_MU} />
                        <p className="text-xs text-slate-500 leading-relaxed">The posterior mean is a weighted average of prior mean and sample mean.</p>
                    </div>
                </div>
                <CodeBlock code={CONJUGATE_SIM_CODE} title="Python – Normal-Normal Conjugate Update (Closed Form)" />
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-3 text-left font-semibold text-slate-600">Prior</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Likelihood</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Posterior</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Use case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {CONJUGATE_TABLE.map((r, i) => (
                                <tr key={r.prior} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <td className="p-3 font-mono text-blue-700">{r.prior}</td>
                                    <td className="p-3 font-mono text-amber-700">{r.likelihood}</td>
                                    <td className="p-3 font-mono text-emerald-700">{r.posterior}</td>
                                    <td className="p-3 text-slate-500">{r.use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                    <Info className="shrink-0 text-slate-400 mt-0.5" size={16} />
                    <p className="text-sm text-slate-600">
                        Real models rarely have conjugate forms — parameters interact, likelihoods
                        are non-standard, and models are hierarchical. That is why we use MCMC in
                        PyMC. But understanding conjugate updates builds intuition for what MCMC
                        is approximating.
                    </p>
                </div>
            </section>

            {/* Workflow Loop */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800">The Bayesian Workflow Loop</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">
                    Bayesian modeling is an iterative process, not a single step. Based on Gelman,
                    Vehtari et al. (2020), the workflow cycles through four stages until the model
                    adequately explains the data.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: GitBranch, color: 'blue', label: '1. Define Model', desc: 'Specify priors and likelihood based on domain knowledge. Priors are hypotheses, not arbitrary choices.' },
                        { icon: BarChart2, color: 'purple', label: '2. Prior Predictive', desc: 'Simulate data from the prior alone. Check that generated data is scientifically plausible.' },
                        { icon: RefreshCw, color: 'indigo', label: '3. Fit & Diagnose', desc: 'Run MCMC. Check R̂ < 1.01, ESS > 400, no divergences. Only proceed if diagnostics pass.' },
                        { icon: CheckSquare, color: 'emerald', label: '4. Posterior Predictive', desc: 'Simulate from the posterior. Does the model replicate real data patterns? If not, revise.' },
                    ].map(({ icon: Icon, color, label, desc }) => (
                        <div key={label} className={`p-5 rounded-xl bg-${color}-50/70 border border-${color}-100`}>
                            <Icon className={`text-${color}-500 mb-3`} size={20} />
                            <div className={`font-bold text-${color}-800 text-sm mb-2`}>{label}</div>
                            <div className={`text-xs text-${color}-700/80 leading-relaxed`}>{desc}</div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
