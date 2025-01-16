import { PriceAlertService } from '@/lib/price-alert-service';

// Initialize the price alert service as a singleton
let priceAlertService: PriceAlertService | null = null;

export function initPriceAlertService() {
  if (!priceAlertService) {
    priceAlertService = new PriceAlertService();
  }
  return priceAlertService;
}

// Initialize the service when the module is imported
initPriceAlertService(); 