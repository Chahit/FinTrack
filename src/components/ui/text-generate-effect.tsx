"use client";
import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export const TextGenerateEffect = ({
	words,
	className = "",
}: {
	words: string;
	className?: string;
}) => {
	const controls = useAnimation();

	useEffect(() => {
		controls.start({
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		});

		// Add text color animation
		const textElements = document.querySelectorAll('.text-generate');
		textElements.forEach((element) => {
			element.classList.add('text-text-primary', 'dark:text-white');
		});
	}, [controls]);

	return (
		<motion.div
			className={`text-generate ${className}`}
			initial={{ opacity: 0 }}
			animate={controls}
		>
			{words}
		</motion.div>
	);
};