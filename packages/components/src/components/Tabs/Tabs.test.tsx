// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Bell } from 'lucide-react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './Tabs';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const renderTabs = (props: Partial<Omit<React.ComponentProps<typeof Tabs>, 'children'>> = {}) =>
  render(
    <Tabs defaultValue="overview" {...props}>
      <TabList aria-label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="history" disabled>
          History
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="overview">Overview panel</TabPanel>
        <TabPanel value="activity">Activity panel</TabPanel>
        <TabPanel value="history">History panel</TabPanel>
      </TabPanels>
    </Tabs>
  );

describe('Tabs', () => {
  describe('Rendering', () => {
    it('renders a tablist with tab buttons and a visible panel', () => {
      renderTabs();

      expect(screen.getByRole('tablist', { name: 'Project sections' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview panel');
    });

    it('forwards refs to the root and sub-components', () => {
      const rootRef = React.createRef<HTMLDivElement>();
      const listRef = React.createRef<HTMLDivElement>();
      const tabRef = React.createRef<HTMLButtonElement>();
      const panelsRef = React.createRef<HTMLDivElement>();
      const panelRef = React.createRef<HTMLDivElement>();

      render(
        <Tabs ref={rootRef} defaultValue="overview">
          <TabList ref={listRef} aria-label="Project sections">
            <Tab ref={tabRef} value="overview">
              Overview
            </Tab>
          </TabList>
          <TabPanels ref={panelsRef}>
            <TabPanel ref={panelRef} value="overview">
              Overview panel
            </TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
      expect(listRef.current).toBeInstanceOf(HTMLDivElement);
      expect(tabRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(panelsRef.current).toBeInstanceOf(HTMLDivElement);
      expect(panelRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards class names to root and sub-components', () => {
      render(
        <Tabs className="root-class" defaultValue="overview">
          <TabList className="list-class" aria-label="Project sections">
            <Tab className="tab-class" value="overview">
              Overview
            </Tab>
          </TabList>
          <TabPanels className="panels-class">
            <TabPanel className="panel-class" value="overview">
              Overview panel
            </TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(document.querySelector('.root-class')).toBeInTheDocument();
      expect(document.querySelector('.list-class')).toBeInTheDocument();
      expect(document.querySelector('.tab-class')).toBeInTheDocument();
      expect(document.querySelector('.panels-class')).toBeInTheDocument();
      expect(document.querySelector('.panel-class')).toBeInTheDocument();
    });

    it('applies variant, size, and orientation classes from context', () => {
      const { container } = renderTabs({ variant: 'pill', size: 'sm', orientation: 'vertical' });

      expect(container.firstChild).toBeInstanceOf(HTMLElement);
      expect((container.firstChild as HTMLElement).className).toMatch(/pill/);
      expect((container.firstChild as HTMLElement).className).toMatch(/sm/);
      expect((container.firstChild as HTMLElement).className).toMatch(/vertical/);
    });

    it('renders startIcon and endSlot content inside the tab', () => {
      render(
        <Tabs defaultValue="alerts">
          <TabList aria-label="Alert tabs">
            <Tab value="alerts" startIcon={<Bell aria-hidden="true" />} endSlot={<span>12</span>}>
              Alerts
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="alerts">Alert panel</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const tab = screen.getByRole('tab', { name: /Alerts\s*12/ });
      expect(tab.querySelector('svg')).toBeInTheDocument();
      expect(tab).toHaveTextContent('12');
    });
  });

  describe('State management', () => {
    it('supports uncontrolled selection changes', async () => {
      const user = userEvent.setup();
      renderTabs();

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const activityTab = screen.getByRole('tab', { name: 'Activity' });

      await user.click(activityTab);

      expect(activityTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity panel');
    });

    it('supports controlled value changes', () => {
      renderTabs({ value: 'activity' });

      expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity panel');
    });

    it('calls onValueChange when the active tab changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      renderTabs({ onValueChange });
      await user.click(screen.getByRole('tab', { name: 'Activity' }));

      expect(onValueChange).toHaveBeenCalledWith('activity');
    });

    it('keeps disabled tabs non-interactive', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      renderTabs({ onValueChange });
      const disabledTab = screen.getByRole('tab', { name: 'History' });

      expect(disabledTab).toHaveAttribute('data-disabled');

      await user.click(disabledTab);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('can force mount inactive panels', () => {
      render(
        <Tabs defaultValue="overview">
          <TabList aria-label="Project sections">
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="overview">Overview panel</TabPanel>
            <TabPanel value="activity" forceMount>
              Activity panel
            </TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByText('Activity panel')).toBeInTheDocument();
      expect(screen.getByText('Activity panel').closest('[role="tabpanel"]')).toHaveAttribute(
        'data-state',
        'inactive'
      );
    });
  });

  describe('Accessibility and keyboard', () => {
    it('supports arrow-key navigation between horizontal tabs', async () => {
      const user = userEvent.setup();
      renderTabs();

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const activityTab = screen.getByRole('tab', { name: 'Activity' });

      overviewTab.focus();
      await user.keyboard('{ArrowRight}');

      expect(activityTab).toHaveFocus();
    });

    it('supports arrow-key navigation between vertical tabs', async () => {
      const user = userEvent.setup();
      renderTabs({ orientation: 'vertical' });

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const activityTab = screen.getByRole('tab', { name: 'Activity' });

      overviewTab.focus();
      await user.keyboard('{ArrowDown}');

      expect(activityTab).toHaveFocus();
    });

    it('connects tabs to tabpanels with accessible relationships', () => {
      renderTabs();

      const activeTab = screen.getByRole('tab', { name: 'Overview' });
      const panel = screen.getByRole('tabpanel');

      expect(activeTab).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', activeTab.id);
    });

    it('has no axe violations', async () => {
      const { container } = renderTabs();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
