import { MapPinned, MessageCircleMore, PackageCheck, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { createOrderStatusMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { trackWhatsAppClick } from '../../utils/analytics';

export const DeliveryOrderCard = ({
  order,
  onStatusChange,
  onStartTracking,
  trackingOrderId,
}) => (
  <article className="panel-card delivery-order-card">
    <div className="space-between">
      <div>
        <p className="eyebrow">{order.orderNumber}</p>
        <h3>{order.customerName}</h3>
      </div>
      <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
    </div>

    <p>{order.address.fullAddress}</p>
    <p>
      {order.address.landmark} • {order.address.pincode}
    </p>
    <p>Customer phone: {order.customerPhone}</p>

    <div className="order-meta-grid">
      <div>
        <span>Total</span>
        <strong>{formatCurrency(order.total)}</strong>
      </div>
      <div>
        <span>Payment</span>
        <strong>{order.paymentMethod}</strong>
      </div>
    </div>

    <div className="product-actions">
      <button className="btn btn-secondary" onClick={() => onStatusChange(order.id, 'Preparing')} type="button">
        <PackageCheck size={16} />
        Preparing
      </button>
      <button className="btn btn-secondary" onClick={() => onStatusChange(order.id, 'Out for Delivery')} type="button">
        <Truck size={16} />
        On the way
      </button>
      <button className="btn btn-primary" onClick={() => onStatusChange(order.id, 'Delivered')} type="button">
        Delivered
      </button>
    </div>

    <button className="btn btn-tertiary" onClick={() => onStartTracking(order.id)} type="button">
      <MapPinned size={16} />
      {trackingOrderId === order.id ? 'Sharing live location' : 'Start live tracking'}
    </button>

    <a
      className="btn btn-secondary full-width"
      href={createWhatsAppLink(order.customerPhone, createOrderStatusMessage(order, order.status))}
      onClick={() =>
        trackWhatsAppClick({
          source: 'delivery-order-update',
          label: order.orderNumber,
          value: order.total,
        })
      }
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircleMore size={16} />
      Update customer on WhatsApp
    </a>
  </article>
);
