import '@shopify/ui-extensions/preact';
import {render} from 'preact';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const number = shopify.orderConfirmation.value?.number;
  const isFirstOrder = shopify.orderConfirmation.value?.isFirstOrder;

  if (!number) {
    return null;
  }

  return (
    <s-banner
      tone={isFirstOrder ? 'success' : 'auto'}
      heading={isFirstOrder ? 'Welcome!' : 'Thanks for your order'}
    >
      Order #{number} is confirmed.{' '}
      {isFirstOrder
        ? "We're glad you found us — save this number for any support requests."
        : 'Save this number for any support requests.'}
    </s-banner>
  );
}
