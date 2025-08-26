import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable loading spinner component with multiple sizes and color options. Designed with accessibility in mind and includes proper ARIA labels.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the spinner',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'neutral', 'current'],
      description: 'Color of the spinner',
    },
    label: {
      control: { type: 'text' },
      description: 'Accessibility label for screen readers',
    },
  },
  args: {
    label: 'Loading...',
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    label: 'Loading (extra small)',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Loading (small)',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Loading (medium)',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Loading (large)',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    label: 'Loading (extra large)',
  },
};

export const PrimaryColor: Story = {
  args: {
    size: 'md',
    color: 'primary',
    label: 'Loading with primary color',
  },
};

export const NeutralColor: Story = {
  args: {
    size: 'md',
    color: 'neutral',
    label: 'Loading with neutral color',
  },
};

export const CurrentColor: Story = {
  args: {
    size: 'md',
    color: 'current',
    label: 'Loading with current color',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="xs" />
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          Extra Small
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="sm" />
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="md" />
        <div style={{ marginTop: '0.5rem' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" />
        <div style={{ marginTop: '0.5rem', fontSize: '1.125rem' }}>Large</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="xl" />
        <div style={{ marginTop: '0.5rem', fontSize: '1.25rem' }}>
          Extra Large
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available spinner sizes displayed together for comparison.',
      },
    },
  },
};

export const AllColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" color="primary" />
        <div style={{ marginTop: '0.5rem' }}>Primary</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" color="neutral" />
        <div style={{ marginTop: '0.5rem' }}>Neutral</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'purple' }}>
          <LoadingSpinner size="lg" color="current" />
        </div>
        <div style={{ marginTop: '0.5rem' }}>Current (Purple)</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available color options displayed together.',
      },
    },
  },
};

export const CustomLabel: Story = {
  args: {
    size: 'md',
    label: 'Please wait while we process your request...',
  },
};

export const InlineUsage: Story = {
  render: () => (
    <div style={{ fontSize: '1.125rem' }}>
      Processing your request{' '}
      <LoadingSpinner size="sm" color="current" label="Processing" /> please
      wait...
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using the spinner inline with text.',
      },
    },
  },
};
