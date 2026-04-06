import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
    title: string;
    description: string;
    children: ReactNode;
}

export default function PageContainer({ title, description, children }: Props) {
    return (
        <div className="max-w-[1200px] w-full mx-auto pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight text-[#1a1d21] mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>{title}</h1>
                <p className="text-[#6b7280] text-[15px]">{description}</p>
            </motion.div>
            
            {children}
        </div>
    );
}
