import { User, Email, Password } from './User';

export class UserBuilder {
  private email = 'test@example.com';
  private password = 'defaultpassword123';

  withEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }

  withPassword(password: string): UserBuilder {
    this.password = password;
    return this;
  }

  async build(): Promise<User> {
    const emailResult = Email.create(this.email);
    if (emailResult.isFailure()) {
      throw new Error(`Invalid test email: ${emailResult.error}`);
    }

    const passwordResult = await Password.create(this.password);
    if (passwordResult.isFailure()) {
      throw new Error(`Invalid test password: ${passwordResult.error}`);
    }

    const userResult = await User.create(emailResult.value, passwordResult.value);
    if (userResult.isFailure()) {
      throw new Error(`Invalid test user: ${userResult.error}`);
    }

    return userResult.value;
  }
}