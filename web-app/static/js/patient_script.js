function queryRecipes(recipes, transactions, recipeList, local_time) {
    $.ajax({
        type: "GET",
        url: "/patient/get_recipes",
        timeout: 600000,

        success: function (data) {
            var queried_recipes = JSON.parse(data);
		    recipes.push.apply(recipes, queried_recipes);
            console.log(recipes);
            queryTransactions(recipes, transactions, recipeList, local_time);
        },

        error: function (e) {
            alert('Error');
        }
    });
}

function queryTransactions(recipes, transactions, recipeList, local_time) {
    $.ajax({
        type: "GET",
        url: "/patient/get_transactions",
        timeout: 600000,

        success: function (data) {
            var queried_transactions = JSON.parse(data);
		    transactions.push.apply(transactions, queried_transactions);
            console.log(transactions);
            fillData(recipes, transactions, recipeList, local_time);
        },

        error: function (e) {
            alert('Error');
        }
    });
}

$(document).ready(function() {

    /////get current time for later comparisons
    var date = new Date();
    var local_time = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0,10);
    ///////

    // ok, so I haven't managed to put right variables there from json, so there
    // is just the template of the function used to generate a recipe with transaction
    var recipes = []; // json
    var transactions = []; //json
    var recipeList = document.getElementById('recipe-list');
    
    // Load data from blockchain
    queryRecipes(recipes, transactions, recipeList, local_time);
    
    // TEST values - later should be load from json
	/*
    var test_recipe = [
    	{'PrescriptionID': 1, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Rutinoscorbin', 'MedicineQuantity': '2 tabs', 'ExpirationDate': '2020-12-30', 'Note': "Take 2 tablets a day. Morning and Evening."},
    	{'PrescriptionID': 2, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Gripex', 'MedicineQuantity': '1 tab', 'ExpirationDate': '2020-12-30', 'Note': "Take once a day before going to sleep until fever stops"}
    ];
    recipes.push(test_recipe);
    var test_recipe2 = [
    	{'PrescriptionID': 3, 'RecipeID': 2, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Zabak', 'MedicineQuantity': '30 ml', 'ExpirationDate': '2010-12-30', 'Note': "Take 3 times a day."}
    ];
    recipes.push(test_recipe2);
    
    var test_transaction = {'TransactionID': 1, 'PrescriptionID': 1, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'ChemistID': 1,
    						'Medicine': 'Rutinoscorbin', 'MedicineQuantity': '2 tabs', 'MedicineValue': 4.80, 'TransactionDate': '2020-12-31', 'Closed': true};
    transactions.push(test_transaction);
    */
    // END OF TEST values
});

function fillData(recipes, transactions, recipeList, local_time) {
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
        tmpl.querySelector('.expiration-date').innerText = recipe[0].ExpirationDate;
        
        // Iterate through recipe to check if all prescribed medicines are bought
        var closedTrans = 0;
        for (prescription of recipe) {
			if (prescription.RecipeClosed)
				closedTrans++;
        }
        var recipeClosed = (closedTrans == recipe.length);
        tmpl.querySelector('.recipe-status').style.fontWeight = "bold";
        // chceck the recipe status
        if(local_time > recipe[0].ExpirationDate) {
            tmpl.querySelector('.recipe-status').innerText = "expired";
            tmpl.querySelector('.recipe-status').style.color = "#c44646";
        } else if (recipeClosed) {
            tmpl.querySelector('.recipe-status').innerText = "completed";
            tmpl.querySelector('.recipe-status').style.color = "#509b80";
        } else {
            tmpl.querySelector('.recipe-status').innerText = "not completed";
            tmpl.querySelector('.recipe-status').style.color = "#f4d142";
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
            
            tmpl_medicine_list.querySelector('.medicine-name').innerHTML += ',';
            if(prescription.Note !== ''){
                tmpl_medicine_list.querySelector('.medicine-quantity').innerHTML += ',';
            }

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
            

			if (prescription.RecipeClosed)
				tmpl_medicine_list.querySelector('.medicine').style.textDecoration = "line-through";


            
            // append the li of medicines to the list
            medicineList.appendChild(tmpl_medicine_list);
        }
        
        // now create list of transactions for a given recipe
        
        var transactionList = tmpl.querySelector('.transaction-list');
        
        if(transactions_arr.length === 0) {
            $('.transactions #empty_info').hide();
        }
        
        for(var n = 0; n < transactions_arr.length; n++) {
            var transaction = transactions_arr[n];
            
            var tmpl_transaction_list = document.getElementById('transaction-list-template').cloneNode(true);
            
            tmpl_transaction_list.querySelector('.date').innerText = transaction.TransactionDate;
            tmpl_transaction_list.querySelector('.chemist-id').innerText = transaction.ChemistID;
            tmpl_transaction_list.querySelector('.value').innerText = transaction.MedicineValue;
            
            tmpl_transaction_list.querySelector('.date').innerHTML += ',';
            tmpl_transaction_list.querySelector('.chemist-id').innerHTML += ',';
            
            // append the li of transaction to the list
            transactionList.appendChild(tmpl_transaction_list);
        }
        
        //lastly, add everything to the list.. then repeat, ufff
        //tmpl.style.display = 'block';
        recipeList.appendChild(tmpl);
    }
}
