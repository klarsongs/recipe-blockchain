echo "======== Stopping blockchain ========"
./stopBlockchain.sh

# Exit on first error.
set -e

cd blockchain/recipe-app

echo "======== Starting blockchain ========"
./startFabric.sh

echo "========== Enrolling patient admin =========="
node enrollAdminPatient.js

echo "========== Registering patient ========="
node registerPatient.js

echo "========== Enrolling doctor admin =========="
node enrollAdminDoctor.js

echo "========== Registering doctor ========="
node registerDoctor.js

echo "========== Enrolling chemist admin =========="
node enrollAdminChemist.js

echo "========== Registering chemist ========="
node registerChemist.js

echo "############ RUN TESTS ##############"

echo "========= Query all recipes as doctor ========="
node queryRecipesDoctor.js

echo "====== Query all transactions as chemist ======="
node queryTransactions.js

echo "========= Query all recipes as patient (should fail) ========="
node queryRecipesPatient.js
