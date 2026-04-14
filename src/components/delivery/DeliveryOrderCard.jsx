import { MapPinned, MessageCircleMore, PackageCheck, PhoneCall, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { createOrderStatusMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { trackWhatsAppClick } from '../../utils/analytics';

export const DeliveryOrderCard = ({
  order,
  onStatusChange,
  onStartTracking,
  trackingOrderId,
  variant = 'web',
}) => {
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    order.address?.fullAddress || '',
  )}`;
  const isAppVariant = variant === 'app';

  return (
    <article className={`panel-card delivery-order-card ${isAppVariant ? 'delivery-order-card-app' : ''}`.trim()}>
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

      {isAppVariant ? (
        <div className="delivery-task-shortcuts">
          <a className="btn btn-secondary" href={`tel:${order.customerPhone}`}>
            <PhoneCall size={16} />
            Call
          </a>
          <a className="btn btn-secondary" href={mapsLink} rel="noreferrer" target="_blank">
            <MapPinned size={16} />
            Map
          </a>
          <a
            className="btn btn-secondary"
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
            WhatsApp
          </a>
        </div>
      ) : null}

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

      {!isAppVariant ? (
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
      ) : null}
    </article>
  );
};
