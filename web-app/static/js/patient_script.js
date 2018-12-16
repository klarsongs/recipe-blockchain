$(document).ready(function() {

    /////get current time for later comparisons
    var date = new Date();
    var local_time = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0,19);
    ///////

    // ok, so I haven't managed to put right variables there from json, so there
    // is just the template of the function used to generate a recipe with transaction
    var recipes = []; // json
    var transactions = []; //json
    var recipeList = document.getElementById('recipe-list');
    
    // TEST values - later should be load from json
    var test_recipe = [
    	{'PrescriptionID': 1, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Rutinoscorbin', 'MedicineQuantity': '2 tabs', 'ExpirationDate': '2020-12-30', 'Note': "Won't help"},
    	{'PrescriptionID': 2, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Gripex', 'MedicineQuantity': '1 tab', 'ExpirationDate': '2020-12-30', 'Note': "Could help"}
    ];
    recipes.push(test_recipe);
    var test_recipe2 = [
    	{'PrescriptionID': 3, 'RecipeID': 2, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Nothing', 'MedicineQuantity': '4 kg', 'ExpirationDate': '2020-12-30', 'Note': "Test"}
    ];
    recipes.push(test_recipe2);
    
    var test_transaction = {'TransactionID': 1, 'PrescriptionID': 1, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'ChemistID': 1,
    						'Medicine': 'Rutinoscorbin', 'MedicineQuantity': '2 tabs', 'MedicineValue': 4.80, 'TransactionDate': '2020-12-31', 'Closed': true};
    transactions.push(test_transaction);
    
    // END OF TEST values

    for(var i = 0; i < recipes.length; i++) {

		// array with all prescriptions corresponding to single recipe
        var recipe = recipes[i];
        //alert(JSON.stringify(recipe));

        // array with corresponding transactions
        var transactions_arr = [];

        // find corresponding transactions
        for(var k = 0; k < transactions.length; k++) {
            if(transactions[k].RecipeID === recipe[0].RecipeID) {
                transactions_arr.push(transactions[k]);
            }
        }

        // using the template from html, clone it
        var tmpl = document.getElementById('recipe-template').cloneNode(true);

        // assign recipe ID
        tmpl.querySelector('.recipe-id').innerText = recipe[0].RecipeID;
        
        // Iterate through recipe to check if all prescribed medicines are bought
        var closedTrans = 0;
        for (prescription of recipe) {
		    for (transaction of transactions_arr) {
		    	if (transaction.PrescriptionID != prescription.PrescriptionID)
		    		continue;	// Skip transactions not related to the currently checked prescription
		    		
		    	if (transaction.Closed == true)
		    		closedTrans++;
		    }
        }
        var recipeClosed = (closedTrans == recipe.length);

        // chceck the recipe status
        if(local_time > recipe[0].ExpirationDate) {
            tmpl.querySelector('.recipe-status').innerText = "expired";
            tmpl.querySelector('.recipe-status').style.color = "red";
        } else if (recipeClosed) {
            tmpl.querySelector('.recipe-status').innerText = "completed";
            tmpl.querySelector('.recipe-status').style.color = "green";
        } else {
            tmpl.querySelector('.recipe-status').innerText = "not completed";
            tmpl.querySelector('.recipe-status').style.color = "yellow";
        }

        // check the doctor ID (probably should also show name)
        tmpl.querySelector('.doctor-id').innerText = recipe[0].DoctorID

        // create list of medicines
        // iterate through the list of medicines from recipe
        
        
        var medicineList = tmpl.querySelector('.medicine-list');
        
        for(var j = 0; j < recipe.length; j++) {
            var prescription = recipe[j];

            // use template for medicine-list
            var tmpl_medicine_list = document.getElementById('medicine-list-template').cloneNode(true);

            tmpl_medicine_list.querySelector('.medicine-name').innerText = prescription.Medicine;
            tmpl_medicine_list.querySelector('.medicine-quantity').innerText = prescription.MedicineQuantity;
            tmpl_medicine_list.querySelector('.medicine-notes').innerText = prescription.Note;

            // check if medicine is in the medicine list of transaction
            // if it is in the transaction, then marked as already bought
            // no idea how to check medicines inside transaction
            /*
            for(var l = 0; l < transactions_arr.length; l++) {
                for (var m = 0; m < medicines_arr.length; m++) {
                    if(transactions_arr[l].Medicines[m].Name === prescription.Medicine) {
                        tmpl_medicine_list.querySelector('.medicine').style.textDecoration = "overline";
                    }
                }
            }
            */
            

			for (transaction of transactions_arr) {
				if (transaction.PrescriptionID != prescription.PrescriptionID)
					continue;	// Skip transactions not related to the currently checked prescription
					
				if (transaction.Closed == true)
					tmpl_medicine_list.querySelector('.medicine').style.textDecoration = "line-through";
			}

            
            // append the li of medicines to the list
            medicineList.appendChild(tmpl_medicine_list);
        }
        
        // now create list of transactions for a given recipe
        
        var transactionList = tmpl.querySelector('.transaction-list');
        for(var n = 0; n < transactions_arr.length; n++) {
            var transaction = transactions_arr[n];
            
            var tmpl_transaction_list = document.getElementById('transaction-list-template').cloneNode(true);
            
            tmpl_transaction_list.querySelector('.date').innerText = transaction.TransactionDate;
            tmpl_transaction_list.querySelector('.chemist-id').innerText = transaction.ChemistID;
            tmpl_transaction_list.querySelector('.value').innerText = transaction.MedicineValue;
            
            // append the li of transaction to the list
            transactionList.appendChild(tmpl_transaction_list);
        }
        
        //lastly, add everything to the list.. then repeat, ufff
        //tmpl.style.display = 'block';
        recipeList.appendChild(tmpl);
    }
    
});
