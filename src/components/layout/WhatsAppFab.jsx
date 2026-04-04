import { MessageCircleMore } from 'lucide-react';
import { createGeneralOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';

export const WhatsAppFab = ({ phoneNumber }) => (
  <a
    aria-label="Order on WhatsApp"
    className="whatsapp-fab"
    href={createWhatsAppLink(phoneNumber, createGeneralOrderMessage())}
    rel="noreferrer"
    target="_blank"
    title="Order on WhatsApp"
  >
    <MessageCircleMore size={22} />
  </a>
);
