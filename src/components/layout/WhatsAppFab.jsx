import { MessageCircleMore } from 'lucide-react';
import { createGeneralOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';

export const WhatsAppFab = ({ phoneNumber }) => (
  <a
    className="whatsapp-fab"
    href={createWhatsAppLink(phoneNumber, createGeneralOrderMessage())}
    rel="noreferrer"
    target="_blank"
  >
    <MessageCircleMore size={22} />
    Order on WhatsApp
  </a>
);
