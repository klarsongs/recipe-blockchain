import string
import random
from hashlib import sha256
import time


# one node mining part :
example_challenge = '9Kgdhjg52dfgdfgd78KgLda5Az'

def generation(challenge=example_challenge, size=25):
    answer = ''.join(random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits) for x in range(size))

    attemp = challenge+answer
    return attemp, answer


def testAttemp():
    Found = False
    start = time.time()
    while Found == False:
        attemp, answer = generation()
        solution = sha256(attemp.encode('utf-8')).hexdigest()
        if solution.startswith('00000'):   # in the case of bitcoin this should be around 40 zeros to begin with
            timeTook = time.time() - start
            #print(solution)
            print(timeTook)
            Found = True
    return attemp


# other nodes checking the result to make sure its true :
# this part merely takes an small fraction of time compared to when we mine the hash
def verifyAttemp(attemp):
    if sha256(attemp.encode('utf-8')).hexdigest().startswith('00000'):
        print("verified")
    else:
        print("unvalid")

x = testAttemp()
verifyAttemp(x)
