import type { Meta, StoryObj } from '@storybook/react';
import { AuthCard, AuthButton, AuthInput } from '../components/auth';

const meta = {
  title: 'Auth/AuthCard',
  component: AuthCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A specialized card component designed for authentication forms. Provides consistent styling and layout for login/signup flows.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Main title displayed at the top of the card',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Subtitle text shown below the title',
    },
  },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    children: (
      <div
        style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}
      >
        Card Content
      </div>
    ),
  },
};

export const WithoutSubtitle: Story = {
  args: {
    title: 'Sign In',
    children: (
      <div
        style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}
      >
        Card Content
      </div>
    ),
  },
};

export const LoginForm: Story = {
  render: () => (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AuthInput label="Email" type="email" placeholder="Enter your email" />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <AuthButton>Sign In</AuthButton>
        <AuthButton variant="ghost">Don't have an account? Sign up</AuthButton>
      </form>
    </AuthCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete login form using AuthCard with AuthInput and AuthButton components.',
      },
    },
  },
};

export const SignupForm: Story = {
  render: () => (
    <AuthCard title="Create Account" subtitle="Sign up to get started">
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
        />
        <AuthInput label="Email" type="email" placeholder="Enter your email" />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a password"
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
        />
        <AuthButton>Create Account</AuthButton>
        <AuthButton variant="ghost">
          Already have an account? Sign in
        </AuthButton>
      </form>
    </AuthCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete signup form using AuthCard with multiple input fields.',
      },
    },
  },
};

export const WithError: Story = {
  render: () => (
    <AuthCard title="Sign In" subtitle="Welcome back">
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value="invalid-email"
          error="Please enter a valid email address"
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <AuthButton isLoading loadingText="Signing in...">
          Sign In
        </AuthButton>
      </form>
    </AuthCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Authentication form showing error states and loading button.',
      },
    },
  },
};
