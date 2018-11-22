#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

RECIPE_CHANNEL_NAME=recipe-channel
TRANSACTION_CHANNEL_NAME=transaction-channel

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

if [ ! -d ~/.hfc-key-store/ ]; then
	mkdir ~/.hfc-key-store/
fi

# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
cd ../basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our test data
docker-compose -f ./docker-compose.yml up -d cli

# Install chaincode for patients
# - recipe
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode install -n recipe-chaincode -v 1.0 -p github.com/recipe-app/recipe
# - transaction
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode install -n transaction-chaincode -v 1.0 -p github.com/recipe-app/transaction

# Install chaincode for doctors
# - recipe
docker exec -e "CORE_PEER_LOCALMSPID=DoctorsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/doctors.example.com/users/Admin@doctors.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.doctors.example.com:7051" cli peer chaincode install -n recipe-chaincode -v 1.0 -p github.com/recipe-app/recipe
# - transaction
docker exec -e "CORE_PEER_LOCALMSPID=DoctorsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/doctors.example.com/users/Admin@doctors.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.doctors.example.com:7051" cli peer chaincode install -n transaction-chaincode -v 1.0 -p github.com/recipe-app/transaction

# Install chaincode for chemists
# - recipe
docker exec -e "CORE_PEER_LOCALMSPID=ChemistsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chemists.example.com/users/Admin@chemists.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.chemists.example.com:7051" cli peer chaincode install -n recipe-chaincode -v 1.0 -p github.com/recipe-app/recipe
# - transaction
docker exec -e "CORE_PEER_LOCALMSPID=ChemistsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chemists.example.com/users/Admin@chemists.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.chemists.example.com:7051" cli peer chaincode install -n transaction-chaincode -v 1.0 -p github.com/recipe-app/transaction

# Instantiate chaincode for both channels
# - recipe
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C $RECIPE_CHANNEL_NAME -n recipe-chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('PatientsMSP.member','DoctorsMSP.member','ChemistsMSP.member')"
# - transaction
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C $TRANSACTION_CHANNEL_NAME -n transaction-chaincode -v 1.0 -c '{"Args":[""]}' -P "OR ('PatientsMSP.member','DoctorsMSP.member','ChemistsMSP.member')"

sleep 10
# Invoke chaincode to initialize recipe ledger with test data
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C $RECIPE_CHANNEL_NAME -n recipe-chaincode -c '{"function":"initLedger","Args":[""]}'

# Invoke chaincode to initialize transaction ledger with test data
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/patients.example.com/users/Admin@patients.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C $TRANSACTION_CHANNEL_NAME -n transaction-chaincode -c '{"function":"initLedger","Args":[""]}'

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
printf "Then run 'node enrollAdmin.js', then 'node registerUser'\n\n"
printf "The 'node invoke.js' will fail until it has been updated with valid arguments\n"
printf "The 'node query.js' may be run at anytime once the user has been registered\n\n"
