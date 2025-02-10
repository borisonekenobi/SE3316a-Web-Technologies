export abstract class Service {
  readonly host: string = `http://${location.host.split(':')[0]}:3000/api`;

  protected updateToken(token: string): void {
    sessionStorage.setItem('token', token);
    if (token === null) {
      this.logout();
    }
  }

  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  }
}
