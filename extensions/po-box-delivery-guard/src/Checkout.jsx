import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {
  useBuyerJourneyIntercept,
  useExtensionCapability,
} from '@shopify/ui-extensions/checkout/preact';
import {isPoBoxAddress} from '../../../lib/po-box.js';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const editorType = shopify.extension.editor?.type;
  const blockProgressGranted = useExtensionCapability('block_progress');

  useBuyerJourneyIntercept(({canBlockProgress}) => {
    const address1 = shopify.shippingAddress?.value?.address1;

    if (canBlockProgress && isPoBoxAddress(address1)) {
      return {
        behavior: 'block',
        reason: 'Shipping address looks like a PO Box',
        errors: [
          {
            // No `target`, so this renders as a page-level error rather
            // than attaching to one specific field.
            message: "We can't ship to PO boxes. Please enter a physical street address.",
          },
        ],
      };
    }

    return {behavior: 'allow'};
  });

  if (editorType === 'checkout' && !blockProgressGranted) {
    return (
      <s-banner tone="warning" heading="This app may be misconfigured">
        To block PO Box addresses at checkout, enable this behavior in "Checkout behavior"
        settings.
      </s-banner>
    );
  }

  return null;
}
