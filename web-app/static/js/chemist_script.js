// Remove li from list
function myFunc(elem) {
    let li = elem.parentNode;
    li.parentNode.removeChild(li);
}

$(document).ready(function(){

    $("#copy_recipe").click( function(event) {
        var doc_ID = $('#recipe #read-recipe-elements-doctor').val();
        var medicines = document.getElementById("read-recipe-elements-medicines").querySelectorAll(".medicine-name");
        var quantities = document.getElementById("read-recipe-elements-medicines").querySelectorAll(".quantity-name");
        var pat_ID = $('#get_recipe #patients_id').val();
        $('#add_transaction .doctor_ID').val(doc_ID);

        const myList = document.getElementById('read-recipe-elements-medicines');
        var i;
        for(i=0; i<medicines.length; i++) {
            let myNewValue = medicines[i];
            let myNewQuantity = quantities[i];

            //Check if input have value or is empty
            if(myNewValue == "" || myNewQuantity == ""){
                alert("Medicine name and quantity must be entered");
            }else{
                // Here will Create Li tag and add it value from input
                let newLi = document.createElement('li');
                let elementNew = myList.appendChild(newLi);

                elementNew.innerHTML = "<span class='recipe-elements' id='recipe-elements-medicine'><span class='recipe-elements-label'> Medicine: </span>" + "<span id='recipe-elements-medicine-val'>" + myNewValue + "</span></span>";

                elementNew.innerHTML += "<span class='recipe-elements' id='recipe-elements-quantity'><span class='recipe-elements-label'> Quantity: </span>" + "<span id='recipe-elements-quantity-val'>" + myNewQuantity + "</span></span>";
            }
        }
    });

    /////
    var date = new Date();
    $('input[type=datetime-local]').val(new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0,19));
    /////

    const btnAddVl = document.getElementById('add_medicine_trans_btn');
    const buttonAddText = document.getElementById('add_medicine_btn');
    const inputValue = document.getElementById('inputAdd');
    const myList = document.getElementById('medicine-list');
    const inputValue_text = document.getElementById('inputAdd_text');
    const quantity = document.getElementById('medicine-quantity');
    const expiration_div = document.getElementById('empty');

    // Show Input
    if(btnAddVl) {
        btnAddVl.addEventListener('click', () => {
            if(inputValue.style.display == 'block') {
                inputValue.style.display= 'none'
                buttonAddText.style.display = 'none'
                expiration_div.style.height = 0 + 'px';
            }else {
                inputValue.style.display= 'block'
                buttonAddText.style.display = 'block'
                expiration_div.style.height = 100 + 'px';
            }
        })
    }

    //STOP WEBSITE FROM REALOADING ACCIDENTALLY//
    $("#add_medicine_btn").click( function(event) {
        event.preventDefault();
    });
    
    $("#add_medicine_trans_btn").click( function(event) {
    event.preventDefault();
});
    ////////////////////////////////////////////

    buttonAddText.addEventListener('click', () => {

        let myNewValue = inputValue_text.value;
        let myNewQuantity = quantity.value; 

        //Check if input have value or is empty
        if(myNewValue == "" || myNewQuantity == ""){
            alert("Medicine name and quantity must be entered");
        }else{
            // Here will Create Li tag and add it value from input
            let newLi = document.createElement('li');
            let elementNew = myList.appendChild(newLi);

            elementNew.innerHTML = "<span class='recipe-elements' id='recipe-elements-medicine'><span class='recipe-elements-label'> Medicine: </span>" + "<span id='recipe-elements-medicine-val'>" + myNewValue + "</span></span>";

            elementNew.innerHTML += "<span class='recipe-elements' id='recipe-elements-quantity'><span class='recipe-elements-label'> Quantity: </span>" + "<span id='recipe-elements-quantity-val'>" + myNewQuantity + "</span></span>";

            elementNew.innerHTML += "<span onclick='myFunc(this)' class='delete fa fa-trash-alt'></span>";

            inputValue_text.value = "";
            quantity.value = "";

        }
    });

    ////////TEST JSON - remove later /////////
    //    var data2 = {Key:"1", Record:{DoctorID:"1",Info:"",Limit:"1",PatientID:"1"}};
    //
    //    var doc_id = data2.Record.DoctorID;
    //    var patient_id = data2.Record.PatientID;
    //    var info = data2.Record.Info;
    //    var element = document.getElementById("recipe");
    //    element.innerHTML += "Doctor ID: " + doc_id + "<br />";
    //    element.innerHTML += "Patient ID: " + patient_id + "<br />";
    //    element.innerHTML += "Description: " + info;
    //////////////////////////////////////
    // Handle logout
    // Handle query
    $('#get_recipe_btn').click(function(){
        var id = $('#patients_id').val();
        // Disable submit button (to prevent multiplication of requests)
        $('#get_recipe_btn').prop("disabled", true);

        $.ajax({
            type: "GET",
            url: "/chemist/get_recipe/" + id,
            timeout: 600000,

            success: function (data) {
                $('#get_recipe_btn').prop("disabled", false);
                var div = document.getElementById('recipe');
                div.style.display = 'block';
                data = JSON.parse(data);  // change JSON string into object
                data = data[data.length-1]  // get only the newest recipe (last entry) ????
                var doc_id = data.Record.DoctorID;
                var patient_id = data.Record.PatientID;
                var list_of_medicines = data.Record.Medicines.Name; //should include medicine name
                var list_of_quantities = data.Record.Medicines.Quantity; //should include quantity for each medicine
                var expiration_date = data.Record.ExpirationDate;

                $('#read-recipe-elements-doctor').val(doc_id);
                $('#read-recipe-elements-expiration').val(expiration_date);

                var ul = document.getElementById('read-recipe-elements-medicines');
                var i;
                for (i = 0; list_of_medicines.length; i++) {
                    var li = document.createElement("li");
                    var medicine = document.createElement("span");
                    medicine.className = "medicine-name";
                    var quantity = document.createElement("span");
                    quantity.className = "quantity-name";
                    medicine.appendChild(document.createTextNode(list_of_medicines[i]));
                    quantity.appendChild(document.createTextNode(list_of_quantities[i]));
                    li.appendChild(medicine);
                    li.appendChild(quantity);
                    ul.appendChild(li); 
                }
            },

            error: function (e) {
                $('#get_recipe_btn').prop("disabled", false);
                alert('Error');
            }
        });

        return false;
    });

    //NEEDS REFINEMENT
    $('#add_transaction_btn').click(function(){
        var chemistID_val = $('#add_transaction .chemist_ID').val();
        var doctorID_val = $('#add_transaction .doctor_ID').val();
        var patientID_val = $('#add_transaction .patient_ID').val();
        var medicines_vals = document.getElementById("medicine-list").querySelectorAll("#transaction-elements-medicine-vals");
        var quantity_vals = document.getElementById("medicine-list").querySelectorAll("#transaction-elements-quantity-vals");
        var value_val = $('#add_transaction .value').val();
        var status_val = $('#add_transaction .status').is(":checked") ? "Completed" : "Not completed";

        var date = new Date();
        var date_val = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0,19)

        const obj = {
            "ChemistID": chemistID_val,
            "DoctorID": doctorID_val,
            "PatientID": patientID_val,
            "Medicine": medicine_vals, //IS ADDING MULTIPLE MEDICINES POSSIBLE?
            "MedicineQuantity": quantity_vals,    
            "Value": value_val,
            "Date": date_val,
            "Status": status_val
        }


        // Disable submit button (to prevent multiplication of requests)
        $('#add_transaction_btn').prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "/chemist/add_transaction",
            timeout: 600000,
            data: JSON.stringify(obj),
            contentType: 'application/json',

            success: function (data) {
                alert('Success');
                $('#add_transaction_btn').prop("disabled", false);
            },

            error: function (e) {
                $('#add_transaction_btn').prop("disabled", false);
                alert('Error');
            }
        });

        return false;
    });

});
