import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/Modal';

function Fixture({ onClose }: { onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title="Test dialog" description="A description">
      <div>
        <button type="button">First</button>
        <button type="button">Last</button>
      </div>
    </Modal>
  );
}

describe('Modal accessibility', () => {
  it('exposes itself as a modal dialog', () => {
    render(<Fixture onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('associates the dialog with its title and description', () => {
    render(<Fixture onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    const descId = dialog.getAttribute('aria-describedby');

    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe('Test dialog');
    expect(document.getElementById(descId!)?.textContent).toBe('A description');
  });

  it('moves focus into the dialog when it opens', () => {
    render(<Fixture onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    // The close button is the first focusable element in the dialog.
    expect(screen.getByRole('button', { name: /Close Test dialog/i })).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab inside the dialog', async () => {
    render(<Fixture onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: /Close Test dialog/i });
    const first = screen.getByRole('button', { name: /First/i });
    const last = screen.getByRole('button', { name: /Last/i });

    // Tab from the last focusable element wraps to the first.
    last.focus();
    await userEvent.tab();
    expect(close).toHaveFocus();

    // Shift+Tab from the first wraps back to the last.
    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();

    // Focus never escapes the dialog, wherever we start from.
    for (const start of [close, first, last]) {
      start.focus();
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('locks scrolling on the body while open', () => {
    render(<Fixture onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow on unmount', () => {
    const { unmount } = render(<Fixture onClose={vi.fn()} />);
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>content</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
