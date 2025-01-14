'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { gsap } from "gsap";

interface AssetFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: AssetFormData) => void;
	initialData?: AssetFormData;
	mode: 'add' | 'edit';
}

export interface AssetFormData {
	symbol: string;
	type: string;
	units: number;
	purchasePrice: number;
}

const assetTypes = [
	{ label: 'Stock', value: 'stock' },
	{ label: 'Cryptocurrency', value: 'crypto' },
	{ label: 'Commodity', value: 'commodity' },
];

export default function AssetForm({ isOpen, onClose, onSubmit, initialData, mode }: AssetFormProps) {
	const [formData, setFormData] = useState<AssetFormData>(initialData || {
		symbol: '',
		type: '',
		units: 0,
		purchasePrice: 0
	});

	useEffect(() => {
		if (isOpen) {
			// Animate form elements when modal opens
			gsap.from(".form-element", {
				opacity: 0,
				y: 20,
				duration: 0.5,
				stagger: 0.1,
				ease: "power2.out",
				delay: 0.2
			});
		}
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		// Animate form submission
		gsap.to(".form-element", {
			scale: 0.95,
			duration: 0.1,
			ease: "power2.in",
			onComplete: () => {
				onSubmit(formData);
				onClose();
			}
		});
	};

	return (
		<Modal 
			isOpen={isOpen} 
			onClose={onClose}
			classNames={{
				base: "bg-white dark:bg-primary",
				header: "text-text-primary dark:text-white",
				body: "text-text-primary dark:text-white",
				footer: "border-t-1 border-gray-light dark:border-gray-dark"
			}}
		>
			<ModalContent>
				<form onSubmit={handleSubmit}>
					<ModalHeader>
						{mode === 'add' ? 'Add New Asset' : 'Edit Asset'}
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<div className="form-element">
								<Input
									label="Symbol"
									placeholder="e.g., AAPL, BTC"
									value={formData.symbol}
									onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
									className="bg-gray-light dark:bg-gray-dark"
									required
								/>
							</div>
							<div className="form-element">
								<Select
									label="Asset Type"
									placeholder="Select asset type"
									selectedKeys={[formData.type]}
									onChange={(e) => setFormData({ ...formData, type: e.target.value })}
									className="bg-gray-light dark:bg-gray-dark"
									required
								>
									{assetTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</Select>
							</div>
							<div className="form-element">
								<Input
									label="Units"
									type="number"
									step="any"
									value={formData.units.toString()}
									onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) })}
									className="bg-gray-light dark:bg-gray-dark"
									required
								/>
							</div>
							<div className="form-element">
								<Input
									label="Purchase Price"
									type="number"
									step="any"
									value={formData.purchasePrice.toString()}
									onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
									className="bg-gray-light dark:bg-gray-dark"
									required
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button 
							color="danger" 
							variant="light" 
							onPress={onClose}
							className="text-accent"
						>
							Cancel
						</Button>
						<Button 
							color="secondary" 
							type="submit"
							className="bg-secondary hover:bg-secondary/90 text-white"
						>
							{mode === 'add' ? 'Add Asset' : 'Save Changes'}
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}