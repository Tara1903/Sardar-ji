import { MessageCircleMore } from 'lucide-react';
import { createWhatsAppLink } from '../../utils/whatsapp';

export const WhatsAppFab = ({ phoneNumber }) => (
  <a
    className="whatsapp-fab"
    href={createWhatsAppLink(phoneNumber, 'Hello Sardar Ji Food Corner, I want to place an order.')}
    rel="noreferrer"
    target="_blank"
  >
    <MessageCircleMore size={22} />
    Order
  </a>
);
