from flask import Flask, session, redirect, url_for
from authlib.integrations.flask_client import OAuth
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Secret key for session management

oauth = OAuth(app)

oauth.register(
    name='oidc',
    authority='https://cognito-idp.ca-central-1.amazonaws.com/ca-central-1_BRHwuiSO6',
    client_id='6evs9njelpsoi420kgpacflnk9',
    client_secret='1hlfmib544bhv0k01l9t51jb6bf0f83gie7rqi09qkg3vc10ruic',
    server_metadata_url='https://cognito-idp.ca-central-1.amazonaws.com/ca-central-1_BRHwuiSO6/.well-known/openid-configuration',
    client_kwargs={'scope': 'email openid phone'}
)

@app.route('/')
def index():
    user = session.get('user')
    if user:
        return f'Hello, {user["email"]}. <a href="/logout">Logout</a>'
    else:
        return f'Welcome! Please <a href="/login">Login</a>.'

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return oauth.oidc.authorize_redirect('https://localhost:3000')

@app.route('/authorize')
def authorize():
    token = oauth.oidc.authorize_access_token()
    user = token['userinfo']
    session['user'] = user
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
