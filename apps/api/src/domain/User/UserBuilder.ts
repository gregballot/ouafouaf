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
    const email = Email.create(this.email);
    const password = await Password.create(this.password);
    const user = await User.create({ email, password });
    return user;
  }
}
