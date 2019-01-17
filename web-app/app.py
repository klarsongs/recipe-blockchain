from flask import Flask, jsonify, request, make_response, session, render_template, url_for, redirect, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

import requests
import json
import os

import chaincodes

# For id auto-numbering
TRANSACTION_ID = 10
RECIPE_ID = 10
PRESCRIPTION_ID = 10

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
    #print(birthday)

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
def chemist_add_transaction():
    global TRANSACTION_ID
    
    print('Adding transactions')
    data = request.get_json()
    #print(data)
    # TODO: Check if data is valid?

    transaction_id = TRANSACTION_ID
    
    # Read transactions in a loop
    for i, transaction in enumerate(data):
        #print(transaction)
        
        chemist_id = int(transaction['ChemistID'])
        if transaction['PrescriptionID'] == '':
            prescription_id = ''
            recipe_id = ''
            doctor_id = ''
        else:
            prescription_id = int(transaction['PrescriptionID'])
            recipe_id = int(transaction['RecipeID'])
            doctor_id = int(transaction['DoctorID'])
            
        patient_id = int(transaction['PatientID'])
        medicine = transaction['Medicine']
        quantity = transaction['Quantity']
        value = transaction['Value']
        date = transaction['Date']
        #is_closed = transaction['Status']
        #continue

        success = chaincodes.add_transaction(transaction_id, chemist_id, prescription_id, recipe_id, doctor_id, patient_id, medicine, quantity, value, date)
        if success:
            TRANSACTION_ID += 1
            transaction_id = TRANSACTION_ID
            
            # Mark as closed in recipe
            if prescription_id != '':
                success = chaincodes.close_prescription(prescription_id)
                if not success:
                    abort(400)  # Bad request
            
        else:
            abort(400)  # Bad request
            
    return jsonify({'success': True, 'message': 'Added transactions.'})

@app.route('/doctor/add_recipe', methods=['POST'])
def doctor_add_recipe():
    global RECIPE_ID
    global PRESCRIPTION_ID

    print('Adding prescriptions')
    data = request.get_json()
    #print(data)
     # TODO: Check if data is valid?

    recipe_id = RECIPE_ID
    prescription_id = PRESCRIPTION_ID
    
    # First increase id, if error then later decrease
    RECIPE_ID += 1
    
    # Read prescriptions in loop, add them as single recipe
    for i, prescription in enumerate(data):
        #print(prescription)
    
        doctor_id = int(prescription['DoctorID'])
        patient_id = int(prescription['PatientID'])
        medicine = prescription['Medicine']
        medicineQuantity = prescription['Quantity']
        expirationDate = prescription['ExpirationDate']
        note = prescription['Note']
        recipeDate = prescription['Date']

        success = chaincodes.add_recipe(prescription_id, recipe_id, doctor_id, patient_id, medicine, medicineQuantity, expirationDate, note, recipeDate)
        #print(success)

        if success:
            PRESCRIPTION_ID += 1
            recipe_id = RECIPE_ID - 1 # get old recipe value
            prescription_id = PRESCRIPTION_ID
        else:
            if i == 0:
                RECIPE_ID -= 1
            abort(400)  # Bad request
        
    return jsonify({'success': True, 'message': 'Added prescritpions.'})
        
        

@app.route('/chemist/get_recipes/<id>', methods=['GET'])
def chemist_get_recipes(id):
    response = chaincodes.get_open_recipe_by_patient(id)
    if response is not None:
        return response
    else:
        abort(404)  # Not found

@app.route('/doctor/get_patient/<id>', methods=['GET'])
def doctor_get_patient(id):
    patient = User.query.filter_by(id=id).first()
    if patient is None or patient.Role != 'Patient':
    	abort(404)  # Not found
    name = patient.FirstName + " " + patient.LastName
    birthday = patient.birthday
    insurance = patient.insurance
    return jsonify({'name': name, 'birthday': birthday, 'insurance': insurance})


