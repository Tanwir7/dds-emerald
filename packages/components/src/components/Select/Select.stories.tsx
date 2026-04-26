import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../Label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select';
import storyStyles from './Select.stories.module.scss';

const meta: Meta<typeof Select> = {
  title: 'Core Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-default">Select an option</Label>
        <Select>
          <SelectTrigger id="storybook-select-default" aria-label="Select an option">
            <SelectValue placeholder="Choose one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option-1">Option 1</SelectItem>
            <SelectItem value="option-2">Option 2</SelectItem>
            <SelectItem value="option-3">Option 3</SelectItem>
            <SelectItem value="option-4">Option 4</SelectItem>
            <SelectItem value="option-5">Option 5</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithValue: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-value">Selected option</Label>
        <Select defaultValue="option-2">
          <SelectTrigger id="storybook-select-value" aria-label="Selected option">
            <SelectValue placeholder="Choose one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option-1">Option 1</SelectItem>
            <SelectItem value="option-2">Option 2</SelectItem>
            <SelectItem value="option-3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-select-sm">Small</Label>
          <Select>
            <SelectTrigger id="storybook-select-sm" size="sm" aria-label="Small">
              <SelectValue placeholder="Small..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-select-md">Medium</Label>
          <Select>
            <SelectTrigger id="storybook-select-md" size="md" aria-label="Medium">
              <SelectValue placeholder="Medium..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-select-lg">Large</Label>
          <Select>
            <SelectTrigger id="storybook-select-lg" size="lg" aria-label="Large">
              <SelectValue placeholder="Large..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-invalid">Select an option</Label>
        <Select>
          <SelectTrigger
            id="storybook-select-invalid"
            invalid
            aria-invalid="true"
            aria-label="Select an option"
          >
            <SelectValue placeholder="Choose one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">One</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-disabled">Disabled</Label>
        <Select disabled>
          <SelectTrigger id="storybook-select-disabled" aria-label="Disabled">
            <SelectValue placeholder="Disabled..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">One</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-groups">Food categories</Label>
        <Select>
          <SelectTrigger id="storybook-select-groups" aria-label="Food categories">
            <SelectValue placeholder="Select a food..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-separator">Actions</Label>
        <Select>
          <SelectTrigger id="storybook-select-separator" aria-label="Actions">
            <SelectValue placeholder="Select action..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="duplicate">Duplicate</SelectItem>
            <SelectSeparator />
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-disabled-item">Disabled option</Label>
        <Select>
          <SelectTrigger id="storybook-select-disabled-item" aria-label="Disabled option">
            <SelectValue placeholder="Select one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option-1">Available Option</SelectItem>
            <SelectItem value="option-2" disabled>
              Unavailable Option
            </SelectItem>
            <SelectItem value="option-3">Another Option</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const LongList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-select-long">Long list</Label>
        <Select>
          <SelectTrigger id="storybook-select-long" aria-label="Long list">
            <SelectValue placeholder="Select number..." />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 30 }, (_, i) => (
              <SelectItem key={i} value={`item-${i}`}>
                Item {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const OpenAndSelect: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const option = within(document.body).getByRole('option', { name: 'Option 2' });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Option 2');
  },
};

export const KeyboardSelect: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
