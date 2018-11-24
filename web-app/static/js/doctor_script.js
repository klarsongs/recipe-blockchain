$(document).ready(function(){

    $('#add_recipe_btn').click(function(){

        var doctorID_val = $('.add_recipe .doctor_ID').val();
        var patientID_val = $('.add_recipe .patient_ID').val();
        var description_val = $('.add_recipe .recipe_description').val();

        const obj = {
            DoctorID: doctorID_val,
            PatientID: patientID_val,
            Description: description_val
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

        return false;
    });

});