@app.route('/patient/get_recipes', methods=['GET'])
def patient_get_recipes():
	id = session['id'] 
	response = chaincodes.get_recipe_by_patient(id)
	if response is not None:
		return response
	else:
		abort(404)  # Not found

@app.route('/patient/get_transactions', methods=['GET'])
def patient_get_transactions():
	id = session['id'] 
	response = chaincodes.get_transaction_by_patient(id)
	if response is not None:
		return response
	else:
		abort(404)  # Not found
		
@app.route('/doctor/get_patient_recipes/<id>', methods=['GET'])
def doctor_get_recipes(id):
	response = chaincodes.get_recipe_by_patient(id)
	if response is not None:
		return response
	else:
		abort(404)  # Not found
		
		
# Statistics:
@app.route('/stats', methods=['GET'])
def get_statistics():
    response = chaincodes.get_all_transactions()
    if response is None:
        abort(404)  # Not found 	
    transactions = json.loads(response)
    
    response = chaincodes.get_all_recipes()
    if response is None:
        abort(404)  # Not found	    
    recipes = json.loads(response)
	    
    stats = {}
    
    doctor_prescriptions = {}
    doctor_visits = {}; processed_recipes = {}
    
    for prescription in recipes:

        # Count of prescriptions per doctor
        if prescription['DoctorID'] not in doctor_prescriptions.keys():
            doctor_prescriptions[prescription['DoctorID']] = 1
        else: 
            doctor_prescriptions[prescription['DoctorID']] += 1
            
        # Count of patients (recipes) per doctor
        if prescription['DoctorID'] not in doctor_visits.keys():
            doctor_visits[prescription['DoctorID']] = 1
            processed_recipes[prescription['DoctorID']] = [prescription['RecipeID']]
        elif prescription['RecipeID'] not in processed_recipes[prescription['DoctorID']]:
            doctor_visits[prescription['DoctorID']] += 1
            processed_recipes[prescription['DoctorID']].append(prescription['RecipeID'])


    chemist_transactions = {}
    medicine_popularity = {}
    chemist_income = {}
    
    for transaction in transactions:
    
        # Count of transactions per chemist
        if transaction['ChemistID'] not in chemist_transactions.keys():
            chemist_transactions[transaction['ChemistID']] = 1
        else: 
            chemist_transactions[transaction['ChemistID']] += 1
            
        # Popularity ranking of medicines
        if transaction['Medicine'] not in medicine_popularity.keys():
            medicine_popularity[transaction['Medicine']] = 1
        else: 
            medicine_popularity[transaction['Medicine']] += 1
            
        # Income per chemist (sum of values)
        if transaction['ChemistID'] not in chemist_income.keys():
            chemist_income[transaction['ChemistID']] = float(transaction['MedicineValue'])
        else: 
            chemist_income[transaction['ChemistID']] += float(transaction['MedicineValue'])
            
            
    # Final touches
    sum_val = sum([val for val in doctor_prescriptions.values()])
    doctor_prescriptions['all'] = sum_val
    
    sum_val = sum([val for val in doctor_visits.values()])
    doctor_visits['all'] = sum_val
    
    sum_val = sum([val for val in chemist_transactions.values()])
    chemist_transactions['all'] = sum_val
    
    sum_val = sum([val for val in chemist_income.values()])
    chemist_income['all'] = sum_val
    
    medicine_ranking = [{'medicine': k, 'popularity': v} for k, v in medicine_popularity.items()]
    medicine_ranking.sort(key=lambda row: row['popularity'])
    
    stats['prescriptions_per_doctor'] = doctor_prescriptions
    stats['visits_per_doctor'] = doctor_visits
    stats['transactions_per_chemist'] = chemist_transactions
    stats['income_per_chemist'] = chemist_income
    stats['medicine_popularity'] = medicine_ranking
        
    return jsonify(stats)


if __name__ == '__main__':
    app.run(debug=True)
