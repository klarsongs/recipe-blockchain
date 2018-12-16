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

    for(var i = 0; i < recipes.length; i++) {

        var recipe = recipes[i];

        // array with corresponding transactions
        var transactions_arr;

        // find corresponding transactions
        for(var k = 0; i < transactions.length; i++) {
            if(transactions[k].RecipeID === recipe.RecipeID) {
                transactions_arr.push(transactions[k]);
            }
        }

        // using the template from html, clone it
        var tmpl = document.getElementById('recipe-template').content.cloneNode(true);

        // assign recipe ID
        tmpl.querySelector('.recipe-id').innerText = recipe.RecipeID;

        // chceck the recipe status
        if(local_time > recipe.ExpirationDate) {
            tmpl.querySelector('.recipe-status').innerText = "expired";
            tmpl.querySelector('.recipe-status').style.color = "red";
        } else if (trans_status === "True") {
            tmpl.querySelector('.recipe-status').innerText = "completed";
            tmpl.querySelector('.recipe-status').style.color = "green";
        } else {
            tmpl.querySelector('.recipe-status').innerText = "not completed";
            tmpl.querySelector('.recipe-status').style.color = "yellow";
        }

        // check the doctor ID (probably should also show name)
        tmpl.querySelector('.doctor-id').innerText = recipe.DoctorID

        // create list of medicines
        // iterate through the list of medicines from recipe
        
        var medicineList = document.getElementById('medicine-list');
        
        for(var j = 0; j < recipes.medicines.length; j++) {
            var medicine = recipes.medicines[j];

            // use template for medicine-list
            var tmpl_medicine_list = document.getElementById('medicine-list-template').content.cloneNode(true);

            tmpl_medicine_list.querySelector('.medicine-name').innerText = medicine.Name;
            tmpl_medicine_list.querySelector('.medicine-quantity').innerText = medicine.Quantity;
            tmpl_medicine_list.querySelector('.medicine-notes').innerText = medicine.Note;

            // check if medicine is in the medicine list of transaction
            // if it is in the transaction, then marked as already bought
            // no idea how to check medicines inside transaction
            for(var l = 0; l < transactions_arr.length; l++) {
                for (var m = 0; m < medicines_arr.length; m++) {
                    if(transactions_arr[l].Medicines[m].Name === medicine.Name) {
                        tmpl_medicine_list.querySelector('.medicine').style.textDecoration = "overline";
                    }
                }
            }
            
            // append the li of medicines to the list
            medicineList.appendChild(tmpl_medicine_list);
        }
        
        // now create list of transactions for a given recipe
        var transactionList = document.getElementById('transaction-list');
        for(var n = 0; n < transactions_arr.length; n++) {
            var transaction = transactions_arr[n];
            
            var tmpl_transaction_list = document.getElementById('transaction-list-template').content.cloneNode(true);
            
            tmpl_transaction_list.querySelector('.date').innerText = transaction.Date;
            tmpl_transaction_list.querySelector('.chemist-id').innerText = transaction.ChemistID;
            tmpl_transaction_list.querySelector('.value').innerText = transaction.Value;
            
            transactionList.appendChild(tmpl_transaction_list);
            
        }
        
        //lastly, add everything to the list.. then repeat, ufff
        recipeList.appendChild(tmpl);
    }
    
});