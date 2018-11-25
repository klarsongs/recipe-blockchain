$(document).ready(function(){

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
                data = JSON.parse(data);  // change JSON string into object
                data = data[data.length-1]  // get only the newest recipe (last entry) ????
                var doc_id = data.Record.DoctorID;
                var patient_id = data.Record.PatientID;
                var info = data.Record.Info;
                var element = document.getElementById("recipe");
                element.innerHTML += "Doctor ID: " + doc_id + "<br />";
                element.innerHTML += "Patient ID: " + patient_id + "<br />";
                element.innerHTML += "Description: " + info;
                document.getElementById("doctor_ID_trans").value = doc_id;
                document.getElementById("patient_ID_trans").value = patient_id;
                document.getElementById("recipe_description_trans").value = info;
            },

            error: function (e) {
                $('#get_recipe_btn').prop("disabled", false);
                alert('Error');
            }
        });

        return false;
    });

    $('#add_transaction_btn').click(function(){
        var chemistID_val = $('#add_transaction .chemist_ID').val();
        var doctorID_val = $('#add_transaction .doctor_ID').val();
        var patientID_val = $('#add_transaction .patient_ID').val();
        var description_val = $('#add_transaction .recipe_description').val();
        var value_val = $('#add_transaction .value').val();
        var date_val = $('#add_transaction .date').val();
        var status_val = $('#add_transaction .status').is(":checked") ? "Completed" : "Not completed";

        const obj = {
            "ChemistID": chemistID_val,
            "DoctorID": doctorID_val,
            "PatientID": patientID_val,
            "Description": description_val,
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
