import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpRight, MessageSquarePlus, Search, Sparkles, Upload } from 'lucide-react';
import { Alert } from '../../components/Alert';
import { Avatar, AvatarFallback } from '../../components/Avatar';
import { AvatarGroup } from '../../components/AvatarGroup';
import { Button } from '../../components/Button';
import { CheckboxField } from '../../components/CheckboxField';
import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Divider } from '../../components/Divider';
import { Field } from '../../components/Field';
import { Flex } from '../../components/Flex';
import { Grid } from '../../components/Grid';
import { Heading } from '../../components/Heading';
import { Image } from '../../components/Image';
import { InlineAlert } from '../../components/InlineAlert';
import { Input } from '../../components/Input';
import { Kbd } from '../../components/Kbd';
import { Label } from '../../components/Label';
import { Link } from '../../components/Link';
import { ProgressBar } from '../../components/ProgressBar';
import { ProgressRing } from '../../components/ProgressRing';
import { Radio } from '../../components/Radio';
import { RadioGroupField } from '../../components/RadioGroupField';
import { Rating } from '../../components/Rating/Rating';
import { Skeleton } from '../../components/Skeleton';
import { Slider } from '../../components/Slider';
import { Stack } from '../../components/Stack';
import { SwitchField } from '../../components/SwitchField';
import { Tag } from '../../components/Tag';
import { Text } from '../../components/Text';
import { Textarea } from '../../components/Textarea';
import storyStyles from './DashboardShell.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceParameters } from '../../utils/storySource';

const componentDescription = `DashboardShell is an app-pattern doc that composes a broad slice of the Emerald library into one review-ready workspace.

### Components exercised

- Layout: \`Container\`, \`Grid\`, \`Stack\`, \`Flex\`, \`Divider\`
- Messaging and status: \`Tag\`, \`Alert\`, \`InlineAlert\`, \`ProgressBar\`, \`ProgressRing\`, \`Rating\`
- Identity and media: \`AvatarGroup\`, \`Avatar\`, \`Image\`
- Forms and controls: \`Field\`, \`Input\`, \`Textarea\`, \`RadioGroupField\`, \`Radio\`, \`Label\`, \`Slider\`, \`SwitchField\`, \`CheckboxField\`, \`Button\`
- Documentation helpers: \`Code\`, \`Link\`, \`Kbd\`

### Accessibility contract

- Keyboard: tab order moves from top actions into the prompt form, then settings, then linked reference actions.
- Screen readers: each section uses landmark-friendly \`main\` and \`section\` structure with visible headings, visible labels, and labeled progress indicators.
- Focus: the pattern does not trap or reorder focus; all interactive children keep native or Radix-managed behavior.
- QA: verify Storybook a11y stays scoped to the pattern root and the docs source preview remains JSX-only without story wrapper markup.`;

