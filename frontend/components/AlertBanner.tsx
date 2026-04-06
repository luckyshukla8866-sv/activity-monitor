import { motion } from 'framer-motion';

interface Props {
    severity: 'high' | 'medium' | 'low';
    message: string;
}

const CONFIG = {
    high: {
        icon: 'error',
        bg: 'bg-error-container/20',
        border: 'border-error/20',
        text: 'text-error',
        animation: 'animate-pulse shadow-[0_0_8px_rgba(179,27,37,0.15)]',
    },
    medium: {
        icon: 'warning',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-600',
        animation: '',
    },
    low: {
        icon: 'info',
        bg: 'bg-primary-container/20',
        border: 'border-primary/20',
        text: 'text-primary',
        animation: '',
    },
};

export default function AlertBanner({ severity, message }: Props) {
    const config = CONFIG[severity] || CONFIG.low;

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-4 p-4 rounded-[1rem] border ${config.bg} ${config.border} ${config.animation}`}
        >
            <span className={`material-symbols-outlined mt-0.5 shrink-0 ${config.text}`} style={{fontVariationSettings: "'FILL' 1"}}>{config.icon}</span>
            <p className={`text-sm leading-relaxed font-medium ${config.text}`}>{message}</p>
        </motion.div>
    );
}
