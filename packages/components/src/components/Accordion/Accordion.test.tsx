import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

type RenderSharedProps = {
  variant?: 'default' | 'flush';
  className?: string;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
};

type RenderSingleProps = RenderSharedProps & {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
};

type RenderMultipleProps = RenderSharedProps & {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

const renderAccordion = (props: RenderSingleProps | RenderMultipleProps = {}) =>
  render(
    <Accordion {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section one</AccordionTrigger>
        <AccordionContent>First panel</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section two</AccordionTrigger>
        <AccordionContent>Second panel</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" disabled>
        <AccordionTrigger>Section three</AccordionTrigger>
        <AccordionContent>Third panel</AccordionContent>
      </AccordionItem>
    </Accordion>
  );

afterEach(() => {
  cleanup();
});

describe('Accordion', () => {
  describe('Rendering', () => {
    it('renders accordion triggers as buttons inside headings', () => {
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section one' });
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger.parentElement?.tagName).toBe('H3');
    });

    it('forwards refs to root and sub-components', () => {
      const rootRef = React.createRef<HTMLDivElement>();
      const itemRef = React.createRef<HTMLDivElement>();
      const triggerRef = React.createRef<HTMLButtonElement>();
      const contentRef = React.createRef<HTMLDivElement>();

      render(
        <Accordion ref={rootRef}>
          <AccordionItem ref={itemRef} value="item-1">
            <AccordionTrigger ref={triggerRef}>Section one</AccordionTrigger>
            <AccordionContent ref={contentRef}>First panel</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
      expect(itemRef.current).toBeInstanceOf(HTMLDivElement);
      expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies the default variant class by default', () => {
      const { container } = renderAccordion();
      expect(container.firstChild).toBeInstanceOf(HTMLElement);
      expect((container.firstChild as HTMLElement).className).toMatch(/variantDefault/);
    });

    it('applies the flush variant class when requested', () => {
      const { container } = renderAccordion({ variant: 'flush' });
      expect(container.firstChild).toBeInstanceOf(HTMLElement);
      expect((container.firstChild as HTMLElement).className).toMatch(/variantFlush/);
    });

    it('forwards custom class names to root and sub-components', async () => {
      const user = userEvent.setup();

      render(
        <Accordion className="root-class">
          <AccordionItem value="item-1" className="item-class">
            <AccordionTrigger className="trigger-class">Section one</AccordionTrigger>
            <AccordionContent className="content-class">First panel</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByRole('button', { name: 'Section one' }));

      expect(screen.getByRole('button', { name: 'Section one' })).toHaveClass('trigger-class');
      expect(document.querySelector('.root-class')).toBeInTheDocument();
      expect(document.querySelector('.item-class')).toBeInTheDocument();
      expect(document.querySelector('.content-class')).toBeInTheDocument();
    });

    it('renders a content inner wrapper when expanded', async () => {
      const user = userEvent.setup();
      const { container } = renderAccordion();

      await user.click(screen.getByRole('button', { name: 'Section one' }));

      expect(container.querySelector('[class*="contentInner"]')).toBeInTheDocument();
    });
  });

  describe('Single mode', () => {
    it('opens one panel at a time by default', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const firstTrigger = screen.getByRole('button', { name: 'Section one' });
      const secondTrigger = screen.getByRole('button', { name: 'Section two' });

      await user.click(firstTrigger);
      expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(secondTrigger);
      expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
      expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('is collapsible by default in single mode', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section one' });
      await user.click(trigger);
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports controlled single mode values', () => {
      renderAccordion({ value: 'item-2' });
      expect(screen.getByRole('button', { name: 'Section two' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Section one' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('calls onValueChange with the opened item value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderAccordion({ onValueChange });

      await user.click(screen.getByRole('button', { name: 'Section one' }));
      expect(onValueChange).toHaveBeenCalledWith('item-1');
    });
  });

  describe('Multiple mode', () => {
    it('allows multiple panels to be open at once', async () => {
      const user = userEvent.setup();
      renderAccordion({ type: 'multiple' });

      const firstTrigger = screen.getByRole('button', { name: 'Section one' });
      const secondTrigger = screen.getByRole('button', { name: 'Section two' });

      await user.click(firstTrigger);
      await user.click(secondTrigger);

      expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
      expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports controlled multiple mode values', () => {
      renderAccordion({ type: 'multiple', value: ['item-1', 'item-2'] });

      expect(screen.getByRole('button', { name: 'Section one' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Section two' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('calls onValueChange with an array in multiple mode', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderAccordion({ type: 'multiple', onValueChange });

      await user.click(screen.getByRole('button', { name: 'Section one' }));
      expect(onValueChange).toHaveBeenCalledWith(['item-1']);
    });
  });

  describe('Accessibility and keyboard', () => {
    it('connects trigger and content with aria-controls and region semantics', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section one' });
      await user.click(trigger);

      const controlledId = trigger.getAttribute('aria-controls');
      const region = screen.getByRole('region');

      expect(controlledId).toBeTruthy();
      expect(region.id).toBe(controlledId);
    });

    it('ArrowDown moves focus to the next trigger', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const firstTrigger = screen.getByRole('button', { name: 'Section one' });
      const secondTrigger = screen.getByRole('button', { name: 'Section two' });

      firstTrigger.focus();
      await user.keyboard('{ArrowDown}');

      expect(secondTrigger).toHaveFocus();
    });

    it('Space toggles the focused trigger', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section one' });
      trigger.focus();
      await user.keyboard(' ');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('disabled items remain non-interactive', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderAccordion({ onValueChange });

      const disabledTrigger = screen.getByRole('button', { name: 'Section three' });
      expect(disabledTrigger).toHaveAttribute('data-disabled');

      await user.click(disabledTrigger);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Axe', () => {
    it('has no accessibility violations when closed', async () => {
      const { container } = renderAccordion();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations when a panel is open', async () => {
      const user = userEvent.setup();
      renderAccordion();

      await user.click(screen.getByRole('button', { name: 'Section one' }));
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});
