$(document).ready(function(){
    $("#configured-total-check").click(function() {
        //判断本身状态，注意点击本身会改变其状态
        let status = $("#configured-total-check").prop("checked");

        //点击后是选中状态，则将其他所有项选中
        if (status) {
            $("table.configured-apis tbody input").each(function(){
                if (!$(this).prop("checked")){
                    $(this).prop("checked", true);
                }
            });
        }
        //点击后是取消选中，则取消已选中的
        else {
            $("table.configured-apis tbody input").each(function(){
                if ($(this).prop("checked")){
                    $(this).prop("checked", false);
                }
            });
        }
    });

    $("#choosed-total-check").click(function() {
        //判断本身状态，注意点击本身会改变其状态
        let status = $("#choosed-total-check").prop("checked");

        //点击后是选中状态，则将其他所有项选中
        if (status) {
            $("table.choosed-apis td>input").each(function(){
                if (!$(this).prop("checked")){
                    $(this).prop("checked", true);
                }
            });
        }
        //点击后是取消选中，则取消已选中的
        else {
            $("table.choosed-apis td>input").each(function(){
                if ($(this).prop("checked")){
                    $(this).prop("checked", false);
                }
            });
        }
    });

    $("#moveRight").click(function(){
        //判断是否有勾选
        let check_flag = 0;
        $("table.configured-apis tbody input").each(function(){
            if ($(this).prop("checked")) {
                check_flag = 1;
            }
        });

        //没选择则提示
        if (check_flag == 0) {
            error_msg("Please at least select ONE API to move!");
            return;
        }
        else{
            //获取选中列表
            var api_arr = new Array();
            $("table.configured-apis tbody input").each(function(){
            if ($(this).prop("checked")) {
                api_arr.push($(this).parent().siblings("td").first().text());
            }
            });
            const project_id = $("#tmpProjectID").text();
            const task_id = $("#tmpTaskID").text();
            //执行
            const request = new XMLHttpRequest();
            request.open("POST", "/move/right")

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
            para.append("api_arr", api_arr);
            para.append("project_id", project_id);
            para.append("task_id", task_id);
            request.send(para);
        }
    });

    $("#moveLeft").click(function(){
        //判断是否有勾选
        let check_flag = 0;
        $("table.choosed-apis td>input").each(function(){
            if ($(this).prop("checked")) {
                check_flag = 1;
            }
        });
        const project_id = $("#tmpProjectID").text();
        const task_id = $("#tmpTaskID").text();

        //没选择则提示
        if (check_flag == 0) {
            error_msg("Please at least select ONE API to move!");
            return;
        }
        else{
            //获取选中列表
            var api_arr = new Array();
            $("table.choosed-apis td>input").each(function(){
            if ($(this).prop("checked")) {
                api_arr.push($(this).parent().siblings("td").first().text());
            }
            });
            //执行
            const request = new XMLHttpRequest();
            request.open("POST", "/move/left")

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
            para.append("api_arr", api_arr);
            para.append("project_id", project_id);
            para.append("task_id", task_id);
            request.send(para);
        }
    });


    $("#saveConfig").click(function(){
        var login_api = "";
        let type_flag = 0;
        $("table.choosed-apis input[name='apiType']").each(function(){
            if ($(this).prop("checked")) {
                type_flag = 1;
                login_api = $(this).parent().parent().siblings("td").first().next().text();
            }
        });

        var api_arr = new Array();
        $("table.choosed-apis input[name='needLogin']").each(function(){
            if ($(this).prop("checked")) {
                api_arr.push($(this).parent().parent().siblings("td").first().next().text());
            }
        });

        const project_id = $("#tmpProjectID").text();
        const task_id = $("#tmpTaskID").text();
        //执行
        const request = new XMLHttpRequest();
        request.open("POST", "/config/save")

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
        para.append("api_arr", api_arr);
        para.append("project_id", project_id);
        para.append("login_api", login_api);
        para.append("task_id", task_id);
        request.send(para);
    });

    $("table.choosed-apis input[name='apiType']").each(function(){
            if ($(this).val() == "Y") {
                $(this).attr("Checked", true);
            }
        });

    $("table.choosed-apis input[name='needLogin']").each(function(){
            if ($(this).val() == "Y") {
                $(this).attr("Checked", true);
            }
        });
});