package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)


type SmartContract struct {
}

type Recipe struct {
	idPrescription string `json:"idPrescription"`
	DoctorID string `json:"DoctorID"`
	PatientID  string `json:"PatientID"`
	Limit  string `json:"Limit"`
	Info string `json:"Info"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}


func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryRecipe" {
		return s.queryRecipe(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordRecipe" {
		return s.recordRecipe(APIstub, args)
	} else if function == "queryAllRecipe" {
		return s.queryAllRecipe(APIstub)
	} else if function == "changeRecipeLimit" {
		return s.changeRecipeLimit(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}


func (s *SmartContract) queryRecipe(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	recipeAsBytes, _ := APIstub.GetState(args[0])
	if recipeAsBytes == nil {
		return shim.Error("Could not locate prescription")
	}
	return shim.Success(recipeAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	recipe := []Recipe{
		Recipe{idPrescription: "1", DoctorID: "1", PatientID: "1", Limit: "1"},
		Recipe{idPrescription: "2", DoctorID: "1", PatientID: "3", Limit: "1"},
		Recipe{idPrescription: "3", DoctorID: "4", PatientID: "14", Limit: "1"},
		Recipe{idPrescription: "4", DoctorID: "3", PatientID: "19", Limit: "1"},
		Recipe{idPrescription: "5", DoctorID: "2", PatientID: "6", Limit: "2"},
		Recipe{idPrescription: "6", DoctorID: "2", PatientID: "3", Limit: "2"},
		Recipe{idPrescription: "7", DoctorID: "4", PatientID: "1", Limit: "1"},
		Recipe{idPrescription: "8", DoctorID: "3", PatientID: "5", Limit: "5"},
		Recipe{idPrescription: "9", DoctorID: "5", PatientID: "0", Limit: "4"},
		Recipe{idPrescription: "10",DoctorID: "1", PatientID: "7", Limit: "1"}}

	i := 0
	for i < len(recipe) {
		fmt.Println("i is ", i)
		recipeAsBytes, _ := json.Marshal(recipe[i])
		APIstub.PutState(strconv.Itoa(i+1), recipeAsBytes)
		fmt.Println("Added", recipe[i])
		i = i + 1
	}

	return shim.Success(nil)
}


func (s *SmartContract) recordRecipe(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var recipe = Recipe{ idPrescription: args[1], DoctorID: args[2], PatientID: args[3], Limit: args[4]}

	recipeAsBytes, _ := json.Marshal(recipe)
	err := APIstub.PutState(args[0], recipeAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record prescription packet: %s", args[0]))
	}

	return shim.Success(nil)
}

func (s *SmartContract) queryAllRecipe(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

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
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllRecipe:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeRecipeLimit(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	recipeAsBytes, _ := APIstub.GetState(args[0])
	if recipeAsBytes == nil {
		return shim.Error("Could not locate prescription")
	}
	recipe := Recipe{}

	json.Unmarshal(recipeAsBytes, &recipe)
	recipe.Info = args[1]

	recipeAsBytes, _ = json.Marshal(recipe)
	err := APIstub.PutState(args[0], recipeAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change prescription information: %s", args[0]))
	}

	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