const dashboardShellSource = storySource(
  '<Container as="main" padding="lg">',
  '  <Container as="section" padding="lg" background="card" border>',
  '    <Grid columns={{ default: 1, lg: 2 }} gap="lg">',
  '      <Stack gap="md">',
  '        <Flex wrap="wrap" gap="sm" align="center">',
  '          <Tag variant="accent">App pattern</Tag>',
  '          <Tag variant="info">23 components</Tag>',
  '          <InlineAlert intent="success">Stakeholder packet is review-ready.</InlineAlert>',
  '        </Flex>',
  '        <Heading as="h1" size="5xl">Campaign Review Workspace</Heading>',
  '        <Text size="lg" color="muted">',
  '          A reusable dashboard shell for review, handoff, and release readiness using Emerald primitives.',
  '        </Text>',
  '        <Flex wrap="wrap" gap="sm">',
  '          <Button icon={Upload}>Publish draft</Button>',
  '          <Button variant="secondary" icon={MessageSquarePlus}>Request feedback</Button>',
  '          <Button variant="ghost" icon={ArrowUpRight}>Open live preview</Button>',
  '        </Flex>',
  '        <Flex wrap="wrap" gap="sm" align="center">',
  '          <Text size="sm" color="muted">Quick regenerate:</Text>',
  '          <Kbd>Shift</Kbd>',
  '          <Kbd>Enter</Kbd>',
  '        </Flex>',
  '      </Stack>',
  '      <Container background="subtle" padding="md">',
  '        <Image',
  '          src="/window.svg"',
  '          alt="Illustration of the campaign review workspace shell."',
  '          aspectRatio="16/9"',
  '        />',
  '        <Grid columns={{ default: 1, sm: 2 }} gap="sm">',
  '          <Container padding="md" background="card" border>',
  '            <Text size="sm" color="muted">Publish readiness</Text>',
  '            <ProgressRing label="Publish readiness" value={84} variant="success" showValue />',
  '          </Container>',
  '          <Container padding="md" background="card" border>',
  '            <Text size="sm" color="muted">Reviewer coverage</Text>',
  '            <AvatarGroup size="sm">',
  '              <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>',
  '              <Avatar><AvatarFallback>MN</AvatarFallback></Avatar>',
  '              <Avatar><AvatarFallback>JR</AvatarFallback></Avatar>',
  '            </AvatarGroup>',
  '          </Container>',
  '        </Grid>',
  '      </Container>',
  '    </Grid>',
  '  </Container>',
  '',
  '  <Grid columns={{ default: 1, xl: 2 }} gap="lg">',
  '    <Stack gap="lg">',
  '      <Container as="section" padding="lg" background="card" border>',
  '        <Heading as="h2" size="3xl">Launch checklist</Heading>',
  '        <Alert intent="warning" title="Publishing guardrail">',
  '          Human review is still required for legal disclosure copy and audience exclusions.',
  '        </Alert>',
  '        <Grid columns={{ default: 1, md: 2 }} gap="md">',
  '          <Container padding="md" background="subtle" border>',
  '            <Text size="sm" color="muted">Checklist completion</Text>',
  '            <ProgressBar label="Checklist completion" value={68} variant="success" showValue />',
  '          </Container>',
  '          <Container padding="md" background="subtle" border>',
  '            <Text size="sm" color="muted">Reviewer confidence</Text>',
  '            <Rating label="Reviewer confidence" readOnly value={4} />',
  '            <InlineAlert intent="info">Average rating increased after tone fixes.</InlineAlert>',
  '          </Container>',
  '        </Grid>',
  '        <Divider />',
  '        <Text color="muted">',
  '          Deployment target <Code>/apps/docs</Code> with annotated variants linked in',
  '          <Link href="https://example.com/playbook" external>the launch playbook</Link>.',
  '        </Text>',
  '      </Container>',
  '',
  '      <Container as="section" padding="lg" background="card" border>',
  '        <Heading as="h2" size="3xl">Prompt configuration</Heading>',
  '        <Field',
  '          label="Audience query"',
  '          instruction="Use a searchable phrase the growth team will recognize."',
  '          helper="This input powers the preview segment filters."',
  '        >',
  '          <Input',
  '            startIcon={Search}',
  '            defaultValue="enterprise retention cohort"',
  '            placeholder="Search by campaign, audience, or market"',
  '          />',
  '        </Field>',
  '        <Field',
  '          label="System prompt"',
  '          helper="Describe tone, approvals, and hard constraints before publishing."',
  '        >',
  '          <Textarea',
  '            rows={5}',
  '            defaultValue="Review the campaign summary for compliance, clarity, and tone."',
  '          />',
  '        </Field>',
  '        <RadioGroupField',
  '          label="Review mode"',
  '          instruction="Choose how strict the model should be when it finds ambiguity."',
  '          defaultValue="balanced"',
  '        >',
  '          <div>',
  '            <Radio id="review-mode-balanced" value="balanced" />',
  '            <Label htmlFor="review-mode-balanced">Balanced</Label>',
  '          </div>',
  '          <div>',
  '            <Radio id="review-mode-strict" value="strict" />',
  '            <Label htmlFor="review-mode-strict">Strict</Label>',
  '          </div>',
  '          <div>',
  '            <Radio id="review-mode-exploratory" value="exploratory" />',
  '            <Label htmlFor="review-mode-exploratory">Exploratory</Label>',
  '          </div>',
  '        </RadioGroupField>',
  '        <Container padding="md" background="subtle" border>',
  '          <Text as="span" id="autonomy-threshold-label" weight="semibold">',
  '            Autonomy threshold',
  '          </Text>',
  '          <Slider',
  '            aria-labelledby="autonomy-threshold-label"',
  '            defaultValue={[72]}',
  '            thumbLabels={["Autonomy threshold"]}',
  '          />',
  '          <InlineAlert intent="info">',
  '            High thresholds hold questionable recommendations for manual approval.',
  '          </InlineAlert>',
  '        </Container>',
  '      </Container>',
  '    </Stack>',
  '',
  '    <Stack gap="lg">',
  '      <Container as="section" padding="lg" background="card" border>',
  '        <Heading as="h2" size="3xl">Review settings</Heading>',
  '        <SwitchField',
  '          label="Require human sign-off"',
  '          description="Recommended"',
  '          instruction="Keep compliance-sensitive launches gated before publish."',
  '          helper="Human approval is required for legal and finance workspaces."',
  '          defaultChecked',
  '        />',
  '        <CheckboxField',
  '          label="Attach changelog to stakeholder packet"',
  '          helper="Includes prompt changes, reviewers, and updated assets."',
  '          defaultChecked',
  '        />',
  '        <CheckboxField',
  '          label="Notify channel owners after publish"',
  '          helper="Posts a summary to the shared campaign operations channel."',
  '        />',
  '      </Container>',
  '',
  '      <Container as="section" padding="lg" background="card" border>',
  '        <Heading as="h2" size="3xl">Preview asset</Heading>',
  '        <Image',
  '          src="/globe.svg"',
  '          alt="Global campaign asset marker used as a placeholder preview."',
  '          aspectRatio="4/3"',
  '          fit="contain"',
  '        />',
  '        <Flex wrap="wrap" gap="sm">',
  '          <Tag variant="success">Localized</Tag>',
  '          <Tag variant="default">Alt text ready</Tag>',
  '        </Flex>',
  '      </Container>',
  '',
  '      <Container as="section" padding="lg" background="card" border>',
  '        <Heading as="h2" size="3xl">Command handoff</Heading>',
  '        <Text color="muted">Model: <Code>gpt-5.5</Code></Text>',
  '        <Flex wrap="wrap" gap="sm" align="center">',
  '          <Kbd>G</Kbd>',
  '          <Kbd>D</Kbd>',
  '          <Text size="sm">Generate draft</Text>',
  '        </Flex>',
  '        <Flex wrap="wrap" gap="sm" align="center">',
  '          <Kbd>R</Kbd>',
  '          <Kbd>V</Kbd>',
  '          <Text size="sm">Open reviewer view</Text>',
  '        </Flex>',
  '        <Link href="https://example.com/review-runbook" external>',
  '          Open the review runbook',
  '        </Link>',
  '      </Container>',
  '    </Stack>',
  '  </Grid>',
  '</Container>'
);

