// Remove li from list

function myFunc(elem) {
    let li = elem.parentNode;
    li.parentNode.removeChild(li);
}

$(document).ready(function(){
    
    //recipes

    var recipes = [];

    var test_recipe = [
        {'PrescriptionID': 1, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Rutinoscorbin', 'MedicineQuantity': '2 tabs', 'ExpirationDate': '2020-12-30', 'Note': ''},
        {'PrescriptionID': 2, 'RecipeID': 1, 'DoctorID': 1, 'PatientID': 1, 'Medicine': 'Gripex', 'MedicineQuantity': '1 tab', 'ExpirationDate': '2020-12-30', 'Note': ''}
    ];
    recipes.push(test_recipe);

    var historyList = document.getElementById('patients_history_list');
    for (var i = 0; i < recipes.length; i++) {
        var recipe = recipes[i];

        // using the template from html, clone it
        var tmpl = document.getElementById('patients_history_li_tmpl').cloneNode(true);

        tmpl.querySelector('.recipe_info').querySelector('.recipe_id').innerText = recipe[0].RecipeID;
        tmpl.querySelector('.recipe_info').querySelector('.doctor_id').innerText = recipe[0].DoctorID;
        tmpl.querySelector('.recipe_info').querySelector('.recipe_date').innerText = recipe[0].ExpirationDate;

        var medicineList = tmpl.querySelector('.medicine-list');

        for(var j = 0; j < recipe.length; j++) {
            var prescription = recipe[j];

            // use template for medicine-list
            var tmpl_medicine_list = document.getElementById('medicine-list-tmpl').cloneNode(true);

            tmpl_medicine_list.querySelector('.medicine-name').innerText = prescription.Medicine;
            tmpl_medicine_list.querySelector('.medicine-quantity').innerText = prescription.MedicineQuantity;
            tmpl_medicine_list.querySelector('.medicine-note').innerText = prescription.Note;

            medicineList.appendChild(tmpl_medicine_list);
        }
    }
    historyList.appendChild(tmpl);

    $('#patient_search_btn').click(function(event) { 

        var id = $('.new_visit .patient_ID').val();

        $.ajax({
            type: "GET",
            url: "/doctor/get_patient/" + id,
            timeout: 600000,

            success: function (data) {
                $('#add_recipe_btn').prop("disabled", true);
                var div = document.getElementById('patients_data');
                div.style.display = 'block';
                var name = data.name;
                var birthday = data.birthday;
                var insurance = data.insurance;
                var name_element = document.getElementById('surname');
                var birthday_element = document.getElementById('birthday');
                var insurance_element = document.getElementById('insurance');
                name_element.innerHTML = name;
                birthday_element.innerHTML = birthday;
                insurance_element.innerHTML = insurance;

                $('#add_recipe_btn').prop("disabled", false);
            },

            error: function (e) {
                alert('Error');
            }
        });

    });

    $('#patients_history_btn').click(function(event) {

        const div = document.getElementById('list_placeholder');

        // show the list/hide the list
        if(div.style.display == 'block') {
            div.style.display= 'none'
        }else {
            div.style.display= 'block'
        }

    });


    //// FOR THE ADDING MEDICINES LIST ////
    // All Variables

    const btnAddVl = document.querySelector('.add-icon');
    const buttonAddText = document.getElementById('add_medicine_btn');
    const inputValue = document.getElementById('inputAdd');
    const myList = document.getElementById('medicine-list');
    const inputValue_text = document.getElementById('inputAdd_text');
    const quantity = document.getElementById('medicine-quantity');
    const note = document.getElementById('medicine-note');
    const expiration_div = document.getElementById('recipe_expiration');

    // Show Input
    if(btnAddVl) {
        btnAddVl.addEventListener('click', () => {
            if(inputValue.style.display == 'block') {
                inputValue.style.display= 'none'
                buttonAddText.style.display = 'none'
                btnAddVl.classList.remove('fa-minus');
                btnAddVl.classList.add('fa-plus');
                expiration_div.style.marginTop = 0 + 'px';
            }else {
                inputValue.style.display= 'block'
                buttonAddText.style.display = 'block'
                btnAddVl.classList.remove('fa-plus');
                btnAddVl.classList.add('fa-minus');
                expiration_div.style.marginTop = 100 + 'px';
            }
        })
    }

    // When click buttonAddText Add text to li

    //STOP WEBSITE FROM REALOADING ACCIDENTALLY//
    $("#add_medicine_btn").click( function(event) {
        event.preventDefault();
    });
    ////////////////////////////////////////////

    buttonAddText.addEventListener('click', () => {

        let myNewValue = inputValue_text.value;
        let myNewQuantity = quantity.value; 
        let myNewNote = note.value;

        //Check if input have value or is empty
        if(myNewValue == "" || myNewQuantity == ""){
            alert("Medicine name and quantity must be entered");
        }else{
            // Here will Create Li tag and add it value from input
            let newLi = document.createElement('li');
            let elementNew = myList.appendChild(newLi);
            //          elementNew.innerHTML = "Medicine: " + myNewValue + " Quantity: " + myNewQuantity + " Notes: " + myNewNote + "<span onclick='myFunc(this)' class='delete fa fa-trash-alt'></span>";

            elementNew.innerHTML = "<span class='recipe-elements' id='recipe-elements-medicine'><span class='recipe-elements-label'> Medicine: </span>" + "<span id='recipe-elements-medicine-val'>" + myNewValue + "</span></span>";

            elementNew.innerHTML += "<span class='recipe-elements' id='recipe-elements-quantity'><span class='recipe-elements-label'> Quantity: </span>" + "<span id='recipe-elements-quantity-val'>" + myNewQuantity + "</span></span>";

            elementNew.innerHTML += "<span class='recipe-elements' id='recipe-elements-notes'><span class='recipe-elements-label'> Notes: </span> " + "<span id='recipe-elements-note-val'>" + myNewNote + "</span></span>";

            elementNew.innerHTML += "<span onclick='myFunc(this)' class='delete fa fa-trash-alt'></span>";

            inputValue_text.value = "";
            quantity.value = "";
            note.value = "";

        }
    });

    $('#add_recipe_btn').click(function(event){


        ////// STOPS PAGE FROM RELOADING WHEN BUTTON IS PRESSED, REMOVE IF NOT NECESSARY////
        event.preventDefault();
        /////////////////////

        var doctorID_val = $('.add_recipe .doctor_ID').val();
        var patientID_val = $('.add_recipe .patient_ID').val();
        var medicines_vals = document.getElementById("medicine-list").querySelectorAll("#recipe-elements-medicine-val");
        var quantity_vals = document.getElementById("medicine-list").querySelectorAll('#recipe-elements-quantity-val');
        var note_vals = document.getElementById("medicine-list").querySelectorAll('#recipe-elements-notes-val');
        var expiration_val = $('.add_recipe .expiration_date').val()

        var i;
        for(i = 0; i < medicines_vals.length; i++ ) {


            var medicine_val = medicines_vals[i].innerHTML;
            var quantity_val = quantity_vals[i].innerHTML;
            var note_vals = quantity_vals[i].innerHTML;

            const obj = {
                "DoctorID": doctorID_val,
                "PatientID": patientID_val,
                "Medicine": medicine_val,
                "Quantity": quantity_val,
                "ExpirationDate": expiration_val,
                "Note": note_val
            }

            // Disable submit button (to prevent multiplication of requests)
            $('#add_recipe_btn').prop("disabled", true);

            $.ajax({
                type: "POST",
                url: "/doctor/add_recipe",
                timeout: 600000,
                data: JSON.stringify(obj),
                contentType: 'application/json',

                success: function (data) {
                    alert('Recipe added');
                    $('#add_recipe_btn').prop("disabled", false);
                },

                error: function (e) {
                    $('#add_recipe_btn').prop("disabled", false);
                    alert('Error');
                }
            });

        }

        return false;
    });

});
