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
	Medicine string `json:"Medicine"`
	MedicineQuantity string `json:"MedicineQuantity"`
	ExpirationDate string `json:"ExpirationDate"`
	Note string `json:"ExpirationDate"`
	MultipleUse string `json:"ExpirationDate"`
	Limit  string `json:"Limit"`
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
	} else if function == "changeRecipeMultipleUse" {
		return s.changeRecipeMultipleUse(APIstub, args)
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
	recipe := []recipe{
		Recipe{idPrescription: "1", DoctorID: "1", PatientID: "1", Medicine: "Adderall", MedicineQuantity: "100",ExpirationDate: "03-12-2017",Note: "take it only once a day",MultipleUse: "False", Limit: "1"},
		Recipe{idPrescription: "2", DoctorID: "3", PatientID: "2", Medicine: "Advil", MedicineQuantity: "20",ExpirationDate: "12-08-2018",Note: "take it 3 times a day",MultipleUse: "True", Limit: "5"},
		Recipe{idPrescription: "32", DoctorID: "1", PatientID: "3", Medicine: "morphine", MedicineQuantity: "5",ExpirationDate: "28-06-2018",Note: "take it only when the pain kicks in",MultipleUse: "False", Limit: "3"}
	}

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

	if len(args) != 10 {
		return shim.Error("Incorrect number of arguments. Expecting 10")
	}

	var recipe = Recipe{ idPrescription: args[1], DoctorID: args[2], PatientID: args[3], Medicine: args[4], MedicineQuantity: args[6], ExpirationDate: args[7], Note: args[8], MultipleUse: args[9], Limit: args[10]}

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

func (s *SmartContract) changeRecipeMultipleUse(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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
	err := APIstub.PutState(args[0], recordRecipe)
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