const loadingSource = storySource(
  '<Container as="main" padding="lg">',
  '  <Container as="section" padding="lg" background="card" border>',
  '    <Grid columns={{ default: 1, lg: 2 }} gap="lg">',
  '      <Stack gap="md">',
  '        <Skeleton variant="text" lines={3} />',
  '        <Flex wrap="wrap" gap="sm">',
  '          <Skeleton width={160} height={44} />',
  '          <Skeleton width={180} height={44} />',
  '        </Flex>',
  '      </Stack>',
  '      <Skeleton variant="rectangular" height={320} />',
  '    </Grid>',
  '  </Container>',
  '',
  '  <Grid columns={{ default: 1, xl: 2 }} gap="lg">',
  '    <Container padding="lg" background="card" border>',
  '      <Skeleton variant="text" lines={6} />',
  '    </Container>',
  '    <Container padding="lg" background="card" border>',
  '      <Skeleton variant="text" lines={5} />',
  '    </Container>',
  '  </Grid>',
  '</Container>'
);

const classNames = {
  storyA11yScope: getRequiredClassName(storyStyles, 'storyA11yScope'),
  storyShell: getRequiredClassName(storyStyles, 'storyShell'),
  heroPanel: getRequiredClassName(storyStyles, 'heroPanel'),
  heroMedia: getRequiredClassName(storyStyles, 'heroMedia'),
  sectionCard: getRequiredClassName(storyStyles, 'sectionCard'),
  metricCard: getRequiredClassName(storyStyles, 'metricCard'),
  radioOption: getRequiredClassName(storyStyles, 'radioOption'),
  shortcutList: getRequiredClassName(storyStyles, 'shortcutList'),
  shortcutRow: getRequiredClassName(storyStyles, 'shortcutRow'),
  loadingButtons: getRequiredClassName(storyStyles, 'loadingButtons'),
  tabular: getRequiredClassName(storyStyles, 'tabular'),
} as const;

