import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {computeFreeShippingProgress} from '../../../lib/free-shipping.js';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const subtotal = shopify.cost.subtotalAmount.value;
  const threshold = Number(shopify.settings.value.freeShippingThreshold) || 75;

  // subtotalAmount is always available (unlike totalAmount, which excludes
  // shipping until a method is selected), which makes it the reliable base
  // for a threshold calculation. See the Cost API best practices.
  const amount = Number(subtotal?.amount ?? 0);
  const currencyCode = subtotal?.currencyCode ?? 'USD';

  const {remaining, percent, met} = computeFreeShippingProgress(amount, threshold);

  return (
    <s-stack direction="block" gap="small-200">
      <s-stack direction="inline" justifyContent="space-between">
        <s-text>{met ? 'Free shipping unlocked' : 'Free shipping progress'}</s-text>
        <s-text color="subdued">
          {formatMoney(amount, currencyCode)} / {formatMoney(threshold, currencyCode)}
        </s-text>
      </s-stack>
      <s-progress
        value={percent}
        tone={met ? 'success' : 'auto'}
        accessibilityLabel={`${Math.round(percent * 100)} percent toward free shipping`}
      ></s-progress>
      {!met ? (
        <s-text color="subdued">
          Add {formatMoney(remaining, currencyCode)} more to unlock free shipping
        </s-text>
      ) : null}
    </s-stack>
  );
}

function formatMoney(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}
