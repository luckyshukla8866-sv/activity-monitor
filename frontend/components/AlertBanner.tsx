import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    severity: 'high' | 'medium' | 'low';
    message: string;
}

const CONFIG = {
    high: {
        icon: XCircle,
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/50',
        text: 'text-rose-400',
        animation: 'animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    },
    medium: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        animation: '',
    },
    low: {
        icon: Info,
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        text: 'text-sky-400',
        animation: '',
    },
};

export default function AlertBanner({ severity, message }: Props) {
    const config = CONFIG[severity] || CONFIG.low;
    const Icon = config.icon;

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-md ${config.bg} ${config.border} ${config.animation}`}
        >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.text}`} />
            <p className={`text-sm leading-relaxed ${config.text} drop-shadow-sm`}>{message}</p>
        </motion.div>
    );
}
