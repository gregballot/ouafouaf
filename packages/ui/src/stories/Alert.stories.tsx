import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../components/Alert';

// Mock function for actions
const fn = () => () => {};

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile alert component with multiple variants (info, success, warning, error) and optional close functionality. Designed with accessibility in mind and follows the design system tokens.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
      description: 'Visual style variant of the alert',
    },
    title: {
      control: { type: 'text' },
      description: 'Optional title for the alert',
    },
    children: {
      control: { type: 'text' },
      description: 'Main content of the alert',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when close button is clicked',
    },
  },
  args: {
    children: 'This is an alert message',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your input before proceeding',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred while processing your request',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Important Notice',
    children: 'This alert has a title and provides additional context for the user.',
  },
};

export const WithCloseButton: Story = {
  args: {
    variant: 'info',
    title: 'Dismissible Alert',
    children: 'This alert can be dismissed by clicking the close button.',
    onClose: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
      <Alert variant="info" title="Information">
        This is an informational alert with a title.
      </Alert>
      <Alert variant="success" title="Success">
        Operation completed successfully!
      </Alert>
      <Alert variant="warning" title="Warning">
        Please review your input before proceeding.
      </Alert>
      <Alert variant="error" title="Error">
        An error occurred while processing your request.
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available alert variants displayed together.',
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    variant: 'info',
    title: 'Detailed Information',
    children: 'This is a longer alert message that demonstrates how the component handles extended content. The alert will expand to accommodate the text while maintaining proper spacing and readability.',
  },
};
