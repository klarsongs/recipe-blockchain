#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

RECIPE_CHANNEL_NAME=recipe-channel
TRANSACTION_CHANNEL_NAME=transaction-channel

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca.patients.example.com ca.doctors.example.com ca.chemists.example.com orderer.example.com peer0.patients.example.com peer0.doctors.example.com peer0.chemists.example.com couchdb0 couchdb1 couchdb2 cli

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channels
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@patients.example.com/msp" peer0.patients.example.com peer channel create -o orderer.example.com:7050 -c $RECIPE_CHANNEL_NAME -f /etc/hyperledger/configtx/recipe_channel.tx --outputBlock /etc/hyperledger/configtx/$RECIPE_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@patients.example.com/msp" peer0.patients.example.com peer channel create -o orderer.example.com:7050 -c $TRANSACTION_CHANNEL_NAME -f /etc/hyperledger/configtx/transaction_channel.tx --outputBlock /etc/hyperledger/configtx/$TRANSACTION_CHANNEL_NAME.block

# Join peers to the channels.
docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@patients.example.com/msp" peer0.patients.example.com peer channel join -b /etc/hyperledger/configtx/$RECIPE_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=PatientsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@patients.example.com/msp" peer0.patients.example.com peer channel join -b /etc/hyperledger/configtx/$TRANSACTION_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=DoctorsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@doctors.example.com/msp" peer0.doctors.example.com peer channel join -b /etc/hyperledger/configtx/$RECIPE_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=DoctorsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@doctors.example.com/msp" peer0.doctors.example.com peer channel join -b /etc/hyperledger/configtx/$TRANSACTION_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=ChemistsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@chemists.example.com/msp" peer0.chemists.example.com peer channel join -b /etc/hyperledger/configtx/$RECIPE_CHANNEL_NAME.block

docker exec -e "CORE_PEER_LOCALMSPID=ChemistsMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@chemists.example.com/msp" peer0.chemists.example.com peer channel join -b /etc/hyperledger/configtx/$TRANSACTION_CHANNEL_NAME.block

# Prepare CA affiliations
docker exec ca.patients.example.com fabric-ca-client enroll -u http://admin:adminpw@localhost:7054
docker exec ca.patients.example.com fabric-ca-client affiliation add patients

docker exec ca.doctors.example.com fabric-ca-client enroll -u http://admin:adminpw@localhost:7054
docker exec ca.doctors.example.com fabric-ca-client affiliation add doctors

docker exec ca.chemists.example.com fabric-ca-client enroll -u http://admin:adminpw@localhost:7054
docker exec ca.chemists.example.com fabric-ca-client affiliation add chemists
