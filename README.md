# E-recipe blockchain project
Project for Agile Methods course project


Requirements:
(if script not working, run 'chmod +x filename' to add execution permission)

1) Download NodeJS dependencies, running script:
./installNodeDeps.sh

2) Ensure fabric binaries are present in /blockchain/bin
(if not copy it from ~/go/hyperledger/fabric/examples/fabric-samples/bin)


Instructions:

./startBlockchain.sh
Should start the blockchain network and prepare chaincode (prepare everything on the side of blockchain)

./stopBlockchain.sh
Stops the blockchain and remove all containers from memory, reseting the workspace.

./startApp.sh
Runs the python Flask server with web-application.


Info:

There are 3 peers from 3 organizations:
- peer0.patients.example.com
- peer0.doctors.example.com
- peer0.chemists.example.com
(For now everyone have permission to do everything, we can try to change it later).

There are two channels (two separate blockchains):
- recipe-channel
- transaction-channel


Current endorsment policy (consensus algorithm) requires approval of any other single peer, from any organization (run chaincode on his computer and compare if results are the same).
