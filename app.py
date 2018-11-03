from flask import Flask, jsonify, request, make_response, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import json

app = Flask(__name__)

app.config['SECRET_KEY'] = 'thisissecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:rootsuper@localhost:3306/e-recepie'

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(45))
    FirstName = db.Column(db.String(45))
    LastName = db.Column(db.String(45))
    Role = db.Column(db.String(45))
    insurance = db.Column(db.Integer)
    password = db.Column(db.String(255))


@app.route('/isloggedin', methods=['GET'])
def is_logged_in():
    if 'logged' in session:
        return jsonify({'message' : 'True'})
    else:
        return jsonify({'message' : 'False'})



@app.route('/register', methods=['POST'])
def create_user():

    postedData = request.get_json()
    username = postedData["username"]
    FirstName = postedData["FirstName"]
    LastName = postedData["LastName"]
    Role = postedData["Role"]
    insurance = postedData["insurance"]
    password = postedData["password"]

    # i dont check password and its repeated in here because it can be easily check in frontend without need to send data to backend anymore

    username = User.query.filter_by(username=username).first()
    if username:
        return jsonify({'message' : 'username already exists'})

    hashed_password = generate_password_hash(postedData["password"], method='sha256')

    new_user = User(username=postedData['username'],FirstName=postedData["FirstName"],LastName=postedData["LastName"],Role = postedData["Role"],insurance = postedData["insurance"],password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message' : 'New user created!'})


@app.route('/login', methods=['POST'])
def login():
    postedData = request.get_json()
    usern = postedData["username"]
    password = postedData["password"]

    if not postedData or not usern or not password:
        return jsonify({'message' : 'Please enter both username and password'})

    username = User.query.filter_by(username=usern).first()

    if not username:
        return jsonify({'message' : 'wrong credentials'})

    if check_password_hash(username.password, password):
        session['logged'] =  True
        return jsonify({'message' : 'login successful'})
    return jsonify({'message' : 'wrong credentials'})



if __name__ == '__main__':
    app.run(debug=True)
