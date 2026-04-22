import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from './Textarea';
import styles from './Textarea.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  invalid: getRequiredClassName(styles, 'invalid'),
  resizeNone: getRequiredClassName(styles, 'resizeNone'),
  resizeVertical: getRequiredClassName(styles, 'resizeVertical'),
  resizeBoth: getRequiredClassName(styles, 'resizeBoth'),
} as const;

const render = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getTextarea = (container: HTMLElement = document.body) => {
  const textarea = container.querySelector('textarea');

  expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  return textarea as HTMLTextAreaElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Textarea', () => {
  it('renders a <textarea> element', () => {
    const { container } = render(<Textarea aria-label="Message" />);

    expect(getTextarea(container)).toBeInTheDocument();
  });

  it('forwards ref to HTMLTextAreaElement', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const { container } = render(<Textarea ref={ref} aria-label="Message" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toBe(getTextarea(container));
  });

  it('forwards className to <textarea>', () => {
    const { container } = render(<Textarea className="custom-textarea" aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass('custom-textarea');
  });

  it('applies .md class by default', () => {
    const { container } = render(<Textarea aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<Textarea size="sm" aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    const { container } = render(<Textarea size="lg" aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.lg);
  });

  it('has rows={3} by default', () => {
    const { container } = render(<Textarea aria-label="Message" />);

    expect(getTextarea(container)).toHaveAttribute('rows', '3');
  });

  it('respects rows prop', () => {
    const { container } = render(<Textarea rows={6} aria-label="Message" />);

    expect(getTextarea(container)).toHaveAttribute('rows', '6');
  });

  it('applies .resizeVertical class by default', () => {
    const { container } = render(<Textarea aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.resizeVertical);
  });

  it('applies .resizeNone class when resize="none"', () => {
    const { container } = render(<Textarea resize="none" aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.resizeNone);
  });

  it('applies .resizeBoth class when resize="both"', () => {
    const { container } = render(<Textarea resize="both" aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.resizeBoth);
  });

  it('applies .invalid class when invalid={true}', () => {
    const { container } = render(<Textarea invalid aria-label="Message" />);

    expect(getTextarea(container)).toHaveClass(classNames.invalid);
  });

  it('does not apply .invalid when invalid={false}', () => {
    const { container } = render(<Textarea invalid={false} aria-label="Message" />);

    expect(getTextarea(container)).not.toHaveClass(classNames.invalid);
  });

  it('does not automatically set aria-invalid when invalid is true', () => {
    const { container } = render(<Textarea invalid aria-label="Message" />);

    expect(getTextarea(container)).not.toHaveAttribute('aria-invalid');
  });

  it('forwards placeholder prop', () => {
    const { container } = render(
      <Textarea placeholder="Tell us what happened" aria-label="Message" />
    );

    expect(getTextarea(container)).toHaveAttribute('placeholder', 'Tell us what happened');
  });

  it('forwards value and onChange props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Textarea value="Initial message" onChange={onChange} aria-label="Message" />
    );
    const textarea = getTextarea(container);

    await user.click(textarea);
    await user.keyboard('!');

    expect(textarea).toHaveValue('Initial message');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards disabled as a native attribute', () => {
    const { container } = render(<Textarea disabled aria-label="Message" />);

    expect(getTextarea(container)).toBeDisabled();
  });

  it('forwards readOnly', () => {
    const { container } = render(<Textarea readOnly aria-label="Message" />);

    expect(getTextarea(container)).toHaveAttribute('readonly');
  });

  it('forwards maxLength', () => {
    const { container } = render(<Textarea maxLength={140} aria-label="Message" />);

    expect(getTextarea(container)).toHaveAttribute('maxlength', '140');
  });

  it('forwards aria-label, aria-describedby, aria-invalid', () => {
    const { container } = render(
      <Textarea aria-label="Message" aria-describedby="message-helper" aria-invalid="true" />
    );
    const textarea = getTextarea(container);

    expect(textarea).toHaveAttribute('aria-label', 'Message');
    expect(textarea).toHaveAttribute('aria-describedby', 'message-helper');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards data-testid and arbitrary props', () => {
    const { container } = render(
      <Textarea data-testid="message-textarea" autoComplete="off" aria-label="Message" />
    );
    const textarea = getTextarea(container);

    expect(textarea).toHaveAttribute('data-testid', 'message-textarea');
    expect(textarea).toHaveAttribute('autocomplete', 'off');
  });

  it('keyboard: receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Textarea aria-label="Message" />
      </div>
    );
    const textarea = getTextarea(container);

    await user.tab();
    await user.tab();

    expect(textarea).toHaveFocus();
  });

  it('keyboard: does not receive focus when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Textarea disabled aria-label="Message" />
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getTextarea(container)).not.toHaveFocus();
    expect(container.querySelector('button')).toHaveFocus();
  });

  it('keyboard: is reachable when readOnly', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Textarea readOnly aria-label="Message" />
      </div>
    );
    const textarea = getTextarea(container);

    await user.tab();
    await user.tab();

    expect(textarea).toHaveFocus();
  });

  it('axe passes for default render', async () => {
    const { container } = render(
      <div>
        <label htmlFor="default-textarea">Message</label>
        <Textarea id="default-textarea" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when invalid={true}', async () => {
    const { container } = render(
      <div>
        <label htmlFor="invalid-textarea">Message</label>
        <Textarea
          id="invalid-textarea"
          invalid
          aria-invalid="true"
          aria-describedby="message-error"
        />
        <p id="message-error">Enter a message before submitting.</p>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled', async () => {
    const { container } = render(
      <div>
        <label htmlFor="disabled-textarea">Message</label>
        <Textarea id="disabled-textarea" disabled />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when readOnly', async () => {
    const { container } = render(
      <div>
        <label htmlFor="readonly-textarea">Message</label>
        <Textarea id="readonly-textarea" readOnly defaultValue="Read-only content" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with aria-label provided', async () => {
    const { container } = render(<Textarea aria-label="Message" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and focus styles', () => {
    const stylesheet = readFileSync('src/components/Textarea/Textarea.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
    expect(stylesheet).toContain('line-height: var(--dds-line-height-relaxed);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-input);');
    expect(stylesheet).toContain('border: 1px solid var(--dds-color-border-input);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).toContain('border-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('oklch(from var(--dds-color-status-danger) l c h / 0.5)');
    expect(stylesheet).toContain('&:disabled');
    expect(stylesheet).toContain('&:read-only');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Textarea/Textarea.module.scss', 'utf8');
    const storyStyles = readFileSync(
      'src/components/Textarea/Textarea.stories.module.scss',
      'utf8'
    );

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});
