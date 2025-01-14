'use client';

import { Card, CardBody, CardHeader, Tab, Tabs } from "@nextui-org/react";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const articles = [
	{
		title: "Understanding Portfolio Diversification",
		summary: "Learn why and how to diversify your investment portfolio effectively",
		readTime: 5,
		category: "basics"
	},
	{
		title: "Technical Analysis Fundamentals",
		summary: "Master the basics of technical analysis for better trading decisions",
		readTime: 10,
		category: "advanced"
	},
	{
		title: "Risk Management Strategies",
		summary: "Essential strategies to manage and mitigate investment risks",
		readTime: 8,
		category: "strategies"
	}
];

const videos = [
	{
		title: "Getting Started with FinTrack",
		description: "A comprehensive guide to using the FinTrack platform",
		duration: "5:30",
		thumbnail: "/thumbnails/getting-started.jpg"
	},
	{
		title: "Advanced Trading Techniques",
		description: "Learn professional trading strategies and techniques",
		duration: "10:15",
		thumbnail: "/thumbnails/advanced-trading.jpg"
	}
];

const guides = [
	{
		title: "Beginner's Guide to Investing",
		steps: [
			"Understanding Market Basics",
			"Creating Your First Portfolio",
			"Risk Assessment",
			"Setting Investment Goals"
		]
	},
	{
		title: "Advanced Trading Guide",
		steps: [
			"Technical Analysis",
			"Fundamental Analysis",
			"Market Psychology",
			"Risk Management"
		]
	}
];

export function EducationHub() {
	useEffect(() => {
		// Animate title
		gsap.from(".education-title", {
			opacity: 0,
			y: -30,
			duration: 1,
			ease: "power3.out"
		});

		// Animate cards with scroll trigger
		gsap.from(".education-card", {
			scrollTrigger: {
				trigger: ".education-card",
				start: "top bottom-=100",
				toggleActions: "play none none reverse"
			},
			opacity: 0,
			y: 50,
			duration: 0.8,
			stagger: 0.2,
			ease: "power3.out"
		});
	}, []);

	return (
		<div className="min-h-screen bg-bg-light dark:bg-bg-dark p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				<h1 className="education-title text-3xl font-bold text-text-primary dark:text-white mb-8">
					Learning Center
				</h1>

				<Tabs>
					<Tab key="articles" title="Articles">
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{articles.map((article, index) => (
								<Card key={index} className="education-card bg-white dark:bg-primary shadow-lg">
									<CardBody>
										<h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
											{article.title}
										</h3>
										<p className="text-text-secondary mb-4">{article.summary}</p>
										<div className="flex justify-between items-center">
											<span className="text-sm text-text-secondary">
												{article.readTime} min read
											</span>
											<span className="text-sm text-secondary">
												{article.category}
											</span>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					</Tab>

					<Tab key="videos" title="Video Tutorials">
						<div className="grid md:grid-cols-2 gap-6">
							{videos.map((video, index) => (
								<Card key={index} className="education-card bg-white dark:bg-primary shadow-lg">
									<CardBody>
										<div className="aspect-video bg-gray-200 dark:bg-gray-800 mb-4 rounded-lg">
											{/* Video thumbnail placeholder */}
										</div>
										<h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
											{video.title}
										</h3>
										<p className="text-text-secondary mb-4">{video.description}</p>
										<span className="text-sm text-accent">{video.duration}</span>
									</CardBody>
								</Card>
							))}
						</div>
					</Tab>

					<Tab key="guides" title="Interactive Guides">
						<div className="grid md:grid-cols-2 gap-6">
							{guides.map((guide, index) => (
								<Card key={index} className="education-card bg-white dark:bg-primary shadow-lg">
									<CardHeader>
										<h3 className="text-lg font-semibold text-text-primary dark:text-white">
											{guide.title}
										</h3>
									</CardHeader>
									<CardBody>
										<ol className="space-y-4">
											{guide.steps.map((step, stepIndex) => (
												<li key={stepIndex} className="flex items-center space-x-3">
													<span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
														{stepIndex + 1}
													</span>
													<span className="text-text-primary dark:text-white">{step}</span>
												</li>
											))}
										</ol>
									</CardBody>
								</Card>
							))}
						</div>
					</Tab>
				</Tabs>
			</div>
		</div>
	);
}