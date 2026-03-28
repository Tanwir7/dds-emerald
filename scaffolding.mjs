// scaffolding.mjs (abbreviated)
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const [,, name] = process.argv;
if (!name) { console.error('Usage: node scaffolding.mjs ComponentName'); process.exit(1); }

const dir = `packages/components/src/components/${name}`;
mkdirSync(dir, { recursive: true });

// Component template
writeFileSync(join(dir, `${name}.tsx`), `
import React from 'react';
import styles from './${name}.module.scss';
import clsx from 'clsx';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

${name}.displayName = '${name}';
`.trimStart());

// SCSS template
writeFileSync(join(dir, `${name}.module.scss`), `
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;

.root {
  // TODO: implement ${name} styles
  // Always use --dds-* tokens. Never hardcode values.
}
`.trimStart());

// Test template
writeFileSync(join(dir, `${name}.test.tsx`), `
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ${name} } from './${name}';

expect.extend(toHaveNoViolations);

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name}>content</${name}>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('forwards className', () => {
    render(<${name} className="custom">content</${name}>);
    expect(screen.getByText('content')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<${name} ref={ref}>content</${name}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no a11y violations', async () => {
    const { container } = render(<${name}>content</${name}>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // TODO: add variant tests, state tests, interaction tests
});
`.trimStart());

// Stories template
writeFileSync(join(dir, `${name}.stories.tsx`), `
import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: '${name}',
  },
};
`.trimStart());

// index.ts
writeFileSync(join(dir, 'index.ts'), `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`);

console.log(`✅ Scaffolded ${name} in ${dir}`);
