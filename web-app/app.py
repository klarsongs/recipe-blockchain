from flask import Flask, jsonify, request, make_response, session, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

import requests
import json
import os

import chaincodes

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SECRET_KEY'] = 'thisissecret'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:rootsuper@localhost:3306/e-recepie' # hosted MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')  # NoSQL - SQLite

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # username = db.Column(db.String(45))
    FirstName = db.Column(db.String(45))
    LastName = db.Column(db.String(45))
    Role = db.Column(db.String(45))
    insurance = db.Column(db.Integer)
    password = db.Column(db.String(255))
    email = db.Column(db.String(255))


db.create_all()
db.session.commit()


@app.route('/isloggedin', methods=['GET'])
def is_logged_in():
    if 'logged' in session:
        return jsonify({'message' : 'True'})
    else:
        return jsonify({'message' : 'False'})



@app.route('/register', methods=['POST'])
def create_user():

    postedData = request.get_json()
    # username = postedData["username"]
    FirstName = postedData["FirstName"]
    LastName = postedData["LastName"]
    Role = postedData["Role"]
    insurance = postedData["insurance"]
    password = postedData["password"]
    email = postedData["email"]

    if '' in postedData.values():
        return jsonify({'success': False, 'message': 'All fields must be filled'})

    # i dont check password and its repeated in here because it can be easily check in frontend without need to send data to backend anymore

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'success': False, 'message' : 'user already exists'})

    hashed_password = generate_password_hash(postedData["password"], method='sha256')

    new_user = User(FirstName=postedData["FirstName"],LastName=postedData["LastName"],Role = postedData["Role"],insurance = postedData["insurance"],password=hashed_password, email=postedData["email"])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'message' : 'New user created!'})


@app.route('/login', methods=['POST'])
def login():
    postedData = request.get_json()
    usermail = postedData["email"]
    password = postedData["password"]

    if not postedData or not usermail or not password:
        return jsonify({'success': False, 'message' : 'Please enter both email and password'})

    user = User.query.filter_by(email=usermail).first()

    if not user:
        return jsonify({'message' : 'wrong credentials'})

    if check_password_hash(user.password, password):
        session['logged'] = True
        session['role'] = user.Role
        session['id'] = user.id
        return jsonify({'success': True, 'message' : 'login successful'})
    return jsonify({'success': False, 'message' : 'wrong credentials'})


@app.route('/logout', methods=['GET'])
def logout():
    if not 'logged' in session:
        return jsonify({'success': False, 'message': "User not logged in. Can't logout."})
    session.pop('logged', None)
    return jsonify({'success': True, 'message': 'Log out successful'})

@app.route('/')
def index():
    if not 'logged' in session:
        return render_template('login.html')
    else:
        if session['role'] == 'Doctor':
            return render_template('user_page/doctor.html', id=session['id'])
        elif session['role'] == 'Chemist':
            return render_template('user_page/chemist.html', id=session['id'])
        elif session['role'] == 'Patient':
            return render_template('user_page/patient.html', id=session['id'])
        else:
            session.clear()

@app.route('/chemist/add_transaction', methods=['POST'])
def add_transaction():
    print(data)

@app.route('/doctor/add_recipe', methods=['POST'])
def add_recipe():
    # TODO: Load data from post vars
    print(request.get_data())
    success = chaincodes.add_recipe(idx=666, recipe_id=666, doctor_id=1, patient_id=2, limit=1)
    if success:
        return "Success"  # TODO: Should return id of new recipe?
    else:
        abort(400)  # Bad request

@app.route('/chemist/get_recipe/<id>', methods=['GET'])
def get_recipe(id):
    response = chaincodes.get_recipe_by_patient(id)
    if response is not None:
        return response
    else:
        abort(404)  # Not found

if __name__ == '__main__':
    app.run(debug=True)
