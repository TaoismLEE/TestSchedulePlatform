$(document).ready(function(){
    //pop up regist dialog
    $('#registerProject').click(function () {
        $("#myModalLabel").text("Regist Project");
        $("#myModal").modal('show');
        $("div.modal-header button:first").addClass("hiddenElement");
        $("#btn_regist>span").text("Regist");

        //clear out cache for dialog
        $("#txt_project_name").val("");
        $("#txt_project_url").val("");
        $("#txt_incharger").val("");
        $("#text_phone").val("");
        $("#txt_description").val("");
        //$("#pic_logo").val("");
    });

    //submit regist or edit data of project
    $("#btn_regist").click(function() {
        if($("#myModalLabel").text() == "Regist Project"){
            const request = new XMLHttpRequest();
            const projectname = $("#txt_project_name").val();
            const project_url = $("#txt_project_url").val();
            const incharger = $("#txt_incharger").val();
            const phone = $("#text_phone").val();
            const description = $("#txt_description").val();
            //const logo = $("#pic_logo").val();
            const owned_by = localStorage.getItem("user_id");
            if (projectname == "" | project_url == "") {
                warning_msg("ProjectName and URL are required!");
                return;
                return;
            }

            //API call
            request.open("POST", "/projectregist");

            //deal with feedback
            request.onload = function() {
                const result = JSON.parse(request.responseText);
                if (result.status == 200) {
                    success_msg(result.Message);
                    $("#myModal").modal('hide');
                    setTimeout(function(){
                        window.location.reload();
                        }, 2100);
                    }
                else
                    error_msg(result.ErrMsg);
            };

            //send request
            const paras = new FormData();
            paras.append("projectname", projectname);
            paras.append("project_url", project_url);
            paras.append("incharger", incharger);
            paras.append("description", description);
            //paras.append("logo", logo);
            paras.append("phone", phone);
            paras.append("owned_by", owned_by);
            request.send(paras);
        }
        else  if ($("#myModalLabel").text() == "Edit Project"){
            const request = new XMLHttpRequest();
            const projectname = $("#txt_project_name").val();
            const project_url = $("#txt_project_url").val();
            const incharger = $("#txt_incharger").val();
            const phone = $("#text_phone").val();
            const description = $("#txt_description").val();
            //const logo = $("#pic_logo").val();
            const project_id = localStorage.getItem("project_id");
            if (projectname == "" | project_url == "") {
                warning_msg("ProjectName and URL are required!");
                return;
                return;
            }

            //API call
            request.open("POST", "/project/edit/save");

            //deal with feedback
            request.onload = function() {
                const result = JSON.parse(request.responseText);
                if (result.status == 200) {
                    $("#myModal").modal('hide');
                    success_msg(result.Message);
                    setTimeout(function(){
                        window.location.reload();
                        }, 2100);
                    }
                else
                    error_msg(result.ErrMsg);
            };

            //send request
            const paras = new FormData();
            paras.append("projectname", projectname);
            paras.append("project_url", project_url);
            paras.append("incharger", incharger);
            paras.append("description", description);
            //paras.append("logo", logo);
            paras.append("phone", phone);
            paras.append("project_id", project_id);
            request.send(paras);
        }
    });

    $("#signOut").click(function(){
        const request = new XMLHttpRequest();
        request.open("POST", "/signout");
        request.onload = function(){
            const result = JSON.parse(request.responseText);
            if (result.status == 200) {
                window.location.replace(result.url);
                }
        };
        const paras = new FormData();
        request.send(paras);
    });

    $("#editUser").click(function(){
    const request = new XMLHttpRequest();
    user_id = localStorage.getItem('user_id');

    request.open("POST", "/user/edit");
    request.onload = function(){
        const result = JSON.parse(request.responseText);
        if (result.status == 200) {
            //open edit modal
            $("#myModal2").modal('show');
            $("#myModalLabel2").text("Edit User");
            $("div.modal-header button:last").addClass("hiddenElement");
            $("#btn_submit2>span").text("Save");

            //write back user data
            $("#txt_user_name").val(result.data.USERNAME);
            $("#password").val(result.data.PASSWORD);
            $("#txt_qq").val(result.data.QQ);
            $("#txt_MSN").val(result.data.MSN);
            $("#txt_phone").val(result.data.PHONE);
            $("#txt_mail").val(result.data.MAIL);

            //save login password
            localStorage.setItem("password", result.data.PASSWORD);
            }
        return;
    };
    const paras = new FormData();
    paras.append("user_id", user_id)
    request.send(paras);
    });

    //Save user data
    $("#btn_submit2").click(function() {
        if($("#myModalLabel2").text() == "Edit User"){
            const request = new XMLHttpRequest();
            const username = $("#txt_user_name").val();
            const password = $("#password").val();
            const qq = $("#txt_qq").val();
            const msn = $("#txt_MSN").val();
            const phone = $("#txt_phone").val();
            const mail = $("#txt_mail").val();
            const user_id = localStorage.getItem('user_id');
            //const photo = $("#txt_img").val();
            if (password == "") {
                warning_msg("Password is required!!");
                return;
                return;
            }

            //API call
            request.open("POST", "/user/edit/save");

            //deal with feedback
            request.onload = function() {
                const result = JSON.parse(request.responseText);
                if (result.status == 200) {
                    success_msg(result.Message);
                    let new_password = $("#password").val();
                    $("#myModal2").modal('hide');
                    let old_password = localStorage.getItem("password");
                    if (new_password == old_password){
                        return;
                    }
                    else
                        window.location.replace(result.url);
                        localStorage.setItem("password", "");
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
            paras.append("user_id", user_id);
            request.send(paras);
        }
    });
    document.querySelectorAll(".btn-outline-secondary").forEach(function(e){
        e.onclick = function(){
            //get project_id and action name
            var str = $(this).parent().next().children().first().attr("href");
            var arrs = new Array();
            arrs = str.split("/");
            project_id = arrs[2];
            action = $(this).text();

            if (action == "Delete") {
                bootbox.confirm({
                message: "Are you sure to delete?",
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-danger'
                    }
                    },
                callback: function (result) {
                    if (result){
                        const request = new XMLHttpRequest();
                        request.open("POST", "/project/delete");
                        request.onload = function(){
                            const result = JSON.parse(request.responseText);
                            if (result.status == 200) {
                                success_msg(result.Message);
                                setTimeout(function(){
                                    window.location.reload();
                                    }, 2100);
                                }
                        };
                        const paras = new FormData();
                        paras.append("project_id", project_id);
                        request.send(paras);
                    }
                }
                });
            }
            else {
                const request = new XMLHttpRequest();
                request.open("POST", "/project/edit");
                request.onload = function(){
                    const result = JSON.parse(request.responseText);
                    if (result.status == 200) {
                        //show edit dialog
                        $("#myModalLabel").text("Edit Project");
                        $("#myModal").modal('show');
                        $("div.modal-header button:first").addClass("hiddenElement");
                        $("#btn_regist>span").text("Save");

                        //write back project data
                        $("#txt_project_name").val(result.data.PROJECT_NAME);
                        $("#txt_project_url").val(result.data.PROJECT_URL);
                        $("#txt_incharger").val(result.data.INCHARGER);
                        $("#text_phone").val(result.data.PHONE);
                        $("#txt_description").val(result.data.DESCRIPTION);

                        //save editing project_id
                        localStorage.setItem("project_id", project_id);
                        return;
                        }
                    else {
                        error_msg(result.ErrMsg);
                    }
                };
                const paras = new FormData();
                paras.append("project_id", project_id);
                request.send(paras);
            }
        };
    });
});