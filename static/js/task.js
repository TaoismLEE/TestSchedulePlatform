$(document).ready(function(){
    //pop up create dialog
    $('#taskCreate').click(function () {
        $("#myModalLabel").text("Create Task");
        $("#myModal").modal('show');
        $("div.modal-header button:first").addClass("hiddenElement");
        $("#btn_submit>span").text("Submit");

        //clear out cache for dialog
        $("#txt_task_name").val("");
        $("#cronValue").val("");
    });

    //submit or edit data of task
    $("#btn_submit").click(function() {
        if($("#myModalLabel").text() == "Create Task"){
            const request = new XMLHttpRequest();
            const task_name = $("#txt_task_name").val();
            const cron_exp = $("#cronValue").val();
            //const logo = $("#pic_logo").val();
            const belong_project = $("#tmpProjectID").text();
            if (task_name == "" | cron_exp == "") {
                warning_msg("TaskName and CronExp are required!");
                return;
                return;
            }

            //API call
            request.open("POST", "/task/create");

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
            paras.append("task_name", task_name);
            paras.append("cron_exp", cron_exp);
            paras.append("belong_project", belong_project);
            request.send(paras);
        }
        else  if ($("#myModalLabel").text() == "Edit Task"){
            const request = new XMLHttpRequest();
            const task_name = $("#txt_task_name").val();
            const cron_exp = $("#cronValue").val();
            const task_id = localStorage.getItem("edit_task_id");
            //const logo = $("#pic_logo").val();
            if (task_name == "" | cron_exp == "") {
                warning_msg("TaskName and CronExp are required!");
                return;
                return;
            }

            //API call
            request.open("POST", "/task/edit/save");

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
            paras.append("task_name", task_name);
            paras.append("cron_exp", cron_exp);
            paras.append("task_id", task_id);
            request.send(paras);
        }
    });

    $("#selector").cron({
        onChange: function(){
            $('#cronValue').val($(this).cron("value"));
        },
    });

    $("#total-check").click(function() {
        //判断本身状态，注意点击本身会改变其状态
        let status = $("#total-check").prop("checked");

        //点击后是选中状态，则将其他所有项选中
        if (status) {
            $("tbody input").each(function(){
                if (!$(this).prop("checked")){
                    $(this).prop("checked", true);
                }
            });
        }
        //点击后是取消选中，则取消已选中的
        else {
            $("tbody input").each(function(){
                if ($(this).prop("checked")){
                    $(this).prop("checked", false);
                }
            });
        }
    });

    $("#taskEdit").click(function () {
        //判断是否有勾选待编辑项
        let flag = 0;
        $("tbody input").each(function(){
            if ($(this).prop("checked")) {
                flag =　flag + 1;
            }
        });
        if (flag == 1){
            // check the status of task
            $("tbody input").each(function() {
                if ($(this).prop("checked")) {
                    let value = $(this).parent().siblings("td").first().next().next().next().next().text();
                    let status = $.trim(value);
                    if (status == "Scheduled" | status == "Running"){
                        warning_msg("Can NOT edit scheduled or running task!");
                        return;
                    }
                    else {
                        // pop up edit dialog
                        $("#myModalLabel").text("Edit Task");
                        $("#myModal").modal('show');
                        $("div.modal-header button:first").addClass("hiddenElement");
                        $("#btn_submit>span").text("Submit");

                        // write back task data
                        $("tbody input").each(function() {
                            if ($(this).prop("checked")) {
                                localStorage.setItem("edit_task_id", $(this).parent().siblings("td").first().text());
                                let task_name = $(this).parent().siblings("td").first().next().text();
                                let cron_exp = $(this).parent().siblings("td").first().next().next().text();
                                $("#txt_task_name").val(task_name);
                                $("#cronValue").val(cron_exp);
                            }
                        });
                    }
                }
            });
        }
        else {
            error_msg("Please choose ONE item to edit!");
            return;
        }
    });

    $("#taskDelete").click(function(){
        //判断是否有勾选待删项
        let check_flag = 0;
        let status_flag = 0;
        $("tbody input").each(function(){
            if ($(this).prop("checked")) {
                check_flag = 1;
                let value = $(this).parent().siblings("td").first().next().next().next().next().text();
                let status = $.trim(value);
                if (status == "Scheduled" | status == "Running"){
                        status_flag = 1;
                    }
            }
        });

        //有选择则删除，没选择则提示
        if (check_flag == 0) {
            error_msg("Please at least select ONE task to delete!");
            return;
        }
        else if (status_flag == 1){
            warning_msg("Can NOT delete task with Scheduled or Running status!");
            return;
        }
        else{
            //获取选中列表
            var task_arr = new Array();
            $("tbody input").each(function(){
            if ($(this).prop("checked")) {
                task_arr.push($(this).parent().siblings("td").first().text());
            }
            });
            //执行删除
            const request = new XMLHttpRequest();
            request.open("POST", "/task/delete")

            request.onload = function() {
            const result = JSON.parse(request.responseText);
            if (result.status == 200) {
                success_msg(result.Message);
                setTimeout(function(){
                        window.location.reload();
                        }, 2100);
            }
            };

            const para = new FormData();
            para.append("task_arr", task_arr);
            request.send(para);
        }
    });

    // on schedule task
    $("tbody").on("click", "button[name='scheduleTask']", function(){
        //read task_id
        var task_id = $(this).parent().siblings("td").first().next().text();
        const request = new XMLHttpRequest();
        request.open("POST", "/schedule/task");

        request.onload = function() {
        const result = JSON.parse(request.responseText);
        if (result.status == 200){
                success_msg(result.Message);
                setTimeout(function(){
                        window.location.reload();
                        }, 2100);
        }
        };

        const para = new FormData();
        para.append("task_id", task_id);
        request.send(para);

    });

    //off schedule task
    $("tbody").on("click", "button[name='cancelTask']", function(){
        //read task_id
        var task_id = $(this).parent().siblings("td").first().next().text();
        const request = new XMLHttpRequest();
        request.open("POST", "/cancel/task");

        request.onload = function() {
        const result = JSON.parse(request.responseText);
        if (result.status == 200){
                success_msg(result.Message);
                setTimeout(function(){
                        window.location.reload();
                        }, 2100);
        }
        };

        const para = new FormData();
        para.append("task_id", task_id);
        request.send(para);

    });

    $("#taskSearch").click(function(){
        const project_id = $("#tmpProjectID").text();
        const path = "/tasks/" + project_id;
        let task_name = $("#taskName").val();
        const request = new XMLHttpRequest();
        request.open("POST", path);

        request.onload = function() {
        const result = JSON.parse(request.responseText);
        let content_str = "";
        //remove previous content
        $("tbody").empty();

        //display returned content
        for(i=0; i<result["data"].length;i++){
            let tmp = "<tr>" + "<td><input type=\"checkbox\" rowindex=" + i + "></td>" +"<td>" + result['data'][i]['id'] + "</td>" + "<td>" + result['data'][i]['task_name'] + "</td>"  + "<td>" + result['data'][i]['cron_exp']  + "</td>"+ "<td>" + result['data'][i]['create_time']  + "</td>"+ "<td>" + result['data'][i]['status']  + "</td>" + "<td>" + result['data'][i]['start_time']  + "</td>"+ "<td>" + result['data'][i]['end_time']  + "</td>"+ "<td>" + result['data'][i]['execute_time']  + "</td>"+ "<td><a href=\"/config_apis/" + result['data'][i]['id'] + "\" class=\"btn btn-sm btn-primary\" role=\"button\" style=\"margin-right: 4px;\" target=\"_blank\">Choose APIs</a><button class=\"btn btn-primary btn-sm\" name=\"scheduleTask\" style=\"margin-right: 5px;\" type=\"button\">On</button><button class=\"btn btn-primary btn-sm\" name=\"cancelTask\" style=\"margin-right: 5px;\" type=\"button\">Off</button><a href=\"/his_report/" + result['data'][i]['id'] + "/1\" class=\"btn btn-sm btn-primary\" role=\"button\" style=\"margin-right: 4px;\" target=\"_blank\">Report</a></td>" +"</tr>";
            content_str = content_str + tmp;
        }
        $("tbody").html(content_str);

        $("tbody input").each(function(){
            let value = $(this).parent().siblings("td").first().next().next().next().next().text();
            if (value == "1"){
                    $(this).parent().siblings("td").first().next().next().next().next().text("New");
                }
            else if (value == "2"){
                $(this).parent().siblings("td").first().next().next().next().next().text("Scheduled");
                let element = $(this).parent().siblings("td").first().next().next().next().next()
                element.addClass('bg-color-green');
            }
            else if (value == "3"){
                $(this).parent().siblings("td").first().next().next().next().next().text("Running");
                let element = $(this).parent().siblings("td").first().next().next().next().next()
                element.addClass('bg-color-orange');
            }
            else if (value == "4"){
                $(this).parent().siblings("td").first().next().next().next().next().text("Off scheduled");
            }
            else {
                $(this).parent().siblings("td").first().next().next().next().next().text("Not Defined");
            }
            if (value == "2" | value == "3"){
                let element = $(this).parent().siblings("td").last().find("button[name='scheduleTask']");
                element.removeClass("btn-primary");
                element.addClass("btn-secondary");
                element.attr("disabled", true);
            }
            else {
                let element = $(this).parent().siblings("td").last().find("button[name='cancelTask']");
                element.removeClass("btn-primary");
                element.addClass("btn-secondary");
                element.attr("disabled", true);
            }
            let start_time = $(this).parent().siblings("td").first().next().next().next().next().next().text();
            let end_time = $(this).parent().siblings("td").first().next().next().next().next().next().next().text();
            let execute_time = $(this).parent().siblings("td").first().next().next().next().next().next().next().text();
            if (start_time == "null" || start_time == "None"){
                $(this).parent().siblings("td").first().next().next().next().next().next().text("--");
            }
            if (end_time == "null" || end_time == "None"){
                $(this).parent().siblings("td").first().next().next().next().next().next().next().text("--");
            }
            if (execute_time == "null"  || execute_time == "None"){
                $(this).parent().siblings("td").first().next().next().next().next().next().next().next().text("--");
            }
        });
        };

        const para = new FormData();
        para.append("task_name", task_name);
        request.send(para);
        return false;
    });

    // Enable and Disable button based on task status
    $("tbody input").each(function() {
        let value = $(this).parent().siblings("td").first().next().next().next().next().text();
        let status = $.trim(value);
        if (status == "Scheduled" | status == "Running") {
            let element = $(this).parent().siblings("td").last().find("button[name='scheduleTask']");
            element.removeClass("btn-primary");
            element.addClass("btn-secondary");
            element.attr("disabled", true);
        } else {
            let element = $(this).parent().siblings("td").last().find("button[name='cancelTask']");
            element.removeClass("btn-primary");
            element.addClass("btn-secondary");
            element.attr("disabled", true);
        }
        if (status == "Running") {
            let element = $(this).parent().siblings("td").first().next().next().next().next()
                element.addClass('bg-color-orange');
        }
        if (status == "Scheduled") {
            let element = $(this).parent().siblings("td").first().next().next().next().next()
                element.addClass('bg-color-green');
        }
    });
});