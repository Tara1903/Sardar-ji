import { MessageCircleMore } from 'lucide-react';
import { createWhatsAppLink } from '../../utils/whatsapp';

export const WhatsAppFab = ({ phoneNumber }) => (
  <a
    className="whatsapp-fab"
    href={createWhatsAppLink(phoneNumber, 'I want to place an order from Sardar Ji Food Corner.')}
    rel="noreferrer"
    target="_blank"
  >
    <MessageCircleMore size={22} />
    Order
  </a>
);
