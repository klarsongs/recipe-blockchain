echo "======== Stopping blockchain ========"
./stopBlockchain.sh

# Exit on first error.
set -e

cd blockchain/recipe-app

echo "======== Starting blockchain ========"
./startFabric.sh

echo "========== Enrolling admin =========="
node enrollAdmin.js

echo "========== Registering user ========="
node registerUser.js

echo "############ RUN TESTS ##############"

echo "========= Query all recipes ========="
node queryRecipes.js

echo "====== Query all transactions ======="
node queryTransactions.js