const RadioOption = ({ id, label, value }: { id: string; label: string; value: string }) => (
  <div className={classNames.radioOption}>
    <Radio id={id} value={value} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const DashboardShellPattern = () => {
  const baseId = useId();
  const heroHeadingId = `${baseId}-hero-heading`;
  const checklistHeadingId = `${baseId}-checklist-heading`;
  const promptHeadingId = `${baseId}-prompt-heading`;
  const settingsHeadingId = `${baseId}-settings-heading`;
  const previewHeadingId = `${baseId}-preview-heading`;
  const handoffHeadingId = `${baseId}-handoff-heading`;
  const autonomyLabelId = `${baseId}-autonomy-threshold`;

  return (
    <div className={classNames.storyA11yScope}>
      <Container as="main" className={classNames.storyShell} padding="lg">
        <Container
          as="section"
          aria-labelledby={heroHeadingId}
          background="card"
          border
          padding="lg"
          className={classNames.heroPanel}
        >
          <Grid columns={{ default: 1, lg: 2 }} gap="lg">
            <Stack gap="md">
              <Flex wrap="wrap" gap="sm" align="center">
                <Tag variant="accent">App pattern</Tag>
                <Tag variant="info">23 components</Tag>
                <InlineAlert intent="success">Stakeholder packet is review-ready.</InlineAlert>
              </Flex>

              <Stack gap="sm">
                <Heading id={heroHeadingId} as="h1" size="5xl">
                  Campaign Review Workspace
                </Heading>
                <Text size="lg" color="muted">
                  A reusable dashboard shell for review, handoff, and release readiness using
                  Emerald primitives.
                </Text>
              </Stack>

              <Flex wrap="wrap" gap="sm">
                <Button icon={Upload}>Publish draft</Button>
                <Button variant="secondary" icon={MessageSquarePlus}>
                  Request feedback
                </Button>
                <Button variant="ghost" icon={ArrowUpRight}>
                  Open live preview
                </Button>
              </Flex>

              <Flex wrap="wrap" gap="sm" align="center">
                <Text size="sm" color="muted">
                  Quick regenerate:
                </Text>
                <Kbd>Shift</Kbd>
                <Kbd>Enter</Kbd>
                <Text size="sm" color="muted">
                  from any prompt field.
                </Text>
              </Flex>
            </Stack>

            <Container background="subtle" padding="md" className={classNames.heroMedia}>
              <Image
                src="/window.svg"
                alt="Illustration of the campaign review workspace shell."
                aspectRatio="16/9"
              />

              <Grid columns={{ default: 1, sm: 2 }} gap="sm">
                <Container background="card" border padding="md" className={classNames.metricCard}>
                  <Text size="sm" color="muted">
                    Publish readiness
                  </Text>
                  <Flex align="center" gap="sm">
                    <ProgressRing
                      label="Publish readiness"
                      value={84}
                      variant="success"
                      showValue
                    />
                    <Text size="sm" className={classNames.tabular}>
                      4 of 5 approval gates cleared.
                    </Text>
                  </Flex>
                </Container>

                <Container background="card" border padding="md" className={classNames.metricCard}>
                  <Text size="sm" color="muted">
                    Reviewer coverage
                  </Text>
                  <AvatarGroup size="sm">
                    <Avatar>
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>MN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>JR</AvatarFallback>
                    </Avatar>
                  </AvatarGroup>
                  <Text size="sm">Strategy, legal, and growth are assigned.</Text>
                </Container>
              </Grid>
            </Container>
          </Grid>
        </Container>

        <Grid columns={{ default: 1, xl: 2 }} gap="lg">
          <Stack gap="lg">
            <Container
              as="section"
              aria-labelledby={checklistHeadingId}
              background="card"
              border
              padding="lg"
              className={classNames.sectionCard}
            >
              <Stack gap="md">
                <Flex justify="between" align="start" wrap="wrap" gap="sm">
                  <Stack gap="xs">
                    <Heading id={checklistHeadingId} as="h2" size="3xl">
                      Launch checklist
                    </Heading>
                    <Text color="muted">
                      Monitor readiness, reviewers, and blockers in one place.
                    </Text>
                  </Stack>
                  <Tag variant="warning">2 blockers</Tag>
                </Flex>

                <Alert intent="warning" title="Publishing guardrail">
                  Human review is still required for legal disclosure copy and audience exclusions.
                </Alert>

                <Grid columns={{ default: 1, md: 2 }} gap="md">
                  <Container
                    background="subtle"
                    border
                    padding="md"
                    className={classNames.metricCard}
                  >
                    <Text size="sm" color="muted">
                      Checklist completion
                    </Text>
                    <ProgressBar
                      label="Checklist completion"
                      value={68}
                      variant="success"
                      showValue
                    />
                  </Container>

                  <Container
                    background="subtle"
                    border
                    padding="md"
                    className={classNames.metricCard}
                  >
                    <Text size="sm" color="muted">
                      Reviewer confidence
                    </Text>
                    <Rating label="Reviewer confidence" readOnly value={4} />
                    <InlineAlert intent="info">
                      Average rating increased after tone fixes.
                    </InlineAlert>
                  </Container>
                </Grid>

                <Divider />

                <Stack gap="sm">
                  <Text weight="semibold">Release notes</Text>
                  <Text color="muted">
                    Deployment target <Code>/apps/docs</Code> with annotated variants linked in{' '}
                    <Link href="https://example.com/playbook" external>
                      the launch playbook
                    </Link>
                    .
                  </Text>
                </Stack>
              </Stack>
            </Container>

            <Container
              as="section"
              aria-labelledby={promptHeadingId}
              background="card"
              border
              padding="lg"
              className={classNames.sectionCard}
            >
              <Stack gap="md">
                <Flex justify="between" align="start" wrap="wrap" gap="sm">
                  <Stack gap="xs">
                    <Heading id={promptHeadingId} as="h2" size="3xl">
                      Prompt configuration
                    </Heading>
                    <Text color="muted">
                      Use grouped field components for inputs, review preferences, and guardrails.
                    </Text>
                  </Stack>
                  <Button variant="secondary" icon={Sparkles}>
                    Generate draft
                  </Button>
                </Flex>

                <Field
                  label="Audience query"
                  instruction="Use a searchable phrase the growth team will recognize."
                  helper="This input powers the preview segment filters."
                >
                  <Input
                    startIcon={Search}
                    defaultValue="enterprise retention cohort"
                    placeholder="Search by campaign, audience, or market"
                  />
                </Field>

                <Field
                  label="System prompt"
                  helper="Describe tone, approvals, and hard constraints before publishing."
                >
                  <Textarea
                    rows={5}
                    defaultValue="Review the campaign summary for compliance, clarity, and tone. Flag anything that requires a human sign-off before publishing."
                  />
                </Field>

                <RadioGroupField
                  label="Review mode"
                  instruction="Choose how strict the model should be when it finds ambiguity."
                  defaultValue="balanced"
                >
                  <RadioOption
                    id={`${baseId}-review-mode-balanced`}
                    value="balanced"
                    label="Balanced"
                  />
                  <RadioOption id={`${baseId}-review-mode-strict`} value="strict" label="Strict" />
                  <RadioOption
                    id={`${baseId}-review-mode-exploratory`}
                    value="exploratory"
                    label="Exploratory"
                  />
                </RadioGroupField>

                <Container
                  background="subtle"
                  border
                  padding="md"
                  className={classNames.metricCard}
                >
                  <Text as="span" id={autonomyLabelId} weight="semibold">
                    Autonomy threshold
                  </Text>
                  <Slider
                    aria-labelledby={autonomyLabelId}
                    defaultValue={[72]}
                    thumbLabels={['Autonomy threshold']}
                  />
                  <InlineAlert intent="info">
                    High thresholds hold questionable recommendations for manual approval.
                  </InlineAlert>
                </Container>
              </Stack>
            </Container>
          </Stack>

          <Stack gap="lg">
            <Container
              as="section"
              aria-labelledby={settingsHeadingId}
              background="card"
              border
              padding="lg"
              className={classNames.sectionCard}
            >
              <Stack gap="md">
                <Heading id={settingsHeadingId} as="h2" size="3xl">
                  Review settings
                </Heading>
                <SwitchField
                  label="Require human sign-off"
                  description="Recommended"
                  instruction="Keep compliance-sensitive launches gated before publish."
                  helper="Human approval is required for legal and finance workspaces."
                  defaultChecked
                />
                <CheckboxField
                  label="Attach changelog to stakeholder packet"
                  helper="Includes prompt changes, reviewers, and updated assets."
                  defaultChecked
                />
                <CheckboxField
                  label="Notify channel owners after publish"
                  helper="Posts a summary to the shared campaign operations channel."
                />
              </Stack>
            </Container>

            <Container
              as="section"
              aria-labelledby={previewHeadingId}
              background="card"
              border
              padding="lg"
              className={classNames.sectionCard}
            >
              <Stack gap="md">
                <Heading id={previewHeadingId} as="h2" size="3xl">
                  Preview asset
                </Heading>
                <Image
                  src="/globe.svg"
                  alt="Global campaign asset marker used as a placeholder preview."
                  aspectRatio="4/3"
                  fit="contain"
                />
                <Flex wrap="wrap" gap="sm">
                  <Tag variant="success">Localized</Tag>
                  <Tag variant="default">Alt text ready</Tag>
                </Flex>
                <Text color="muted">
                  Use a descriptive asset preview alongside the generated packet before requesting
                  legal approval.
                </Text>
              </Stack>
            </Container>

            <Container
              as="section"
              aria-labelledby={handoffHeadingId}
              background="card"
              border
              padding="lg"
              className={classNames.sectionCard}
            >
              <Stack gap="md">
                <Heading id={handoffHeadingId} as="h2" size="3xl">
                  Command handoff
                </Heading>
                <Text color="muted">
                  Model: <Code>gpt-5.5</Code>
                </Text>

                <Stack gap="sm" className={classNames.shortcutList}>
                  <div className={classNames.shortcutRow}>
                    <Kbd>G</Kbd>
                    <Kbd>D</Kbd>
                    <Text size="sm">Generate draft</Text>
                  </div>
                  <div className={classNames.shortcutRow}>
                    <Kbd>R</Kbd>
                    <Kbd>V</Kbd>
                    <Text size="sm">Open reviewer view</Text>
                  </div>
                </Stack>

                <Link href="https://example.com/review-runbook" external>
                  Open the review runbook
                </Link>
              </Stack>
            </Container>
          </Stack>
        </Grid>
      </Container>
    </div>
  );
};

const DashboardShellLoadingPattern = () => (
  <div className={classNames.storyA11yScope}>
    <Container as="main" className={classNames.storyShell} padding="lg">
      <Container background="card" border padding="lg" className={classNames.heroPanel}>
        <Grid columns={{ default: 1, lg: 2 }} gap="lg">
          <Stack gap="md">
            <Skeleton variant="text" lines={1} width="40%" />
            <Skeleton variant="text" lines={3} />
            <div className={classNames.loadingButtons}>
              <Skeleton width={152} height={44} />
              <Skeleton width={180} height={44} />
              <Skeleton width={164} height={44} />
            </div>
          </Stack>
          <Skeleton variant="rectangular" height={320} />
        </Grid>
      </Container>

      <Grid columns={{ default: 1, xl: 2 }} gap="lg">
        <Container background="card" border padding="lg" className={classNames.sectionCard}>
          <Stack gap="md">
            <Skeleton variant="text" lines={2} />
            <Skeleton variant="rectangular" height={96} />
            <Skeleton variant="rectangular" height={160} />
            <Skeleton variant="text" lines={3} />
          </Stack>
        </Container>

        <Container background="card" border padding="lg" className={classNames.sectionCard}>
          <Stack gap="md">
            <Skeleton variant="text" lines={2} />
            <Skeleton variant="rectangular" height={220} />
            <Skeleton variant="text" lines={4} />
          </Stack>
        </Container>
      </Grid>
    </Container>
  </div>
);

const meta = {
  title: 'App Patterns/DashboardShell',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      context: '.' + classNames.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <DashboardShellPattern />,
  parameters: storySourceParameters(dashboardShellSource),
};

export const Loading: Story = {
  render: () => <DashboardShellLoadingPattern />,
  parameters: storySourceParameters(loadingSource),
};
