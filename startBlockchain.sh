# Exit on first error.
set -e

cd blockchain/recipe-app

echo "======== Starting blockchain ========"
./startFabric.sh

echo "========== Enrolling admin =========="
node enrollAdmin.js

echo "========== Registering user ========="
node registerUser.js
