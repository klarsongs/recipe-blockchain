import os
from Naked.toolshed.shell import execute_js, muterun_js
    
def query_chaincode(channel, chaincode, function, parameters):
    args = channel + ' ' + chaincode + ' ' + function + ' ' + parameters
    response = muterun_js('node-connectors/query.js', arguments=args)
    if response.exitcode == 0:
        return response.stdout.split('Response is ', 1)[1]
    else:
        sys.stderr.write(response.stderr)
        return None
    
def get_recipe(recipe_id):
    channel = 'recipe-channel'
    chaincode = 'recipe-chaincode'
    function = 'queryRecipe'
    parameters = str(recipe_id)
    
    response = query_chaincode(channel, chaincode, function, parameters)
    return response
