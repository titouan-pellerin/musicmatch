export class SpotifyLogin {
  exchangeHost: string;
  accessToken: string | null = null;
  expiresIn: number | null = null;

  constructor(exchangeHost: string) {
    this.exchangeHost = exchangeHost;
  }

  login() {
    return new Promise<string>((resolve, reject) => {
      const width = 450,
        height = 730,
        left = screen.width / 2 - width / 2,
        top = screen.height / 2 - height / 2;

      window.open(
        this.exchangeHost + '/login',
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
          width +
          ', height=' +
          height +
          ', top=' +
          top +
          ', left=' +
          left,
      );

      window.addEventListener('message', (e) => {
        if (e && e.origin === this.exchangeHost) {
          const hash = JSON.parse(e.data);
          if (hash.type === 'access_token') {
            this.accessToken = hash.access_token;
            this.expiresIn = hash.expires_in;
            if (this.accessToken === '') {
              reject();
            } else {
              const refreshToken = hash.refresh_token;
              localStorage.setItem('refreshToken', refreshToken);

              resolve(hash.access_token);
            }
          }
        } else {
          reject();
        }
      });
    });
  }

  async refreshToken() {
    const refresh_token = localStorage.getItem('refreshToken');
    if (refresh_token) {
      const newToken = await fetch(
        this.exchangeHost + '/refresh_token?' + new URLSearchParams({ refresh_token }),
      ).then((response) => response.json());
      this.accessToken = newToken.access_token;
      this.expiresIn = newToken.expires_in;
      return newToken.access_token;
    }
  }
}
