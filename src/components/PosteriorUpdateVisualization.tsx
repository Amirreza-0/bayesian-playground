import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Quick helper to draw two overlapping distributions to represent Prior * Likelihood ∝ Posterior
interface Props {
    priorMu: number;
    priorSigma: number;
    dataMu: number;
    dataSigma: number;
}

export function PosteriorUpdateVisualization({ priorMu, priorSigma, dataMu, dataSigma }: Props) {
    // Calculate exact analytical posterior for normal-normal conjugate model
    const posteriorVar = 1 / (1 / (priorSigma ** 2) + 1 / (dataSigma ** 2));
    const posteriorSigma = Math.sqrt(posteriorVar);
    const posteriorMu = posteriorVar * ((priorMu / (priorSigma ** 2)) + (dataMu / (dataSigma ** 2)));

    const getPath = (mu: number, sigma: number) => {
        const minX = -10; const maxX = 10; const points = 100;
        const step = (maxX - minX) / points;

        const pdf = (x: number) => {
            const coef = 1 / (Math.max(sigma, 0.1) * Math.sqrt(2 * Math.PI));
            const exp = -0.5 * Math.pow((x - mu) / Math.max(sigma, 0.1), 2);
            return coef * Math.exp(exp);
        };

        let d = "";
        for (let i = 0; i <= points; i++) {
            const x = minX + i * step;
            const y = pdf(x);
            const svgX = ((x - minX) / (maxX - minX)) * 800;
            const svgY = 400 - (y * 400);
            if (i === 0) d += `M ${svgX} ${svgY} `;
            else d += `L ${svgX} ${svgY} `;
        }
        d += `L 800 400 L 0 400 Z`;
        return d;
    };

    const pathPrior = useMemo(() => getPath(priorMu, priorSigma), [priorMu, priorSigma]);
    const pathLikelihood = useMemo(() => getPath(dataMu, dataSigma), [dataMu, dataSigma]);
    const pathPosterior = useMemo(() => getPath(posteriorMu, posteriorSigma), [posteriorMu, posteriorSigma]);

    return (
        <div className="relative w-full aspect-[2/1] bg-slate-50/50 mt-4 rounded-xl overflow-hidden border border-slate-200 flex flex-col items-center justify-end">
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/80 p-3 rounded-lg border border-slate-200 shadow-sm z-20 space-y-2 backdrop-blur-md text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="font-medium text-slate-700">Prior (Belief)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div><span className="font-medium text-slate-700">Likelihood (Data)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="font-medium text-slate-900">Posterior (Updated)</span></div>
            </div>

            <svg viewBox="0 0 800 400" className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none">
                {/* Prior Path */}
                <motion.path d={pathPrior} initial={false} animate={{ d: pathPrior }} transition={{ type: "spring", bounce: 0 }}
                    fill="none" strokeWidth="2" strokeDasharray="6 6" className="text-blue-400 stroke-current"
                />
                {/* Likelihood (Data) Path */}
                <motion.path d={pathLikelihood} initial={false} animate={{ d: pathLikelihood }} transition={{ type: "spring", bounce: 0 }}
                    fill="none" strokeWidth="2" className="text-slate-400 stroke-current"
                />
                {/* Posterior Path */}
                <motion.path d={pathPosterior} initial={false} animate={{ d: pathPosterior }} transition={{ type: "spring", bounce: 0 }}
                    fill="url(#grad-post)" strokeWidth="3" className="text-indigo-600 stroke-current"
                />
                <defs>
                    <linearGradient id="grad-post" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" className="text-indigo-500" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-indigo-50" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
