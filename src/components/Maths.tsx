import { InlineMath as KatexInline, BlockMath as KatexBlock } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathProps {
    math: string;
    className?: string;
}

/** Renders a LaTeX expression inline (within text flow). */
export function InlineMath({ math, className }: MathProps) {
    return (
        <span className={className}>
            <KatexInline math={math} />
        </span>
    );
}

/** Renders a LaTeX expression as a centered display block. */
export function BlockMath({ math, className }: MathProps) {
    return (
        <div className={`py-3 overflow-x-auto ${className ?? ''}`}>
            <KatexBlock math={math} />
        </div>
    );
}
