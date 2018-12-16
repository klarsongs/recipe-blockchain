from flask import Flask, jsonify, request, make_response, session, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

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
    insurance = db.Column(db.String(45))
    insurance_startdate = db.Column(db.Date)
    insurance_expireddate = db.Column(db.Date)
    password = db.Column(db.String(255))
    email = db.Column(db.String(255))
    birthday = db.Column(db.Date)


db.create_all()
db.session.commit()


# For id auto-numbering
TRANSACTION_ID = 10
RECIPE_ID = 10


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
    insurance_start = datetime.strptime(postedData["insurancestart"], '%Y-%m-%d')
    insurance_startdate = insurance_start.date()
    insurance_expired = datetime.strptime(postedData["insuranceexpired"], '%Y-%m-%d')
    insurance_expireddate = insurance_expired.date()
    password = postedData["password"]
    email = postedData["email"]
    birthday_datetime = datetime.strptime(postedData["birthday"], '%Y-%m-%d')
    birthday = birthday_datetime.date()
    print(birthday)

    if '' in postedData.values():
        return jsonify({'success': False, 'message': 'All fields must be filled'})

    # i dont check password and its repeated in here because it can be easily check in frontend without need to send data to backend anymore

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'success': False, 'message' : 'user already exists'})

    hashed_password = generate_password_hash(password, method='sha256')

    new_user = User(FirstName=FirstName, LastName=LastName, Role = Role,insurance = insurance, insurance_startdate = insurance_startdate,insurance_expireddate = insurance_expireddate, password=hashed_password, email=email, birthday=birthday)
    db.session.add(new_user)
    db.session.commit()
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
        session['FirstName'] = user.FirstName
        session['LastName'] = user.LastName
        session['insurance'] = user.insurance
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
            return render_template('user_page/doctor.html', id=session['id'], FirstName = session['FirstName'], LastName = session['LastName'])
        elif session['role'] == 'Chemist':
            return render_template('user_page/chemist.html', id=session['id'], FirstName = session['FirstName'], LastName = session['LastName'])
        elif session['role'] == 'Patient':
            return render_template('user_page/patient.html', id=session['id'], FirstName = session['FirstName'], LastName = session['LastName'], insurance = session['insurance'])
        else:
            session.clear()

@app.route('/chemist/add_transaction', methods=['POST'])
def add_transaction():
    data = request.get_json()
    # TODO: Check if data is valid?

    global TRANSACTION_ID
    transaction_id = TRANSACTION_ID
    chemist_id = int(data['ChemistID'])
    prescription_id = 1  # TODO: need it being passed from frontend
    info = str(data['Description'])

    success = chaincodes.add_transaction(transaction_id, transaction_id, chemist_id, prescription_id, info)
    if success:
        TRANSACTION_ID += 1
        return "Success"  # TODO: Should return id of new recipe?
    else:
        abort(400)  # Bad request

@app.route('/doctor/add_recipe', methods=['POST'])
def add_recipe():
    data = request.get_json()
     # TODO: Check if data is valid?

    global RECIPE_ID
    recipe_id = RECIPE_ID
    doctor_id = int(data['DoctorID'])
    patient_id = int(data['PatientID'])
    limit = 1  # TODO: add limit field in frontend?
    # TODO: Add description in chaincode?

    success = chaincodes.add_recipe(recipe_id, recipe_id, doctor_id, patient_id, limit)
    if success:
        RECIPE_ID += 1
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

@app.route('/doctor/get_patient/<id>', methods=['GET'])
def get_patient(id):
    patient = User.query.filter_by(id=id).first()
    name = patient.FirstName + " " + patient.LastName
    birthday = patient.birthday
    insurance = patient.insurance
    return jsonify({'name': name, 'birthday': birthday, 'insurance': insurance})




if __name__ == '__main__':
    app.run(debug=True)
