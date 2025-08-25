import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../components/Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible card component with multiple variants (elevated, outlined, filled) and padding options. Designed to provide consistent container styling across the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevated', 'outlined', 'filled'],
      description: 'Visual style variant of the card',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size for the card content',
    },
    children: {
      control: { type: 'text' },
      description: 'Content to display inside the card',
    },
  },
  args: {
    children: 'Card content goes here',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'This is an elevated card with a subtle shadow.',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'This is an outlined card with a border.',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: 'This is a filled card with a background color.',
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'none',
    children: 'This card has no padding.',
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'sm',
    children: 'This card has small padding.',
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: 'This card has large padding.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', maxWidth: '800px' }}>
      <Card variant="elevated" style={{ width: '200px' }}>
        <h3>Elevated Card</h3>
        <p>This card has a subtle shadow effect.</p>
      </Card>
      <Card variant="outlined" style={{ width: '200px' }}>
        <h3>Outlined Card</h3>
        <p>This card has a border outline.</p>
      </Card>
      <Card variant="filled" style={{ width: '200px' }}>
        <h3>Filled Card</h3>
        <p>This card has a background fill.</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available card variants displayed together.',
      },
    },
  },
};

export const AllPaddingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', maxWidth: '800px' }}>
      <Card variant="elevated" padding="none" style={{ width: '180px' }}>
        <h3>No Padding</h3>
        <p>Content touches the edges.</p>
      </Card>
      <Card variant="elevated" padding="sm" style={{ width: '180px' }}>
        <h3>Small Padding</h3>
        <p>Minimal spacing around content.</p>
      </Card>
      <Card variant="elevated" padding="md" style={{ width: '180px' }}>
        <h3>Medium Padding</h3>
        <p>Standard spacing around content.</p>
      </Card>
      <Card variant="elevated" padding="lg" style={{ width: '180px' }}>
        <h3>Large Padding</h3>
        <p>Generous spacing around content.</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available padding sizes displayed together.',
      },
    },
  },
};

export const ComplexContent: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: (
      <div>
        <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Featured Article</h2>
        <p style={{ margin: '0 0 1rem 0', lineHeight: '1.6' }}>
          This card demonstrates how the component handles complex content with multiple elements,
          including headings, paragraphs, and interactive elements.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>
            Read More
          </button>
          <button style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>
            Share
          </button>
        </div>
      </div>
    ),
  },
};
