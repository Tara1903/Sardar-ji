export const MONTHLY_SUBSCRIPTION_PRODUCT_SLUG = 'monthly-plan';
export const MONTHLY_SUBSCRIPTION_PLAN_NAME = 'Monthly Thali';
const MONTHLY_SUBSCRIPTION_PRODUCT_NAMES = ['monthly plan', 'monthly thali', 'monthly thali plan'];
export const MONTHLY_SUBSCRIPTION_PRICE = 1560;
export const MONTHLY_SUBSCRIPTION_DURATION_DAYS = 30;
export const MONTHLY_SUBSCRIPTION_DESCRIPTION =
  'Daily changing sabzi with rice + dahi included in a dedicated 30-day veg meal subscription.';

export const MONTHLY_SUBSCRIPTION_BENEFITS = [
  'Fresh veg thali support for your everyday routine',
  'Dedicated 30-day validity tracked inside your account',
  'Referral system now counts active plan subscribers',
];

export const isMonthlySubscriptionProduct = (product) => {
  const slug = String(product?.slug || '')
    .trim()
    .toLowerCase();
  const name = String(product?.name || '')
    .trim()
    .toLowerCase();

  return slug === MONTHLY_SUBSCRIPTION_PRODUCT_SLUG || MONTHLY_SUBSCRIPTION_PRODUCT_NAMES.includes(name);
};
