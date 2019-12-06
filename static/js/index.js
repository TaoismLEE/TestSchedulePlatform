$(document).ready(function(){
    //pop up sign-up dialog
    $('#signUp').click(function () {
        $("#myModalLabel").text("Sign Up");
        $("#myModal").modal('show');
        $("div.modal-header button:first").addClass("hiddenElement");
        $("#btn_submit>span").text("Submit");

        //clear out cache for dialog
        $("#txt_user_name").val("");
        $("#password").val("");
        $("#txt_qq").val("");
        $("#txt_MSN").val("");
        $("#txt_phone").val("");
        $("#txt_mail").val("");
    });

    //submit sign-up or edit data of users
    $("#btn_submit").click(function() {
        if($("#myModalLabel").text() == "Sign Up"){
            const request = new XMLHttpRequest();
            const username = $("#txt_user_name").val();
            const password = $("#password").val();
            const qq = $("#txt_qq").val();
            const msn = $("#txt_MSN").val();
            const phone = $("#txt_phone").val();
            const mail = $("#txt_mail").val();
            //const photo = $("#txt_img").val();
            if (username == "" | password == "") {
                warning_msg("Username and Password are required!!");
                return;
                return;
            }

            //API call
            request.open("POST", "/signup");

            //deal with feedback
            request.onload = function() {
                const result = JSON.parse(request.responseText);
                if (result.status == 200) {
                    success_msg(result.Message);
                    $("#myModal").modal('hide');
                    }
                else
                    error_msg(result.ErrMsg);
            };

            //send request
            const paras = new FormData();
            paras.append("username", username);
            paras.append("password", password);
            paras.append("qq", qq);
            paras.append("msn", msn);
            paras.append("phone", phone);
            paras.append("mail", mail);
            //paras.append("photo", photo);
            request.send(paras);
        }
    });

    //sign in
    $("#signIn").click(function () {
        const request = new XMLHttpRequest();
        const username = $("#inputUserName").val();
        const password = $("#inputPassword").val();
        if (username == "" | password == "") {
            warning_msg("Username and Password are required!");
            return;
            return;
        }

        request.open("POST", "/signin");

        request.onload = function () {
            const result = JSON.parse(request.responseText);
            if (result.status == 200) {
                localStorage.setItem("user_id", result.user);
                const new_url = result.url + "/" + String(result.user);
                window.location.replace(new_url);
            }
            else {
                error_msg(result.ErrMsg)
            }
        };

        const paras = new FormData();
        paras.append("username", username);
        paras.append("password", password);
        request.send(paras)
    });
});