'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export default function NavigationBar() {
	const { isLoaded, isSignedIn } = useUser();
	const pathname = usePathname();

	useEffect(() => {
		gsap.from(".nav-item", {
			opacity: 0,
			y: -20,
			duration: 0.5,
			stagger: 0.1,
			ease: "power2.out"
		});
	}, []);

	const navItems = [
		{ name: 'Portfolio', href: '/' },
		{ name: 'Market', href: '/market' },
		{ name: 'Risk Analysis', href: '/risk' },
	];

	return (
		<Navbar 
			className="bg-white/5 backdrop-blur-lg border-b border-white/10"
			maxWidth="full"
		>
			<NavbarBrand>
				<Link href="/" className="font-bold text-white text-xl">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="flex items-center gap-2"
					>
						<div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
							FT
						</div>
						FinTrack
					</motion.div>
				</Link>
			</NavbarBrand>

			<NavbarContent className="hidden sm:flex gap-4" justify="center">
				{navItems.map((item) => (
					<NavbarItem 
						key={item.href} 
						isActive={pathname === item.href}
						className="nav-item"
					>
						<Link 
							href={item.href} 
							className={`text-sm ${pathname === item.href 
								? 'text-white font-medium' 
								: 'text-white/60 hover:text-white transition-colors'}`}
						>
							{item.name}
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>

			<NavbarContent justify="end">
				{!isLoaded ? (
					<div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
				) : isSignedIn ? (
					<UserButton 
						appearance={{
							elements: {
								avatarBox: "h-8 w-8",
								userButtonPopoverCard: "bg-white/10 backdrop-blur-lg border border-white/20",
								userButtonPopoverText: "text-white",
								userButtonPopoverActionButton: "text-white hover:text-white/80",
								userButtonPopoverActionButtonText: "text-white",
								userButtonPopoverFooter: "hidden"
							}
						}}
					/>
				) : (
					<SignInButton mode="modal">
						<Button
							className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
							variant="flat"
						>
							Sign In
						</Button>
					</SignInButton>
				)}
			</NavbarContent>
		</Navbar>
	);
}