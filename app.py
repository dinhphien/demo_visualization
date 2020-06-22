from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('visualization.html')


@app.route('/visualization')
def visualization():
    return render_template('visualization.html')

@app.route('/entity')
def entity():
    return render_template('entityTable.html')

@app.route('/news')
def news():
    return render_template('newsTable.html')

@app.route('/login')
def login():
    return render_template('sign-in.html')


@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


if __name__ == '__main__':
    app.run(debug=True, port=9999)
