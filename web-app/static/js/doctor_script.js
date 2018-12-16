// Remove li from list

function myFunc(elem) {
    let li = elem.parentNode;
    li.parentNode.removeChild(li);
}

$(document).ready(function(){

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
        
        
        // EXAMPLE VALUES FOR STYLING
        
        
//        var recipes = [{'recipeId': '213', 'doctorId': '3243', 'recipeDate': '13-04-2018', 'medicinesList': [{'name': 'Rutinoscrobin', 'quantity': '20 packs', 'note': '10 tablets a day'}, {'name': 'Food', 'quantity': '30 kg', 'note': 'The best would be pizza'}]}];
////        var recipeId = 213;
////        var doctorId = 3243;
////        var recipeDate = 13-04-2018;
////        var medicinesList = [["Rutinoscorbin", "Food"],["20 packs", "30 mg"],["10 tablets a day"],["The best would be pizza"]];
//        
////        var historyList = document.getElementById('patients_history_list');
//        
//        for (var i = 0; i < recipes.length; i++) {
//            var recipe = recipes[i];
//            var tmpl = $('#patients_history_li_tmpl').clone();
////            var tmpl = document.getElementById('patients_history_li_tmpl'), clone = tmpl.cloneNode(true);
////            var tmpl = document.getElementById('patients_history_li_tmpl').content.cloneNode(true);
//            tmpl.find('.recipe_info .recipe_id').text = recipe.recipeId;
//            tmpl.find('.recipe_info .doctor_id').text = recipe.doctorId;
//            tmpl.find('.recipe_info .recipe_date').text = 
//            tmpl.recipeDate;
//            
////            var medicineList = document.getElementById('medicine-list');
//            
//            for (var j = 0; j < recipe.medicinesList.length; j++) {
//                var medicine = recipe.medicinesList[j];
//                var tmpl_medicine = $('#medicine-list-tmpl').clone();
////                var tmpl_medicine = document.getElementById('medicine-list-tmpl'), clone = tmpl.cloneNode(true);
////                var tmpl_medicine = document.getElementById('medicine-list-tmpl').content.cloneNode(true);
//                tmpl_medicine.find('.medicine .medicine-name').text = medicine.name;
//                tmpl_medicine.find('.medicine .medicine-quantity').text = medicine.quantity;
//                tmpl_medicine.find('.medicine .medicine-note').text = medicine.note;
////                medicineList.appendChild(tmpl_medicine);
//                $('.medicine-list').append(tmpl_medicine)
//            }
//            
//            $('#patients_history_list').append(tmpl);
//        }
        
        
//        var id = $('.new_visit .patient_ID').val();
//
//        $.ajax({
//            type: "GET",
//            url: "/doctor/get_patient_history/" + id,
//            timeout: 600000,
//
//            success: function (data) {
//                //success
//            },
//
//            error: function (e) {
//                alert('Error');
//            }
//        });

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
