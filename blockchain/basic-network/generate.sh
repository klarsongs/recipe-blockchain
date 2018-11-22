#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
RECIPE_CHANNEL_NAME=recipe-channel
TRANSACTION_CHANNEL_NAME=transaction-channel

# remove previous crypto material and config transactions
rm -fr config/*
rm -fr crypto-config/*

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile ThreeOrgsOrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate recipe channel configuration transaction
configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./config/recipe_channel.tx -channelID $RECIPE_CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate recipe channel configuration transaction..."
  exit 1
fi

# generate transaction channel configuration transaction
configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./config/transaction_channel.tx -channelID $TRANSACTION_CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate transaction channel configuration transaction..."
  exit 1
fi

# generate anchor peer transactions for both channels
# ... for patients
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/PatientsRecipeMSPanchors.tx -channelID $RECIPE_CHANNEL_NAME -asOrg PatientsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for PatientsMSP ch1..."
  exit 1
fi
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/PatientsTransactionMSPanchors.tx -channelID $TRANSACTION_CHANNEL_NAME -asOrg PatientsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for PatientsMSP ch2..."
  exit 1
fi

# ... for doctors
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/DoctorsRecipeMSPanchors.tx -channelID $RECIPE_CHANNEL_NAME -asOrg DoctorsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for DoctorsMSP ch1..."
  exit 1
fi
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/DoctorsTransactionMSPanchors.tx -channelID $TRANSACTION_CHANNEL_NAME -asOrg DoctorsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for DoctorsMSP ch2..."
  exit 1
fi

# ... for chemists
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/ChemistsRecipeMSPanchors.tx -channelID $RECIPE_CHANNEL_NAME -asOrg ChemistsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for ChemistsMSP ch1..."
  exit 1
fi
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/ChemistsTransactionMSPanchors.tx -channelID $TRANSACTION_CHANNEL_NAME -asOrg ChemistsMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for ChemistsMSP ch2..."
  exit 1
fi
