import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, CreditCard, FileText, Settings } from 'lucide-react';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Input } from '../Input';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import { Step, Stepper, type StepperProps } from './Stepper';
import storyStyles from './Stepper.stories.module.scss';

const componentDescription = `Stepper communicates sequence progress across completed, current, pending, and error states.

### Accessibility contract

- Keyboard: clickable steps receive focus in reading order and activate on Enter or Space; supporting controls in example stories remain standard buttons and fields.
- Screen readers: the root exposes \`role="list"\` with \`aria-label="Progress steps"\`; each step is a \`listitem\`; the current step uses \`aria-current="step"\`; status text is announced through visually hidden copy beside the visible label.
- Focus management: Stepper itself does not trap focus; any surrounding wizard or dialog owns focus containment.
- Designers: keep labels short, descriptions optional, and do not rely on color alone to explain progress or errors.
- QA: verify connector count is always \`n - 1\`, active state uses \`aria-current="step"\`, and non-linear steps stay keyboard-operable.`;

const renderDefaultSteps = () => (
  <>
    <Step label="Account" />
    <Step label="Billing" />
    <Step label="Review" />
    <Step label="Complete" />
  </>
);

const StoryRender = (args: StepperProps) => (
  <div className={storyStyles.storyA11yScope}>
    <Stepper {...args}>{renderDefaultSteps()}</Stepper>
  </div>
);

const meta: Meta<typeof Stepper> = {
  title: 'Core Components/Stepper',
  component: Stepper,
  subcomponents: {
    Step,
  },
  tags: ['autodocs'],
  args: {
    activeStep: 1,
  },
  argTypes: {
    children: {
      control: false,
    },
  },
  render: StoryRender,
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stepper>;

const ControlledStepperExample = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <div className={storyStyles.storyStack}>
      <Stepper activeStep={activeStep}>
        <Step label="Account" />
        <Step label="Billing" />
        <Step label="Review" />
        <Step label="Complete" />
      </Stepper>
      <div className={storyStyles.storyActions}>
        <Button
          type="button"
          onClick={() => setActiveStep((currentStep) => Math.max(0, currentStep - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => setActiveStep((currentStep) => Math.min(3, currentStep + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const WizardExample = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <div className={storyStyles.storyStack}>
      <Stepper activeStep={activeStep}>
        <Step label="Account" description="Create your workspace login" />
        <Step label="Billing" description="Add a payment method" />
        <Step label="Review" description="Confirm your plan details" />
      </Stepper>
      <form className={storyStyles.wizardForm}>
        <div className={storyStyles.wizardField}>
          <label htmlFor="workspace-name">Workspace name</label>
          <Input id="workspace-name" placeholder="Emerald launch workspace" />
        </div>
        <div className={storyStyles.storyActions}>
          <Button
            type="button"
            onClick={() => setActiveStep((currentStep) => Math.max(0, currentStep - 1))}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => setActiveStep((currentStep) => Math.min(2, currentStep + 1))}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export const Horizontal: Story = {
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper {...args}>{renderDefaultSteps()}</Stepper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stepper activeStep={1}>',
      '  <Step label="Account" />',
      '  <Step label="Billing" />',
      '  <Step label="Review" />',
      '  <Step label="Complete" />',
      '</Stepper>'
    )
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper {...args}>{renderDefaultSteps()}</Stepper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stepper activeStep={1} orientation="vertical">',
      '  <Step label="Account" />',
      '  <Step label="Billing" />',
      '  <Step label="Review" />',
      '  <Step label="Complete" />',
      '</Stepper>'
    )
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={1}>
        <Step label="Account" status="completed" />
        <Step label="Billing" status="active" />
        <Step label="Review" status="pending" />
        <Step label="Complete" status="error" />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Stepper activeStep={1}>',
          '  <Step label="Account" status="completed" />',
          '  <Step label="Billing" status="active" />',
          '  <Step label="Review" status="pending" />',
          '  <Step label="Complete" status="error" />',
          '</Stepper>'
        )
      ),
    },
  },
};

export const WithDescriptions: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={1}>
        <Step label="Account" description="Create your workspace login" />
        <Step label="Billing" description="Add a payment method" />
        <Step label="Review" description="Verify billing and contact details" />
        <Step label="Complete" description="Launch the workspace" />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Stepper activeStep={1}>',
          '  <Step label="Account" description="Create your workspace login" />',
          '  <Step label="Billing" description="Add a payment method" />',
          '  <Step label="Review" description="Verify billing and contact details" />',
          '  <Step label="Complete" description="Launch the workspace" />',
          '</Stepper>'
        )
      ),
    },
  },
};

export const Error: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={1}>
        <Step label="Account" />
        <Step label="Billing" status="error" />
        <Step label="Review" />
        <Step label="Complete" />
      </Stepper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stepper activeStep={1}>',
      '  <Step label="Account" />',
      '  <Step label="Billing" status="error" />',
      '  <Step label="Review" />',
      '  <Step label="Complete" />',
      '</Stepper>'
    )
  ),
};

