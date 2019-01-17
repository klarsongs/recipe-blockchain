package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	//"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)


type SmartContract struct {
}

type Transaction struct {
	TransactionID string `json:"TransactionID"`
	ChemistID string `json:"ChemistID"`
	PrescriptionID  string `json:"PrescriptionID"`
	RecipeID string `json:"RecipeID"`
	DoctorID string `json:"DoctorID"`
	PatientID  string `json:"PatientID"`
	Medicine string `json:"Medicine"`
	MedicineQuantity string `json:"MedicineQuantity"`
	MedicineValue string `json:"MedicineValue"`
	TransactionDate string `json:"TransactionDate"`
	//Closed string `json:"Closed"`
}

type Recipe struct {
	PrescriptionID string `json:"PrescriptionID"`
	RecipeID string `json:"RecipeID"`
	DoctorID string `json:"DoctorID"`
	PatientID  string `json:"PatientID"`
	Medicine string `json:"Medicine"`
	MedicineQuantity string `json:"MedicineQuantity"`
	ExpirationDate string `json:"ExpirationDate"`
	Note string `json:"Note"`
	RecipeDate string `json:"RecipeDate"`
	RecipeClosed bool `json:"RecipeClosed"`
	//Limit  string `json:"Limit"`
}

// ToChaincodeArgs converts string args to []byte args
func ToChaincodeArgs(args ...string) [][]byte {
	bargs := make([][]byte, len(args))
	for i, arg := range args {
		bargs[i] = []byte(arg)
	}
	return bargs
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}


func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	if function == "queryTransaction" {
		return s.queryTransaction(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordTransaction" {
		return s.recordTransaction(APIstub, args)
	} else if function == "queryAllTransaction" {
		return s.queryAllTransaction(APIstub)
	//} else if function == "changClosedStatus" {
	//	return s.changClosedStatus(APIstub, args)
	} else if function == "queryPatientTransactions" {
		return s.queryPatientTransactions(APIstub, args)
	//} else if function == "queryRecipeTransactions" {
	//	return s.queryRecipeTransactions(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}


func (s *SmartContract) queryTransaction(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	transactionAsBytes, _ := APIstub.GetState(args[0])
	if transactionAsBytes == nil {
		return shim.Error("Could not locate transaction")
	}
	return shim.Success(transactionAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	transaction := []Transaction{
    Transaction{TransactionID: "1", ChemistID: "1", PrescriptionID: "1", RecipeID: "1", DoctorID: "1", PatientID: "1", Medicine: "Rutinoscorbin", MedicineQuantity: "2 tabs", MedicineValue: "4.80", TransactionDate: "03-12-2017"},
    Transaction{TransactionID: "2", ChemistID: "3", PrescriptionID: "7", RecipeID: "1", DoctorID: "1", PatientID: "9", Medicine: "Advil", MedicineQuantity: "20", MedicineValue: "20", TransactionDate: "04-12-2017"},
    Transaction{TransactionID: "3", ChemistID: "2", PrescriptionID: "8", RecipeID: "2", DoctorID: "6", PatientID: "27", Medicine: "Morphine", MedicineQuantity: "5", MedicineValue: "65", TransactionDate: "05-12-2018"},
    Transaction{TransactionID: "4", ChemistID: "1", PrescriptionID: "", RecipeID: "", DoctorID: "", PatientID: "1", Medicine: "Gripex", MedicineQuantity: "2 tabs", MedicineValue: "3.60", TransactionDate: "03-12-2017"}}

	i := 0
	for i < len(transaction) {
		fmt.Println("i is ", i)
		transactionAsBytes, _ := json.Marshal(transaction[i])
		APIstub.PutState(strconv.Itoa(i+1), transactionAsBytes)
		fmt.Println("Added", transaction[i])
		i = i + 1
	}

	return shim.Success(nil)
}


func (s *SmartContract) recordTransaction(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 10 {
		return shim.Error("Incorrect number of arguments. Expecting 10")
	}

	// Prepare transaction
	var transaction = Transaction{ TransactionID: args[0], ChemistID: args[1], PrescriptionID: args[2], RecipeID: args[3], DoctorID: args[4], PatientID: args[5], Medicine: args[6], MedicineQuantity: args[7], MedicineValue: args[8], TransactionDate: args[9]}

	// Upload transaction
	transactionAsBytes, _ := json.Marshal(transaction)
	err := APIstub.PutState(args[0], transactionAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record transaction packet: %s", args[0]))
	}


/*
	// Get recipes and transactions with the same RecipeID as this transaction
	recipe_id = args[3]
	
	// Query recipes from the other channel
	chaincodeArgs := ToChaincodeArgs("queryRecipe", recipe_id)
	response := APIstub.InvokeChaincode("recipe-chaincode", chaincodeArgs, "recipe-channel")
	if response.Status != shim.OK {
		return shim.Error(response.Message)
	}
	responseBytes := response.Payload
	recipes := make([]Recipe, 0)
	json.Unmarshal(responseBytes, &recipes)
	
	// Query transactions
	chaincodeArgs := ToChaincodeArgs("queryRecipeTransactions", recipe_id)
	response := APIstub.InvokeChaincode("transaction-chaincode", chaincodeArgs)
	if response.Status != shim.OK {
		return shim.Error(response.Message)
	}
	responseBytes := response.Payload
	transactions := make([]Transaction, 0)
	json.Unmarshal(responseBytes, &transactions)
	
	// Compare the number of both, call Close if it is the same (all recipe elements are realized)
	if len(transactions) >= len(recipes) {
		chaincodeArgs := ToChaincodeArgs("closeRecipe", recipe_id)
		response := APIstub.InvokeChaincode("recipe-chaincode", chaincodeArgs, "recipe-channel")
		if response.Status != shim.OK {
			return shim.Error(response.Message)
		}
	}
*/	
	return shim.Success(nil)
}

func (s *SmartContract) queryAllTransaction(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	//fmt.Printf("- queryAllTransaction:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryPatientTransactions(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}	

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		transactionAsBytes := queryResponse.Value
		transaction := Transaction{}
		json.Unmarshal(transactionAsBytes, &transaction)

		// Here can modify or check data
		if transaction.PatientID != string(args[0])  || transaction.PrescriptionID == ""{
			continue
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	//fmt.Printf("- queryAllTransaction:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
func (s *SmartContract) queryRecipeTransactions(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}	

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		transactionAsBytes := queryResponse.Value
		transaction := Transaction{}
		json.Unmarshal(transactionAsBytes, &transaction)

		// Here can modify or check data
		if transaction.RecipeID != string(args[0]) {
			continue
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	//fmt.Printf("- queryAllTransaction:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
*/

/*
func (s *SmartContract) changClosedStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	transactionAsBytes, _ := APIstub.GetState(args[0])
	if transactionAsBytes == nil {
		return shim.Error("Could not locate transaction")
	}
	transaction := Transaction{}

	json.Unmarshal(transactionAsBytes, &transaction)
	//transaction.Info = args[1]

	transactionAsBytes, _ = json.Marshal(transaction)
	err := APIstub.PutState(args[0], transactionAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change transaction information: %s", args[0]))
	}

	return shim.Success(nil)
}
*/

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
