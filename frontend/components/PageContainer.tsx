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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight text-[#2c2f31] mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>{title}</h1>
                <p className="text-[#595c5e] text-[15px]">{description}</p>
            </motion.div>
            
            {children}
        </div>
    );
}
