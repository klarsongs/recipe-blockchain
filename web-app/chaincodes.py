import os
from Naked.toolshed.shell import execute_js, muterun_js
    
def list2str(parameters):
    return " ".join(str(param) for param in parameters)   
    
# "Backend" functions to query and invoke any chaincode (using NodeJS called through Naked)
def query_chaincode(channel, chaincode, function, parameters):
    parameters = list2str(parameters)
    args = channel + ' ' + chaincode + ' ' + function + ' ' + parameters
    response = muterun_js('node-connectors/query.js', arguments=args)
    if response.exitcode == 0:
        return response.stdout.split('Response is ', 1)[1]
    else:
        sys.stderr.write(response.stderr)
        return None
        
def invoke_chaincode(channel, chaincode, function, parameters):
    parameters = list2str(parameters)
    args = channel + ' ' + chaincode + ' ' + function + ' ' + parameters
    response = muterun_js('node-connectors/invoke.js', arguments=args)
    if response.exitcode == 0:
        return True
    else:
        sys.stderr.write(response.stderr)
        return False
    
    
# Recipe query functions
def get_recipe(recipe_id):
    channel = 'recipe-channel'
    chaincode = 'recipe-chaincode'
    function = 'queryRecipe'
    parameters = [recipe_id]
    
    response = query_chaincode(channel, chaincode, function, parameters)
    return response
    
def get_recipe_by_patient(patient_id):
    channel = 'recipe-channel'
    chaincode = 'recipe-chaincode'
    function = 'queryRecipeByPatient'
    parameters = [patient_id]
    
    response = query_chaincode(channel, chaincode, function, parameters)
    return response
    
# Recipe invoke functions
def add_recipe(idx, recipe_id, doctor_id, patient_id, limit):
    channel = 'recipe-channel'
    chaincode = 'recipe-chaincode'
    function = 'recordRecipe'
    parameters = [idx, recipe_id, doctor_id, patient_id, limit]
    # BTW - Why have recipe_id, when the key is already id of recipe? or there could be many entries forming 1 recipe?
    
    success = invoke_chaincode(channel, chaincode, function, parameters)
    return success

def change_recipe_limit(recipe_id, limit):
    channel = 'recipe-channel'
    chaincode = 'recipe-chaincode'
    function = 'changeRecipeLimit'
    parameters = [recipe_id, limit]
    
    success = invoke_chaincode(channel, chaincode, function, parameters)
    return success
    
    
    
# Transaction query functions


# Transaction invoke functions
def add_transaction(idx, transaction_id, chemist_id, prescription_id, info):
    channel = 'transaction-channel'
    chaincode = 'transaction-chaincode'
    function = 'recordTransaction'
    parameters = [idx, transaction_id, chemist_id, prescription_id, info]
    # BTW - Why have transaction_id, when the key is already id of transaction? or there could be many entries forming 1 transaction?
    
    success = invoke_chaincode(channel, chaincode, function, parameters)
    return success
    
