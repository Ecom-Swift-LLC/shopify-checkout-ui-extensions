import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const canUpdate = shopify.instructions.value.notes.canUpdateNote;
  const currentNote = shopify.note.value;
  const maxLength = Number(shopify.settings.value.maxLength) || 140;

  const [draft, setDraft] = useState(currentNote ?? '');
  const [saved, setSaved] = useState(Boolean(currentNote));
  const [error, setError] = useState(null);

  // Accelerated checkouts (Apple Pay, Google Pay) can't collect a note.
  if (!canUpdate) {
    return null;
  }

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed) {
      return remove();
    }

    const result = await shopify.applyNoteChange({
      type: 'updateNote',
      note: trimmed.slice(0, maxLength),
    });

    if (result.type === 'error') {
      setError(result.message);
    } else {
      setError(null);
      setSaved(true);
    }
  }

  async function remove() {
    const result = await shopify.applyNoteChange({type: 'removeNote'});

    if (result.type === 'error') {
      setError(result.message);
    } else {
      setError(null);
      setSaved(false);
      setDraft('');
    }
  }

  return (
    <s-stack direction="block" gap="base">
      <s-heading>Delivery instructions</s-heading>
      <s-text-area
        label="Add a note for the courier (optional)"
        value={draft}
        maxLength={maxLength}
        onChange={(event) => {
          setSaved(false);
          setDraft(event.currentTarget.value);
        }}
      ></s-text-area>
      <s-stack direction="inline" gap="base">
        <s-button variant="primary" onClick={save}>
          {saved ? 'Saved' : 'Save note'}
        </s-button>
        {currentNote ? (
          <s-button tone="critical" variant="secondary" onClick={remove}>
            Remove
          </s-button>
        ) : null}
      </s-stack>
      {error ? <s-text tone="critical">{error}</s-text> : null}
    </s-stack>
  );
}
