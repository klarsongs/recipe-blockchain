package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	//"io/ioutil"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)


type SmartContract struct {
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
	//Limit  string `json:"Limit"`
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
	Closed string `json:"Closed"`
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
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryRecipe" {
		return s.queryRecipe(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordRecipe" {
		return s.recordRecipe(APIstub, args)
	} else if function == "queryAllRecipe" {
		return s.queryAllRecipe(APIstub)
	} else if function == "queryPatientRecipes" {
		return s.queryPatientRecipes(APIstub, args)
	} else if function == "queryPatientOpenRecipes" {
		return s.queryPatientOpenRecipes(APIstub, args)
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
	recipes := []Recipe{
		Recipe{PrescriptionID: "1", RecipeID: "1", DoctorID: "1", PatientID: "1", Medicine: "Rutinoscorbin", MedicineQuantity: "2 tabs",ExpirationDate: "2020-12-30",Note: "Take 2 tablets a day. Morning and Evening.", RecipeDate: "08-06-2017"},
		Recipe{PrescriptionID: "2", RecipeID: "1", DoctorID: "1", PatientID: "1", Medicine: "Gripex", MedicineQuantity: "1 tab",ExpirationDate: "2020-12-30",Note: "Take once a day before going to sleep until fever stops", RecipeDate: "12-06-2018"},
		Recipe{PrescriptionID: "3", RecipeID: "2", DoctorID: "1", PatientID: "1", Medicine: "Zabak", MedicineQuantity: "30 ml",ExpirationDate: "2020-12-30",Note: "Take 3 times a day.", RecipeDate: "21-04-2017"}}

	i := 0
	for i < len(recipes) {
		fmt.Println("i is ", i)
		recipeAsBytes, _ := json.Marshal(recipes[i])
		APIstub.PutState(strconv.Itoa(i+1), recipeAsBytes)
		fmt.Println("Added", recipes[i])
		i = i + 1
	}

	return shim.Success(nil)
}


func (s *SmartContract) recordRecipe(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// Check if user is doctor
	err := cid.AssertAttributeValue(APIstub, "accType", "doctor")
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(args) != 9 {
		return shim.Error("Incorrect number of arguments. Expecting 9")
	}

	var recipe = Recipe{ PrescriptionID: args[0], RecipeID: args[1], DoctorID: args[2], PatientID: args[3], Medicine: args[4], MedicineQuantity: args[5], ExpirationDate: args[6], Note: args[7], RecipeDate: args[8]}

	recipeAsBytes, _ := json.Marshal(recipe)
	err2 := APIstub.PutState(args[0], recipeAsBytes)
	if err2 != nil {
		return shim.Error(fmt.Sprintf("Failed to record prescription packet: %s", args[0]))
	}

	return shim.Success(nil)
}

func (s *SmartContract) queryAllRecipe(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Check if user is doctor
	err := cid.AssertAttributeValue(APIstub, "accType", "doctor")
	if err != nil {
		return shim.Error(err.Error())
	}
	
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
		
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	//fmt.Printf("- queryAllRecipe:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryPatientRecipes(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

	recipes := make(map[string][]string)
	
	var recipeAsBytes []byte
	var recipe Recipe

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		recipeAsBytes = queryResponse.Value
		recipe = Recipe{}
		json.Unmarshal(recipeAsBytes, &recipe)

		// Here can modify or check data
		if recipe.PatientID != string(args[0]) {
			continue
		}

		recipes[recipe.RecipeID] = append(recipes[recipe.RecipeID], string(recipeAsBytes))
	}
	
	// here fill json
	
	var buffer bytes.Buffer
	buffer.WriteString("[")
	
	i := 0;
	for _, recipe := range recipes {
		buffer.WriteString("[")
		buffer.WriteString(strings.Join(recipe, ","))
		buffer.WriteString("]")
		if i < len(recipes) - 1 {
			buffer.WriteString(",")
		}
		i++;
	}
	
	buffer.WriteString("]")
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryPatientOpenRecipes(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

	recipes := make(map[string][]string)
	
	// Query transactions from the other channel
	chaincodeArgs := ToChaincodeArgs("queryPatientTransactions", args[0])
	response := APIstub.InvokeChaincode("transaction-chaincode", chaincodeArgs, "transaction-channel")
	if response.Status != shim.OK {
		return shim.Error(response.Message)
	}
	
	responseBytes := response.Payload
	
	transactions := make([]Transaction, 0)
	json.Unmarshal(responseBytes, &transactions)
	
	var recipeAsBytes []byte
	var recipe Recipe

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		recipeAsBytes = queryResponse.Value
		recipe = Recipe{}
		json.Unmarshal(recipeAsBytes, &recipe)

		// Here can modify or check data
		skip := false
		if recipe.PatientID != string(args[0]) {
			skip = true
		}
		
		for _, tx := range transactions {
			if tx.PrescriptionID == recipe.PrescriptionID && tx.Closed == "True" {
				skip = true
				break
			}
		}
		if !skip {
			recipes[recipe.RecipeID] = append(recipes[recipe.RecipeID], string(recipeAsBytes))
		}
	}
	
	// here fill json
	
	var buffer bytes.Buffer
	buffer.WriteString("[")
	
	i := 0;
	for _, recipe := range recipes {
		buffer.WriteString("[")
		buffer.WriteString(strings.Join(recipe, ","))
		buffer.WriteString("]")
		if i < len(recipes) - 1 {
			buffer.WriteString(",")
		}
		i++;
	}
	
	buffer.WriteString("]")
	return shim.Success(buffer.Bytes())
}

/*
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
*/

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
