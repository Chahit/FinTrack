'use client';

import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox } from "@nextui-org/react";
import { useState } from "react";

interface ShareData {
	portfolioValue?: boolean;
	performanceMetrics?: boolean;
	assetAllocation?: boolean;
	customMessage: string;
}

export function ShareComponent({ 
	portfolioValue,
	performanceChange,
	topAssets
}: { 
	portfolioValue: number;
	performanceChange: number;
	topAssets: string[];
}) {
	const {isOpen, onOpen, onClose} = useDisclosure();
	const [shareData, setShareData] = useState<ShareData>({
		portfolioValue: false,
		performanceMetrics: true,
		assetAllocation: false,
		customMessage: ''
	});

	const handleShare = (platform: 'twitter' | 'linkedin') => {
		let shareText = 'Check out my investment portfolio on FinTrack! 📈\n\n';
		
		if (shareData.performanceMetrics) {
			shareText += `Portfolio Performance: ${performanceChange >= 0 ? '+' : ''}${performanceChange}%\n`;
		}
		
		if (shareData.portfolioValue) {
			shareText += `Total Value: $${portfolioValue.toLocaleString()}\n`;
		}
		
		if (shareData.assetAllocation && topAssets.length > 0) {
			shareText += `Top Assets: ${topAssets.join(', ')}\n`;
		}

		const encodedText = encodeURIComponent(shareText);
		
		const urls = {
			twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedText}`
		};

		window.open(urls[platform], '_blank');
		onClose();
	};

	return (
		<>
			<Button 
				color="primary"
				variant="ghost"
				onPress={onOpen}
			>
				Share Portfolio
			</Button>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalContent>
					<ModalHeader>Share Your Portfolio</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<div className="space-y-2">
								<Checkbox
									isSelected={shareData.performanceMetrics}
									onValueChange={(checked) => setShareData(prev => ({ ...prev, performanceMetrics: checked }))}
								>
									Include Performance Metrics
								</Checkbox>
								<Checkbox
									isSelected={shareData.portfolioValue}
									onValueChange={(checked) => setShareData(prev => ({ ...prev, portfolioValue: checked }))}
								>
									Include Portfolio Value
								</Checkbox>
								<Checkbox
									isSelected={shareData.assetAllocation}
									onValueChange={(checked) => setShareData(prev => ({ ...prev, assetAllocation: checked }))}
								>
									Include Top Assets
								</Checkbox>
							</div>

							<div className="flex gap-2">
								<Button
									color="primary"
									variant="flat"
									onPress={() => handleShare('twitter')}
								>
									Share on Twitter
								</Button>
								<Button
									color="primary"
									variant="flat"
									onPress={() => handleShare('linkedin')}
								>
									Share on LinkedIn
								</Button>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}