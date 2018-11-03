$(document).ready(function(){
    $('.message a').click(function(){
       $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
    });


    // Handle register
    $('.register-form button').click(function(){
        // Get data from the form
        var usernameVal = $('.register-form .name').val();
        var passwordVal = $('.register-form .password').val();
        var emailVal = $('.register-form .email').val();

        // JSONify the data
        const obj = {
            username: usernameVal,
            password: passwordVal,
            email: emailVal
        }

        // Disable submit button (to prevent multiplication of requests)
        $('.register-form button').prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "/register",
            data: JSON.stringify(obj),
            contentType: 'application/json',
            timeout: 600000,

            success: function (data) {
                $(".register-form").get(0).reset();
                alert(data.message);
                $(".register-form button").prop("disabled", false);
            },

            error: function (e) {
                alert('Error');
                $(".register-form button").prop("disabled", false);
            }
        });

        return false;
    });


    // Handle login
    $('.login-form button').click(function(){
        var usernameVal = $('.login-form .username').val();
        var passwordVal = $('.login-form .password').val();

        // JSONify the data
        const obj = {
            username: usernameVal,
            password: passwordVal
        }

        // Disable submit button (to prevent multiplication of requests)
        $('.login-form button').prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "/login",
            data: JSON.stringify(obj),
            contentType: 'application/json',
            timeout: 600000,

            success: function (data) {
                $(".login-form").get(0).reset();
                alert(data.message);
                $(".login-form button").prop("disabled", false);
            },

            error: function (e) {
                alert('Error');
                $(".login-form button").prop("disabled", false);
            }
        });

        return false;
    });

});