export const Completed: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={3}>
        <Step label="Account" status="completed" />
        <Step label="Billing" status="completed" />
        <Step label="Review" status="completed" />
        <Step label="Complete" status="completed" />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Stepper activeStep={3}>',
          '  <Step label="Account" status="completed" />',
          '  <Step label="Billing" status="completed" />',
          '  <Step label="Review" status="completed" />',
          '  <Step label="Complete" status="completed" />',
          '</Stepper>'
        )
      ),
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storySection}>
        <Stepper activeStep={1} size="sm">
          <Step label="Account" />
          <Step label="Billing" />
          <Step label="Review" />
        </Stepper>
        <Stepper activeStep={1} size="md">
          <Step label="Account" />
          <Step label="Billing" />
          <Step label="Review" />
        </Stepper>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Stepper activeStep={1} size="sm">',
          '    <Step label="Account" />',
          '    <Step label="Billing" />',
          '    <Step label="Review" />',
          '  </Stepper>',
          '',
          '  <Stepper activeStep={1} size="md">',
          '    <Step label="Account" />',
          '    <Step label="Billing" />',
          '    <Step label="Review" />',
          '  </Stepper>',
          '</>'
        )
      ),
    },
  },
};

export const NonLinear: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={1} nonLinear>
        <Step label="Account" onClick={() => undefined} />
        <Step label="Billing" onClick={() => undefined} />
        <Step label="Review" onClick={() => undefined} />
        <Step label="Complete" onClick={() => undefined} />
      </Stepper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stepper activeStep={1} nonLinear>',
      '  <Step label="Account" onClick={() => undefined} />',
      '  <Step label="Billing" onClick={() => undefined} />',
      '  <Step label="Review" onClick={() => undefined} />',
      '  <Step label="Complete" onClick={() => undefined} />',
      '</Stepper>'
    )
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stepper activeStep={1}>
        <Step label="Setup" icon={<Settings aria-hidden="true" />} status="completed" />
        <Step label="Billing" icon={<CreditCard aria-hidden="true" />} status="active" />
        <Step label="Review" icon={<FileText aria-hidden="true" />} />
        <Step label="Launch" icon={<Check aria-hidden="true" />} />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          "import { Check, CreditCard, FileText, Settings } from 'lucide-react';",
          '',
          '<Stepper activeStep={1}>',
          '  <Step label="Setup" icon={<Settings aria-hidden="true" />} status="completed" />',
          '  <Step label="Billing" icon={<CreditCard aria-hidden="true" />} status="active" />',
          '  <Step label="Review" icon={<FileText aria-hidden="true" />} />',
          '  <Step label="Launch" icon={<Check aria-hidden="true" />} />',
          '</Stepper>'
        )
      ),
    },
  },
};

export const Controlled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ControlledStepperExample />
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const Example = () => {',
          '  const [activeStep, setActiveStep] = React.useState(0);',
          '',
          '  return (',
          '    <>',
          '      <Stepper activeStep={activeStep}>',
          '        <Step label="Account" />',
          '        <Step label="Billing" />',
          '        <Step label="Review" />',
          '        <Step label="Complete" />',
          '      </Stepper>',
          '      <Button type="button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>',
          '        Previous',
          '      </Button>',
          '      <Button type="button" onClick={() => setActiveStep((step) => Math.min(3, step + 1))}>',
          '        Next',
          '      </Button>',
          '    </>',
          '  );',
          '};'
        )
      ),
    },
  },
};

export const InWizard: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <WizardExample />
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const Example = () => {',
          '  const [activeStep, setActiveStep] = React.useState(0);',
          '',
          '  return (',
          '    <>',
          '      <Stepper activeStep={activeStep}>',
          '        <Step label="Account" description="Create your workspace login" />',
          '        <Step label="Billing" description="Add a payment method" />',
          '        <Step label="Review" description="Confirm your plan details" />',
          '      </Stepper>',
          '      <form>',
          '        <label htmlFor="workspace-name">Workspace name</label>',
          '        <Input id="workspace-name" placeholder="Emerald launch workspace" />',
          '        <Button type="button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>',
          '          Back',
          '        </Button>',
          '        <Button type="button" onClick={() => setActiveStep((step) => Math.min(2, step + 1))}>',
          '          Next',
          '        </Button>',
          '      </form>',
          '    </>',
          '  );',
          '};'
        )
      ),
    },
  },
};

export const AdvanceStep: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ControlledStepperExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const steps = within(canvasElement).getAllByRole('listitem');
    await expect(steps[0]).toHaveAttribute('aria-current', 'step');
    const nextButton = within(canvasElement).getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await expect(steps[1]).toHaveAttribute('aria-current', 'step');
  },
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const Example = () => {',
          '  const [activeStep, setActiveStep] = React.useState(0);',
          '',
          '  return (',
          '    <>',
          '      <Stepper activeStep={activeStep}>',
          '        <Step label="Account" />',
          '        <Step label="Billing" />',
          '        <Step label="Review" />',
          '        <Step label="Complete" />',
          '      </Stepper>',
          '      <Button type="button" onClick={() => setActiveStep((step) => Math.min(3, step + 1))}>',
          '        Next',
          '      </Button>',
          '    </>',
          '  );',
          '};'
        )
      ),
    },
  },
};
