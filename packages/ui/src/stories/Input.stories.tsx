import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../components/Input';

// Mock function for actions
const fn = () => () => {};

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible input component with validation states, icons, labels, and helper text. Supports different sizes and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'Visual variant of the input',
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the input',
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text shown below the input',
    },
    error: {
      control: { type: 'text' },
      description:
        'Error message (overrides helperText and sets error variant)',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the input',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    helperText: 'Must be at least 3 characters long',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    error: 'Password must be at least 8 characters long',
    value: 'short',
  },
};

export const Success: Story = {
  args: {
    label: 'Email',
    variant: 'success',
    value: 'user@example.com',
    helperText: 'Email is available',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
    value: 'Disabled value',
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input fields in different sizes.',
      },
    },
  },
};

export const ValidationStates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <Input
        label="Default State"
        placeholder="Default input"
        helperText="This is a normal input field"
      />
      <Input
        label="Error State"
        placeholder="Invalid input"
        error="This field is required"
        value="invalid"
      />
      <Input
        label="Success State"
        variant="success"
        placeholder="Valid input"
        helperText="Looks good!"
        value="valid@example.com"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input fields showing different validation states.',
      },
    },
  },
};

export const InputTypes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <Input label="Text" type="text" placeholder="Enter text" />
      <Input label="Email" type="email" placeholder="Enter email" />
      <Input label="Password" type="password" placeholder="Enter password" />
      <Input label="Number" type="number" placeholder="Enter number" />
      <Input label="Search" type="search" placeholder="Search..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different HTML input types supported by the component.',
      },
    },
  },
};
