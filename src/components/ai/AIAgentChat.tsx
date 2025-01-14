'use client';

import { Card, CardBody, Input, Button } from "@nextui-org/react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Message {
	id: string;
	content: string;
	type: 'user' | 'agent';
	timestamp: string;
}

interface AIAgentChatProps {
	agentType: 'portfolio' | 'news' | 'technical';
	title: string;
	description: string;
}

export function AIAgentChat({ agentType, title, description }: AIAgentChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Initial animation for chat container
		gsap.from(".chat-container", {
			opacity: 0,
			y: 20,
			duration: 0.5,
			ease: "power2.out"
		});

		// Animate description text
		gsap.from(".chat-description", {
			opacity: 0,
			y: 10,
			duration: 0.5,
			delay: 0.2,
			ease: "power2.out"
		});
	}, []);

	useEffect(() => {
		// Animate new messages
		if (messages.length > 0) {
			gsap.from(".message-new", {
				opacity: 0,
				x: messages[messages.length - 1].type === 'user' ? 20 : -20,
				duration: 0.3,
				ease: "power2.out"
			});
			
			// Scroll to bottom
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSubmit = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content: input,
			type: 'user',
			timestamp: new Date().toISOString()
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			const response = await fetch(`/api/ai/${agentType}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: input })
			});

			const data = await response.json();

			const agentMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: data.response,
				type: 'agent',
				timestamp: new Date().toISOString()
			};

			setMessages(prev => [...prev, agentMessage]);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="chat-container bg-white dark:bg-primary shadow-lg h-full">
			<CardBody className="flex flex-col h-full">
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-text-primary dark:text-white">{title}</h3>
					<p className="text-text-secondary chat-description">{description}</p>
				</div>

				<div className="flex-grow overflow-y-auto space-y-4 mb-4">
					{messages.map((message, index) => (
						<div
							key={message.id}
							className={`p-3 rounded-lg ${
								message.type === 'user'
									? 'bg-secondary/10 ml-auto'
									: 'bg-gray-light dark:bg-gray-dark mr-auto'
							} max-w-[80%] ${index === messages.length - 1 ? 'message-new' : ''}`}
						>
							<p className="text-sm text-text-primary dark:text-white">{message.content}</p>
							<span className="text-xs text-text-secondary">
								{new Date(message.timestamp).toLocaleTimeString()}
							</span>
						</div>
					))}
					{isLoading && (
						<div className="flex items-center space-x-2 text-text-secondary">
							<div className="animate-pulse">Thinking...</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask your question..."
						onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
						className="bg-gray-light dark:bg-gray-dark text-text-primary dark:text-white"
					/>
					<Button
						color="secondary"
						isLoading={isLoading}
						onPress={handleSubmit}
						className="bg-secondary hover:bg-secondary/90 text-white"
					>
						Send
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}